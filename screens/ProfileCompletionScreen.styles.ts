import { StyleSheet } from 'react-native';

/** Fiel à referência: fundo branco, ondas roxas claras no rodapé, logo em cima, Continuar roxo, dots só o atual preenchido */
const PURPLE = '#6C26CB';
const PURPLE_LIGHT = '#F5EFFB';
const TEXT_DARK = '#1F2937';
const TEXT_GRAY = '#6B7280';
const BORDER = '#D1D5DB';
const PADDING = 28;

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  /* Área branca: logo + conteúdo */
  topArea: {
    flex: 1,
    paddingHorizontal: PADDING,
  },
  logoWrap: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
  },
  logoIcon: {
    width: 56,
    height: 56,
    resizeMode: 'contain',
  },
  logoName: {
    fontSize: 26,
    fontWeight: '700',
    color: '#000000',
    letterSpacing: 0.3,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingBottom: 20,
  },
  stepBlock: {
    width: '100%',
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: TEXT_DARK,
    textAlign: 'center',
    marginBottom: 10,
  },
  stepSubtitle: {
    fontSize: 15,
    color: TEXT_GRAY,
    textAlign: 'center',
    marginBottom: 28,
    lineHeight: 22,
  },
  input: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 18,
    fontSize: 17,
    color: TEXT_DARK,
  },
  dateInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dateInput: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 18,
    fontSize: 17,
    color: TEXT_DARK,
  },
  calendarBtn: {
    width: 52,
    height: 52,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  phoneCountryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 18,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: '#FFFFFF',
    minWidth: 88,
  },
  phoneCountryText: {
    fontSize: 17,
    fontWeight: '600',
    color: TEXT_DARK,
  },
  phoneInput: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 18,
    fontSize: 17,
    color: TEXT_DARK,
  },
  phoneCountryOption: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  phoneCountryOptionText: {
    fontSize: 16,
    color: TEXT_DARK,
    fontWeight: '500',
  },
  datePickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  datePickerContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 34,
  },
  datePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  datePickerCancel: {
    fontSize: 16,
    color: TEXT_GRAY,
    fontWeight: '600',
  },
  datePickerDone: {
    fontSize: 16,
    color: PURPLE,
    fontWeight: '700',
  },
  datePickerDoneBtn: {
    marginHorizontal: 20,
    marginTop: 16,
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: PURPLE,
    alignItems: 'center',
  },
  /* Segmented: 3 opções em uma linha (Homem, Mulher, Não-binário) */
  segmentRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  segment: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentSelected: {
    backgroundColor: PURPLE,
    borderColor: PURPLE,
  },
  segmentText: {
    fontSize: 16,
    fontWeight: '600',
    color: TEXT_DARK,
  },
  segmentTextSelected: {
    color: '#FFFFFF',
  },
  /* Quem conhecer: 3 botões grandes (Homens, Mulheres, Todos) */
  optionColumn: {
    width: '100%',
    gap: 14,
  },
  optionBig: {
    width: '100%',
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionBigSelected: {
    backgroundColor: PURPLE,
    borderColor: PURPLE,
  },
  optionBigText: {
    fontSize: 17,
    fontWeight: '600',
    color: TEXT_DARK,
  },
  optionBigTextSelected: {
    color: '#FFFFFF',
  },
  /* Interesses: grid de tags */
  categoryScroll: {
    maxHeight: 280,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  tag: {
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: '#FFFFFF',
  },
  tagSelected: {
    backgroundColor: PURPLE,
    borderColor: PURPLE,
  },
  tagText: {
    fontSize: 15,
    fontWeight: '600',
    color: TEXT_DARK,
  },
  tagTextSelected: {
    color: '#FFFFFF',
  },
  stepLoader: {
    marginTop: 20,
  },
  /* Foto: círculo grande, borda cinza, ícone roxo + texto */
  photoWrap: {
    alignItems: 'center',
    marginTop: 20,
  },
  photoTouchable: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoCircle: {
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 2,
    borderColor: BORDER,
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoIcon: {
    marginBottom: 12,
  },
  photoLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: PURPLE,
  },
  photoImg: {
    width: 180,
    height: 180,
    borderRadius: 90,
  },
  /* Galeria: grid de fotos + célula adicionar */
  galleryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  galleryItem: {
    width: '30%',
    aspectRatio: 1,
    borderRadius: 14,
    overflow: 'hidden',
    position: 'relative',
  },
  galleryItemImage: {
    width: '100%',
    height: '100%',
  },
  galleryAddCell: {
    width: '30%',
    aspectRatio: 1,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: BORDER,
    borderStyle: 'dashed',
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  galleryAddCellContent: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  galleryRemoveBtn: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  /* Rodapé: faixa roxa clara com “onda” no topo, botão Continuar e dots */
  footerWave: {
    backgroundColor: PURPLE_LIGHT,
    borderTopLeftRadius: 120,
    borderTopRightRadius: 120,
    paddingTop: 48,
    paddingHorizontal: PADDING,
    paddingBottom: 48,
    alignItems: 'center',
    overflow: 'visible',
  },
  continueBtn: {
    width: '100%',
    paddingVertical: 18,
    borderRadius: 16,
    backgroundColor: PURPLE,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
    shadowColor: PURPLE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  continueBtnDisabled: {
    opacity: 0.5,
  },
  continueBtnText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  /* Dots: só o atual preenchido, resto vazado */
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: PURPLE,
    backgroundColor: 'transparent',
  },
  dotActive: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: PURPLE,
    borderWidth: 0,
  },
  backBtn: {
    position: 'absolute',
    left: PADDING,
    top: 16,
    padding: 10,
    zIndex: 10,
  },
  backBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: PURPLE,
  },
});
