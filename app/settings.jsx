import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Switch,
  Alert,
  Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import GradientBackground from '../components/GradientBackground';
import QualitySelector from '../components/QualitySelector';
import { getSettings, updateSettings, resetSettings } from '../services/storage';
import { Colors, Spacing, BorderRadius } from '../constants/colors';

function SettingRow({ icon, label, description, children, onPress }) {
  const Wrapper = onPress ? TouchableOpacity : View;
  return (
    <Wrapper
      style={styles.settingRow}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.settingIcon}>
        <Ionicons name={icon} size={20} color={Colors.primary} />
      </View>
      <View style={styles.settingInfo}>
        <Text style={styles.settingLabel}>{label}</Text>
        {description && (
          <Text style={styles.settingDescription}>{description}</Text>
        )}
      </View>
      {children}
    </Wrapper>
  );
}

function SectionHeader({ title }) {
  return <Text style={styles.sectionHeader}>{title}</Text>;
}

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const [settings, setSettings] = useState({
    apiUrl: '',
    defaultQuality: '1080',
    hapticFeedback: true,
  });
  const [showQualityPicker, setShowQualityPicker] = useState(false);
  const [isEditingUrl, setIsEditingUrl] = useState(false);
  const [tempUrl, setTempUrl] = useState('');
  const [isEditingToken, setIsEditingToken] = useState(false);
  const [tempToken, setTempToken] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const data = await getSettings();
    setSettings(data);
    setTempUrl(data.apiUrl || '');
    setTempToken(data.apiToken || '');
  };

  const handleUpdate = async (key, value) => {
    const updated = await updateSettings({ [key]: value });
    if (updated) setSettings(updated);
  };

  const handleSaveUrl = async () => {
    await handleUpdate('apiUrl', tempUrl.trim());
    setIsEditingUrl(false);
  };

  const handleSaveToken = async () => {
    await handleUpdate('apiToken', tempToken.trim());
    setIsEditingToken(false);
  };

  const handleReset = () => {
    Alert.alert(
      'Restaurar ajustes',
      '¿Volver a los ajustes por defecto?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Restaurar',
          onPress: async () => {
            const defaults = await resetSettings();
            setSettings(defaults);
            setTempUrl(defaults.apiUrl || '');
            setTempToken(defaults.apiToken || '');
          },
        },
      ]
    );
  };

  return (
    <GradientBackground>
      <ScrollView
        style={styles.flex}
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + Spacing.lg },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Ajustes</Text>
          <Text style={styles.subtitle}>Personaliza tu experiencia</Text>
        </View>

        {/* API Settings */}
        <SectionHeader title="SERVIDOR API" />
        <View style={styles.section}>
          <SettingRow
            icon="server-outline"
            label="URL del servidor Cobalt"
            description={settings.apiUrl}
          />
          {isEditingUrl ? (
            <View style={styles.urlEditContainer}>
              <TextInput
                style={styles.urlInput}
                value={tempUrl}
                onChangeText={setTempUrl}
                placeholder="https://cobaltapi.squair.xyz"
                placeholderTextColor={Colors.textMuted}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <View style={styles.urlButtons}>
                <TouchableOpacity style={styles.urlCancelBtn} onPress={() => { setIsEditingUrl(false); setTempUrl(settings.apiUrl || ''); }}>
                  <Text style={styles.urlCancelText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.urlSaveBtn} onPress={handleSaveUrl}>
                  <Text style={styles.urlSaveText}>Guardar</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <TouchableOpacity style={styles.editUrlBtn} onPress={() => setIsEditingUrl(true)}>
              <Ionicons name="pencil" size={14} color={Colors.primary} />
              <Text style={styles.editUrlText}>Cambiar URL</Text>
            </TouchableOpacity>
          )}

          <View style={styles.divider} />

          <SettingRow
            icon="key-outline"
            label="Token JWT / API Key"
            description={settings.apiToken ? 'Token configurado (Oculto)' : 'Ninguno (Opcional)'}
          />
          {isEditingToken ? (
            <View style={styles.urlEditContainer}>
              <TextInput
                style={styles.urlInput}
                value={tempToken}
                onChangeText={setTempToken}
                placeholder="Ingresa tu JWT token o API Key"
                placeholderTextColor={Colors.textMuted}
                autoCapitalize="none"
                autoCorrect={false}
                secureTextEntry={false}
              />
              <View style={styles.urlButtons}>
                <TouchableOpacity style={styles.urlCancelBtn} onPress={() => { setIsEditingToken(false); setTempToken(settings.apiToken || ''); }}>
                  <Text style={styles.urlCancelText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.urlSaveBtn} onPress={handleSaveToken}>
                  <Text style={styles.urlSaveText}>Guardar</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <TouchableOpacity style={styles.editUrlBtn} onPress={() => setIsEditingToken(true)}>
              <Ionicons name="pencil" size={14} color={Colors.primary} />
              <Text style={styles.editUrlText}>{settings.apiToken ? 'Cambiar Token' : 'Añadir Token'}</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Download Settings */}
        <SectionHeader title="DESCARGA" />
        <View style={styles.section}>
          <SettingRow
            icon="film-outline"
            label="Calidad por defecto"
            description={`${settings.defaultQuality}p`}
            onPress={() => setShowQualityPicker(true)}
          >
            <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
          </SettingRow>

          <View style={styles.divider} />

          <SettingRow
            icon="phone-portrait-outline"
            label="Vibración háptica"
            description="Feedback táctil al descargar"
          >
            <Switch
              value={settings.hapticFeedback}
              onValueChange={(val) => handleUpdate('hapticFeedback', val)}
              trackColor={{ false: Colors.surfaceHover, true: Colors.primaryGlow }}
              thumbColor={settings.hapticFeedback ? Colors.primary : Colors.textMuted}
            />
          </SettingRow>
        </View>

        {/* Info */}
        <SectionHeader title="INFORMACIÓN" />
        <View style={styles.section}>
          <SettingRow
            icon="information-circle-outline"
            label="Acerca de"
            description="TikDownloaderCOL v1.0.0"
          />
        </View>

        {/* Reset */}
        <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
          <Ionicons name="refresh-outline" size={18} color={Colors.error} />
          <Text style={styles.resetText}>Restaurar ajustes por defecto</Text>
        </TouchableOpacity>

        <View style={{ height: Spacing.xxl * 2 }} />
      </ScrollView>

      {/* Quality Picker */}
      <QualitySelector
        visible={showQualityPicker}
        selectedQuality={settings.defaultQuality}
        onSelect={(val) => {
          handleUpdate('defaultQuality', val);
        }}
        onClose={() => setShowQualityPicker(false)}
      />
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.lg,
  },
  // Header
  header: {
    marginBottom: Spacing.xl,
  },
  title: {
    color: Colors.textPrimary,
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: '500',
    marginTop: 4,
  },
  // Section
  sectionHeader: {
    color: Colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: Spacing.sm,
    marginTop: Spacing.lg,
    marginLeft: Spacing.xs,
  },
  section: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginLeft: 56,
  },
  // Setting Row
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
  },
  settingIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.primaryGlow,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  settingInfo: {
    flex: 1,
  },
  settingLabel: {
    color: Colors.textPrimary,
    fontSize: 15,
    fontWeight: '600',
  },
  settingDescription: {
    color: Colors.textSecondary,
    fontSize: 13,
    marginTop: 2,
  },
  // URL edit
  urlEditContainer: {
    padding: Spacing.md,
    paddingTop: 0,
  },
  urlInput: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    color: Colors.textPrimary,
    fontSize: 14,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  urlButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  urlCancelBtn: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  urlCancelText: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  urlSaveBtn: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.primary,
  },
  urlSaveText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
  editUrlBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    padding: Spacing.md,
    paddingTop: 0,
  },
  editUrlText: {
    color: Colors.primary,
    fontSize: 13,
    fontWeight: '600',
  },
  // Reset
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.errorGlow,
  },
  resetText: {
    color: Colors.error,
    fontSize: 14,
    fontWeight: '600',
  },
});
