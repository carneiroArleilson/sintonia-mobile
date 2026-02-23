import { View, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { LanguageProvider } from './i18n/LanguageProvider';
import { AuthProvider, useAuth } from './api/AuthContext';
import { LoginScreen } from './screens/LoginScreen';
import { HomeScreen } from './screens/HomeScreen';
import { ProfileCompletionScreen } from './screens/ProfileCompletionScreen';
import { styles } from './App.styles';

function AppContent() {
  const { token, loading, profileComplete, user } = useAuth();
  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#6C26CB" />
        <StatusBar style="auto" />
      </View>
    );
  }
  if (!token) return <LoginScreen />;
  // Tela de cadastro só para app_user com dados incompletos
  const isAppUserWithIncompleteProfile =
    user?.role === 'app_user' && (profileComplete === false || profileComplete === undefined);
  if (isAppUserWithIncompleteProfile) {
    return <ProfileCompletionScreen />;
  }
  return <HomeScreen />;
}

export default function App() {
  return (
    <SafeAreaProvider>
      <LanguageProvider>
        <AuthProvider>
          <AppContent />
          <StatusBar style="dark" />
        </AuthProvider>
      </LanguageProvider>
    </SafeAreaProvider>
  );
}
