import { useState } from 'react';
import { View, Text, TouchableOpacity, Image, ActivityIndicator, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTranslation } from '../i18n/LanguageProvider';
import { useAuth } from '../api/AuthContext';
import { signInWithGoogle, signInWithFacebook, signInWithApple } from '../api/socialAuth';
import { styles } from './LoginScreen.styles';

const ICON_SIZE = 22;

/** Logo: mesma de sintonia-backoffice/public/assets/logo.png (copie para assets/logo.png). */
const LogoImage = require('../assets/logo.png');

export function LoginScreen() {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { loginWithSocial } = useAuth();
  const [loading, setLoading] = useState<string | null>(null);

  const handleSocial = async (
    provider: 'google' | 'facebook' | 'apple',
    signIn: () => Promise<{ idToken?: string; accessToken?: string; name?: string | null; photoUrl?: string | null } | null>,
  ) => {
    if (loading) return;
    setLoading(provider);
    try {
      const cred = await signIn();
      if (!cred) return;
      await loginWithSocial(provider, {
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

  const handleGmail = () => handleSocial('google', signInWithGoogle);
  const handleFacebook = () => handleSocial('facebook', signInWithFacebook);
  const handleApple = async () => {
    try {
      await handleSocial('apple', signInWithApple);
    } catch {
      Alert.alert(t('loginError'), t('loginAppleNotAvailable'));
    }
  };
  const handlePhone = () => {
    Alert.alert(t('loginWithPhone'), t('loginPhoneComingSoon'));
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
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
          style={[styles.button, styles.buttonFacebook]}
          onPress={handleFacebook}
          disabled={!!loading}
          activeOpacity={0.8}
        >
          {loading === 'facebook' ? (
            <ActivityIndicator size="small" color="#fff" style={styles.buttonIcon} />
          ) : (
            <Ionicons name="logo-facebook" size={ICON_SIZE} color="#ffffff" style={styles.buttonIcon} />
          )}
          <Text style={[styles.buttonText, styles.buttonFacebookText]}>{t('loginWithFacebook')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.buttonApple]}
          onPress={handleApple}
          disabled={!!loading}
          activeOpacity={0.8}
        >
          {loading === 'apple' ? (
            <ActivityIndicator size="small" color="#fff" style={styles.buttonIcon} />
          ) : (
            <Ionicons name="logo-apple" size={ICON_SIZE} color="#ffffff" style={styles.buttonIcon} />
          )}
          <Text style={[styles.buttonText, styles.buttonAppleText]}>{t('loginWithApple')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.buttonPhone]} onPress={handlePhone} activeOpacity={0.8}>
          <Ionicons name="call" size={ICON_SIZE} color="#ffffff" style={styles.buttonIcon} />
          <Text style={[styles.buttonText, styles.buttonPhoneText]}>{t('loginWithPhone')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
