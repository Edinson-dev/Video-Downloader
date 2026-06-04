import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PLATFORMS } from '../constants/platforms';
import { Colors, BorderRadius, Spacing, Shadows } from '../constants/colors';

function HistoryItem({ item, onDelete, onShare, onPlay }) {
  const platform = PLATFORMS[item.platform];
  const date = new Date(item.downloadedAt);
  const formattedDate = `${date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
  })} · ${date.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
  })}`;

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '';
    const mb = bytes / (1024 * 1024);
    return mb >= 1 ? `${mb.toFixed(1)} MB` : `${(bytes / 1024).toFixed(0)} KB`;
  };

  const handleDelete = () => {
    Alert.alert(
      'Eliminar del historial',
      '¿Quieres eliminar este registro?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => onDelete(item.id),
        },
      ]
    );
  };

  const handlePress = () => {
    if (!item.isAudio && onPlay) {
      onPlay(item);
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={item.isAudio ? 1 : 0.7}
      onPress={handlePress}
      style={styles.item}
    >
      {/* Platform/Type icon */}
      <View
        style={[
          styles.platformIcon,
          {
            backgroundColor: platform
              ? `${platform.gradient[0]}20`
              : Colors.surfaceElevated,
          },
        ]}
      >
        <Ionicons
          name={item.isAudio ? 'musical-notes' : 'play-circle'}
          size={24}
          color={platform?.gradient[0] || Colors.textSecondary}
        />
      </View>

      {/* Info */}
      <View style={styles.itemInfo}>
        <Text style={styles.itemPlatform}>
          {platform?.name || 'Video'} · {item.isAudio ? 'MP3' : `${item.quality || '1080'}p`}
        </Text>
        <Text style={styles.itemDate} numberOfLines={1}>
          {formattedDate}
          {item.fileSize ? ` · ${formatFileSize(Number(item.fileSize))}` : ''}
        </Text>
        <Text style={styles.itemUrl} numberOfLines={1}>
          {item.url}
        </Text>
      </View>

      {/* Share button */}
      {onShare && (
        <TouchableOpacity
          onPress={() => onShare(item)}
          style={styles.shareButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="share-social-outline" size={18} color={Colors.primary} />
        </TouchableOpacity>
      )}

      {/* Delete button */}
      <TouchableOpacity
        onPress={handleDelete}
        style={styles.deleteButton}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons name="trash-outline" size={18} color={Colors.textMuted} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

export default function DownloadHistory({ history, onDelete, onClearAll, onShare, onPlay }) {
  if (!history || history.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="folder-open-outline" size={64} color={Colors.textMuted} />
        <Text style={styles.emptyTitle}>Sin descargas aún</Text>
        <Text style={styles.emptySubtitle}>
          Los videos que descargues aparecerán aquí
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {history.length} {history.length === 1 ? 'descarga' : 'descargas'}
        </Text>
        {onClearAll && (
          <TouchableOpacity onPress={onClearAll}>
            <Text style={styles.clearAllText}>Limpiar todo</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* List */}
      <FlatList
        data={history}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <HistoryItem item={item} onDelete={onDelete} onShare={onShare} onPlay={onPlay} />
        )}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
  },
  headerTitle: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: '500',
  },
  clearAllText: {
    color: Colors.error,
    fontSize: 14,
    fontWeight: '600',
  },
  list: {
    paddingBottom: Spacing.xxl,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginHorizontal: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  platformIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  itemInfo: {
    flex: 1,
  },
  itemPlatform: {
    color: Colors.textPrimary,
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  itemDate: {
    color: Colors.textSecondary,
    fontSize: 13,
    marginBottom: 2,
  },
  itemUrl: {
    color: Colors.textMuted,
    fontSize: 12,
  },
  shareButton: {
    padding: Spacing.sm,
    marginRight: Spacing.xs,
  },
  deleteButton: {
    padding: Spacing.sm,
  },
  separator: {
    height: Spacing.sm,
  },
  // Empty state
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },
  emptyTitle: {
    color: Colors.textSecondary,
    fontSize: 20,
    fontWeight: '700',
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  emptySubtitle: {
    color: Colors.textMuted,
    fontSize: 15,
    textAlign: 'center',
  },
});
