import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { colors, spacing, radius, shadows, typography } from '../theme';

function StoreCard({ store, onDelete }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardIconWrap}>
        <Ionicons name="storefront" size={20} color={colors.accent} />
      </View>

      <View style={styles.cardBody}>
        <Text style={styles.cardTitle} numberOfLines={1}>
          {store.name}
        </Text>
        {store.address ? (
          <Text style={styles.cardAddress} numberOfLines={1}>
            <Ionicons name="location-outline" size={11} color={colors.textTertiary} />{' '}
            {store.address}
          </Text>
        ) : (
          <Text style={styles.cardAddress}>Endereço não informado</Text>
        )}
      </View>

      <TouchableOpacity
        onPress={() =>
          Alert.alert(
            'Excluir estabelecimento',
            `Deseja excluir "${store.name}"?\nOs preços registrados para esta loja serão removidos.`,
            [
              { text: 'Cancelar', style: 'cancel' },
              { text: 'Excluir', style: 'destructive', onPress: () => onDelete(store.id) },
            ]
          )
        }
        style={styles.deleteBtn}
        hitSlop={8}
      >
        <Ionicons name="trash-outline" size={18} color={colors.textTertiary} />
      </TouchableOpacity>
    </View>
  );
}

function EmptyStores() {
  return (
    <View style={styles.empty}>
      <View style={styles.emptyIcon}>
        <Ionicons name="storefront-outline" size={56} color={colors.accent} />
      </View>
      <Text style={styles.emptyTitle}>Nenhuma loja cadastrada</Text>
      <Text style={styles.emptySubtitle}>
        Adicione supermercados e lojas para começar a comparar preços
      </Text>
    </View>
  );
}

export default function StoresScreen() {
  const { stores, addStore, deleteStore } = useApp();
  const [modalVisible, setModalVisible] = useState(false);
  const [storeName, setStoreName] = useState('');
  const [storeAddress, setStoreAddress] = useState('');

  const handleCreate = () => {
    const name = storeName.trim();
    if (!name) return;
    addStore(name, storeAddress);
    setStoreName('');
    setStoreAddress('');
    setModalVisible(false);
  };

  const handleCancel = () => {
    setStoreName('');
    setStoreAddress('');
    setModalVisible(false);
  };

  const sorted = [...stores].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Estabelecimentos</Text>
          <Text style={styles.headerSubtitle}>
            {stores.length === 0
              ? 'Nenhuma loja cadastrada'
              : `${stores.length} ${stores.length === 1 ? 'loja' : 'lojas'} cadastrada${stores.length > 1 ? 's' : ''}`}
          </Text>
        </View>
        <View style={styles.headerIconWrap}>
          <Ionicons name="storefront" size={26} color={colors.white} />
        </View>
      </View>

      {/* Store list */}
      <FlatList
        data={sorted}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <StoreCard store={item} onDelete={deleteStore} />}
        ListEmptyComponent={<EmptyStores />}
        contentContainerStyle={sorted.length === 0 ? styles.listEmpty : styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)} activeOpacity={0.85}>
        <Ionicons name="add" size={30} color={colors.white} />
      </TouchableOpacity>

      {/* Create Store Modal */}
      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={handleCancel}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.overlay}
        >
          <Pressable style={StyleSheet.absoluteFill} onPress={handleCancel} />
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={styles.modalIconWrap}>
                <Ionicons name="storefront" size={22} color={colors.accent} />
              </View>
              <Text style={styles.modalTitle}>Nova Loja</Text>
            </View>

            <Text style={styles.modalLabel}>Nome do estabelecimento *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Supermercado Extra"
              placeholderTextColor={colors.textTertiary}
              value={storeName}
              onChangeText={setStoreName}
              autoFocus
              returnKeyType="next"
              maxLength={60}
            />

            <Text style={styles.modalLabel}>Endereço (opcional)</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Av. Paulista, 1000"
              placeholderTextColor={colors.textTertiary}
              value={storeAddress}
              onChangeText={setStoreAddress}
              returnKeyType="done"
              onSubmitEditing={handleCreate}
              maxLength={100}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.btnSecondary} onPress={handleCancel}>
                <Text style={styles.btnSecondaryText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.btnAccent, !storeName.trim() && styles.btnDisabled]}
                onPress={handleCreate}
                disabled={!storeName.trim()}
              >
                <Text style={styles.btnPrimaryText}>Cadastrar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.primaryDark,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    ...typography.h2,
    color: colors.white,
  },
  headerSubtitle: {
    ...typography.bodySmall,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
  headerIconWrap: {
    width: 48,
    height: 48,
    borderRadius: radius.full,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    padding: spacing.md,
    paddingBottom: 100,
  },
  listEmpty: {
    flex: 1,
    padding: spacing.md,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    ...shadows.sm,
  },
  cardIconWrap: {
    width: 42,
    height: 42,
    borderRadius: radius.md,
    backgroundColor: colors.accentSurface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  cardBody: {
    flex: 1,
    gap: 3,
  },
  cardTitle: {
    ...typography.h4,
    color: colors.text,
  },
  cardAddress: {
    ...typography.bodySmall,
    color: colors.textTertiary,
  },
  deleteBtn: {
    padding: spacing.sm,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  emptyIcon: {
    width: 100,
    height: 100,
    borderRadius: radius.full,
    backgroundColor: colors.accentSurface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  emptySubtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  fab: {
    position: 'absolute',
    bottom: spacing.xl,
    right: spacing.lg,
    width: 58,
    height: 58,
    borderRadius: radius.full,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.lg,
  },
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modalCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    width: '100%',
    ...shadows.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  modalIconWrap: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    backgroundColor: colors.accentSurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    ...typography.h3,
    color: colors.text,
  },
  modalLabel: {
    ...typography.label,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  input: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.background,
    marginBottom: spacing.md,
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  btnSecondary: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
  },
  btnSecondaryText: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
  },
  btnAccent: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: radius.md,
    backgroundColor: colors.accent,
    alignItems: 'center',
  },
  btnPrimaryText: {
    ...typography.bodyMedium,
    color: colors.white,
  },
  btnDisabled: {
    backgroundColor: colors.border,
  },
});
