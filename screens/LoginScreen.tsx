import { View, Text, TouchableOpacity, Image } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTranslation } from '../i18n/LanguageProvider';
import { styles } from './LoginScreen.styles';

const ICON_SIZE = 22;

/** Logo: mesma de sintonia-backoffice/public/assets/logo.png (copie para assets/logo.png). */
const LogoImage = require('../assets/logo.png');

export function LoginScreen() {
  const { t } = useTranslation();

  const handleGmail = () => {
    // TODO: login com Gmail
  };
  const handleFacebook = () => {
    // TODO: login com Facebook
  };
  const handleApple = () => {
    // TODO: login com Apple
  };
  const handlePhone = () => {
    // TODO: login com telefone
  };

  return (
    <View style={styles.container}>
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
        <TouchableOpacity style={[styles.button, styles.buttonGmail]} onPress={handleGmail} activeOpacity={0.8}>
          <Ionicons name="logo-google" size={ICON_SIZE} color="#3c4043" style={styles.buttonIcon} />
          <Text style={[styles.buttonText, styles.buttonGmailText]}>{t('loginWithGmail')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.buttonFacebook]} onPress={handleFacebook} activeOpacity={0.8}>
          <Ionicons name="logo-facebook" size={ICON_SIZE} color="#ffffff" style={styles.buttonIcon} />
          <Text style={[styles.buttonText, styles.buttonFacebookText]}>{t('loginWithFacebook')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.buttonApple]} onPress={handleApple} activeOpacity={0.8}>
          <Ionicons name="logo-apple" size={ICON_SIZE} color="#ffffff" style={styles.buttonIcon} />
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
