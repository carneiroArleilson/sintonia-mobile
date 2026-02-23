import { StyleSheet } from 'react-native';

const BRAND_BG = '#F5EFFB';
const BRAND_PRIMARY = '#262626';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BRAND_BG,
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: BRAND_PRIMARY,
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#5C4D6B',
    textAlign: 'center',
  },
});
