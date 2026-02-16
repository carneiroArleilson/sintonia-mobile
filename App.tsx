import { StatusBar } from 'expo-status-bar';
import { Text, View } from 'react-native';
import { LanguageProvider, useTranslation } from './i18n/LanguageProvider';
import { styles } from './App.styles';

function AppContent() {
  const { t } = useTranslation();
  return (
    <View style={styles.container}>
      <Text>{t('appWelcome')}</Text>
      <StatusBar style="auto" />
    </View>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}
