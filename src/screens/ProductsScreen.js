import React, { useState, useMemo, useCallback } from 'react';
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
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as Clipboard from 'expo-clipboard';

import { useApp } from '../context/AppContext';
import { colors, spacing, radius, shadows, typography } from '../theme';
import { parseProductCSV, CSV_TEMPLATE, CSV_COLUMNS } from '../utils/csvParser';
import { getCategoryColor, getCategoryIcon } from '../utils/categoryUtils';

const UNITS = ['un', 'kg', 'g', 'L', 'ml', 'cx', 'pct', 'dz'];

// ─── Import Modal ─────────────────────────────────────────────────────────────

const STEP = { IDLE: 'idle', READING: 'reading', PREVIEW: 'preview', TEMPLATE: 'template' };

function ImportModal({ visible, onClose, onImport }) {
  const [step, setStep] = useState(STEP.IDLE);
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);

  const reset = () => {
    setStep(STEP.IDLE);
    setResult(null);
    setCopied(false);
  };

  const handleClose = () => { reset(); onClose(); };

  const pickAndParse = async () => {
    try {
      setStep(STEP.READING);
      const picked = await DocumentPicker.getDocumentAsync({
        type: ['text/csv', 'text/plain', 'text/comma-separated-values', '*/*'],
        copyToCacheDirectory: true,
      });

      if (picked.canceled) { setStep(STEP.IDLE); return; }

      const uri = picked.assets[0].uri;
      const content = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      const parsed = parseProductCSV(content);
      setResult(parsed);
      setStep(STEP.PREVIEW);
    } catch (err) {
      setStep(STEP.IDLE);
      Alert.alert('Erro ao ler arquivo', 'Verifique se o arquivo é um CSV válido com codificação UTF-8.');
    }
  };

  const handleConfirmImport = () => {
    if (result?.products?.length > 0) {
      onImport(result.products);
      handleClose();
    }
  };

  const copyTemplate = async () => {
    await Clipboard.setStringAsync(CSV_TEMPLATE);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.sheetOverlay}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={handleClose} />
        <View style={styles.sheet}>
          <View style={styles.sheetHandle} />

          {/* ── Step: IDLE (main menu) ── */}
          {step === STEP.IDLE && (
            <>
              <View style={styles.sheetTitleRow}>
                <View style={styles.sheetTitleIcon}>
                  <Ionicons name="cloud-upload" size={22} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.sheetTitle}>Importar via CSV</Text>
                  <Text style={styles.sheetSubtitle}>Selecione um arquivo .csv do dispositivo</Text>
                </View>
              </View>

              <TouchableOpacity style={styles.importOptionBtn} onPress={pickAndParse}>
                <View style={[styles.importOptionIcon, { backgroundColor: colors.primarySurface }]}>
                  <Ionicons name="document-text" size={22} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.importOptionTitle}>Escolher arquivo CSV</Text>
                  <Text style={styles.importOptionDesc}>Abre o gerenciador de arquivos do dispositivo</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.importOptionBtn}
                onPress={() => setStep(STEP.TEMPLATE)}
              >
                <View style={[styles.importOptionIcon, { backgroundColor: colors.accentSurface }]}>
                  <Ionicons name="code-slash" size={22} color={colors.accent} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.importOptionTitle}>Ver modelo do CSV</Text>
                  <Text style={styles.importOptionDesc}>Estrutura de colunas e exemplo preenchido</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
              </TouchableOpacity>

              <View style={styles.csvFormatNote}>
                <Ionicons name="information-circle-outline" size={15} color={colors.textTertiary} />
                <Text style={styles.csvFormatNoteText}>
                  Separador: vírgula ou ponto e vírgula. Codificação: UTF-8.
                </Text>
              </View>

              <TouchableOpacity style={styles.btnSecondary} onPress={handleClose}>
                <Text style={styles.btnSecondaryText}>Fechar</Text>
              </TouchableOpacity>
            </>
          )}

          {/* ── Step: READING ── */}
          {step === STEP.READING && (
            <View style={styles.loadingWrap}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.loadingText}>Lendo e processando arquivo...</Text>
            </View>
          )}

          {/* ── Step: TEMPLATE ── */}
          {step === STEP.TEMPLATE && (
            <>
              <View style={styles.sheetTitleRow}>
                <TouchableOpacity onPress={() => setStep(STEP.IDLE)} style={styles.backIconBtn} hitSlop={8}>
                  <Ionicons name="arrow-back" size={20} color={colors.text} />
                </TouchableOpacity>
                <Text style={styles.sheetTitle}>Modelo do CSV</Text>
              </View>

              {/* Column reference */}
              <Text style={styles.sectionLabel}>Colunas disponíveis</Text>
              <View style={styles.columnsTable}>
                {CSV_COLUMNS.map(col => (
                  <View key={col.key} style={styles.colRow}>
                    <View style={styles.colKeyWrap}>
                      <Text style={styles.colKey}>{col.key}</Text>
                      {col.required && (
                        <View style={styles.requiredBadge}>
                          <Text style={styles.requiredText}>obrigatório</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.colDesc}>{col.description}</Text>
                  </View>
                ))}
              </View>

              {/* Template preview */}
              <Text style={styles.sectionLabel}>Exemplo de arquivo</Text>
              <ScrollView
                style={styles.templateBox}
                horizontal
                showsHorizontalScrollIndicator={false}
              >
                <Text style={styles.templateText}>{CSV_TEMPLATE}</Text>
              </ScrollView>

              <View style={styles.templateActions}>
                <TouchableOpacity
                  style={[styles.btnPrimary, copied && styles.btnSuccess]}
                  onPress={copyTemplate}
                >
                  <Ionicons
                    name={copied ? 'checkmark' : 'copy-outline'}
                    size={16}
                    color={colors.white}
                  />
                  <Text style={styles.btnPrimaryText}>
                    {copied ? 'Copiado!' : 'Copiar modelo'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.btnSecondary} onPress={() => setStep(STEP.IDLE)}>
                  <Text style={styles.btnSecondaryText}>Voltar</Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          {/* ── Step: PREVIEW ── */}
          {step === STEP.PREVIEW && result && (
            <>
              <View style={styles.sheetTitleRow}>
                <TouchableOpacity onPress={() => setStep(STEP.IDLE)} style={styles.backIconBtn} hitSlop={8}>
                  <Ionicons name="arrow-back" size={20} color={colors.text} />
                </TouchableOpacity>
                <Text style={styles.sheetTitle}>Pré-visualização</Text>
              </View>

              {/* Stats row */}
              <View style={styles.statsRow}>
                <View style={[styles.statCard, { backgroundColor: colors.successSurface }]}>
                  <Text style={[styles.statNumber, { color: colors.success }]}>
                    {result.products.length}
                  </Text>
                  <Text style={styles.statLabel}>válidos</Text>
                </View>
                <View style={[styles.statCard, { backgroundColor: colors.warningSurface }]}>
                  <Text style={[styles.statNumber, { color: colors.warning }]}>
                    {result.skipped}
                  </Text>
                  <Text style={styles.statLabel}>ignorados</Text>
                </View>
                <View style={[styles.statCard, { backgroundColor: colors.borderLight }]}>
                  <Text style={[styles.statNumber, { color: colors.textSecondary }]}>
                    {result.total}
                  </Text>
                  <Text style={styles.statLabel}>total linhas</Text>
                </View>
              </View>

              {/* Errors */}
              {result.errors.length > 0 && (
                <View style={styles.errorsBox}>
                  <View style={styles.errorsHeader}>
                    <Ionicons name="warning-outline" size={14} color={colors.warning} />
                    <Text style={styles.errorsTitle}>
                      {result.errors.length} aviso{result.errors.length > 1 ? 's' : ''}
                    </Text>
                  </View>
                  {result.errors.slice(0, 3).map((e, i) => (
                    <Text key={i} style={styles.errorItem}>• {e}</Text>
                  ))}
                  {result.errors.length > 3 && (
                    <Text style={styles.errorItem}>
                      + {result.errors.length - 3} mais...
                    </Text>
                  )}
                </View>
              )}

              {result.products.length === 0 ? (
                <View style={styles.noProductsWrap}>
                  <Ionicons name="close-circle-outline" size={36} color={colors.error} />
                  <Text style={styles.noProductsText}>
                    Nenhum produto válido encontrado.{'\n'}Verifique o formato do arquivo.
                  </Text>
                </View>
              ) : (
                <>
                  <Text style={styles.sectionLabel}>
                    Prévia — primeiros {Math.min(5, result.products.length)} de {result.products.length}
                  </Text>
                  <ScrollView style={styles.previewList} showsVerticalScrollIndicator={false}>
                    {result.products.slice(0, 5).map((p, i) => (
                      <View key={i} style={styles.previewRow}>
                        <View style={styles.previewRowNum}>
                          <Text style={styles.previewNum}>{i + 1}</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.previewName}>{p.name}</Text>
                          <Text style={styles.previewMeta}>
                            {[p.brand, p.category, p.unit].filter(Boolean).join(' · ')}
                          </Text>
                          {p.barcode ? (
                            <Text style={styles.previewBarcode}>
                              <Ionicons name="barcode-outline" size={11} /> {p.barcode}
                            </Text>
                          ) : null}
                        </View>
                      </View>
                    ))}
                    {result.products.length > 5 && (
                      <Text style={styles.previewMore}>
                        ... e mais {result.products.length - 5} produto{result.products.length - 5 > 1 ? 's' : ''}
                      </Text>
                    )}
                  </ScrollView>

                  <View style={styles.pmActions}>
                    <TouchableOpacity style={styles.btnSecondary} onPress={handleClose}>
                      <Text style={styles.btnSecondaryText}>Cancelar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.btnPrimary} onPress={handleConfirmImport}>
                      <Ionicons name="cloud-upload-outline" size={16} color={colors.white} />
                      <Text style={styles.btnPrimaryText}>
                        Importar {result.products.length}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}

              {result.products.length === 0 && (
                <TouchableOpacity style={styles.btnSecondary} onPress={() => setStep(STEP.IDLE)}>
                  <Text style={styles.btnSecondaryText}>Tentar novamente</Text>
                </TouchableOpacity>
              )}
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ─── Add/Edit Product Modal ───────────────────────────────────────────────────

function ProductFormModal({ visible, initial, onSave, onClose }) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [brand, setBrand] = useState('');
  const [unit, setUnit] = useState('un');
  const [barcode, setBarcode] = useState('');
  const [description, setDescription] = useState('');

  React.useEffect(() => {
    if (visible) {
      setName(initial?.name || '');
      setCategory(initial?.category || '');
      setBrand(initial?.brand || '');
      setUnit(initial?.unit || 'un');
      setBarcode(initial?.barcode || '');
      setDescription(initial?.description || '');
    }
  }, [visible, initial]);

  const handleSave = () => {
    if (!name.trim()) return;
    onSave({ name: name.trim(), category: category.trim(), brand: brand.trim(), unit, barcode: barcode.trim(), description: description.trim() });
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.sheetOverlay}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={[styles.sheet, { maxHeight: '92%' }]}>
          <View style={styles.sheetHandle} />
          <Text style={styles.sheetTitle}>{initial ? 'Editar Produto' : 'Novo Produto'}</Text>

          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            <Field label="Nome *" value={name} onChangeText={setName} placeholder="Ex: Leite Integral" autoFocus />
            <Field label="Categoria" value={category} onChangeText={setCategory} placeholder="Ex: Laticínios" />
            <Field label="Marca" value={brand} onChangeText={setBrand} placeholder="Ex: Ninho" />

            <Text style={styles.fieldLabel}>Unidade de Medida</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.unitScroll}
              contentContainerStyle={styles.unitScrollContent}
            >
              {UNITS.map(u => (
                <TouchableOpacity
                  key={u}
                  style={[styles.unitChip, unit === u && styles.unitChipActive]}
                  onPress={() => setUnit(u)}
                >
                  <Text style={[styles.unitChipText, unit === u && styles.unitChipTextActive]}>{u}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Field label="Código de Barras" value={barcode} onChangeText={setBarcode} placeholder="Ex: 7891000100103" keyboardType="numeric" />
            <Field label="Descrição" value={description} onChangeText={setDescription} placeholder="Detalhes adicionais" multiline />
          </ScrollView>

          <View style={styles.pmActions}>
            <TouchableOpacity style={styles.btnSecondary} onPress={onClose}>
              <Text style={styles.btnSecondaryText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.btnPrimary, !name.trim() && styles.btnDisabled]}
              onPress={handleSave}
              disabled={!name.trim()}
            >
              <Ionicons name={initial ? 'checkmark' : 'add'} size={16} color={colors.white} />
              <Text style={styles.btnPrimaryText}>{initial ? 'Salvar' : 'Adicionar'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function Field({ label, value, onChangeText, placeholder, keyboardType, autoFocus, multiline }) {
  return (
    <>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={[styles.fieldInput, multiline && styles.fieldInputMulti]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textTertiary}
        keyboardType={keyboardType || 'default'}
        autoFocus={autoFocus}
        multiline={multiline}
        maxLength={multiline ? 200 : 80}
        returnKeyType={multiline ? 'default' : 'next'}
      />
    </>
  );
}

// ─── Product Card ─────────────────────────────────────────────────────────────

function ProductCard({ product, onEdit, onDelete }) {
  const catColor = getCategoryColor(product.category);
  return (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => onEdit(product)}
      activeOpacity={0.8}
    >
      <View style={styles.productCardLeft}>
        <View style={[styles.productInitial, { backgroundColor: catColor + '20' }]}>
          <Ionicons name={getCategoryIcon(product.category)} size={22} color={catColor} />
        </View>
      </View>

      <View style={styles.productCardBody}>
        <Text style={styles.productName} numberOfLines={1}>{product.name}</Text>
        <View style={styles.productMetaRow}>
          {product.brand ? (
            <Text style={styles.productBrand} numberOfLines={1}>{product.brand}</Text>
          ) : null}
          {product.category ? (
            <View style={[styles.categoryBadge, { backgroundColor: catColor + '18' }]}>
              <Text style={[styles.categoryBadgeText, { color: catColor }]}>{product.category}</Text>
            </View>
          ) : null}
        </View>
        <View style={styles.productFooter}>
          <View style={styles.unitBadge}>
            <Ionicons name="scale-outline" size={10} color={colors.textTertiary} />
            <Text style={styles.unitBadgeText}>{product.unit}</Text>
          </View>
          {product.barcode ? (
            <View style={styles.barcodeBadge}>
              <Ionicons name="barcode-outline" size={10} color={colors.textTertiary} />
              <Text style={styles.barcodeBadgeText}>{product.barcode}</Text>
            </View>
          ) : null}
        </View>
        {product.description ? (
          <Text style={styles.productDesc} numberOfLines={1}>{product.description}</Text>
        ) : null}
      </View>

      <TouchableOpacity
        onPress={() =>
          Alert.alert('Excluir produto', `Excluir "${product.name}"?`, [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Excluir', style: 'destructive', onPress: () => onDelete(product.id) },
          ])
        }
        style={styles.deleteBtn}
        hitSlop={6}
      >
        <Ionicons name="trash-outline" size={17} color={colors.textTertiary} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function ProductsScreen() {
  const { products, importProducts, addProduct, updateProduct, deleteProduct, clearProducts } = useApp();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showImport, setShowImport] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const categories = useMemo(() => {
    const cats = [...new Set(products.map(p => p.category).filter(Boolean))].sort();
    return cats;
  }, [products]);

  const filtered = useMemo(() => {
    let list = products;
    if (selectedCategory) list = list.filter(p => p.category === selectedCategory);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        p =>
          p.name.toLowerCase().includes(q) ||
          p.brand?.toLowerCase().includes(q) ||
          p.category?.toLowerCase().includes(q) ||
          p.barcode?.includes(q)
      );
    }
    return [...list].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
  }, [products, search, selectedCategory]);

  const handleImport = useCallback((newProducts) => {
    const count = importProducts(newProducts);
    Alert.alert(
      'Importação concluída',
      `${count} produto${count > 1 ? 's' : ''} importado${count > 1 ? 's' : ''} com sucesso.`
    );
  }, [importProducts]);

  const handleEdit = useCallback((product) => {
    setEditingProduct(product);
    setShowForm(true);
  }, []);

  const handleFormSave = useCallback((data) => {
    if (editingProduct) {
      updateProduct({ ...editingProduct, ...data });
    } else {
      addProduct(data);
    }
    setEditingProduct(null);
  }, [editingProduct, addProduct, updateProduct]);

  const handleClearAll = () => {
    Alert.alert(
      'Limpar catálogo',
      `Isso removerá todos os ${products.length} produtos. Continuar?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Limpar tudo', style: 'destructive', onPress: clearProducts },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Catálogo de Produtos</Text>
          <Text style={styles.headerSubtitle}>
            {products.length === 0
              ? 'Nenhum produto cadastrado'
              : `${products.length} produto${products.length > 1 ? 's' : ''} · ${categories.length} categori${categories.length === 1 ? 'a' : 'as'}`}
          </Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.headerBtn}
            onPress={() => setShowImport(true)}
            hitSlop={4}
          >
            <Ionicons name="cloud-upload-outline" size={22} color={colors.white} />
          </TouchableOpacity>
          {products.length > 0 && (
            <TouchableOpacity style={styles.headerBtn} onPress={handleClearAll} hitSlop={4}>
              <Ionicons name="trash-outline" size={20} color="rgba(255,255,255,0.7)" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Search bar */}
      <View style={styles.searchWrap}>
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={17} color={colors.textTertiary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por nome, marca ou código..."
            placeholderTextColor={colors.textTertiary}
            value={search}
            onChangeText={setSearch}
            clearButtonMode="while-editing"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')} hitSlop={6}>
              <Ionicons name="close-circle" size={16} color={colors.textTertiary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Category filter cards — always visible */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryScroll}
        contentContainerStyle={styles.categoryScrollContent}
      >
          {/* Todos card */}
          <TouchableOpacity
            style={[
              styles.categoryCard,
              !selectedCategory && { backgroundColor: colors.primary, borderColor: colors.primary },
            ]}
            onPress={() => setSelectedCategory(null)}
          >
            <View style={[
              styles.categoryCardIconBox,
              !selectedCategory
                ? { backgroundColor: 'rgba(255,255,255,0.2)' }
                : { backgroundColor: colors.primarySurface },
            ]}>
              <Ionicons
                name="apps-outline"
                size={24}
                color={!selectedCategory ? colors.white : colors.primary}
              />
            </View>
            <Text
              style={[styles.categoryCardText, !selectedCategory && { color: colors.white }]}
              numberOfLines={2}
            >
              Todos
            </Text>
          </TouchableOpacity>

          {/* Category cards */}
          {categories.map(cat => {
            const active = selectedCategory === cat;
            const color = getCategoryColor(cat);
            return (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.categoryCard,
                  active
                    ? { backgroundColor: color, borderColor: color }
                    : { borderColor: color + '55' },
                ]}
                onPress={() => setSelectedCategory(active ? null : cat)}
              >
                <View style={[
                  styles.categoryCardIconBox,
                  active
                    ? { backgroundColor: 'rgba(255,255,255,0.2)' }
                    : { backgroundColor: color + '18' },
                ]}>
                  <Ionicons
                    name={getCategoryIcon(cat)}
                    size={24}
                    color={active ? colors.white : color}
                  />
                </View>
                <Text
                  style={[
                    styles.categoryCardText,
                    active ? { color: colors.white } : { color: colors.text },
                  ]}
                  numberOfLines={2}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
      </ScrollView>

      {/* Product list */}
      <FlatList
        style={{ flex: 1 }}
        data={filtered}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <ProductCard
            product={item}
            onEdit={handleEdit}
            onDelete={deleteProduct}
          />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <View style={styles.emptyIconWrap}>
              <Ionicons
                name={search || selectedCategory ? 'search-outline' : 'cube-outline'}
                size={52}
                color={colors.primaryLight}
              />
            </View>
            <Text style={styles.emptyTitle}>
              {search || selectedCategory ? 'Nenhum resultado' : 'Catálogo vazio'}
            </Text>
            <Text style={styles.emptySubtitle}>
              {search || selectedCategory
                ? 'Tente outros termos de busca ou remova os filtros'
                : 'Importe um CSV ou adicione produtos manualmente'}
            </Text>
            {!search && !selectedCategory && (
              <TouchableOpacity
                style={styles.emptyImportBtn}
                onPress={() => setShowImport(true)}
              >
                <Ionicons name="cloud-upload-outline" size={18} color={colors.primary} />
                <Text style={styles.emptyImportBtnText}>Importar CSV</Text>
              </TouchableOpacity>
            )}
          </View>
        }
        contentContainerStyle={filtered.length === 0 ? styles.listEmptyFlex : styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => { setEditingProduct(null); setShowForm(true); }}
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={30} color={colors.white} />
      </TouchableOpacity>

      {/* Modals */}
      <ImportModal
        visible={showImport}
        onClose={() => setShowImport(false)}
        onImport={handleImport}
      />
      <ProductFormModal
        visible={showForm}
        initial={editingProduct}
        onSave={handleFormSave}
        onClose={() => { setShowForm(false); setEditingProduct(null); }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },

  // Header
  header: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: { ...typography.h2, color: colors.white },
  headerSubtitle: { ...typography.bodySmall, color: 'rgba(255,255,255,0.75)', marginTop: 2 },
  headerActions: { flexDirection: 'row', gap: spacing.sm },
  headerBtn: {
    width: 40, height: 40, borderRadius: radius.full,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
  },

  // Search
  searchWrap: { padding: spacing.md, paddingBottom: spacing.sm },
  searchBox: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    backgroundColor: colors.surface, borderRadius: radius.lg,
    paddingHorizontal: spacing.md, paddingVertical: 10,
    borderWidth: 1.5, borderColor: colors.border, ...shadows.sm,
  },
  searchInput: { flex: 1, ...typography.body, color: colors.text, padding: 0 },

  // Category cards (vertical rectangle, fixed height, horizontal scroll)
  categoryScroll: {
    flexGrow: 0,
    flexShrink: 0,
    height: 116,
  },
  categoryScrollContent: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
    alignItems: 'center',
  },
  categoryCard: {
    width: 76,
    height: 96,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    ...shadows.sm,
  },
  categoryCardIconBox: {
    width: 44, height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryCardText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 13,
    paddingHorizontal: 4,
  },

  // Product list
  listContent: { padding: spacing.md, paddingBottom: 100 },
  listEmptyFlex: { flex: 1, padding: spacing.md },

  // Product card
  productCard: {
    backgroundColor: colors.surface, borderRadius: radius.lg,
    padding: spacing.md, marginBottom: spacing.sm,
    flexDirection: 'row', alignItems: 'flex-start',
    ...shadows.sm,
  },
  productCardLeft: { marginRight: spacing.md },
  productInitial: {
    width: 42, height: 42, borderRadius: radius.md,
    alignItems: 'center', justifyContent: 'center',
  },
  productInitialText: { fontSize: 18, fontWeight: '700' },
  productCardBody: { flex: 1, gap: 3 },
  productName: { ...typography.bodyMedium, color: colors.text },
  productMetaRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, flexWrap: 'wrap' },
  productBrand: { ...typography.bodySmall, color: colors.textSecondary },
  categoryBadge: {
    paddingHorizontal: 8, paddingVertical: 2, borderRadius: radius.full,
  },
  categoryBadgeText: { ...typography.caption, fontWeight: '700' },
  productFooter: { flexDirection: 'row', gap: spacing.sm, alignItems: 'center', flexWrap: 'wrap' },
  unitBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: colors.borderLight, paddingHorizontal: 7, paddingVertical: 2,
    borderRadius: radius.full,
  },
  unitBadgeText: { ...typography.caption, color: colors.textSecondary },
  barcodeBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: colors.borderLight, paddingHorizontal: 7, paddingVertical: 2,
    borderRadius: radius.full,
  },
  barcodeBadgeText: { ...typography.caption, color: colors.textTertiary, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' },
  productDesc: { ...typography.caption, color: colors.textTertiary, fontStyle: 'italic' },
  deleteBtn: { padding: spacing.xs, marginLeft: spacing.xs },

  // Empty state
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.xl, paddingBottom: 80 },
  emptyIconWrap: { width: 100, height: 100, borderRadius: radius.full, backgroundColor: colors.primarySurface, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.lg },
  emptyTitle: { ...typography.h3, color: colors.text, marginBottom: spacing.sm },
  emptySubtitle: { ...typography.body, color: colors.textSecondary, textAlign: 'center', lineHeight: 22, marginBottom: spacing.lg },
  emptyImportBtn: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    paddingHorizontal: spacing.lg, paddingVertical: 12,
    borderRadius: radius.full, borderWidth: 1.5, borderColor: colors.primary,
  },
  emptyImportBtnText: { ...typography.bodyMedium, color: colors.primary },

  // FAB
  fab: {
    position: 'absolute', bottom: spacing.xl, right: spacing.lg,
    width: 58, height: 58, borderRadius: radius.full,
    backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center',
    ...shadows.lg,
  },

  // Sheet (bottom modal)
  sheetOverlay: { flex: 1, backgroundColor: colors.overlay, justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl,
    paddingHorizontal: spacing.lg,
    paddingBottom: Platform.OS === 'ios' ? 34 : spacing.lg,
    paddingTop: spacing.md,
    maxHeight: '90%',
    ...shadows.lg,
  },
  sheetHandle: {
    width: 36, height: 4, borderRadius: radius.full,
    backgroundColor: colors.border, alignSelf: 'center', marginBottom: spacing.md,
  },
  sheetTitleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.lg },
  sheetTitleIcon: { width: 38, height: 38, borderRadius: radius.sm, backgroundColor: colors.primarySurface, alignItems: 'center', justifyContent: 'center' },
  sheetTitle: { ...typography.h3, color: colors.text },
  sheetSubtitle: { ...typography.bodySmall, color: colors.textSecondary, marginTop: 2 },
  backIconBtn: { padding: 4 },

  // Import options
  importOptionBtn: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    padding: spacing.md, borderRadius: radius.lg,
    borderWidth: 1.5, borderColor: colors.border, marginBottom: spacing.sm,
    backgroundColor: colors.surface,
  },
  importOptionIcon: {
    width: 44, height: 44, borderRadius: radius.md,
    alignItems: 'center', justifyContent: 'center',
  },
  importOptionTitle: { ...typography.bodyMedium, color: colors.text },
  importOptionDesc: { ...typography.bodySmall, color: colors.textSecondary, marginTop: 2 },
  csvFormatNote: {
    flexDirection: 'row', alignItems: 'flex-start', gap: spacing.xs,
    marginBottom: spacing.lg, marginTop: spacing.xs,
  },
  csvFormatNoteText: { ...typography.caption, color: colors.textTertiary, flex: 1 },

  // Loading
  loadingWrap: { alignItems: 'center', paddingVertical: spacing.xxl, gap: spacing.md },
  loadingText: { ...typography.body, color: colors.textSecondary },

  // Template
  sectionLabel: { ...typography.label, color: colors.textSecondary, marginBottom: spacing.sm },
  columnsTable: { borderRadius: radius.md, overflow: 'hidden', borderWidth: 1, borderColor: colors.border, marginBottom: spacing.md },
  colRow: {
    padding: spacing.sm, flexDirection: 'row', alignItems: 'center',
    borderBottomWidth: 1, borderBottomColor: colors.borderLight,
  },
  colKeyWrap: { width: 130, flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  colKey: { ...typography.bodySmall, fontWeight: '700', color: colors.text, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' },
  requiredBadge: { backgroundColor: colors.errorSurface, paddingHorizontal: 5, paddingVertical: 1, borderRadius: 4 },
  requiredText: { fontSize: 9, color: colors.error, fontWeight: '700' },
  colDesc: { ...typography.caption, color: colors.textSecondary, flex: 1 },
  templateBox: {
    backgroundColor: '#1E1E2E', borderRadius: radius.md, padding: spacing.md,
    marginBottom: spacing.md, maxHeight: 160,
  },
  templateText: { fontSize: 11, color: '#A6E3A1', fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace', lineHeight: 18 },
  templateActions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xs },

  // Preview
  statsRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  statCard: { flex: 1, borderRadius: radius.md, padding: spacing.sm, alignItems: 'center' },
  statNumber: { ...typography.h2, fontWeight: '800' },
  statLabel: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  errorsBox: {
    backgroundColor: colors.warningSurface, borderRadius: radius.md,
    padding: spacing.md, marginBottom: spacing.sm,
    borderLeftWidth: 3, borderLeftColor: colors.warning,
  },
  errorsHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginBottom: 6 },
  errorsTitle: { ...typography.bodySmall, fontWeight: '700', color: colors.warning },
  errorItem: { ...typography.caption, color: colors.text, lineHeight: 18 },
  previewList: { maxHeight: 200 },
  previewRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  previewRowNum: { width: 22, height: 22, borderRadius: radius.full, backgroundColor: colors.borderLight, alignItems: 'center', justifyContent: 'center' },
  previewNum: { ...typography.caption, fontWeight: '700', color: colors.textSecondary },
  previewName: { ...typography.bodyMedium, color: colors.text },
  previewMeta: { ...typography.caption, color: colors.textSecondary, marginTop: 1 },
  previewBarcode: { ...typography.caption, color: colors.textTertiary, marginTop: 1 },
  previewMore: { ...typography.bodySmall, color: colors.textTertiary, textAlign: 'center', paddingVertical: spacing.sm, fontStyle: 'italic' },
  noProductsWrap: { alignItems: 'center', paddingVertical: spacing.xl, gap: spacing.sm },
  noProductsText: { ...typography.body, color: colors.textSecondary, textAlign: 'center', lineHeight: 22 },

  // Form
  fieldLabel: { ...typography.label, color: colors.textSecondary, marginBottom: spacing.xs, marginTop: spacing.sm },
  fieldInput: {
    borderWidth: 1.5, borderColor: colors.border, borderRadius: radius.md,
    padding: spacing.md, fontSize: 16, color: colors.text, backgroundColor: colors.background,
    marginBottom: spacing.xs,
  },
  fieldInputMulti: { height: 80, textAlignVertical: 'top' },
  unitScroll: { flexGrow: 0, marginBottom: spacing.sm },
  unitScrollContent: { gap: spacing.xs, alignItems: 'center', paddingVertical: 4 },
  unitChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: radius.full, borderWidth: 1.5, borderColor: colors.border },
  unitChipActive: { borderColor: colors.primary, backgroundColor: colors.primarySurface },
  unitChipText: { ...typography.bodySmall, color: colors.textSecondary, fontWeight: '600' },
  unitChipTextActive: { color: colors.primary },

  // Shared buttons
  pmActions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.lg },
  btnSecondary: { flex: 1, paddingVertical: 13, borderRadius: radius.md, borderWidth: 1.5, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  btnSecondaryText: { ...typography.bodyMedium, color: colors.textSecondary },
  btnPrimary: { flex: 1, paddingVertical: 13, borderRadius: radius.md, backgroundColor: colors.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  btnPrimaryText: { ...typography.bodyMedium, color: colors.white },
  btnSuccess: { backgroundColor: colors.success },
  btnDisabled: { backgroundColor: colors.border },
});
