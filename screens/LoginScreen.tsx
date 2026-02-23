import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTranslation } from '../i18n/LanguageProvider';
import { useAuth } from '../api/AuthContext';
import { signInWithGoogle } from '../api/socialAuth';
import { requestPhoneCode } from '../api/client';
import {
  PHONE_COUNTRIES,
  DEFAULT_PHONE_COUNTRY,
  getCountryByCode,
  applyPhoneMaskByCountry,
  getFullPhoneDigits,
} from '../utils/phone';
import { styles } from './LoginScreen.styles';

const ICON_SIZE = 22;
const PLACEHOLDER_COLOR = '#9CA3AF';

const LogoImage = require('../assets/logo.png');

type LoginView = 'choose' | 'phone' | 'code';

export function LoginScreen() {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { loginWithSocial, loginWithPhone } = useAuth();
  const [loading, setLoading] = useState<string | null>(null);
  const [view, setView] = useState<LoginView>('choose');
  const [phoneCountryCode, setPhoneCountryCode] = useState(DEFAULT_PHONE_COUNTRY.code);
  const [phoneNationalDigits, setPhoneNationalDigits] = useState('');
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [phoneSentForCode, setPhoneSentForCode] = useState('');
  const [code, setCode] = useState('');

  const handleGmail = async () => {
    if (loading) return;
    setLoading('google');
    try {
      const cred = await signInWithGoogle();
      if (!cred) return;
      await loginWithSocial('google', {
        idToken: cred.idToken,
        accessToken: cred.accessToken,
        nome: cred.name ?? undefined,
        photoUrl: cred.photoUrl ?? undefined,
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Login falhou';
      Alert.alert(t('loginError'), msg);
    } finally {
      setLoading(null);
    }
  };

  const handlePhone = () => setView('phone');

  const handleSendCode = async () => {
    const fullPhone = getFullPhoneDigits(phoneCountryCode, phoneNationalDigits);
    if (fullPhone.length < 10) {
      Alert.alert(t('loginError'), 'Digite um número válido com DDD.');
      return;
    }
    setLoading('phone');
    try {
      await requestPhoneCode(fullPhone);
      setPhoneSentForCode(fullPhone);
      setView('code');
      setCode('');
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Falha ao enviar código';
      Alert.alert(t('loginError'), msg);
    } finally {
      setLoading(null);
    }
  };

  const handleVerify = async () => {
    const trimmed = code.replace(/\D/g, '');
    if (trimmed.length !== 6) {
      Alert.alert(t('loginError'), 'Digite o código de 6 dígitos.');
      return;
    }
    setLoading('verify');
    try {
      await loginWithPhone(phoneSentForCode, trimmed);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Código inválido ou expirado';
      Alert.alert(t('loginError'), msg);
    } finally {
      setLoading(null);
    }
  };

  const handleBack = () => {
    if (view === 'code') {
      setView('phone');
      setCode('');
      setPhoneSentForCode('');
    } else {
      setView('choose');
      setPhoneCountryCode(DEFAULT_PHONE_COUNTRY.code);
      setPhoneNationalDigits('');
      setShowCountryPicker(false);
    }
  };

  const content = (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      {view !== 'choose' && (
        <TouchableOpacity style={styles.backButton} onPress={handleBack} activeOpacity={0.8}>
          <Text style={styles.backButtonText}>
            <Ionicons name="arrow-back" size={20} color="#6C26CB" /> {t('loginPhoneBack')}
          </Text>
        </TouchableOpacity>
      )}

      {view === 'choose' && (
        <>
          <View style={styles.logoContainer}>
            <Image
              source={LogoImage}
              style={styles.logoImage}
              resizeMode="contain"
              accessibilityLabel={t('logoAlt')}
            />
          </View>
          <Text style={styles.tagline}>{t('loginTagline')}</Text>
          <View style={styles.options}>
            <TouchableOpacity
              style={[styles.button, styles.buttonGmail]}
              onPress={handleGmail}
              disabled={!!loading}
              activeOpacity={0.8}
            >
              {loading === 'google' ? (
                <ActivityIndicator size="small" color="#3c4043" style={styles.buttonIcon} />
              ) : (
                <Ionicons name="logo-google" size={ICON_SIZE} color="#3c4043" style={styles.buttonIcon} />
              )}
              <Text style={[styles.buttonText, styles.buttonGmailText]}>{t('loginWithGmail')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.buttonPhone]}
              onPress={handlePhone}
              disabled={!!loading}
              activeOpacity={0.8}
            >
              <Ionicons name="call" size={ICON_SIZE} color="#ffffff" style={styles.buttonIcon} />
              <Text style={[styles.buttonText, styles.buttonPhoneText]}>{t('loginWithPhone')}</Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      {view === 'phone' && (() => {
        const phoneCountry = getCountryByCode(phoneCountryCode);
        const phoneDisplay = applyPhoneMaskByCountry(phoneNationalDigits, phoneCountry);
        return (
          <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }} keyboardShouldPersistTaps="handled">
            <View style={styles.phoneForm}>
              <Text style={styles.phoneTitle}>{t('loginPhoneTitle')}</Text>
              <Text style={styles.phoneSubtitle}>{t('loginPhoneSubtitle')}</Text>
              <View style={styles.phoneRow}>
                <TouchableOpacity
                  style={styles.phoneCountryBtn}
                  onPress={() => setShowCountryPicker(true)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.phoneCountryText}>+{phoneCountryCode}</Text>
                  <Ionicons name="chevron-down" size={18} color="#6C26CB" />
                </TouchableOpacity>
                <TextInput
                  style={styles.phoneNumberInput}
                  value={phoneDisplay}
                  onChangeText={(text) => {
                    const d = text.replace(/\D/g, '').slice(0, phoneCountry.maxLen);
                    setPhoneNationalDigits(d);
                  }}
                  placeholder={phoneCountry.placeholder}
                  placeholderTextColor={PLACEHOLDER_COLOR}
                  keyboardType="phone-pad"
                  maxLength={phoneCountry.maxLen + 6}
                  editable={!loading}
                />
              </View>
              <TouchableOpacity
                style={[styles.button, styles.buttonPhone]}
                onPress={handleSendCode}
                disabled={!!loading}
                activeOpacity={0.8}
              >
                {loading === 'phone' ? (
                  <ActivityIndicator size="small" color="#fff" style={styles.buttonIcon} />
                ) : null}
                <Text style={[styles.buttonText, styles.buttonPhoneText]}>{t('loginPhoneSendCode')}</Text>
              </TouchableOpacity>
            </View>
            {showCountryPicker && (
              <Modal visible transparent animationType="slide">
                <TouchableOpacity
                  style={styles.modalOverlay}
                  activeOpacity={1}
                  onPress={() => setShowCountryPicker(false)}
                />
                <View style={styles.modalBox}>
                  <View style={[styles.modalHeader, { justifyContent: 'flex-start' }]}>
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
          </ScrollView>
        );
      })()}

      {view === 'code' && (
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }} keyboardShouldPersistTaps="handled">
          <View style={styles.phoneForm}>
            <Text style={styles.phoneTitle}>{t('loginPhoneCodeTitle')}</Text>
            <Text style={styles.phoneSubtitle}>{t('loginPhoneCodeSubtitle')}</Text>
            <TextInput
              style={styles.phoneInput}
              placeholder={t('loginPhoneCodePlaceholder')}
              placeholderTextColor="#9CA3AF"
              value={code}
              onChangeText={(v) => setCode(v.replace(/\D/g, '').slice(0, 6))}
              keyboardType="number-pad"
              maxLength={6}
              editable={!loading}
            />
            <TouchableOpacity
              style={[styles.button, styles.buttonPhone]}
              onPress={handleVerify}
              disabled={!!loading}
              activeOpacity={0.8}
            >
              {loading === 'verify' ? (
                <ActivityIndicator size="small" color="#fff" style={styles.buttonIcon} />
              ) : null}
              <Text style={[styles.buttonText, styles.buttonPhoneText]}>{t('loginPhoneVerify')}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      {content}
    </KeyboardAvoidingView>
  );
}
