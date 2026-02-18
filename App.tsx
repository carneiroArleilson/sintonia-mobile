import { StatusBar } from 'expo-status-bar';
import { LanguageProvider } from './i18n/LanguageProvider';
import { LoginScreen } from './screens/LoginScreen';

export default function App() {
  return (
    <LanguageProvider>
      <LoginScreen />
      <StatusBar style="auto" />
    </LanguageProvider>
  );
}
