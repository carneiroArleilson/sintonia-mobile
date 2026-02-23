import { StyleSheet } from 'react-native';

const BRAND_BG = '#F5EFFB';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BRAND_BG,
  },
  content: {
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingTop: 12,
    paddingHorizontal: 24,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5DDF0',
  },
  footerItem: {
    padding: 12,
  },
});
