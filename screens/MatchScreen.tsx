import { View, Text } from 'react-native';
import { useTranslation } from '../i18n/LanguageProvider';
import { styles } from './MatchScreen.styles';

/** Tela inicial do app – área de match (conteúdo placeholder por enquanto). */
export function MatchScreen() {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('menuHome')}</Text>
      <Text style={styles.subtitle}>{t('matchPlaceholder')}</Text>
    </View>
  );
}
