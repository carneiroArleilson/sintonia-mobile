import { useState } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { MatchScreen } from './MatchScreen';
import { HomeScreen } from './HomeScreen';
import { styles } from './MainLayout.styles';

export type MainTab = 'match' | 'profile';

const ICON_SIZE = 26;

export function MainLayout() {
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<MainTab>('match');

  return (
    <View style={styles.container}>
      <View style={[styles.content, { paddingTop: insets.top }]}>
        {tab === 'match' ? <MatchScreen /> : <HomeScreen embedded />}
      </View>
      <View style={[styles.footer, { paddingBottom: insets.bottom + 8 }]}>
        <TouchableOpacity
          style={styles.footerItem}
          onPress={() => setTab('match')}
          activeOpacity={0.7}
        >
          <Ionicons
            name={tab === 'match' ? 'heart' : 'heart-outline'}
            size={ICON_SIZE}
            color={tab === 'match' ? '#6C26CB' : '#5C4D6B'}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.footerItem}
          onPress={() => setTab('profile')}
          activeOpacity={0.7}
        >
          <Ionicons
            name={tab === 'profile' ? 'person' : 'person-outline'}
            size={ICON_SIZE}
            color={tab === 'profile' ? '#6C26CB' : '#5C4D6B'}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}
