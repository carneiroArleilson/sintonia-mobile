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
  },
  en: {
    appName: 'Sintonia',
    appWelcome: 'Open up App.tsx to start working on your app!',
    language: 'Language',
  },
  es: {
    appName: 'Sintonia',
    appWelcome: 'Abre App.tsx para empezar a desarrollar tu app.',
    language: 'Idioma',
  },
};

export const DEFAULT_LANG: Lang = 'pt';

export function getTranslations(lang: Lang): Record<string, string> {
  return translations[lang] ?? translations.pt;
}
