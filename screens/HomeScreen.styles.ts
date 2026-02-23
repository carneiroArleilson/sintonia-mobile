import { StyleSheet } from 'react-native';

/** Paleta da logo Sintonia */
const BRAND_BG = '#F5EFFB';
const BRAND_PRIMARY = '#262626';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BRAND_BG,
    paddingHorizontal: 24,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 72,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: BRAND_PRIMARY,
    marginBottom: 20,
    textAlign: 'center',
  },
  photoWrap: {
    alignSelf: 'center',
    marginBottom: 20,
  },
  photo: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#E5DDF0',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  dataRow: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0EBF5',
  },
  dataLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#5C4D6B',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dataValue: {
    fontSize: 16,
    color: BRAND_PRIMARY,
  },
  logoutButton: {
    marginTop: 24,
    paddingVertical: 14,
    paddingHorizontal: 24,
    backgroundColor: '#D4C4E8',
    borderRadius: 12,
    alignSelf: 'center',
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: BRAND_PRIMARY,
  },
});
