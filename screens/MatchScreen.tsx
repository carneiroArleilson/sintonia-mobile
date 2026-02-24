import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  ActivityIndicator,
  Animated,
  PanResponder,
  Dimensions,
  TouchableOpacity,
  Modal,
  TextInput,
  FlatList,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import { useTranslation } from '../i18n/LanguageProvider';
import { useAuth } from '../api/AuthContext';
import { getDiscoveryProfiles, getCategories, updateProfileLocation, type DiscoveryProfile } from '../api/client';
import { CITIES, type City } from '../data/cities';
import { styles as st } from './MatchScreen.styles';

const LOCATION_CHOICE_KEY = '@sintonia_location_choice';
const LOCATION_LAST_LAT_KEY = '@sintonia_last_lat';
const LOCATION_LAST_LNG_KEY = '@sintonia_last_lng';
const LOCATION_LAST_SENT_AT_KEY = '@sintonia_last_location_sent_at';
const LOCATION_UPDATE_INTERVAL_MS = 24 * 60 * 60 * 1000; // 24h
const LOCATION_MIN_DISTANCE_M = 1000; // 1 km

function haversineMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

const { width: SW, height: SH } = Dimensions.get('window');
const THROW_THRESHOLD = 60;
const EXIT_DISTANCE = SW * 1.1;
const EXIT_Y = SH * 0.35;
const EXIT_ROTATE = 22;

function getAge(birthDate: string): number {
  const [y] = birthDate.split('-').map(Number);
  return new Date().getFullYear() - y;
}

/** Retorna texto para exibição: "50 m", "3 km", etc. (para usar em "A X de você"). */
function formatDistance(meters: number | null | undefined): string {
  if (meters == null || meters < 0) return '';
  if (meters < 1000) return `${Math.round(meters)} m`;
  const km = meters / 1000;
  return km >= 10 ? `${Math.round(km)} km` : `${km.toFixed(1)} km`;
}

export type LocationChoice = 'gps' | 'manual' | null;

export function MatchScreen() {
  const { t } = useTranslation();
  const { token } = useAuth();
  const [profiles, setProfiles] = useState<DiscoveryProfile[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [categoryLabels, setCategoryLabels] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [locationChoice, setLocationChoice] = useState<LocationChoice>(null);
  const [locationPromptVisible, setLocationPromptVisible] = useState(true);
  const [showCityPicker, setShowCityPicker] = useState(false);
  const [citySearch, setCitySearch] = useState('');

  const filteredCities = useMemo(() => {
    const q = citySearch.trim().toLowerCase();
    if (!q) return CITIES;
    return CITIES.filter((c) => c.name.toLowerCase().includes(q));
  }, [citySearch]);

  const pan = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const scaleFront = useRef(new Animated.Value(1)).current;
  const gestureMode = useRef<'throw' | null>(null);
  const currentIndexRef = useRef(0);
  const profilesRef = useRef<DiscoveryProfile[]>([]);
  currentIndexRef.current = currentIndex;
  profilesRef.current = profiles;

  useEffect(() => {
    if (currentIndex > 0) {
      scaleFront.setValue(0.95);
      Animated.spring(scaleFront, {
        toValue: 1,
        useNativeDriver: true,
        friction: 8,
        tension: 100,
      }).start();
    }
  }, [currentIndex, scaleFront]);

  const loadData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [list, categories] = await Promise.all([
        getDiscoveryProfiles(token),
        getCategories('pt'),
      ]);
      setProfiles(list);
      setCurrentIndex(0);
      const map: Record<string, string> = {};
      categories.forEach((c) => { map[c.id] = c.label; });
      setCategoryLabels(map);
    } catch {
      setProfiles([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Carrega escolha de localização salva; se não definida, mostra o prompt (não pede permissão na primeira tela).
  useEffect(() => {
    let cancelled = false;
    AsyncStorage.getItem(LOCATION_CHOICE_KEY)
      .then((value) => {
        if (cancelled) return;
        if (value === 'gps' || value === 'manual') {
          setLocationChoice(value);
          setLocationPromptVisible(false);
        }
      })
      .catch(() => {
        if (!cancelled) setLocationPromptVisible(true);
      });
    return () => { cancelled = true; };
  }, []);

  const handleAllowLocation = useCallback(async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== Location.PermissionStatus.GRANTED) {
        await AsyncStorage.setItem(LOCATION_CHOICE_KEY, 'gps');
        setLocationChoice('gps');
        setLocationPromptVisible(false);
        return;
      }
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        mayShowUserSettings: false,
      });
      const { latitude, longitude } = loc.coords;
      await updateProfileLocation(token!, latitude, longitude);
      await AsyncStorage.setItem(LOCATION_CHOICE_KEY, 'gps');
      await AsyncStorage.setItem(LOCATION_LAST_LAT_KEY, String(latitude));
      await AsyncStorage.setItem(LOCATION_LAST_LNG_KEY, String(longitude));
      await AsyncStorage.setItem(LOCATION_LAST_SENT_AT_KEY, String(Date.now()));
      setLocationChoice('gps');
      setLocationPromptVisible(false);
    } catch (e) {
      if (__DEV__) console.warn('[MatchScreen] Falha ao obter localização:', e);
      await AsyncStorage.setItem(LOCATION_CHOICE_KEY, 'gps');
      setLocationChoice('gps');
      setLocationPromptVisible(false);
    }
  }, [token]);

  const handleOpenCityPicker = useCallback(() => {
    setShowCityPicker(true);
  }, []);

  const handleSelectCity = useCallback(
    async (city: City) => {
      if (!token) return;
      try {
        await updateProfileLocation(token, city.latitude, city.longitude);
        await AsyncStorage.setItem(LOCATION_CHOICE_KEY, 'manual');
        await AsyncStorage.setItem(LOCATION_LAST_LAT_KEY, String(city.latitude));
        await AsyncStorage.setItem(LOCATION_LAST_LNG_KEY, String(city.longitude));
        await AsyncStorage.setItem(LOCATION_LAST_SENT_AT_KEY, String(Date.now()));
        await AsyncStorage.setItem('@sintonia_location_manual_city_name', city.name);
        setLocationChoice('manual');
        setLocationPromptVisible(false);
        setShowCityPicker(false);
        setCitySearch('');
      } catch (e) {
        if (__DEV__) console.warn('[MatchScreen] Falha ao salvar cidade:', e);
      }
    },
    [token],
  );

  // Atualização inteligente: só envia quando abre o app, ou se moveu >1km, ou a cada 24h.
  useEffect(() => {
    if (!token || locationChoice !== 'gps') return;
    let cancelled = false;
    (async () => {
      try {
        const { status } = await Location.getForegroundPermissionsAsync();
        if (cancelled || status !== Location.PermissionStatus.GRANTED) return;
        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
          mayShowUserSettings: false,
        });
        if (cancelled) return;
        const lat = loc.coords.latitude;
        const lng = loc.coords.longitude;
        const [lastLatS, lastLngS, lastSentAtS] = await Promise.all([
          AsyncStorage.getItem(LOCATION_LAST_LAT_KEY),
          AsyncStorage.getItem(LOCATION_LAST_LNG_KEY),
          AsyncStorage.getItem(LOCATION_LAST_SENT_AT_KEY),
        ]);
        const lastSentAt = lastSentAtS ? parseInt(lastSentAtS, 10) : 0;
        const now = Date.now();
        const shouldUpdate =
          !lastSentAt ||
          now - lastSentAt > LOCATION_UPDATE_INTERVAL_MS ||
          (lastLatS != null && lastLngS != null && haversineMeters(lat, lng, parseFloat(lastLatS), parseFloat(lastLngS)) > LOCATION_MIN_DISTANCE_M);
        if (!shouldUpdate || cancelled) return;
        await updateProfileLocation(token, lat, lng);
        if (cancelled) return;
        await AsyncStorage.setItem(LOCATION_LAST_LAT_KEY, String(lat));
        await AsyncStorage.setItem(LOCATION_LAST_LNG_KEY, String(lng));
        await AsyncStorage.setItem(LOCATION_LAST_SENT_AT_KEY, String(now));
        if (__DEV__) console.log('[MatchScreen] Localização atualizada (inteligente)');
      } catch (e) {
        if (__DEV__) console.warn('[MatchScreen] Falha ao atualizar localização:', e);
      }
    })();
    return () => { cancelled = true; };
  }, [token, locationChoice]);

  const resetCard = useCallback(() => {
    pan.setValue({ x: 0, y: 0 });
    gestureMode.current = null;
  }, [pan]);

  const runExitAnimation = useCallback(
    (direction: 'left' | 'right', onDone: () => void) => {
      const sign = direction === 'right' ? 1 : -1;
      Animated.parallel([
        Animated.timing(pan.x, {
          toValue: sign * EXIT_DISTANCE,
          duration: 280,
          useNativeDriver: true,
        }),
        Animated.timing(pan.y, {
          toValue: EXIT_Y,
          duration: 280,
          useNativeDriver: true,
        }),
      ]).start(() => {
        resetCard();
        setCurrentIndex((i) => i + 1);
        onDone();
      });
    },
    [pan, resetCard],
  );

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, g) =>
        Math.abs(g.dx) > 15 && Math.abs(g.dx) > Math.abs(g.dy),
      onPanResponderGrant: () => {
        gestureMode.current = 'throw';
      },
      onPanResponderMove: (_, gestureState) => {
        const { dx } = gestureState;
        const arcY = (dx / SW) * EXIT_Y * 0.8;
        pan.setValue({ x: dx, y: arcY });
      },
      onPanResponderRelease: (_, gestureState) => {
        const { dx, vx } = gestureState;
        const shouldThrow = Math.abs(dx) > THROW_THRESHOLD || Math.abs(vx) > 0.3;
        const idx = currentIndexRef.current;
        const list = profilesRef.current;
        if (shouldThrow && list[idx]) {
          runExitAnimation(dx > 0 ? 'right' : 'left', () => {});
        } else {
          Animated.spring(pan, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: true,
            friction: 8,
            tension: 80,
          }).start(() => resetCard());
        }
        gestureMode.current = null;
      },
    }),
  ).current;

  const handleReject = useCallback(() => {
    if (profiles[currentIndex] == null) return;
    runExitAnimation('left', () => {});
  }, [currentIndex, profiles, runExitAnimation]);

  const handleMatch = useCallback(() => {
    if (profiles[currentIndex] == null) return;
    runExitAnimation('right', () => {});
  }, [currentIndex, profiles, runExitAnimation]);

  const current = profiles[currentIndex];
  const next = profiles[currentIndex + 1];
  const noMoreCards = !loading && profiles.length > 0 && current == null;

  if (loading) {
    return (
      <View style={st.container}>
        <View style={st.header}>
          <TouchableOpacity style={st.headerFilterBtn} activeOpacity={0.7}>
            <Ionicons name="options-outline" size={26} color="#6C26CB" />
          </TouchableOpacity>
        </View>
        <View style={st.loadingWrap}>
          <ActivityIndicator size="large" color="#6C26CB" />
        </View>
      </View>
    );
  }

  if (!profiles.length || noMoreCards) {
    return (
      <View style={st.container}>
        <View style={st.header}>
          <TouchableOpacity style={st.headerFilterBtn} activeOpacity={0.7}>
            <Ionicons name="options-outline" size={26} color="#6C26CB" />
          </TouchableOpacity>
        </View>
        <View style={st.emptyState}>
          <Text style={st.emptyStateText}>{t('discoveryNoProfiles')}</Text>
        </View>
      </View>
    );
  }

  const rotateInterpolate = pan.x.interpolate({
    inputRange: [-SW, 0, SW],
    outputRange: [`-${EXIT_ROTATE}deg`, '0deg', `${EXIT_ROTATE}deg`],
    extrapolate: 'clamp',
  });

  return (
    <View style={st.container}>
      {locationPromptVisible && (
        <View style={st.locationPromptOverlay}>
          <View style={st.locationPromptCard}>
            <Text style={st.locationPromptTitle}>{t('locationPromptTitle')}</Text>
            <TouchableOpacity style={st.locationPromptPrimaryBtn} onPress={handleAllowLocation} activeOpacity={0.8}>
              <Text style={st.locationPromptPrimaryBtnText}>{t('locationAllow')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={st.locationPromptSecondaryBtn} onPress={handleOpenCityPicker} activeOpacity={0.8}>
              <Text style={st.locationPromptSecondaryBtnText}>{t('locationChooseCity')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <Modal
        visible={showCityPicker}
        animationType="slide"
        transparent
        onRequestClose={() => setShowCityPicker(false)}
      >
        <View style={st.cityPickerOverlay}>
          <View style={st.cityPickerContainer}>
            <View style={st.cityPickerHeader}>
              <Text style={st.cityPickerTitle}>{t('locationChooseCity')}</Text>
              <TouchableOpacity
                style={st.cityPickerCloseBtn}
                onPress={() => { setShowCityPicker(false); setCitySearch(''); }}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                <Ionicons name="close" size={28} color="#1F2937" />
              </TouchableOpacity>
            </View>
            <TextInput
              style={st.citySearchInput}
              value={citySearch}
              onChangeText={setCitySearch}
              placeholder={t('citySearchPlaceholder')}
              placeholderTextColor="#9CA3AF"
            />
            <FlatList
              data={filteredCities}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={st.cityRow}
                  onPress={() => handleSelectCity(item)}
                  activeOpacity={0.7}
                >
                  <Text style={st.cityRowText}>{item.name}</Text>
                  <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                </TouchableOpacity>
              )}
              style={st.cityList}
              ListEmptyComponent={
                <Text style={st.cityListEmpty}>{t('cityListEmpty')}</Text>
              }
            />
          </View>
        </View>
      </Modal>
      <View style={st.header}>
        <TouchableOpacity style={st.headerFilterBtn} activeOpacity={0.7}>
          <Ionicons name="options-outline" size={26} color="#6C26CB" />
        </TouchableOpacity>
      </View>
      <View style={st.cardStack}>
        {/* Card de trás (próximo perfil) */}
        {next != null && (
          <View style={[st.cardBase, st.cardBack]} pointerEvents="none">
            <Image source={{ uri: next.photoUrl }} style={st.cardImage} resizeMode="cover" />
            <LinearGradient
              colors={['rgba(0,0,0,0.65)', 'transparent']}
              style={st.cardGradientOverlay}
            >
              <View style={st.cardNameRow}>
                <Text style={st.cardProfileName} numberOfLines={1}>
                  {next.nome}, {getAge(next.birthDate)}
                </Text>
                {formatDistance(next.distanceMeters) ? (
                  <Text style={st.cardDistance}>
                    {t('distanceFromYou').replace('{{distance}}', formatDistance(next.distanceMeters))}
                  </Text>
                ) : null}
              </View>
            </LinearGradient>
          </View>
        )}

        {/* Card da frente (atual) */}
        {current != null && (
          <Animated.View
            style={[
              st.cardBase,
              st.cardFront,
              {
                transform: [
                  { scale: scaleFront },
                  { translateX: pan.x },
                  { translateY: pan.y },
                  { rotate: rotateInterpolate },
                ],
              },
            ]}
            {...panResponder.panHandlers}
          >
            <ScrollView
              style={st.cardScrollView}
              contentContainerStyle={st.cardScrollContent}
              showsVerticalScrollIndicator={false}
              bounces={true}
              scrollEventThrottle={16}
            >
              <View style={st.cardImageBlock}>
                <Image
                  source={{ uri: current.photoUrl }}
                  style={st.cardImage}
                  resizeMode="cover"
                />
              </View>
              <View style={st.cardInfoPanel}>
                <Text style={st.cardRevealLabel}>{t('discoveryPreferences')}</Text>
                <View style={st.cardRevealTags}>
                  {(current.categories || []).slice(0, 5).map((catId) => (
                    <View key={catId} style={st.cardRevealTag}>
                      <Text style={st.cardRevealTagText}>
                        {categoryLabels[catId] ?? catId}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
              {(current.galleryPhotos?.length ?? 0) > 0 && (
                <View style={st.cardGallerySection}>
                  <Text style={st.cardGalleryTitle}>{t('galleryTitle')}</Text>
                  <View style={st.cardGalleryGrid}>
                    {current.galleryPhotos!.map((photo) => (
                      <View key={photo.id} style={st.cardGalleryItem}>
                        <Image
                          source={{ uri: photo.url }}
                          style={st.cardGalleryItemImage}
                          resizeMode="cover"
                        />
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </ScrollView>
            <LinearGradient
              colors={['rgba(0,0,0,0.65)', 'transparent']}
              style={st.cardGradientOverlay}
              pointerEvents="none"
            >
              <View style={st.cardNameRow}>
                <Text style={st.cardProfileName} numberOfLines={1}>
                  {current.nome}, {getAge(current.birthDate)}
                </Text>
                {formatDistance(current.distanceMeters) ? (
                  <Text style={st.cardDistance}>
                    {t('distanceFromYou').replace('{{distance}}', formatDistance(current.distanceMeters))}
                  </Text>
                ) : null}
              </View>
            </LinearGradient>
          </Animated.View>
        )}
      </View>

      {current != null && (
        <View style={st.buttonsRow}>
          <TouchableOpacity style={[st.actionBtn, st.actionBtnReject]} onPress={handleReject} activeOpacity={0.8}>
            <Text style={{ fontSize: 28, color: '#5C4D6B' }}>✕</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[st.actionBtn, st.actionBtnMatch]} onPress={handleMatch} activeOpacity={0.8}>
            <Text style={{ fontSize: 32, color: '#E94B6C' }}>♥</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
