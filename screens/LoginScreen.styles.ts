import { StyleSheet } from 'react-native';

/** Paleta da logo Sintonia: roxo do ícone + cinza escuro do texto */
const BRAND_BG = '#FFFFFF';
const BRAND_PRIMARY = '#262626';   // cinza escuro (texto "SINTONIA" da logo)
const TEXT_PRIMARY = '#262626';
const TEXT_SECONDARY = '#5C4D6B';  // roxo acinzentado
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
const BUTTON_PHONE_FG = '#ffffff';   /* verde-azulado escuro, mesma "temperatura" do sistema */

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
  backButton: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 0,
    marginBottom: 16,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6C26CB',
  },
  phoneForm: {
    alignSelf: 'stretch',
    marginTop: 8,
  },
  phoneTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: BRAND_PRIMARY,
    marginBottom: 8,
    textAlign: 'center',
  },
  phoneSubtitle: {
    fontSize: 15,
    color: TEXT_SECONDARY,
    textAlign: 'center',
    marginBottom: 24,
  },
  phoneInput: {
    borderWidth: 1,
    borderColor: '#E5DDF0',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 18,
    color: BRAND_PRIMARY,
    marginBottom: 20,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  phoneCountryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 18,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
    minWidth: 88,
  },
  phoneCountryText: {
    fontSize: 17,
    fontWeight: '600',
    color: BRAND_PRIMARY,
  },
  phoneNumberInput: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 18,
    fontSize: 17,
    color: BRAND_PRIMARY,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalBox: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: 340,
    paddingBottom: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: BRAND_PRIMARY,
  },
  phoneCountryOption: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  phoneCountryOptionText: {
    fontSize: 16,
    color: BRAND_PRIMARY,
    fontWeight: '500',
  },
});
