import { useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from '../i18n/LanguageProvider';
import { useAuth } from '../api/AuthContext';
import { styles } from './HomeScreen.styles';

const GENDER_LABELS: Record<string, string> = {
  male: 'genderMale',
  female: 'genderFemale',
  non_binary: 'genderNonBinary',
  other: 'genderOther',
};

const WHO_LABELS: Record<string, string> = {
  male: 'whoMen',
  female: 'whoWomen',
  non_binary: 'whoAll',
  all: 'whoAll',
};

function formatDateIsoToDisplay(iso: string, lang: string): string {
  if (!iso || iso.length < 10) return iso || '';
  const [y, m, d] = iso.slice(0, 10).split('-');
  if (lang === 'pt' || lang === 'es') return `${d}/${m}/${y}`;
  return `${m}/${d}/${y}`;
}

function DataRow({
  label,
  value,
  emptyChar = '—',
}: {
  label: string;
  value: string | null | undefined;
  emptyChar?: string;
}) {
  const display = (value ?? '').trim() || emptyChar;
  return (
    <View style={styles.dataRow}>
      <Text style={styles.dataLabel}>{label}</Text>
      <Text style={styles.dataValue} numberOfLines={2}>
        {display}
      </Text>
    </View>
  );
}

export function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { t, lang } = useTranslation();
  const { user, logout, refreshProfile } = useAuth();

  // Sempre buscar dados do banco ao exibir a tela (evitar cache)
  useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);

  const genderLabel = user?.gender ? t(GENDER_LABELS[user.gender] || user.gender) : null;
  const lookingForLabel = user?.genderLookingFor
    ? t(WHO_LABELS[user.genderLookingFor] || user.genderLookingFor)
    : null;
  const birthDateDisplay = user?.birthDate
    ? formatDateIsoToDisplay(user.birthDate, lang)
    : null;
  const categoriesCount = user?.categories?.length ?? 0;

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>{t('homeProfileTitle')}</Text>

        {user?.photoUrl ? (
          <View style={styles.photoWrap}>
            <Image source={{ uri: user.photoUrl }} style={styles.photo} resizeMode="cover" />
          </View>
        ) : null}

        <View style={styles.card}>
          <DataRow label={t('profileName')} value={user?.nome} />
          <DataRow label={t('homeLabelEmail')} value={user?.email} />
          <DataRow label={t('homeLabelPhone')} value={user?.phone} />
          <DataRow
            label={t('profileBirthDate')}
            value={birthDateDisplay}
            emptyChar={t('homeNoData')}
          />
          <DataRow
            label={t('profileGender')}
            value={genderLabel}
            emptyChar={t('homeNoData')}
          />
          <DataRow
            label={t('profileGenderLookingFor')}
            value={lookingForLabel}
            emptyChar={t('homeNoData')}
          />
          {categoriesCount > 0 ? (
            <View style={styles.dataRow}>
              <Text style={styles.dataLabel}>{t('profileCategories')}</Text>
              <Text style={styles.dataValue}>
                {t('homeCategoriesCount').replace('{{count}}', String(categoriesCount))}
              </Text>
            </View>
          ) : (
            <DataRow
              label={t('profileCategories')}
              value={null}
              emptyChar={t('homeNoData')}
            />
          )}
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={logout} activeOpacity={0.8}>
          <Text style={styles.logoutButtonText}>{t('logout')}</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
