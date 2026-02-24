import { StyleSheet, Dimensions } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const BRAND_BG = '#F5EFFB';
const BRAND_PURPLE = '#6C26CB';
const CARD_BORDER_RADIUS = 16;
const CARD_HORIZONTAL_MARGIN = 12;
const CARD_WIDTH = SCREEN_WIDTH - CARD_HORIZONTAL_MARGIN * 2;
const BUTTONS_ROW_HEIGHT = 24 + 64 + 24;
const CARD_END_AT_BUTTONS_CENTER = BUTTONS_ROW_HEIGHT / 2;
const TAB_BAR_APPROX = 60;
const EXTRA_CARD_INSET = 110;
const CARD_BOTTOM_INSET = TAB_BAR_APPROX + CARD_END_AT_BUTTONS_CENTER + EXTRA_CARD_INSET;
const HEADER_HEIGHT = 52;
const CARD_HEIGHT = SCREEN_HEIGHT - CARD_BOTTOM_INSET - HEADER_HEIGHT;

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BRAND_BG,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: HEADER_HEIGHT,
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  headerFilterBtn: {
    padding: 10,
  },
  locationPromptOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
    paddingHorizontal: 24,
  },
  locationPromptCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 28,
    paddingHorizontal: 24,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 16,
  },
  locationPromptTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 28,
  },
  locationPromptPrimaryBtn: {
    backgroundColor: BRAND_PURPLE,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 14,
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
  },
  locationPromptPrimaryBtnText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  locationPromptSecondaryBtn: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    width: '100%',
    alignItems: 'center',
  },
  locationPromptSecondaryBtnText: {
    fontSize: 16,
    fontWeight: '500',
    color: BRAND_PURPLE,
  },
  cityPickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  cityPickerContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    paddingBottom: 34,
  },
  cityPickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
  },
  cityPickerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  cityPickerCloseBtn: {
    padding: 4,
  },
  citySearchInput: {
    marginHorizontal: 20,
    marginBottom: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    fontSize: 16,
    color: '#1F2937',
  },
  cityList: {
    flexGrow: 0,
    maxHeight: 400,
  },
  cityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  cityRowText: {
    fontSize: 17,
    color: '#1F2937',
    fontWeight: '500',
  },
  cityListEmpty: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    paddingVertical: 24,
  },
  cardStack: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 8,
    paddingHorizontal: CARD_HORIZONTAL_MARGIN,
  },
  cardBase: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: CARD_BORDER_RADIUS,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    position: 'absolute',
    top: 8,
    left: CARD_HORIZONTAL_MARGIN,
    right: CARD_HORIZONTAL_MARGIN,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 12,
  },
  cardBack: {
    transform: [{ scale: 0.95 }],
    zIndex: 0,
  },
  cardFront: {
    zIndex: 1,
  },
  cardGradientOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 100,
    zIndex: 2,
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingBottom: 14,
  },
  cardNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  cardDistance: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 12,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  cardProfileName: {
    flex: 1,
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'left',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  cardScrollContent: {
    paddingBottom: 24,
  },
  cardScrollView: {
    flex: 1,
  },
  cardImageBlock: {
    width: '100%',
    height: CARD_HEIGHT,
    backgroundColor: '#000',
  },
  cardInfoPanel: {
    backgroundColor: 'rgba(0,0,0,0.82)',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 28,
  },
  cardGallerySection: {
    backgroundColor: 'rgba(0,0,0,0.82)',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 28,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  cardGalleryTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  cardGalleryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  cardGalleryItem: {
    width: '31%',
    aspectRatio: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  cardGalleryItemImage: {
    width: '100%',
    height: '100%',
  },
  cardRevealPanel: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.75)',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  cardRevealAge: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  cardRevealLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  cardRevealTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  cardRevealTag: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: BRAND_PURPLE,
  },
  cardRevealTagText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  buttonsRow: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 32,
    paddingVertical: 24,
    paddingHorizontal: 24,
    zIndex: 10,
  },
  actionBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  actionBtnReject: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E5DDF0',
  },
  actionBtnMatch: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E5DDF0',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyStateText: {
    fontSize: 18,
    color: '#5C4D6B',
    textAlign: 'center',
    lineHeight: 26,
  },
  loadingWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export const CARD_WIDTH_PX = CARD_WIDTH;
export const SCREEN_WIDTH_PX = SCREEN_WIDTH;
export const SCREEN_HEIGHT_PX = SCREEN_HEIGHT;
