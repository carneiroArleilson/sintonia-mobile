import React, { useState, useEffect, useRef, useCallback } from 'react';
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
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from '../i18n/LanguageProvider';
import { useAuth } from '../api/AuthContext';
import { getDiscoveryProfiles, getCategories, type DiscoveryProfile } from '../api/client';
import { styles as st } from './MatchScreen.styles';

const { width: SW, height: SH } = Dimensions.get('window');
const THROW_THRESHOLD = 60;
const EXIT_DISTANCE = SW * 1.1;
const EXIT_Y = SH * 0.35;
const EXIT_ROTATE = 22;

function getAge(birthDate: string): number {
  const [y] = birthDate.split('-').map(Number);
  return new Date().getFullYear() - y;
}

export function MatchScreen() {
  const { t } = useTranslation();
  const { token } = useAuth();
  const [profiles, setProfiles] = useState<DiscoveryProfile[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [categoryLabels, setCategoryLabels] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

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
              <Text style={st.cardProfileName} numberOfLines={1}>
                {next.nome}, {getAge(next.birthDate)}
              </Text>
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
              <Text style={st.cardProfileName} numberOfLines={1}>
                {current.nome}, {getAge(current.birthDate)}
              </Text>
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
