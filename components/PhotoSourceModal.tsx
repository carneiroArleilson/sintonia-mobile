import React from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, Pressable } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

const BRAND_PRIMARY = '#262626';
const PURPLE = '#6C26CB';
const BORDER = '#E5E7EB';
const TEXT_GRAY = '#6B7280';

type Props = {
  visible: boolean;
  onClose: () => void;
  onPickGallery: () => void;
  onPickCamera: () => void;
  title: string;
  subtitle: string;
  galleryLabel: string;
  cameraLabel: string;
  cancelLabel: string;
};

export function PhotoSourceModal({
  visible,
  onClose,
  onPickGallery,
  onPickCamera,
  title,
  subtitle,
  galleryLabel,
  cameraLabel,
  cancelLabel,
}: Props) {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <View style={styles.handle} />
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>

          <TouchableOpacity
            style={styles.option}
            onPress={() => {
              onClose();
              onPickGallery();
            }}
            activeOpacity={0.7}
          >
            <View style={styles.optionIconWrap}>
              <Ionicons name="images-outline" size={28} color={PURPLE} />
            </View>
            <Text style={styles.optionLabel}>{galleryLabel}</Text>
            <Ionicons name="chevron-forward" size={20} color={TEXT_GRAY} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.option}
            onPress={() => {
              onClose();
              onPickCamera();
            }}
            activeOpacity={0.7}
          >
            <View style={styles.optionIconWrap}>
              <Ionicons name="camera-outline" size={28} color={PURPLE} />
            </View>
            <Text style={styles.optionLabel}>{cameraLabel}</Text>
            <Ionicons name="chevron-forward" size={20} color={TEXT_GRAY} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={onClose}
            activeOpacity={0.8}
          >
            <Text style={styles.cancelBtnText}>{cancelLabel}</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 34,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: BORDER,
    alignSelf: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: BRAND_PRIMARY,
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    color: TEXT_GRAY,
    textAlign: 'center',
    marginBottom: 24,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: BORDER,
  },
  optionIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F5EFFB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  optionLabel: {
    flex: 1,
    fontSize: 17,
    fontWeight: '600',
    color: BRAND_PRIMARY,
  },
  cancelBtn: {
    marginTop: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: TEXT_GRAY,
  },
});
