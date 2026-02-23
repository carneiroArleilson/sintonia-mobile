import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Modal,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from '../i18n/LanguageProvider';
import { useAuth } from '../api/AuthContext';
import { getCategories, updateAppProfile, uploadProfilePhoto, updateProfilePhotoUrl, checkEmailAvailable, type CategoryItem } from '../api/client';
import { styles } from './ProfileCompletionScreen.styles';
import * as ImagePicker from 'expo-image-picker';

const PLACEHOLDER_COLOR = '#9CA3AF';

type StepType = 'name' | 'email' | 'phone' | 'birthDate' | 'gender' | 'who' | 'categories' | 'photo';

function buildStepTypes(signupVia?: 'phone' | 'social'): StepType[] {
  return [
    'name',
    ...(signupVia !== 'social' ? (['email'] as const) : []),
    ...(signupVia !== 'phone' ? (['phone'] as const) : []),
    'birthDate',
    'gender',
    'who',
    'categories',
    'photo',
  ];
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
function isValidEmail(s: string): boolean {
  return EMAIL_REGEX.test(s.trim());
}

import {
  PHONE_COUNTRIES,
  DEFAULT_PHONE_COUNTRY,
  getCountryByCode,
  parseFullPhone,
  applyPhoneMaskByCountry,
  getFullPhoneDigits,
} from '../utils/phone';

/* Como você se identifica: 3 opções como na referência */
const GENDER_SEGMENTS = [
  { value: 'male', labelKey: 'genderMale' },
  { value: 'female', labelKey: 'genderFemale' },
  { value: 'non_binary', labelKey: 'genderNonBinary' },
] as const;

/* Quem você quer conhecer: 3 opções como na referência */
const WHO_OPTIONS = [
  { value: 'male', labelKey: 'whoMen' },
  { value: 'female', labelKey: 'whoWomen' },
  { value: 'non_binary', labelKey: 'whoAll' },
] as const;

function isValidDateString(s: string): boolean {
  if (!s || s.length !== 10) return false;
  const [y, m, d] = s.split('-').map(Number);
  if (isNaN(y) || isNaN(m) || isNaN(d)) return false;
  const date = new Date(y, m - 1, d);
  return date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d;
}

/** Ícone roxo (S) no fluxo de cadastro, ao lado do nome Sintonia */
const SintoniaIcon = require('../assets/sintonia-icon.png');

type Lang = 'pt' | 'en' | 'es';

/** Formato de data por idioma: pt/es = dd/mm/yyyy, en = mm/dd/yyyy */
function getDateFormatOrder(lang: Lang): 'dmy' | 'mdy' {
  return lang === 'en' ? 'mdy' : 'dmy';
}

/** Converte ISO (yyyy-mm-dd) para exibição (dd/mm/yyyy ou mm/dd/yyyy) */
function isoToDisplay(iso: string, lang: Lang): string {
  if (!iso || iso.length < 10) return '';
  const [y, m, d] = iso.split('-').map((n) => n.replace(/^0+/, '') || '0');
  const order = getDateFormatOrder(lang);
  const dd = d.padStart(2, '0');
  const mm = m.padStart(2, '0');
  const yyyy = y;
  return order === 'dmy' ? `${dd}/${mm}/${yyyy}` : `${mm}/${dd}/${yyyy}`;
}

/** Converte texto com máscara para ISO (yyyy-mm-dd). Retorna '' se incompleto ou inválido. */
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

/** Aplica máscara ao digitar: só dígitos e barras na ordem do idioma */
function applyDateMask(input: string, lang: Lang): string {
  const digits = input.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

export function ProfileCompletionScreen() {
  const insets = useSafeAreaInsets();
  const { t, lang } = useTranslation();
  const { user, token, refreshProfile, markProfileComplete } = useAuth();
  const [step, setStep] = useState(0);
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
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [saving, setSaving] = useState(false);
  const prevStepRef = useRef(0);
  const transitionAnim = useRef(new Animated.Value(1)).current;
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [localPhotoUri, setLocalPhotoUri] = useState<string | null>(null);
  const hasInitializedFromUser = useRef(false);

  const stepTypes = useMemo(() => buildStepTypes(user?.signupVia), [user?.signupVia]);
  const totalSteps = stepTypes.length;

  // Sincroniza do user apenas na carga inicial; não sobrescreve o que o usuário já preencheu
  useEffect(() => {
    if (!user || hasInitializedFromUser.current) return;
    hasInitializedFromUser.current = true;
    setName(user.nome ?? '');
    setEmail(user.email ?? '');
    const { code, national } = parseFullPhone(user.phone ?? '');
    setPhoneCountryCode(code);
    setPhoneNationalDigits(national.replace(/\D/g, ''));
    setBirthDate(user.birthDate ?? '');
    setBirthDateInput(user.birthDate ? isoToDisplay(user.birthDate, lang) : '');
    setGender(user.gender ?? null);
    setGenderLookingFor(user.genderLookingFor ?? null);
    setCategoryIds(user.categories ?? []);
  }, [user, lang]);

  useEffect(() => {
    let cancelled = false;
    getCategories(lang)
      .then((list) => {
        if (!cancelled) setCategories(list);
      })
      .catch(() => {
        if (!cancelled) setCategories([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingCategories(false);
      });
    return () => {
      cancelled = true;
    };
  }, [lang]);

  const toggleCategory = useCallback((id: string) => {
    setCategoryIds((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
    );
  }, []);

  const canProceedStep = useCallback(() => {
    const stepType = stepTypes[step];
    if (!stepType) return false;
    switch (stepType) {
      case 'name':
        return name.trim().length > 0;
      case 'email':
        return isValidEmail(email);
      case 'phone':
        return getFullPhoneDigits(phoneCountryCode, phoneNationalDigits).length >= 10;
      case 'birthDate':
        return isValidDateString(birthDate.trim());
      case 'gender':
        return gender != null && gender.length > 0;
      case 'who':
        return genderLookingFor != null && genderLookingFor.length > 0;
      case 'categories':
        return categoryIds.length > 0;
      case 'photo':
        return true;
      default:
        return false;
    }
  }, [step, stepTypes, name, email, phoneCountryCode, phoneNationalDigits, birthDate, gender, genderLookingFor, categoryIds]);

  const [emailCheckLoading, setEmailCheckLoading] = useState(false);

  const handleNext = useCallback(async () => {
    if (step < totalSteps - 1) {
      const stepType = stepTypes[step];
      if (stepType === 'email') {
        if (!isValidEmail(email)) return;
        if (!token) return;
        setEmailCheckLoading(true);
        try {
          const { available } = await checkEmailAvailable(token, email.trim().toLowerCase());
          if (!available) {
            Alert.alert(t('profileEmailInUse'), undefined, [{ text: 'OK' }]);
            return;
          }
          prevStepRef.current = step;
          setStep((s) => s + 1);
        } catch (e) {
          const msg = e instanceof Error ? e.message : 'Falha ao verificar e-mail';
          Alert.alert('Erro', msg);
        } finally {
          setEmailCheckLoading(false);
        }
        return;
      }
      prevStepRef.current = step;
      setStep((s) => s + 1);
    }
  }, [step, totalSteps, stepTypes, email, token, t]);

  const handleBack = useCallback(() => {
    if (step > 0) {
      prevStepRef.current = step;
      setStep((s) => s - 1);
    }
  }, [step]);

  const pickAndUploadPhoto = useCallback(async () => {
    if (!token || photoUploading) return;
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        t('profilePhoto'),
        'Para adicionar uma foto, permita o acesso à galeria nas configurações do dispositivo.',
      );
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
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
  }, [token, photoUploading, refreshProfile, t]);

  useEffect(() => {
    if (step > prevStepRef.current) {
      transitionAnim.setValue(0);
      Animated.timing(transitionAnim, {
        toValue: 1,
        duration: 280,
        useNativeDriver: true,
      }).start();
    } else {
      transitionAnim.setValue(1);
    }
    prevStepRef.current = step;
  }, [step, transitionAnim]);

  const handleFinish = async () => {
    if (!token || saving) return;
    const hasEmailStep = stepTypes.includes('email');
    const hasPhoneStep = stepTypes.includes('phone');
    const emailOk = hasEmailStep ? isValidEmail(email) : (user?.email?.trim()?.length ?? 0) > 0;
    const phoneOk = hasPhoneStep
      ? getFullPhoneDigits(phoneCountryCode, phoneNationalDigits).length >= 10
      : (user?.phone?.replace(/\D/g, '').length ?? 0) >= 10;
    const valid =
      name.trim().length > 0 &&
      emailOk &&
      phoneOk &&
      isValidDateString(birthDate.trim()) &&
      gender &&
      genderLookingFor &&
      categoryIds.length > 0;
    if (!valid) {
      Alert.alert(
        t('profileCompleteRequiredTitle'),
        t('profileCompleteRequiredMessage'),
      );
      return;
    }
    setSaving(true);
    try {
      const birthDateIso =
        birthDate.trim().match(/^\d{4}-\d{2}-\d{2}$/) ?
          birthDate.trim()
          : (() => {
              const d = birthDate.trim().replace(/\D/g, '');
              if (d.length !== 8) return birthDate.trim();
              const [dd, mm, yyyy] =
                lang === 'pt' || lang === 'es'
                  ? [d.slice(0, 2), d.slice(2, 4), d.slice(4, 8)]
                  : [d.slice(2, 4), d.slice(0, 2), d.slice(4, 8)];
              return `${yyyy}-${mm}-${dd}`;
            })();
      const payload = {
        nome: name.trim(),
        email: hasEmailStep ? email.trim().toLowerCase() : (user?.email ?? '').trim().toLowerCase(),
        phone: hasPhoneStep ? getFullPhoneDigits(phoneCountryCode, phoneNationalDigits) : (user?.phone ?? '').replace(/\D/g, ''),
        birthDate: birthDateIso,
        gender: gender ?? undefined,
        genderLookingFor: genderLookingFor ?? undefined,
        categories: categoryIds,
        photoUrl: localPhotoUri ?? user?.photoUrl ?? undefined,
      };
      if (__DEV__) {
        console.log('[ProfileCompletion] Salvando perfil...', {
          nome: payload.nome?.length,
          email: !!payload.email,
          phoneLen: payload.phone?.length,
          birthDate: payload.birthDate,
          gender: payload.gender,
          categories: payload.categories?.length,
        });
      }
      await updateAppProfile(token, payload);
      if (__DEV__) {
        console.log('[ProfileCompletion] Perfil salvo, atualizando estado...');
      }
      try {
        await refreshProfile();
        markProfileComplete();
      } catch (refreshErr) {
        if (__DEV__) {
          console.warn('[ProfileCompletion] refreshProfile falhou, tentando novamente:', refreshErr);
        }
        await new Promise((r) => setTimeout(r, 800));
        try {
          await refreshProfile();
          markProfileComplete();
        } catch (retryErr) {
          Alert.alert(
            t('profileSavedTitle'),
            t('profileSavedRefreshFail'),
          );
        }
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Falha ao salvar';
      const isEmailInUse = msg.includes('e-mail') && msg.includes('já');
      const isPhoneInUse = msg.includes('celular') && msg.includes('já');
      Alert.alert(
        'Erro',
        isEmailInUse ? t('profileEmailInUse') : isPhoneInUse ? t('profilePhoneInUse') : msg,
      );
    } finally {
      setSaving(false);
    }
  };

  const renderStepContent = () => {
    const stepType = stepTypes[step];
    if (!stepType) return null;
    switch (stepType) {
      case 'name':
        return (
          <View style={styles.stepBlock}>
            <Text style={styles.stepTitle}>{t('profileNameTitle')}</Text>
            <Text style={styles.stepSubtitle}>{t('profileNameSubtitle')}</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder={t('profileNameInputPlaceholder')}
              placeholderTextColor={PLACEHOLDER_COLOR}
              autoCapitalize="words"
              autoFocus
            />
          </View>
        );
      case 'email':
        return (
          <View style={styles.stepBlock}>
            <Text style={styles.stepTitle}>{t('profileEmailTitle')}</Text>
            <Text style={styles.stepSubtitle}>{t('profileEmailSubtitle')}</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder={t('profileEmailPlaceholder')}
              placeholderTextColor={PLACEHOLDER_COLOR}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoFocus
            />
          </View>
        );
      case 'phone': {
        const phoneCountry = getCountryByCode(phoneCountryCode);
        const phoneDisplay = applyPhoneMaskByCountry(phoneNationalDigits, phoneCountry);
        return (
          <View style={styles.stepBlock}>
            <Text style={styles.stepTitle}>{t('profilePhoneTitle')}</Text>
            <Text style={styles.stepSubtitle}>{t('profilePhoneSubtitle')}</Text>
            <View style={styles.phoneRow}>
              <TouchableOpacity
                style={styles.phoneCountryBtn}
                onPress={() => setShowCountryPicker(true)}
                activeOpacity={0.8}
              >
                <Text style={styles.phoneCountryText}>+{phoneCountryCode}</Text>
                <Ionicons name="chevron-down" size={18} color="#1F2937" />
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
                autoFocus
              />
            </View>
            {showCountryPicker && (
              <Modal visible transparent animationType="slide">
                <TouchableOpacity
                  style={styles.datePickerOverlay}
                  activeOpacity={1}
                  onPress={() => setShowCountryPicker(false)}
                />
                <View style={[styles.datePickerContainer, { maxHeight: 340 }]}>
                  <View style={[styles.datePickerHeader, { justifyContent: 'flex-start' }]}>
                    <TouchableOpacity onPress={() => setShowCountryPicker(false)}>
                      <Text style={styles.datePickerCancel}>{t('profileBack')}</Text>
                    </TouchableOpacity>
                    <Text style={[styles.datePickerCancel, { flex: 1, textAlign: 'center', fontWeight: '700' }]}>
                      {t('profilePhoneCountry')}
                    </Text>
                    <View style={{ width: 60 }} />
                  </View>
                  <ScrollView style={{ maxHeight: 260 }} keyboardShouldPersistTaps="handled">
                    {PHONE_COUNTRIES.map((c) => (
                      <TouchableOpacity
                        key={c.code + c.name}
                        style={styles.phoneCountryOption}
                        onPress={() => {
                          setPhoneCountryCode(c.code);
                          setPhoneNationalDigits((prev) => prev.slice(0, c.maxLen));
                          setShowCountryPicker(false);
                        }}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.phoneCountryOptionText}>
                          +{c.code} — {c.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </Modal>
            )}
          </View>
        );
      }
      case 'birthDate':
        return (
          <View style={styles.stepBlock}>
            <Text style={styles.stepTitle}>{t('profileBirthDateTitle')}</Text>
            <Text style={styles.stepSubtitle}>{t('profileBirthDateSubtitle')}</Text>
            <View style={styles.dateInputRow}>
              <TextInput
                style={styles.dateInput}
                value={birthDateInput}
                onChangeText={(text) => {
                  const masked = applyDateMask(text, lang);
                  setBirthDateInput(masked);
                  setBirthDate(displayToIso(masked, lang));
                }}
                placeholder={t('profileBirthDatePlaceholder')}
                placeholderTextColor={PLACEHOLDER_COLOR}
                keyboardType="numbers-and-punctuation"
                maxLength={10}
              />
                <TouchableOpacity
                  style={styles.calendarBtn}
                  onPress={() => setShowDatePicker(true)}
                  activeOpacity={0.8}
                >
                  <Ionicons name="calendar-outline" size={24} color="#1F2937" />
                </TouchableOpacity>
            </View>
            {showDatePicker && (
              <Modal visible transparent animationType="slide">
                <TouchableOpacity
                  style={styles.datePickerOverlay}
                  activeOpacity={1}
                  onPress={() => setShowDatePicker(false)}
                />
                <View style={styles.datePickerContainer}>
                  <View style={styles.datePickerHeader}>
                    <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                      <Text style={styles.datePickerCancel}>{t('profileBack')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => {
                        setShowDatePicker(false);
                      }}
                    >
                      <Text style={styles.datePickerDone}>{t('profileContinue')}</Text>
                    </TouchableOpacity>
                  </View>
                  <DateTimePicker
                    value={
                      birthDate && birthDate.length >= 10
                        ? new Date(
                            parseInt(birthDate.slice(0, 4), 10),
                            parseInt(birthDate.slice(5, 7), 10) - 1,
                            parseInt(birthDate.slice(8, 10), 10)
                          )
                        : new Date(2000, 0, 1)
                    }
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'calendar'}
                    maximumDate={new Date()}
                    minimumDate={new Date(1900, 0, 1)}
                    onChange={(_, selectedDate) => {
                      if (selectedDate) {
                        const y = selectedDate.getFullYear();
                        const m = String(selectedDate.getMonth() + 1).padStart(2, '0');
                        const d = String(selectedDate.getDate()).padStart(2, '0');
                        const iso = `${y}-${m}-${d}`;
                        setBirthDate(iso);
                        setBirthDateInput(isoToDisplay(iso, lang));
                        if (Platform.OS === 'android') setShowDatePicker(false);
                      }
                    }}
                  />
                  {Platform.OS === 'ios' && (
                    <TouchableOpacity
                      style={styles.datePickerDoneBtn}
                      onPress={() => setShowDatePicker(false)}
                    >
                      <Text style={styles.continueBtnText}>{t('profileContinue')}</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </Modal>
            )}
          </View>
        );
      case 'gender':
        return (
          <View style={styles.stepBlock}>
            <Text style={styles.stepTitle}>{t('profileGenderTitle')}</Text>
            <Text style={styles.stepSubtitle}>{t('profileGenderSubtitle')}</Text>
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
        );
      case 'who':
        return (
          <View style={styles.stepBlock}>
            <Text style={styles.stepTitle}>{t('profileGenderLookingFor')}</Text>
            <Text style={styles.stepSubtitle}>{t('profileGenderLookingForSubtitle')}</Text>
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
        );
      case 'categories':
        return (
          <View style={styles.stepBlock}>
            <Text style={styles.stepTitle}>{t('profileCategories')}</Text>
            <Text style={styles.stepSubtitle}>{t('profileCategoriesSubtitle')}</Text>
            {loadingCategories ? (
              <ActivityIndicator size="large" color="#6C26CB" style={styles.stepLoader} />
            ) : (
              <ScrollView style={styles.categoryScroll} showsVerticalScrollIndicator={false}>
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
              </ScrollView>
            )}
          </View>
        );
      case 'photo': {
        const photoUri = localPhotoUri || user?.photoUrl || null;
        return (
          <View style={styles.stepBlock}>
            <Text style={styles.stepTitle}>{t('profilePhoto')}</Text>
            <Text style={styles.stepSubtitle}>{t('profilePhotoSubtitle')}</Text>
            <View style={styles.photoWrap}>
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={pickAndUploadPhoto}
                disabled={photoUploading}
                style={styles.photoTouchable}
              >
                {photoUploading ? (
                  <View style={styles.photoCircle}>
                    <ActivityIndicator size="large" color="#6C26CB" style={styles.photoIcon} />
                    <Text style={styles.photoLabel}>{t('profilePhotoUploading')}</Text>
                  </View>
                ) : photoUri ? (
                  <Image source={{ uri: photoUri }} style={styles.photoImg} />
                ) : (
                  <View style={styles.photoCircle}>
                    <Ionicons
                      name="camera-outline"
                      size={44}
                      color="#6C26CB"
                      style={styles.photoIcon}
                    />
                    <Text style={styles.photoLabel}>{t('profilePhotoAdd')}</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>
        );
      }
      default:
        return null;
    }
  };

  const isLastStep = step === totalSteps - 1;
  const canGoNext = canProceedStep();

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
    >
      {step > 0 && (
        <TouchableOpacity
          style={[styles.backBtn, { top: 16 + insets.top }]}
          onPress={handleBack}
          activeOpacity={0.8}
        >
          <Text style={styles.backBtnText}>{t('profileBack')}</Text>
        </TouchableOpacity>
      )}

      <View style={[styles.topArea, { paddingTop: insets.top }]}>
        <View style={styles.logoWrap}>
          <View style={styles.logoRow}>
            <Image source={SintoniaIcon} style={styles.logoIcon} resizeMode="contain" />
            <Text style={styles.logoName}>Sintonia</Text>
          </View>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View
            style={{
              opacity: transitionAnim,
              transform: [
                {
                  translateX: transitionAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [24, 0],
                  }),
                },
              ],
            }}
          >
            {renderStepContent()}
          </Animated.View>
        </ScrollView>
      </View>

      <View style={[styles.footerWave, { paddingBottom: 48 + insets.bottom }]}>
        {isLastStep ? (
          <TouchableOpacity
            style={[styles.continueBtn, (!canGoNext || saving) && styles.continueBtnDisabled]}
            onPress={handleFinish}
            disabled={!canGoNext || saving}
            activeOpacity={0.85}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.continueBtnText}>{t('profileFinish')}</Text>
            )}
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.continueBtn, (!canGoNext || emailCheckLoading) && styles.continueBtnDisabled]}
            onPress={handleNext}
            disabled={!canGoNext || emailCheckLoading}
            activeOpacity={0.85}
          >
            {emailCheckLoading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.continueBtnText}>{t('profileContinue')}</Text>
            )}
          </TouchableOpacity>
        )}
        <View style={styles.dotsRow}>
          {Array.from({ length: totalSteps }).map((_, i) => (
            <View key={i} style={[styles.dot, i === step && styles.dotActive]} />
          ))}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
