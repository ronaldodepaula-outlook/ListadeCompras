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

const formatDate = (ts) =>
  new Date(ts).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });

function ListCard({ list, onPress, onDelete }) {
  const total = list.items.length;
  const checked = list.items.filter((i) => i.checked).length;
  const priced = list.items.filter((i) => i.prices.length > 0).length;
  const progress = total > 0 ? checked / total : 0;

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={onPress}
    >
      <View style={styles.cardIconWrap}>
        <Ionicons name="cart" size={22} color={colors.primary} />
      </View>

      <View style={styles.cardBody}>
        <Text style={styles.cardTitle} numberOfLines={1}>
          {list.name}
        </Text>
        <Text style={styles.cardMeta}>
          {total === 0 ? 'Lista vazia' : `${total} ${total === 1 ? 'item' : 'itens'}`}
          {priced > 0 ? `  ·  ${priced} cotado${priced > 1 ? 's' : ''}` : ''}
        </Text>
        {total > 0 && (
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${progress * 100}%` }]} />
          </View>
        )}
        <Text style={styles.cardDate}>{formatDate(list.createdAt)}</Text>
      </View>

      <View style={styles.cardRight}>
        <TouchableOpacity
          onPress={() =>
            Alert.alert('Excluir lista', `Deseja excluir "${list.name}"?`, [
              { text: 'Cancelar', style: 'cancel' },
              { text: 'Excluir', style: 'destructive', onPress: () => onDelete(list.id) },
            ])
          }
          style={styles.deleteBtn}
          hitSlop={8}
        >
          <Ionicons name="trash-outline" size={18} color={colors.textTertiary} />
        </TouchableOpacity>
        <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
      </View>
    </Pressable>
  );
}

function EmptyLists() {
  return (
    <View style={styles.empty}>
      <View style={styles.emptyIcon}>
        <Ionicons name="cart-outline" size={56} color={colors.primaryLight} />
      </View>
      <Text style={styles.emptyTitle}>Nenhuma lista criada</Text>
      <Text style={styles.emptySubtitle}>
        Toque no botão + para criar sua primeira lista de compras
      </Text>
    </View>
  );
}

export default function ListsScreen({ navigation }) {
  const { lists, addList, deleteList } = useApp();
  const [modalVisible, setModalVisible] = useState(false);
  const [listName, setListName] = useState('');

  const handleCreate = () => {
    const name = listName.trim();
    if (!name) return;
    const list = addList(name);
    setListName('');
    setModalVisible(false);
    navigation.navigate('ListDetail', { listId: list.id });
  };

  const handleCancel = () => {
    setListName('');
    setModalVisible(false);
  };

  const sorted = [...lists].sort((a, b) => b.createdAt - a.createdAt);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>CompraFácil</Text>
          <Text style={styles.headerSubtitle}>Suas listas de compras</Text>
        </View>
        <View style={styles.headerIconWrap}>
          <Ionicons name="cart" size={28} color={colors.white} />
        </View>
      </View>

      {/* List */}
      <FlatList
        data={sorted}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ListCard
            list={item}
            onPress={() => navigation.navigate('ListDetail', { listId: item.id })}
            onDelete={deleteList}
          />
        )}
        ListEmptyComponent={<EmptyLists />}
        contentContainerStyle={sorted.length === 0 ? styles.listEmpty : styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)} activeOpacity={0.85}>
        <Ionicons name="add" size={30} color={colors.white} />
      </TouchableOpacity>

      {/* Create List Modal */}
      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={handleCancel}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.overlay}
        >
          <Pressable style={StyleSheet.absoluteFill} onPress={handleCancel} />
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Nova Lista</Text>
            <Text style={styles.modalLabel}>Nome da lista</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Compras da semana"
              placeholderTextColor={colors.textTertiary}
              value={listName}
              onChangeText={setListName}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={handleCreate}
              maxLength={60}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.btnSecondary} onPress={handleCancel}>
                <Text style={styles.btnSecondaryText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.btnPrimary, !listName.trim() && styles.btnDisabled]}
                onPress={handleCreate}
                disabled={!listName.trim()}
              >
                <Text style={styles.btnPrimaryText}>Criar Lista</Text>
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
    backgroundColor: colors.primary,
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
    color: 'rgba(255,255,255,0.75)',
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
    ...shadows.md,
  },
  cardPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.99 }],
  },
  cardIconWrap: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.primarySurface,
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
  cardMeta: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  progressBarBg: {
    height: 3,
    backgroundColor: colors.borderLight,
    borderRadius: radius.full,
    overflow: 'hidden',
    marginTop: 4,
    marginBottom: 2,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: radius.full,
  },
  cardDate: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  cardRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginLeft: spacing.sm,
  },
  deleteBtn: {
    padding: spacing.xs,
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
    backgroundColor: colors.primarySurface,
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
    backgroundColor: colors.primary,
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
  modalTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.lg,
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
    marginBottom: spacing.lg,
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.sm,
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
  btnPrimary: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
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
