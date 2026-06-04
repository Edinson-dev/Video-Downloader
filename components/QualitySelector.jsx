import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, BorderRadius, Spacing } from '../constants/colors';
import { VIDEO_QUALITIES } from '../constants/platforms';

export default function QualitySelector({ visible, selectedQuality, onSelect, onClose }) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={styles.container}>
          <Text style={styles.title}>Calidad del Video</Text>
          <Text style={styles.subtitle}>Selecciona la calidad de descarga</Text>

          {VIDEO_QUALITIES.map((q) => (
            <TouchableOpacity
              key={q.value}
              style={[
                styles.option,
                selectedQuality === q.value && styles.optionSelected,
              ]}
              onPress={() => {
                onSelect(q.value);
                onClose();
              }}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.optionText,
                  selectedQuality === q.value && styles.optionTextSelected,
                ]}
              >
                {q.label}
              </Text>
              {selectedQuality === q.value && (
                <Ionicons name="checkmark-circle" size={22} color={Colors.primary} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  container: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    width: '100%',
    maxWidth: 340,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  title: {
    color: Colors.textPrimary,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: Spacing.xs,
  },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: 14,
    marginBottom: Spacing.lg,
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.xs,
  },
  optionSelected: {
    backgroundColor: `${Colors.primary}15`,
  },
  optionText: {
    color: Colors.textSecondary,
    fontSize: 16,
    fontWeight: '500',
  },
  optionTextSelected: {
    color: Colors.textPrimary,
    fontWeight: '700',
  },
});
