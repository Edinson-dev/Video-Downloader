import React, { useState, useEffect, useRef } from 'react';
import { Tabs } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet, Text, Image, Animated, ActivityIndicator, Alert, Linking, Platform, Modal, TouchableOpacity } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as MediaLibrary from 'expo-media-library';
import { Colors } from '../constants/colors';
import packageJson from '../package.json';

// URL del manifiesto de versiones en GitHub Pages
const VERSION_URL = 'https://edinson-dev.github.io/Video-Downloader/version.json';

export default function RootLayout() {
  const [isSplashReady, setIsSplashReady] = useState(false);
  const [updateInfo, setUpdateInfo] = useState(null); // { version, downloadUrl, changelog }
  const fadeAnim = useRef(new Animated.Value(1)).current;

  // ── Compares semantic versions ("1.1.0" > "1.0.0") ──
  const isNewerVersion = (remote, local) => {
    const r = remote.split('.').map(Number);
    const l = local.split('.').map(Number);
    for (let i = 0; i < 3; i++) {
      if ((r[i] || 0) > (l[i] || 0)) return true;
      if ((r[i] || 0) < (l[i] || 0)) return false;
    }
    return false;
  };

  // ── Check for updates ──
  const checkForUpdates = async () => {
    if (Platform.OS !== 'android') return; // APK updates only apply to Android
    try {
      const res = await fetch(VERSION_URL + '?t=' + Date.now());
      const data = await res.json();
      const localVersion = packageJson.version || '1.0.0';
      if (data.version && isNewerVersion(data.version, localVersion)) {
        setUpdateInfo(data);
      }
    } catch (e) {
      console.log('[UPDATE] No se pudo verificar la versión:', e.message);
    }
  };

  useEffect(() => {
    async function initApp() {
      // Demora leve de 1 segundo para asegurar que la app esté en primer plano antes de pedir permisos (Solo en Móviles)
      if (Platform.OS !== 'web') {
        setTimeout(async () => {
          try {
            // Obtener el estado actual de los permisos
            const { status, canAskAgain } = await MediaLibrary.getPermissionsAsync();
            
            if (status !== 'granted') {
              // Solicitar permisos completos (lectura y escritura)
              const request = await MediaLibrary.requestPermissionsAsync();
              console.log('[DEBUG] Resultado de solicitud de permisos:', request.status);
              
              if (request.status !== 'granted') {
                Alert.alert(
                  'Permisos de Galería Requeridos',
                  'Para guardar los videos descargados directamente en la galería de tu dispositivo, necesitamos acceso a tus fotos. ¿Deseas abrir los ajustes de la aplicación para habilitarlo?',
                  [
                    { text: 'Más tarde', style: 'cancel' },
                    { text: 'Ir a Ajustes', onPress: () => Linking.openSettings() }
                  ]
                );
              }
            }
          } catch (e) {
            console.warn('[DEBUG] Error gestionando permisos al iniciar:', e);
          }
        }, 1000);
      } else {
        console.log('[DEBUG] Entorno Web detectado. Omitiendo permisos de galería móvil.');
      }

      // Demora de 3 segundos para el SplashScreen
      setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }).start(() => {
          setIsSplashReady(true);
        });
      }, 3000);
    }
    
    initApp();
    // Check for updates after splash (3s delay to not slow startup)
    setTimeout(checkForUpdates, 4000);
  }, []);

  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        <StatusBar style="light" />
        
        {/* Renderiza las pestañas por debajo para evitar parpadeos visuales al ocultar el splash */}
        <Tabs
          screenOptions={{
            headerShown: false,
            tabBarStyle: {
              backgroundColor: Colors.surface,
              borderTopColor: Colors.border,
              borderTopWidth: 1,
              height: 64,
              paddingBottom: 8,
              paddingTop: 8,
            },
            tabBarActiveTintColor: Colors.primary,
            tabBarInactiveTintColor: Colors.textMuted,
            tabBarLabelStyle: {
              fontSize: 12,
              fontWeight: '600',
            },
          }}
        >
          <Tabs.Screen
            name="index"
            options={{
              title: 'Descargar',
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="download-outline" size={size} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="history"
            options={{
              title: 'Historial',
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="time-outline" size={size} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="settings"
            options={{
              title: 'Ajustes',
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="settings-outline" size={size} color={color} />
              ),
            }}
          />
        </Tabs>

        {/* ── Update Modal ── */}
        <Modal
          visible={!!updateInfo}
          transparent
          animationType="fade"
          statusBarTranslucent
        >
          <View style={styles.updateOverlay}>
            <View style={styles.updateCard}>
              <LinearGradient
                colors={['rgba(0,240,255,0.15)', 'rgba(112,0,255,0.1)']}
                style={styles.updateCardGlow}
              />
              <View style={styles.updateHeader}>
                <View style={styles.updateBadge}>
                  <Ionicons name="sparkles" size={16} color={Colors.primary} />
                  <Text style={styles.updateBadgeText}>Nueva Versión</Text>
                </View>
                <Text style={styles.updateVersion}>v{updateInfo?.version}</Text>
              </View>

              <Text style={styles.updateTitle}>
                ¡Hay una actualización disponible!
              </Text>
              <Text style={styles.updateSubtitle}>
                Tienes la versión <Text style={styles.updateVersionOld}>{packageJson.version}</Text>.
                {' '}Descarga la nueva para mejores funciones y correcciones.
              </Text>

              {updateInfo?.changelog && updateInfo.changelog.length > 0 && (
                <View style={styles.updateChangelog}>
                  {updateInfo.changelog.map((item, i) => (
                    <Text key={i} style={styles.updateChangelogItem}>{item}</Text>
                  ))}
                </View>
              )}

              <View style={styles.updateActions}>
                <TouchableOpacity
                  style={styles.updateBtnPrimary}
                  onPress={() => {
                    if (updateInfo?.downloadUrl) Linking.openURL(updateInfo.downloadUrl);
                  }}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={[Colors.primary, Colors.primaryLight]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.updateBtnGradient}
                  >
                    <Ionicons name="download-outline" size={18} color="#000" />
                    <Text style={styles.updateBtnPrimaryText}>Actualizar Ahora</Text>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.updateBtnSecondary}
                  onPress={() => setUpdateInfo(null)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.updateBtnSecondaryText}>Más tarde</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Capa del SplashScreen personalizado sobre la aplicación */}
        {!isSplashReady && (
          <Animated.View style={[styles.splashContainer, { opacity: fadeAnim }]} pointerEvents={isSplashReady ? 'none' : 'auto'}>
            <View style={styles.splashContent}>
              <Image 
                source={require('../assets/splash-icon.png')} 
                style={styles.splashLogo} 
                resizeMode="contain"
              />
              
              <ActivityIndicator 
                size="large" 
                color={Colors.primary} 
                style={styles.spinner} 
              />
              
              <Text style={styles.appName}>TikDownloaderCOL</Text>
              <Text style={styles.appSubtitle}>Descarga videos al instante</Text>
            </View>
            
            <View style={styles.footer}>
              <Text style={styles.versionText}>Versión {packageJson.version || '1.0.0'}</Text>
            </View>
          </Animated.View>
        )}
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  splashContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  splashContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  splashLogo: {
    width: 140,
    height: 140,
    marginBottom: 24,
  },
  spinner: {
    marginVertical: 16,
  },
  appName: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: 'bold',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  appSubtitle: {
    color: Colors.textSecondary,
    fontSize: 14,
    marginTop: 6,
    fontWeight: '500',
  },
  footer: {
    paddingBottom: 40,
  },
  versionText: {
    color: Colors.textMuted,
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.8,
  },
  // ── Update Modal ──
  updateOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  updateCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#0A0A16',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1.5,
    borderColor: 'rgba(0,240,255,0.2)',
    overflow: 'hidden',
  },
  updateCardGlow: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: 160,
  },
  updateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  updateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0,240,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(0,240,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
  },
  updateBadgeText: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  updateVersion: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '800',
  },
  updateTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  updateSubtitle: {
    color: Colors.textSecondary,
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 16,
  },
  updateVersionOld: {
    color: Colors.textMuted,
    fontWeight: '600',
  },
  updateChangelog: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 12,
    padding: 14,
    gap: 6,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
  },
  updateChangelogItem: {
    color: Colors.textSecondary,
    fontSize: 13,
    lineHeight: 20,
  },
  updateActions: {
    gap: 10,
  },
  updateBtnPrimary: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  updateBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 15,
    borderRadius: 14,
  },
  updateBtnPrimaryText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '800',
  },
  updateBtnSecondary: {
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  updateBtnSecondaryText: {
    color: Colors.textMuted,
    fontSize: 14,
    fontWeight: '600',
  },
});
