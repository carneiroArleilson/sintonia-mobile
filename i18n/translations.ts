/**
 * Traduções do app – um único arquivo para todos os textos.
 * Idiomas: Português do Brasil (pt), Inglês (en), Espanhol (es).
 * Use no componente: const { t } = useTranslation(); t('chave')
 */

export type Lang = 'pt' | 'en' | 'es';

export const translations: Record<Lang, Record<string, string>> = {
  pt: {
    appName: 'Sintonia',
    appWelcome: 'Abra o App.tsx para começar a desenvolver seu app!',
    language: 'Idioma',
    logoAlt: 'Logo Sintonia',
    loginTagline: 'Sintonia um app que capta a frequência do seu coração',
    loginWithGmail: 'Continuar com Gmail',
    loginWithFacebook: 'Continuar com Facebook',
    loginWithApple: 'Continuar com Apple',
    loginWithPhone: 'Continuar com telefone',
  },
  en: {
    appName: 'Sintonia',
    appWelcome: 'Open up App.tsx to start working on your app!',
    language: 'Language',
    logoAlt: 'Sintonia logo',
    loginTagline: 'Sintonia, an app that captures the frequency of your heart',
    loginWithGmail: 'Continue with Gmail',
    loginWithFacebook: 'Continue with Facebook',
    loginWithApple: 'Continue with Apple',
    loginWithPhone: 'Continue with phone',
  },
  es: {
    appName: 'Sintonia',
    appWelcome: 'Abre App.tsx para empezar a desarrollar tu app.',
    language: 'Idioma',
    logoAlt: 'Logo Sintonia',
    loginTagline: 'Sintonia, una app que capta la frecuencia de tu corazón',
    loginWithGmail: 'Continuar con Gmail',
    loginWithFacebook: 'Continuar con Facebook',
    loginWithApple: 'Continuar con Apple',
    loginWithPhone: 'Continuar con teléfono',
  },
};

export const DEFAULT_LANG: Lang = 'pt';

export function getTranslations(lang: Lang): Record<string, string> {
  return translations[lang] ?? translations.pt;
}
