import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
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
import { getCategoryColor, getCategoryIcon } from '../utils/categoryUtils';

const UNITS = ['un', 'kg', 'g', 'L', 'ml', 'cx', 'pct', 'dz'];

const formatPrice = (v) => `R$ ${v.toFixed(2).replace('.', ',')}`;
const formatDate = (ts) =>
  new Date(ts).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });

// ─── Price Modal ─────────────────────────────────────────────────────────────

function PriceModal({ visible, item, listId, stores, onClose }) {
  const { setItemPrice } = useApp();
  const [inputs, setInputs] = useState({});

  useEffect(() => {
    if (item && visible) {
      const init = {};
      stores.forEach((s) => {
        const found = item.prices.find((p) => p.storeId === s.id);
        init[s.id] = found ? found.price.toFixed(2).replace('.', ',') : '';
      });
      setInputs(init);
    }
  }, [item, visible, stores]);

  const handleSave = () => {
    stores.forEach((store) => {
      const raw = (inputs[store.id] || '').replace(',', '.');
      const price = parseFloat(raw);
      setItemPrice(listId, item.id, store.id, store.name, isNaN(price) || price <= 0 ? null : price);
    });
    onClose();
  };

  if (!item) return null;

  const totalQty = item.quantity;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.pmOverlay}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={styles.pmSheet}>
          {/* Handle */}
          <View style={styles.pmHandle} />

          <Text style={styles.pmTitle} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.pmSubtitle}>
            {totalQty} {item.unit} · Informe o preço unitário por loja
          </Text>

          {stores.length === 0 ? (
            <View style={styles.pmEmpty}>
              <Ionicons name="storefront-outline" size={36} color={colors.textTertiary} />
              <Text style={styles.pmEmptyText}>
                Nenhuma loja cadastrada.{'\n'}Acesse a aba Lojas para adicionar.
              </Text>
            </View>
          ) : (
            <ScrollView style={styles.pmList} showsVerticalScrollIndicator={false}>
              {stores.map((store) => {
                const raw = inputs[store.id] || '';
                const price = parseFloat(raw.replace(',', '.'));
                const total = !isNaN(price) && price > 0 ? price * totalQty : null;
                return (
                  <View key={store.id} style={styles.pmRow}>
                    <View style={styles.pmStoreInfo}>
                      <View style={styles.pmStoreIcon}>
                        <Ionicons name="storefront" size={16} color={colors.accent} />
                      </View>
                      <View>
                        <Text style={styles.pmStoreName}>{store.name}</Text>
                        {total !== null && (
                          <Text style={styles.pmTotal}>Total: {formatPrice(total)}</Text>
                        )}
                      </View>
                    </View>
                    <View style={styles.pmInputWrap}>
                      <Text style={styles.pmCurrency}>R$</Text>
                      <TextInput
                        style={styles.pmInput}
                        keyboardType="decimal-pad"
                        placeholder="0,00"
                        placeholderTextColor={colors.textTertiary}
                        value={inputs[store.id] || ''}
                        onChangeText={(v) => setInputs((p) => ({ ...p, [store.id]: v }))}
                        maxLength={10}
                      />
                    </View>
                  </View>
                );
              })}
            </ScrollView>
          )}

          <View style={styles.pmActions}>
            <TouchableOpacity style={styles.btnSecondary} onPress={onClose}>
              <Text style={styles.btnSecondaryText}>Cancelar</Text>
            </TouchableOpacity>
            {stores.length > 0 && (
              <TouchableOpacity style={styles.btnPrimary} onPress={handleSave}>
                <Ionicons name="checkmark" size={18} color={colors.white} />
                <Text style={styles.btnPrimaryText}>Salvar Preços</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ─── Add Item Modal ──────────────────────────────────────────────────────────

function AddItemModal({ visible, listId, onClose }) {
  const { addItem, products } = useApp();
  const [mode, setMode] = useState('form'); // 'form' | 'browse'
  const [name, setName] = useState('');
  const [qty, setQty] = useState('1');
  const [unit, setUnit] = useState('un');
  const [catalogSearch, setCatalogSearch] = useState('');

  const reset = useCallback(() => {
    setMode('form');
    setName('');
    setQty('1');
    setUnit('un');
    setCatalogSearch('');
  }, []);

  const handleCancel = () => { reset(); onClose(); };

  const handleAdd = () => {
    const n = name.trim();
    if (!n) return;
    addItem(listId, n, qty || '1', unit);
    reset();
    onClose();
  };

  // Inline autocomplete when typing in the name field
  const suggestions = useMemo(() => {
    if (!name.trim() || name.trim().length < 2 || !products.length) return [];
    const q = name.toLowerCase();
    return products
      .filter(p => p.name.toLowerCase().includes(q) || p.brand?.toLowerCase().includes(q))
      .slice(0, 4);
  }, [name, products]);

  // Catalog browser filtered list
  const catalogFiltered = useMemo(() => {
    if (!catalogSearch.trim()) return products.slice(0, 30);
    const q = catalogSearch.toLowerCase();
    return products
      .filter(
        p =>
          p.name.toLowerCase().includes(q) ||
          p.brand?.toLowerCase().includes(q) ||
          p.category?.toLowerCase().includes(q)
      )
      .slice(0, 30);
  }, [catalogSearch, products]);

  const selectFromCatalog = (product) => {
    setName(product.name);
    setUnit(product.unit || 'un');
    setMode('form');
    setCatalogSearch('');
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleCancel}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.pmOverlay}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={handleCancel} />
        <View style={styles.pmSheet}>
          <View style={styles.pmHandle} />

          {/* ── BROWSE mode: product catalog picker ── */}
          {mode === 'browse' && (
            <>
              <View style={styles.browseHeader}>
                <TouchableOpacity onPress={() => setMode('form')} style={styles.browseBtnBack} hitSlop={8}>
                  <Ionicons name="arrow-back" size={20} color={colors.text} />
                </TouchableOpacity>
                <Text style={styles.pmTitle}>Catálogo de Produtos</Text>
              </View>

              <View style={styles.browseSearchBox}>
                <Ionicons name="search-outline" size={16} color={colors.textTertiary} />
                <TextInput
                  style={styles.browseSearchInput}
                  placeholder="Buscar produto..."
                  placeholderTextColor={colors.textTertiary}
                  value={catalogSearch}
                  onChangeText={setCatalogSearch}
                  autoFocus
                />
                {catalogSearch.length > 0 && (
                  <TouchableOpacity onPress={() => setCatalogSearch('')} hitSlop={6}>
                    <Ionicons name="close-circle" size={15} color={colors.textTertiary} />
                  </TouchableOpacity>
                )}
              </View>

              <ScrollView
                style={styles.browseList}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                {catalogFiltered.length === 0 ? (
                  <View style={styles.browseEmpty}>
                    <Text style={styles.browseEmptyText}>Nenhum produto encontrado</Text>
                  </View>
                ) : (
                  catalogFiltered.map(p => {
                    const catColor = getCategoryColor(p.category);
                    return (
                      <TouchableOpacity
                        key={p.id}
                        style={styles.browseItem}
                        onPress={() => selectFromCatalog(p)}
                        activeOpacity={0.7}
                      >
                        <View style={[styles.browseItemIcon, { backgroundColor: catColor + '18' }]}>
                          <Ionicons name={getCategoryIcon(p.category)} size={18} color={catColor} />
                        </View>
                        <View style={styles.browseItemBody}>
                          <Text style={styles.browseItemName} numberOfLines={1}>{p.name}</Text>
                          <Text style={styles.browseItemMeta} numberOfLines={1}>
                            {[p.brand, p.category].filter(Boolean).join(' · ') || 'Sem categoria'}
                          </Text>
                        </View>
                        <View style={styles.browseItemUnitBadge}>
                          <Text style={styles.browseItemUnitText}>{p.unit}</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={15} color={colors.textTertiary} />
                      </TouchableOpacity>
                    );
                  })
                )}
                {catalogFiltered.length === 30 && (
                  <Text style={styles.browseMoreHint}>Refine a busca para ver mais resultados</Text>
                )}
              </ScrollView>
            </>
          )}

          {/* ── FORM mode: manual entry with autocomplete ── */}
          {mode === 'form' && (
            <>
              <Text style={styles.pmTitle}>Adicionar Item</Text>

              <Text style={styles.modalLabel}>Nome do produto</Text>
              <TextInput
                style={styles.input}
                placeholder={products.length > 0 ? 'Digite ou busque no catálogo...' : 'Ex: Leite integral'}
                placeholderTextColor={colors.textTertiary}
                value={name}
                onChangeText={setName}
                autoFocus
                maxLength={80}
                returnKeyType="next"
              />

              {/* Inline autocomplete suggestions */}
              {suggestions.length > 0 && (
                <View style={styles.suggestionsBox}>
                  {suggestions.map(p => {
                    const c = getCategoryColor(p.category);
                    return (
                      <TouchableOpacity
                        key={p.id}
                        style={styles.suggestionItem}
                        onPress={() => { setName(p.name); setUnit(p.unit || 'un'); }}
                        activeOpacity={0.7}
                      >
                        <View style={[styles.suggestionIconWrap, { backgroundColor: c + '18' }]}>
                          <Ionicons name={getCategoryIcon(p.category)} size={14} color={c} />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.suggestionName} numberOfLines={1}>{p.name}</Text>
                          {(p.brand || p.category) && (
                            <Text style={styles.suggestionMeta} numberOfLines={1}>
                              {[p.brand, p.category].filter(Boolean).join(' · ')}
                            </Text>
                          )}
                        </View>
                        <View style={styles.suggestionUnitBadge}>
                          <Text style={styles.suggestionUnitText}>{p.unit}</Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}

              {/* Browse catalog button (shown when no active suggestions) */}
              {products.length > 0 && suggestions.length === 0 && (
                <TouchableOpacity style={styles.browseCatalogBtn} onPress={() => setMode('browse')}>
                  <Ionicons name="cube-outline" size={15} color={colors.primary} />
                  <Text style={styles.browseCatalogBtnText}>
                    Buscar no catálogo ({products.length})
                  </Text>
                  <Ionicons name="chevron-forward" size={14} color={colors.primary} />
                </TouchableOpacity>
              )}

              <Text style={styles.modalLabel}>Quantidade</Text>
              <View style={styles.qtyRow}>
                <TextInput
                  style={[styles.input, styles.qtyInput]}
                  keyboardType="decimal-pad"
                  value={qty}
                  onChangeText={setQty}
                  maxLength={8}
                />
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.unitScroll}
                  contentContainerStyle={styles.unitScrollContent}
                >
                  {UNITS.map((u) => (
                    <TouchableOpacity
                      key={u}
                      style={[styles.unitChip, unit === u && styles.unitChipActive]}
                      onPress={() => setUnit(u)}
                    >
                      <Text style={[styles.unitChipText, unit === u && styles.unitChipTextActive]}>
                        {u}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.pmActions}>
                <TouchableOpacity style={styles.btnSecondary} onPress={handleCancel}>
                  <Text style={styles.btnSecondaryText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.btnPrimary, !name.trim() && styles.btnDisabled]}
                  onPress={handleAdd}
                  disabled={!name.trim()}
                >
                  <Ionicons name="add" size={18} color={colors.white} />
                  <Text style={styles.btnPrimaryText}>Adicionar</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ─── Item Row ────────────────────────────────────────────────────────────────

function ItemRow({ item, listId, stores, onToggle, onDelete, onEditPrice }) {
  const prices = item.prices;
  const minPrice = prices.length > 0 ? Math.min(...prices.map((p) => p.price)) : null;

  return (
    <View style={[styles.itemCard, item.checked && styles.itemCardChecked]}>
      <TouchableOpacity onPress={onToggle} style={styles.checkbox} hitSlop={4}>
        <Ionicons
          name={item.checked ? 'checkmark-circle' : 'ellipse-outline'}
          size={26}
          color={item.checked ? colors.primary : colors.border}
        />
      </TouchableOpacity>

      <View style={styles.itemBody}>
        <View style={styles.itemTopRow}>
          <Text
            style={[styles.itemName, item.checked && styles.itemNameChecked]}
            numberOfLines={1}
          >
            {item.name}
          </Text>
          <Text style={styles.itemQty}>
            {item.quantity} {item.unit}
          </Text>
        </View>

        {/* Price Badges */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.badgesScroll}
          contentContainerStyle={styles.badgesContent}
        >
          {prices.map((p) => {
            const isCheap = p.price === minPrice;
            return (
              <TouchableOpacity
                key={p.storeId}
                onPress={() => onEditPrice(item)}
                style={[styles.priceBadge, isCheap && styles.priceBadgeCheap]}
              >
                <Text
                  style={[styles.priceBadgeStore, isCheap && styles.priceBadgeStoreCheap]}
                  numberOfLines={1}
                >
                  {p.storeName}
                </Text>
                <Text style={[styles.priceBadgeValue, isCheap && styles.priceBadgeValueCheap]}>
                  {formatPrice(p.price)}
                </Text>
                {isCheap && prices.length > 1 && (
                  <Ionicons name="trending-down" size={10} color={colors.success} />
                )}
              </TouchableOpacity>
            );
          })}
          <TouchableOpacity onPress={() => onEditPrice(item)} style={styles.addPriceBadge}>
            <Ionicons name="add-circle-outline" size={14} color={colors.primary} />
            <Text style={styles.addPriceText}>{prices.length > 0 ? 'Editar' : 'Preço'}</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      <TouchableOpacity onPress={onDelete} style={styles.deleteBtn} hitSlop={4}>
        <Ionicons name="trash-outline" size={18} color={colors.errorSurface === '#FEE2E2' ? colors.error : '#dc2626'} />
      </TouchableOpacity>
    </View>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────

export default function ListDetailScreen({ navigation, route }) {
  const { listId } = route.params;
  const { lists, stores, deleteItem, toggleItem, renameList } = useApp();

  const list = lists.find((l) => l.id === listId);

  const [showAddItem, setShowAddItem] = useState(false);
  const [showPriceModal, setShowPriceModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState('');

  const openPriceModal = useCallback((item) => {
    setSelectedItem(item);
    setShowPriceModal(true);
  }, []);

  const startRename = () => {
    setNameInput(list.name);
    setEditingName(true);
  };

  const confirmRename = () => {
    if (nameInput.trim()) renameList(listId, nameInput.trim());
    setEditingName(false);
  };

  if (!list) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.detailHeader}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={colors.white} />
          </TouchableOpacity>
          <Text style={styles.detailHeaderTitle}>Lista não encontrada</Text>
        </View>
      </SafeAreaView>
    );
  }

  const checkedCount = list.items.filter((i) => i.checked).length;
  const pricedCount = list.items.filter((i) => i.prices.length > 0).length;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.detailHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} hitSlop={8}>
          <Ionicons name="arrow-back" size={24} color={colors.white} />
        </TouchableOpacity>

        <View style={styles.detailHeaderCenter}>
          {editingName ? (
            <TextInput
              style={styles.headerNameInput}
              value={nameInput}
              onChangeText={setNameInput}
              autoFocus
              onBlur={confirmRename}
              onSubmitEditing={confirmRename}
              maxLength={60}
            />
          ) : (
            <TouchableOpacity onPress={startRename}>
              <Text style={styles.detailHeaderTitle} numberOfLines={1}>
                {list.name}
              </Text>
              <Text style={styles.detailHeaderMeta}>
                {list.items.length === 0
                  ? 'Lista vazia'
                  : `${checkedCount}/${list.items.length} · ${pricedCount} cotado${pricedCount !== 1 ? 's' : ''}`}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          onPress={() =>
            list.items.length > 0
              ? navigation.navigate('Compare', { listId })
              : Alert.alert('Atenção', 'Adicione itens à lista antes de comparar.')
          }
          style={styles.compareBtn}
          hitSlop={8}
        >
          <Ionicons name="bar-chart-outline" size={18} color={colors.white} />
          <Text style={styles.compareBtnText}>Comparar</Text>
        </TouchableOpacity>
      </View>

      {/* Items list */}
      <FlatList
        data={list.items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ItemRow
            item={item}
            listId={listId}
            stores={stores}
            onToggle={() => toggleItem(listId, item.id)}
            onDelete={() =>
              Alert.alert('Remover item', `Remover "${item.name}"?`, [
                { text: 'Cancelar', style: 'cancel' },
                { text: 'Remover', style: 'destructive', onPress: () => deleteItem(listId, item.id) },
              ])
            }
            onEditPrice={openPriceModal}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyItems}>
            <Ionicons name="basket-outline" size={52} color={colors.primaryLight} />
            <Text style={styles.emptyItemsTitle}>Lista vazia</Text>
            <Text style={styles.emptyItemsSub}>Toque em + para adicionar produtos</Text>
          </View>
        }
        contentContainerStyle={
          list.items.length === 0 ? styles.listEmptyFlex : styles.listContent
        }
        showsVerticalScrollIndicator={false}
      />

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={() => setShowAddItem(true)} activeOpacity={0.85}>
        <Ionicons name="add" size={30} color={colors.white} />
      </TouchableOpacity>

      {/* Modals */}
      <AddItemModal
        visible={showAddItem}
        listId={listId}
        onClose={() => setShowAddItem(false)}
      />
      <PriceModal
        visible={showPriceModal}
        item={selectedItem}
        listId={listId}
        stores={stores}
        onClose={() => {
          setShowPriceModal(false);
          setSelectedItem(null);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  // Detail Header
  detailHeader: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    marginRight: spacing.sm,
  },
  detailHeaderCenter: {
    flex: 1,
  },
  detailHeaderTitle: {
    ...typography.h4,
    color: colors.white,
    fontSize: 17,
  },
  detailHeaderMeta: {
    ...typography.caption,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 1,
  },
  headerNameInput: {
    ...typography.h4,
    color: colors.white,
    fontSize: 17,
    borderBottomWidth: 1.5,
    borderBottomColor: 'rgba(255,255,255,0.6)',
    paddingVertical: 2,
    paddingHorizontal: 0,
  },
  compareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 8,
    borderRadius: radius.md,
    marginLeft: spacing.sm,
  },
  compareBtnText: {
    ...typography.caption,
    color: colors.white,
    fontWeight: '700',
    fontSize: 12,
  },

  // Item card
  listContent: {
    padding: spacing.md,
    paddingBottom: 100,
  },
  listEmptyFlex: {
    flex: 1,
    padding: spacing.md,
  },
  itemCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    flexDirection: 'row',
    alignItems: 'flex-start',
    ...shadows.sm,
  },
  itemCardChecked: {
    opacity: 0.6,
  },
  checkbox: {
    marginRight: spacing.sm,
    marginTop: 2,
  },
  itemBody: {
    flex: 1,
    gap: spacing.sm,
  },
  itemTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  itemName: {
    ...typography.bodyMedium,
    color: colors.text,
    flex: 1,
  },
  itemNameChecked: {
    textDecorationLine: 'line-through',
    color: colors.textTertiary,
  },
  itemQty: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    backgroundColor: colors.borderLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  badgesScroll: {
    flexGrow: 0,
  },
  badgesContent: {
    gap: spacing.xs,
    paddingRight: spacing.xs,
  },
  priceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: colors.borderLight,
    borderRadius: radius.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  priceBadgeCheap: {
    backgroundColor: colors.successSurface,
  },
  priceBadgeStore: {
    ...typography.caption,
    color: colors.textSecondary,
    maxWidth: 70,
  },
  priceBadgeStoreCheap: {
    color: colors.success,
  },
  priceBadgeValue: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.text,
  },
  priceBadgeValueCheap: {
    color: colors.success,
  },
  addPriceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    borderRadius: radius.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: colors.primary,
    borderStyle: 'dashed',
  },
  addPriceText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
  },
  deleteBtn: {
    padding: spacing.xs,
    marginLeft: spacing.xs,
    marginTop: 1,
  },

  // Empty state
  emptyItems: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingBottom: 80,
  },
  emptyItemsTitle: {
    ...typography.h3,
    color: colors.text,
  },
  emptyItemsSub: {
    ...typography.body,
    color: colors.textSecondary,
  },

  // FAB
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

  // Price Modal (bottom sheet)
  pmOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end',
  },
  pmSheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: spacing.lg,
    paddingBottom: Platform.OS === 'ios' ? 34 : spacing.lg,
    paddingTop: spacing.md,
    maxHeight: '85%',
    ...shadows.lg,
  },
  pmHandle: {
    width: 36,
    height: 4,
    borderRadius: radius.full,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginBottom: spacing.md,
  },
  pmTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: 4,
  },
  pmSubtitle: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  pmEmpty: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    gap: spacing.sm,
  },
  pmEmptyText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  pmList: {
    maxHeight: 300,
  },
  pmRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  pmStoreInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  pmStoreIcon: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    backgroundColor: colors.accentSurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pmStoreName: {
    ...typography.bodyMedium,
    color: colors.text,
  },
  pmTotal: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 1,
  },
  pmInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.background,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  pmCurrency: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    fontSize: 13,
  },
  pmInput: {
    ...typography.bodyMedium,
    color: colors.text,
    minWidth: 60,
    textAlign: 'right',
    padding: 0,
  },
  pmActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },

  // Add Item Modal
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
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  qtyInput: {
    width: 80,
    marginBottom: 0,
    textAlign: 'center',
  },
  unitScroll: {
    flex: 1,
  },
  unitScrollContent: {
    gap: spacing.xs,
    alignItems: 'center',
  },
  unitChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radius.full,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  unitChipActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySurface,
  },
  unitChipText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  unitChipTextActive: {
    color: colors.primary,
  },

  // Catalog browse mode
  browseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  browseBtnBack: { padding: 4 },
  browseSearchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    borderWidth: 1.5,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  browseSearchInput: {
    flex: 1,
    ...typography.body,
    color: colors.text,
    padding: 0,
  },
  browseList: { maxHeight: 340 },
  browseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: 11,
    paddingHorizontal: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  browseItemIcon: {
    width: 36, height: 36, borderRadius: radius.sm,
    alignItems: 'center', justifyContent: 'center',
  },
  browseItemBody: { flex: 1 },
  browseItemName: { ...typography.bodyMedium, color: colors.text },
  browseItemMeta: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  browseItemUnitBadge: {
    backgroundColor: colors.borderLight,
    paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: radius.full,
  },
  browseItemUnitText: { ...typography.caption, color: colors.textSecondary, fontWeight: '700' },
  browseEmpty: { alignItems: 'center', paddingVertical: spacing.lg },
  browseEmptyText: { ...typography.body, color: colors.textSecondary },
  browseMoreHint: {
    ...typography.caption, color: colors.textTertiary,
    textAlign: 'center', paddingVertical: spacing.sm, fontStyle: 'italic',
  },

  // Autocomplete suggestions
  suggestionsBox: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    marginBottom: spacing.sm,
    overflow: 'hidden',
    backgroundColor: colors.surface,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  suggestionIconWrap: {
    width: 28, height: 28, borderRadius: radius.sm,
    alignItems: 'center', justifyContent: 'center',
  },
  suggestionName: { ...typography.bodyMedium, color: colors.text },
  suggestionMeta: { ...typography.caption, color: colors.textSecondary, marginTop: 1 },
  suggestionUnitBadge: {
    backgroundColor: colors.borderLight,
    paddingHorizontal: 7, paddingVertical: 2,
    borderRadius: radius.full,
  },
  suggestionUnitText: { ...typography.caption, color: colors.textSecondary, fontWeight: '700' },

  // Browse catalog button
  browseCatalogBtn: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.xs,
    paddingVertical: 9, paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1.5, borderColor: colors.primaryLight,
    backgroundColor: colors.primarySurface,
  },
  browseCatalogBtnText: {
    ...typography.bodySmall, color: colors.primary, fontWeight: '600', flex: 1,
  },

  // Shared buttons
  btnSecondary: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  btnPrimaryText: {
    ...typography.bodyMedium,
    color: colors.white,
  },
  btnDisabled: {
    backgroundColor: colors.border,
  },
});
