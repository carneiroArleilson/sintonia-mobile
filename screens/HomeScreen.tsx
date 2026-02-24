import { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  FlatList,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as Location from 'expo-location';
import { useTranslation } from '../i18n/LanguageProvider';
import { useAuth } from '../api/AuthContext';
import {
  getCategories,
  updateAppProfile,
  checkEmailAvailable,
  uploadProfilePhoto,
  updateProfilePhotoUrl,
  addGalleryPhoto,
  removeGalleryPhoto,
  updateProfileLocation,
  type CategoryItem,
} from '../api/client';
import { CITIES, type City } from '../data/cities';
import {
  PHONE_COUNTRIES,
  DEFAULT_PHONE_COUNTRY,
  getCountryByCode,
  parseFullPhone,
  applyPhoneMaskByCountry,
  getFullPhoneDigits,
} from '../utils/phone';
import { styles } from './HomeScreen.styles';
import { PhotoSourceModal } from '../components/PhotoSourceModal';
import * as ImagePicker from 'expo-image-picker';

const PLACEHOLDER_COLOR = '#9CA3AF';

const GENDER_LABELS: Record<string, string> = {
  male: 'genderMale',
  female: 'genderFemale',
  non_binary: 'genderNonBinary',
  other: 'genderOther',
};

const WHO_LABELS: Record<string, string> = {
  male: 'whoMen',
  female: 'whoWomen',
  non_binary: 'whoAll',
  all: 'whoAll',
};

const GENDER_SEGMENTS = [
  { value: 'male', labelKey: 'genderMale' },
  { value: 'female', labelKey: 'genderFemale' },
  { value: 'non_binary', labelKey: 'genderNonBinary' },
] as const;

const WHO_OPTIONS = [
  { value: 'male', labelKey: 'whoMen' },
  { value: 'female', labelKey: 'whoWomen' },
  { value: 'non_binary', labelKey: 'whoAll' },
] as const;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
function isValidEmail(s: string): boolean {
  return EMAIL_REGEX.test((s ?? '').trim());
}

function isValidDateString(s: string): boolean {
  if (!s || s.length !== 10) return false;
  const [y, m, d] = s.split('-').map(Number);
  if (isNaN(y) || isNaN(m) || isNaN(d)) return false;
  const date = new Date(y, m - 1, d);
  return date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d;
}

function isAtLeast18(birthDateIso: string): boolean {
  if (!birthDateIso || birthDateIso.length < 10) return false;
  const [y, m, d] = birthDateIso.slice(0, 10).split('-').map(Number);
  const birth = new Date(y, m - 1, d);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) age--;
  return age >= 18;
}

type Lang = 'pt' | 'en' | 'es';
function getDateFormatOrder(lang: Lang): 'dmy' | 'mdy' {
  return lang === 'en' ? 'mdy' : 'dmy';
}
function isoToDisplay(iso: string, lang: Lang): string {
  if (!iso || iso.length < 10) return '';
  const [y, m, d] = iso.split('-').map((n) => n.replace(/^0+/, '') || '0');
  const order = getDateFormatOrder(lang);
  const dd = d.padStart(2, '0');
  const mm = m.padStart(2, '0');
  return order === 'dmy' ? `${dd}/${mm}/${y}` : `${mm}/${dd}/${y}`;
}
function displayToIso(display: string, lang: Lang): string {
  const digits = display.replace(/\D/g, '');
  if (digits.length !== 8) return '';
  const order = getDateFormatOrder(lang);
  const d = order === 'dmy' ? parseInt(digits.slice(0, 2), 10) : parseInt(digits.slice(2, 4), 10);
  const m = order === 'dmy' ? parseInt(digits.slice(2, 4), 10) : parseInt(digits.slice(0, 2), 10);
  const y = parseInt(digits.slice(4, 8), 10);
  if (m < 1 || m > 12 || d < 1 || d > 31 || y < 1900 || y > 2100) return '';
  const date = new Date(y, m - 1, d);
  if (date.getFullYear() !== y || date.getMonth() !== m - 1 || date.getDate() !== d) return '';
  return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}
function applyDateMask(input: string, lang: Lang): string {
  const digits = input.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

function formatDateIsoToDisplay(iso: string, lang: string): string {
  if (!iso || iso.length < 10) return iso || '';
  const [y, m, d] = iso.slice(0, 10).split('-');
  if (lang === 'pt' || lang === 'es') return `${d}/${m}/${y}`;
  return `${m}/${d}/${y}`;
}

function DataRow({
  label,
  value,
  emptyChar = '—',
}: {
  label: string;
  value: string | null | undefined;
  emptyChar?: string;
}) {
  const display = (value ?? '').trim() || emptyChar;
  return (
    <View style={styles.dataRow}>
      <Text style={styles.dataLabel}>{label}</Text>
      <Text style={styles.dataValue} numberOfLines={2}>
        {display}
      </Text>
    </View>
  );
}

export function HomeScreen({ embedded }: { embedded?: boolean }) {
  const insets = useSafeAreaInsets();
  const { t, lang } = useTranslation();
  const { user, token, logout, refreshProfile } = useAuth();
  const langTyped = lang as Lang;

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.nome ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [phoneCountryCode, setPhoneCountryCode] = useState(DEFAULT_PHONE_COUNTRY.code);
  const [phoneNationalDigits, setPhoneNationalDigits] = useState('');
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [birthDate, setBirthDate] = useState(user?.birthDate ?? '');
  const [birthDateInput, setBirthDateInput] = useState('');
  const [gender, setGender] = useState<string | null>(user?.gender ?? null);
  const [genderLookingFor, setGenderLookingFor] = useState<string | null>(
    user?.genderLookingFor ?? null,
  );
  const [categoryIds, setCategoryIds] = useState<string[]>(user?.categories ?? []);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [saving, setSaving] = useState(false);
  const [localPhotoUri, setLocalPhotoUri] = useState<string | null>(null);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [showPhotoSourceModal, setShowPhotoSourceModal] = useState(false);
  const [showGalleryPhotoModal, setShowGalleryPhotoModal] = useState(false);
  const [galleryUploading, setGalleryUploading] = useState(false);
  const [bio, setBio] = useState(user?.bio ?? '');
  const [locationChoice, setLocationChoice] = useState<'gps' | 'manual' | null>(null);
  const [locationCityName, setLocationCityName] = useState<string>('');
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showCityPicker, setShowCityPicker] = useState(false);
  const [citySearch, setCitySearch] = useState('');
  const [locationUpdating, setLocationUpdating] = useState(false);

  const LOCATION_CHOICE_KEY = '@sintonia_location_choice';
  const LOCATION_LAST_LAT_KEY = '@sintonia_last_lat';
  const LOCATION_LAST_LNG_KEY = '@sintonia_last_lng';
  const LOCATION_LAST_SENT_AT_KEY = '@sintonia_last_location_sent_at';
  const LOCATION_MANUAL_CITY_KEY = '@sintonia_location_manual_city_name';

  useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);

  useEffect(() => {
    AsyncStorage.multiGet(['@sintonia_location_choice', '@sintonia_location_manual_city_name'])
      .then(([[, choice], [, cityName]]) => {
        if (choice === 'gps' || choice === 'manual') setLocationChoice(choice);
        if (cityName) setLocationCityName(cityName);
      })
      .catch(() => {});
  }, []);

  const handleAllowLocation = useCallback(async () => {
    if (!token) return;
    setLocationUpdating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== Location.PermissionStatus.GRANTED) {
        setShowLocationModal(false);
        setLocationUpdating(false);
        return;
      }
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const { latitude, longitude } = loc.coords;
      await updateProfileLocation(token, latitude, longitude);
      await AsyncStorage.setItem(LOCATION_CHOICE_KEY, 'gps');
      await AsyncStorage.setItem(LOCATION_LAST_LAT_KEY, String(latitude));
      await AsyncStorage.setItem(LOCATION_LAST_LNG_KEY, String(longitude));
      await AsyncStorage.setItem(LOCATION_LAST_SENT_AT_KEY, String(Date.now()));
      await AsyncStorage.removeItem('@sintonia_location_manual_city_name');
      setLocationChoice('gps');
      setLocationCityName('');
      setShowLocationModal(false);
    } catch (e) {
      if (__DEV__) console.warn('[HomeScreen] Falha ao obter localização:', e);
      setShowLocationModal(false);
    } finally {
      setLocationUpdating(false);
    }
  }, [token]);

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
        setLocationCityName(city.name);
        setShowCityPicker(false);
        setShowLocationModal(false);
        setCitySearch('');
      } catch (e) {
        if (__DEV__) console.warn('[HomeScreen] Falha ao salvar cidade:', e);
      }
    },
    [token],
  );

  const filteredCities = useMemo(() => {
    const q = citySearch.trim().toLowerCase();
    if (!q) return CITIES;
    return CITIES.filter((c) => c.name.toLowerCase().includes(q));
  }, [citySearch]);

  useEffect(() => {
    if (!user) return;
    setName(user.nome ?? '');
    setEmail(user.email ?? '');
    const { code, national } = parseFullPhone(user.phone ?? '');
    setPhoneCountryCode(code);
    setPhoneNationalDigits(national.replace(/\D/g, ''));
    setBirthDate(user.birthDate ?? '');
    setBirthDateInput(user.birthDate ? isoToDisplay(user.birthDate, langTyped) : '');
    setGender(user.gender ?? null);
    setGenderLookingFor(user.genderLookingFor ?? null);
    setCategoryIds(user.categories ?? []);
    setBio(user.bio ?? '');
  }, [user, langTyped, isEditing]);

  useEffect(() => {
    if (!isEditing) return;
    setLoadingCategories(true);
    getCategories(lang)
      .then(setCategories)
      .catch(() => setCategories([]))
      .finally(() => setLoadingCategories(false));
  }, [isEditing, lang]);

  const toggleCategory = useCallback((id: string) => {
    setCategoryIds((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
    );
  }, []);

  const runPicker = useCallback(
    async (source: 'gallery' | 'camera') => {
      if (!token || photoUploading) return;
      if (source === 'gallery') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert(
            t('profilePhoto'),
            'Para alterar a foto, permita o acesso à galeria nas configurações do dispositivo.',
          );
          return;
        }
      } else {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert(
            t('profilePhoto'),
            'Para tirar uma foto, permita o acesso à câmera nas configurações do dispositivo.',
          );
          return;
        }
      }
      const launchOptions: ImagePicker.ImagePickerOptions = {
        mediaTypes: 'images',
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      };
      const result =
        source === 'gallery'
          ? await ImagePicker.launchImageLibraryAsync(launchOptions)
          : await ImagePicker.launchCameraAsync(launchOptions);
      if (result.canceled || !result.assets?.[0]?.uri) return;
      const asset = result.assets[0];
      setLocalPhotoUri(asset.uri);
      setPhotoUploading(true);
      try {
        const { url } = await uploadProfilePhoto(token, {
          uri: asset.uri,
          type: asset.mimeType || 'image/jpeg',
          name: 'photo.jpg',
        });
        setLocalPhotoUri(url);
        try {
          await updateProfilePhotoUrl(token, url);
          await refreshProfile();
          setLocalPhotoUri(null);
        } catch (updateErr) {
          const updateMsg = updateErr instanceof Error ? updateErr.message : '';
          if (updateMsg.includes('User not found') || updateMsg.includes('not found')) {
            await refreshProfile();
          } else {
            throw updateErr;
          }
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Falha ao enviar foto';
        Alert.alert('Erro', msg);
      } finally {
        setPhotoUploading(false);
      }
    },
    [token, photoUploading, refreshProfile, t],
  );

  const openPhotoSourceModal = useCallback(() => {
    if (!token || photoUploading) return;
    setShowPhotoSourceModal(true);
  }, [token, photoUploading]);

  const runPickerForGallery = useCallback(
    async (source: 'gallery' | 'camera') => {
      if (!token || galleryUploading) return;
      if (source === 'gallery') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert(
            t('profilePhoto'),
            'Para adicionar uma foto, permita o acesso à galeria nas configurações do dispositivo.',
          );
          return;
        }
      } else {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert(
            t('profilePhoto'),
            'Para tirar uma foto, permita o acesso à câmera nas configurações do dispositivo.',
          );
          return;
        }
      }
      if (source === 'gallery') {
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: 'images',
          allowsMultipleSelection: true,
          selectionLimit: 20,
          quality: 0.8,
        });
        if (result.canceled || !result.assets?.length) return;
        setGalleryUploading(true);
        try {
          for (const asset of result.assets) {
            if (!asset.uri) continue;
            const { url } = await uploadProfilePhoto(token, {
              uri: asset.uri,
              type: asset.mimeType || 'image/jpeg',
              name: 'photo.jpg',
            });
            await addGalleryPhoto(token, url);
          }
          if (result.assets.length > 0) await refreshProfile();
        } catch (e) {
          const msg = e instanceof Error ? e.message : 'Falha ao enviar foto';
          Alert.alert('Erro', msg);
        } finally {
          setGalleryUploading(false);
        }
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: 'images',
        quality: 0.8,
      });
      if (result.canceled || !result.assets?.[0]?.uri) return;
      const asset = result.assets[0];
      setGalleryUploading(true);
      try {
        const { url } = await uploadProfilePhoto(token, {
          uri: asset.uri,
          type: asset.mimeType || 'image/jpeg',
          name: 'photo.jpg',
        });
        await addGalleryPhoto(token, url);
        await refreshProfile();
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Falha ao enviar foto';
        Alert.alert('Erro', msg);
      } finally {
        setGalleryUploading(false);
      }
    },
    [token, galleryUploading, refreshProfile, t],
  );

  const openGalleryPhotoModal = useCallback(() => {
    if (!token || galleryUploading) return;
    setShowGalleryPhotoModal(true);
  }, [token, galleryUploading]);

  const handleRemoveGalleryPhoto = useCallback(
    (photoId: string) => {
      Alert.alert(
        t('galleryRemove'),
        t('galleryRemoveConfirm'),
        [
          { text: t('cancelEdit'), style: 'cancel' },
          {
            text: t('galleryRemove'),
            style: 'destructive',
            onPress: async () => {
              if (!token) return;
              try {
                await removeGalleryPhoto(token, photoId);
                await refreshProfile();
              } catch (e) {
                const msg = e instanceof Error ? e.message : 'Falha ao remover';
                Alert.alert('Erro', msg);
              }
            },
          },
        ],
      );
    },
    [token, refreshProfile, t],
  );

  const handleSave = useCallback(async () => {
    if (!token) return;
    const fullPhone = getFullPhoneDigits(phoneCountryCode, phoneNationalDigits);
    if (!name.trim()) {
      Alert.alert(t('profileCompleteRequiredTitle'), t('profileCompleteRequiredMessage'));
      return;
    }
    if (!isValidEmail(email)) {
      Alert.alert('Erro', 'E-mail inválido.');
      return;
    }
    if (fullPhone.length < 10) {
      Alert.alert('Erro', 'Celular inválido.');
      return;
    }
    if (!isValidDateString(birthDate)) {
      Alert.alert('Erro', 'Data de nascimento inválida.');
      return;
    }
    if (!isAtLeast18(birthDate)) {
      Alert.alert(t('profileCompleteRequiredTitle'), t('profileUnderAge'));
      return;
    }
    if (!gender || !genderLookingFor) {
      Alert.alert('Erro', 'Selecione gênero e quem você quer conhecer.');
      return;
    }
    if (categoryIds.length === 0) {
      Alert.alert('Erro', t('profileCategoriesHint'));
      return;
    }
    setSaving(true);
    try {
      const { available } = await checkEmailAvailable(token, email.trim().toLowerCase());
      if (!available) {
        Alert.alert(t('profileEmailInUse'));
        setSaving(false);
        return;
      }
      const birthDateIso =
        birthDate.trim().match(/^\d{4}-\d{2}-\d{2}$/) ? birthDate.trim() : displayToIso(birthDateInput, langTyped);
      await updateAppProfile(token, {
        nome: name.trim(),
        email: email.trim().toLowerCase(),
        phone: fullPhone,
        birthDate: birthDateIso || undefined,
        gender: gender || undefined,
        genderLookingFor: genderLookingFor || undefined,
        categories: categoryIds,
        bio: bio.trim() || undefined,
      });
      await refreshProfile();
      setIsEditing(false);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Falha ao salvar';
      Alert.alert('Erro', msg);
    } finally {
      setSaving(false);
    }
  }, [
    token,
    name,
    email,
    phoneCountryCode,
    phoneNationalDigits,
    birthDate,
    birthDateInput,
    gender,
    genderLookingFor,
    categoryIds,
    langTyped,
    refreshProfile,
    t,
    bio,
  ]);

  const handleCancel = useCallback(() => {
    setIsEditing(false);
  }, []);

  const genderLabel = user?.gender ? t(GENDER_LABELS[user.gender] || user.gender) : null;
  const lookingForLabel = user?.genderLookingFor
    ? t(WHO_LABELS[user.genderLookingFor] || user.genderLookingFor)
    : null;
  const birthDateDisplay = user?.birthDate
    ? formatDateIsoToDisplay(user.birthDate, lang)
    : null;
  const categoriesCount = user?.categories?.length ?? 0;

  const scrollContentStyle = [
    styles.scrollContent,
    embedded && { paddingBottom: 24 + 56 + insets.bottom },
  ];

  if (isEditing) {
    const phoneCountry = getCountryByCode(phoneCountryCode);
    const phoneDisplay = applyPhoneMaskByCountry(phoneNationalDigits, phoneCountry);
    return (
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <View
          style={[
            styles.container,
            {
              paddingTop: embedded ? 16 : insets.top,
              paddingBottom: embedded ? 0 : insets.bottom,
            },
          ]}
        >
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={scrollContentStyle}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={styles.title}>{t('homeProfileTitle')}</Text>

            <View style={styles.formField}>
              <Text style={styles.formLabel}>{t('profilePhoto')}</Text>
              <View style={styles.photoEditWrap}>
                <View style={styles.photoWrap}>
                  {photoUploading ? (
                    <View style={[styles.photo, styles.photoPlaceholder]}>
                      <ActivityIndicator size="large" color="#6C26CB" />
                    </View>
                  ) : localPhotoUri || user?.photoUrl ? (
                    <Image
                      source={{ uri: localPhotoUri || user?.photoUrl || '' }}
                      style={styles.photo}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={[styles.photo, styles.photoPlaceholder]}>
                      <Ionicons name="camera-outline" size={40} color="#6C26CB" />
                    </View>
                  )}
                </View>
                <TouchableOpacity
                  style={styles.editPhotoButton}
                  onPress={openPhotoSourceModal}
                  disabled={photoUploading}
                  activeOpacity={0.8}
                >
                  <Text style={styles.editPhotoButtonText}>{t('editPhotoChange')}</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.formField}>
              <Text style={styles.formLabel}>{t('galleryTitle')}</Text>
              <Text style={{ fontSize: 13, color: '#6B7280', marginBottom: 8 }}>{t('gallerySubtitle')}</Text>
              <View style={styles.galleryGrid}>
                {(user?.galleryPhotos ?? []).map((photo) => (
                  <View key={photo.id} style={styles.galleryItem}>
                    <Image source={{ uri: photo.url }} style={styles.galleryItemImage} resizeMode="cover" />
                    <TouchableOpacity
                      style={styles.galleryRemoveBtn}
                      onPress={() => handleRemoveGalleryPhoto(photo.id)}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="close" size={18} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>
                ))}
                <TouchableOpacity
                  style={styles.galleryAddCell}
                  onPress={openGalleryPhotoModal}
                  disabled={galleryUploading}
                  activeOpacity={0.8}
                >
                  <View style={styles.galleryAddCellContent}>
                    {galleryUploading ? (
                      <ActivityIndicator size="small" color="#6C26CB" />
                    ) : (
                      <Ionicons name="add" size={32} color="#6C26CB" />
                    )}
                  </View>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.formField}>
              <Text style={styles.formLabel}>{t('profileName')}</Text>
              <TextInput
                style={styles.formInput}
                value={name}
                onChangeText={setName}
                placeholder={t('profileNamePlaceholder')}
                placeholderTextColor={PLACEHOLDER_COLOR}
                autoCapitalize="words"
              />
            </View>
            <View style={styles.formField}>
              <Text style={styles.formLabel}>{t('homeLabelEmail')}</Text>
              <TextInput
                style={styles.formInput}
                value={email}
                onChangeText={setEmail}
                placeholder={t('profileEmailPlaceholder')}
                placeholderTextColor={PLACEHOLDER_COLOR}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            <View style={styles.formField}>
              <Text style={styles.formLabel}>{t('homeLabelPhone')}</Text>
              <View style={styles.phoneRow}>
                <TouchableOpacity
                  style={styles.phoneCountryBtn}
                  onPress={() => setShowCountryPicker(true)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.phoneCountryText}>+{phoneCountryCode}</Text>
                  <Ionicons name="chevron-down" size={18} color="#262626" />
                </TouchableOpacity>
                <TextInput
                  style={styles.phoneInput}
                  value={phoneDisplay}
                  onChangeText={(text) => {
                    const d = text.replace(/\D/g, '').slice(0, phoneCountry.maxLen);
                    setPhoneNationalDigits(d);
                  }}
                  placeholder={phoneCountry.placeholder}
                  placeholderTextColor={PLACEHOLDER_COLOR}
                  keyboardType="phone-pad"
                  maxLength={phoneCountry.maxLen + 6}
                />
              </View>
            </View>
            {showCountryPicker && (
              <Modal visible transparent animationType="slide">
                <TouchableOpacity
                  style={styles.modalOverlay}
                  activeOpacity={1}
                  onPress={() => setShowCountryPicker(false)}
                />
                <View style={styles.modalBox}>
                  <View style={styles.modalHeader}>
                    <TouchableOpacity onPress={() => setShowCountryPicker(false)}>
                      <Text style={styles.modalTitle}>{t('profileBack')}</Text>
                    </TouchableOpacity>
                    <Text style={[styles.modalTitle, { flex: 1, textAlign: 'center' }]}>
                      {t('profilePhoneCountry')}
                    </Text>
                    <View style={{ width: 60 }} />
                  </View>
                  <ScrollView style={{ maxHeight: 260 }} keyboardShouldPersistTaps="handled">
                    {PHONE_COUNTRIES.map((c) => (
                      <TouchableOpacity
                        key={c.code + c.name}
                        style={styles.countryOption}
                        onPress={() => {
                          setPhoneCountryCode(c.code);
                          setPhoneNationalDigits((prev) => prev.slice(0, c.maxLen));
                          setShowCountryPicker(false);
                        }}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.countryOptionText}>
                          +{c.code} — {c.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </Modal>
            )}

            <View style={styles.formField}>
              <Text style={styles.formLabel}>{t('profileBirthDate')}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <TextInput
                  style={[styles.formInput, { flex: 1 }]}
                  value={birthDateInput}
                  onChangeText={(text) => {
                    const masked = applyDateMask(text, langTyped);
                    setBirthDateInput(masked);
                    setBirthDate(displayToIso(masked, langTyped));
                  }}
                  placeholder={t('profileBirthDatePlaceholder')}
                  placeholderTextColor={PLACEHOLDER_COLOR}
                  keyboardType="numbers-and-punctuation"
                  maxLength={10}
                />
                <TouchableOpacity
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 16,
                    borderWidth: 1,
                    borderColor: '#D1D5DB',
                    backgroundColor: '#FFFFFF',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  onPress={() => setShowDatePicker(true)}
                  activeOpacity={0.8}
                >
                  <Ionicons name="calendar-outline" size={24} color="#262626" />
                </TouchableOpacity>
              </View>
            </View>
            {showDatePicker && (
              <Modal visible transparent animationType="slide">
                <TouchableOpacity
                  style={styles.modalOverlay}
                  activeOpacity={1}
                  onPress={() => setShowDatePicker(false)}
                />
                <View style={[styles.modalBox, { paddingBottom: 34 }]}>
                  <View style={styles.modalHeader}>
                    <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                      <Text style={styles.modalTitle}>{t('profileBack')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => {
                        setShowDatePicker(false);
                      }}
                    >
                      <Text style={styles.saveButtonText}>{t('profileContinue')}</Text>
                    </TouchableOpacity>
                  </View>
                  <DateTimePicker
                    value={
                      birthDate && birthDate.length >= 10
                        ? new Date(
                            parseInt(birthDate.slice(0, 4), 10),
                            parseInt(birthDate.slice(5, 7), 10) - 1,
                            parseInt(birthDate.slice(8, 10), 10),
                          )
                        : new Date(2000, 0, 1)
                    }
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'calendar'}
                    maximumDate={(() => {
                      const d = new Date();
                      d.setFullYear(d.getFullYear() - 18);
                      return d;
                    })()}
                    minimumDate={new Date(1900, 0, 1)}
                    onChange={(_, selectedDate) => {
                      if (selectedDate) {
                        const y = selectedDate.getFullYear();
                        const m = String(selectedDate.getMonth() + 1).padStart(2, '0');
                        const d = String(selectedDate.getDate()).padStart(2, '0');
                        const iso = `${y}-${m}-${d}`;
                        setBirthDate(iso);
                        setBirthDateInput(isoToDisplay(iso, langTyped));
                      }
                      setShowDatePicker(false);
                    }}
                  />
                </View>
              </Modal>
            )}

            <View style={styles.formField}>
              <Text style={styles.formLabel}>{t('profileGender')}</Text>
              <View style={styles.segmentRow}>
                {GENDER_SEGMENTS.map((opt) => (
                  <TouchableOpacity
                    key={opt.value}
                    style={[styles.segment, gender === opt.value && styles.segmentSelected]}
                    onPress={() => setGender(opt.value)}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.segmentText,
                        gender === opt.value && styles.segmentTextSelected,
                      ]}
                    >
                      {t(opt.labelKey)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <View style={styles.formField}>
              <Text style={styles.formLabel}>{t('profileGenderLookingFor')}</Text>
              <View style={styles.optionColumn}>
                {WHO_OPTIONS.map((opt) => (
                  <TouchableOpacity
                    key={opt.value}
                    style={[
                      styles.optionBig,
                      genderLookingFor === opt.value && styles.optionBigSelected,
                    ]}
                    onPress={() => setGenderLookingFor(opt.value)}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.optionBigText,
                        genderLookingFor === opt.value && styles.optionBigTextSelected,
                      ]}
                    >
                      {t(opt.labelKey)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <View style={styles.formField}>
              <Text style={styles.formLabel}>{t('profileCategories')}</Text>
              {loadingCategories ? (
                <ActivityIndicator size="small" color="#6C26CB" style={{ marginVertical: 12 }} />
              ) : (
                <View style={styles.categoryGrid}>
                  {categories.map((c) => (
                    <TouchableOpacity
                      key={c.id}
                      style={[styles.tag, categoryIds.includes(c.id) && styles.tagSelected]}
                      onPress={() => toggleCategory(c.id)}
                      activeOpacity={0.8}
                    >
                      <Text
                        style={[
                          styles.tagText,
                          categoryIds.includes(c.id) && styles.tagTextSelected,
                        ]}
                      >
                        {c.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            <View style={styles.formField}>
              <Text style={styles.formLabel}>{t('profileDescriptionTitle')}</Text>
              <TextInput
                style={[styles.formInput, { minHeight: 100, textAlignVertical: 'top', paddingTop: 14 }]}
                value={bio}
                onChangeText={setBio}
                placeholder={t('profileDescriptionPlaceholder')}
                placeholderTextColor={PLACEHOLDER_COLOR}
                multiline
                numberOfLines={4}
              />
            </View>

            <View style={styles.rowButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleCancel}
                disabled={saving}
                activeOpacity={0.8}
              >
                <Text style={styles.cancelButtonText}>{t('cancelEdit')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSave}
                disabled={saving}
                activeOpacity={0.8}
              >
                {saving ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.saveButtonText}>{t('saveProfile')}</Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
        <PhotoSourceModal
          visible={showPhotoSourceModal}
          onClose={() => setShowPhotoSourceModal(false)}
          onPickGallery={() => runPicker('gallery')}
          onPickCamera={() => runPicker('camera')}
          title={t('photoSourceTitle')}
          subtitle={t('photoSourceSubtitle')}
          galleryLabel={t('photoSourceGallery')}
          cameraLabel={t('photoSourceCamera')}
          cancelLabel={t('cancelEdit')}
        />
        <PhotoSourceModal
          visible={showGalleryPhotoModal}
          onClose={() => setShowGalleryPhotoModal(false)}
          onPickGallery={() => {
            setShowGalleryPhotoModal(false);
            runPickerForGallery('gallery');
          }}
          onPickCamera={() => {
            setShowGalleryPhotoModal(false);
            runPickerForGallery('camera');
          }}
          title={t('photoSourceTitle')}
          subtitle={t('gallerySubtitle')}
          galleryLabel={t('photoSourceGallery')}
          cameraLabel={t('photoSourceCamera')}
          cancelLabel={t('cancelEdit')}
        />
      </KeyboardAvoidingView>
    );
  }

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: embedded ? 16 : insets.top,
          paddingBottom: embedded ? 0 : insets.bottom,
        },
      ]}
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={scrollContentStyle}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>{t('homeProfileTitle')}</Text>

        {user?.photoUrl || localPhotoUri ? (
          <TouchableOpacity
            style={styles.photoWrap}
            onPress={openPhotoSourceModal}
            disabled={photoUploading}
            activeOpacity={0.9}
          >
            {photoUploading ? (
              <View style={[styles.photo, styles.photoPlaceholder]}>
                <ActivityIndicator size="large" color="#6C26CB" />
              </View>
            ) : (
              <Image
                source={{ uri: localPhotoUri || user?.photoUrl || '' }}
                style={styles.photo}
                resizeMode="cover"
              />
            )}
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.photoWrap}
            onPress={openPhotoSourceModal}
            disabled={photoUploading}
            activeOpacity={0.9}
          >
            <View style={[styles.photo, styles.photoPlaceholder]}>
              <Ionicons name="camera-outline" size={40} color="#6C26CB" style={{ marginBottom: 6 }} />
              <Text style={styles.editPhotoButtonText}>{t('profilePhotoAdd')}</Text>
            </View>
          </TouchableOpacity>
        )}

        <View style={styles.gallerySection}>
          <Text style={styles.gallerySectionTitle}>{t('galleryTitle')}</Text>
          <Text style={{ fontSize: 13, color: '#6B7280', marginBottom: 12 }}>{t('gallerySubtitle')}</Text>
          <View style={styles.galleryGrid}>
            {(user?.galleryPhotos ?? []).map((photo) => (
              <View key={photo.id} style={styles.galleryItem}>
                <Image source={{ uri: photo.url }} style={styles.galleryItemImage} resizeMode="cover" />
                <TouchableOpacity
                  style={styles.galleryRemoveBtn}
                  onPress={() => handleRemoveGalleryPhoto(photo.id)}
                  activeOpacity={0.8}
                >
                  <Ionicons name="close" size={18} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            ))}
            <TouchableOpacity
              style={styles.galleryAddCell}
              onPress={openGalleryPhotoModal}
              disabled={galleryUploading}
              activeOpacity={0.8}
            >
              <View style={styles.galleryAddCellContent}>
                {galleryUploading ? (
                  <ActivityIndicator size="small" color="#6C26CB" />
                ) : (
                  <Ionicons name="add" size={32} color="#6C26CB" />
                )}
              </View>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.card}>
          <DataRow label={t('profileName')} value={user?.nome} />
          <DataRow label={t('homeLabelEmail')} value={user?.email} />
          <DataRow label={t('homeLabelPhone')} value={user?.phone} />
          <DataRow
            label={t('profileBirthDate')}
            value={birthDateDisplay}
            emptyChar={t('homeNoData')}
          />
          <DataRow
            label={t('profileGender')}
            value={genderLabel}
            emptyChar={t('homeNoData')}
          />
          <DataRow
            label={t('profileGenderLookingFor')}
            value={lookingForLabel}
            emptyChar={t('homeNoData')}
          />
          <DataRow
            label={t('profileDescriptionTitle')}
            value={user?.bio ?? null}
            emptyChar={t('homeNoData')}
          />
          <View style={styles.dataRow}>
            <Text style={styles.dataLabel}>{t('locationLabel')}</Text>
            <View style={styles.locationRow}>
              <Text style={styles.dataValue} numberOfLines={1}>
                {locationChoice === 'gps'
                  ? t('locationLabelGps')
                  : locationChoice === 'manual' && locationCityName
                    ? `${t('locationLabelCity')}: ${locationCityName}`
                    : locationChoice === 'manual'
                      ? t('locationLabelCity')
                      : t('homeNoData')}
              </Text>
              <TouchableOpacity
                style={styles.locationChangeBtn}
                onPress={() => setShowLocationModal(true)}
                activeOpacity={0.7}
              >
                <Text style={styles.locationChangeBtnText}>{t('locationChange')}</Text>
              </TouchableOpacity>
            </View>
          </View>
          {categoriesCount > 0 ? (
            <View style={styles.dataRow}>
              <Text style={styles.dataLabel}>{t('profileCategories')}</Text>
              <Text style={styles.dataValue}>
                {t('homeCategoriesCount').replace('{{count}}', String(categoriesCount))}
              </Text>
            </View>
          ) : (
            <DataRow
              label={t('profileCategories')}
              value={null}
              emptyChar={t('homeNoData')}
            />
          )}
        </View>

        <TouchableOpacity
          style={styles.editButton}
          onPress={() => setIsEditing(true)}
          activeOpacity={0.8}
        >
          <Text style={styles.editButtonText}>{t('editProfile')}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutButton} onPress={logout} activeOpacity={0.8}>
          <Text style={styles.logoutButtonText}>{t('logout')}</Text>
        </TouchableOpacity>
      </ScrollView>
      <PhotoSourceModal
        visible={showPhotoSourceModal}
        onClose={() => setShowPhotoSourceModal(false)}
        onPickGallery={() => runPicker('gallery')}
        onPickCamera={() => runPicker('camera')}
        title={t('photoSourceTitle')}
        subtitle={t('photoSourceSubtitle')}
        galleryLabel={t('photoSourceGallery')}
        cameraLabel={t('photoSourceCamera')}
        cancelLabel={t('cancelEdit')}
      />
      <PhotoSourceModal
        visible={showGalleryPhotoModal}
        onClose={() => setShowGalleryPhotoModal(false)}
        onPickGallery={() => {
          setShowGalleryPhotoModal(false);
          runPickerForGallery('gallery');
        }}
        onPickCamera={() => {
          setShowGalleryPhotoModal(false);
          runPickerForGallery('camera');
        }}
        title={t('photoSourceTitle')}
        subtitle={t('gallerySubtitle')}
        galleryLabel={t('photoSourceGallery')}
        cameraLabel={t('photoSourceCamera')}
        cancelLabel={t('cancelEdit')}
      />

      <Modal visible={showLocationModal} animationType="fade" transparent>
        <View style={styles.locationModalOverlay}>
          <View style={styles.locationModalCard}>
            <Text style={styles.locationModalTitle}>{t('locationPromptTitle')}</Text>
            <TouchableOpacity
              style={styles.locationModalPrimaryBtn}
              onPress={handleAllowLocation}
              disabled={locationUpdating}
              activeOpacity={0.8}
            >
              {locationUpdating ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.locationModalPrimaryBtnText}>{t('locationAllow')}</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.locationModalSecondaryBtn}
              onPress={() => { setShowLocationModal(false); setShowCityPicker(true); }}
              disabled={locationUpdating}
              activeOpacity={0.8}
            >
              <Text style={styles.locationModalSecondaryBtnText}>{t('locationChooseCity')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.locationModalCancelBtn}
              onPress={() => setShowLocationModal(false)}
              disabled={locationUpdating}
              activeOpacity={0.8}
            >
              <Text style={styles.locationModalCancelBtnText}>{t('cancelEdit')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={showCityPicker} animationType="slide" transparent onRequestClose={() => setShowCityPicker(false)}>
        <View style={styles.cityPickerOverlay}>
          <View style={styles.cityPickerContainer}>
            <View style={styles.cityPickerHeader}>
              <Text style={styles.cityPickerTitle}>{t('locationChooseCity')}</Text>
              <TouchableOpacity
                style={styles.cityPickerCloseBtn}
                onPress={() => { setShowCityPicker(false); setCitySearch(''); }}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                <Ionicons name="close" size={28} color="#1F2937" />
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.citySearchInput}
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
                  style={styles.cityRow}
                  onPress={() => handleSelectCity(item)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.cityRowText}>{item.name}</Text>
                  <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                </TouchableOpacity>
              )}
              style={styles.cityList}
              ListEmptyComponent={<Text style={styles.cityListEmpty}>{t('cityListEmpty')}</Text>}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}
