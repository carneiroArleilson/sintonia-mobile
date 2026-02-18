import { StyleSheet } from 'react-native';

/** Estilos da tela de login. Design limpo e alinhado à marca Sintonia. */
const BRAND_BG = '#ffffff';
const BRAND_PRIMARY = '#1a1a2e';
const BRAND_ACCENT = '#16213e';
const TEXT_PRIMARY = '#1a1a2e';
const TEXT_SECONDARY = '#5c5c6d';
const SPACING = 24;
const LOGO_HEIGHT = 180;

/** Botões no estilo da referência: sólidos, bem arredondados, sombra suave. */
const BUTTON_GMAIL_BG = '#ffffff';
const BUTTON_GMAIL_FG = '#3c4043';
const BUTTON_APPLE_BG = '#000000';
const BUTTON_APPLE_FG = '#ffffff';
const BUTTON_FACEBOOK_BG = '#1877F2';
const BUTTON_FACEBOOK_FG = '#ffffff';
const BUTTON_PHONE_BG = '#25D366';
const BUTTON_PHONE_FG = '#ffffff';   /* verde-azulado escuro, mesma “temperatura” do sistema */

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BRAND_BG,
    paddingHorizontal: SPACING,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: LOGO_HEIGHT,
    marginBottom: SPACING,
  },
  logoImage: {
    width: 560,
    height: 240,
    resizeMode: 'contain',
  },
  logoText: {
    fontSize: 32,
    fontWeight: '700',
    color: BRAND_PRIMARY,
    letterSpacing: 0.5,
  },
  tagline: {
    alignSelf: 'stretch',
    fontSize: 16,
    fontWeight: '500',
    color: TEXT_SECONDARY,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 8,
    marginBottom: SPACING * 2,
  },
  options: {
    alignSelf: 'stretch',
    gap: 14,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: SPACING,
    borderRadius: 14,
    borderWidth: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonIcon: {
    marginRight: 12,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  buttonGmail: {
    backgroundColor: BUTTON_GMAIL_BG,
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 4,
  },
  buttonGmailText: {
    color: BUTTON_GMAIL_FG,
  },
  buttonFacebook: {
    backgroundColor: BUTTON_FACEBOOK_BG,
  },
  buttonFacebookText: {
    color: BUTTON_FACEBOOK_FG,
  },
  buttonApple: {
    backgroundColor: BUTTON_APPLE_BG,
  },
  buttonAppleText: {
    color: BUTTON_APPLE_FG,
  },
  buttonPhone: {
    backgroundColor: BUTTON_PHONE_BG,
  },
  buttonPhoneText: {
    color: BUTTON_PHONE_FG,
  },
});
