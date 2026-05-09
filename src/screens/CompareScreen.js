import React, { useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { colors, spacing, radius, shadows, typography } from '../theme';

const formatPrice = (v) => `R$ ${v.toFixed(2).replace('.', ',')}`;

function buildComparison(list, stores) {
  if (!list || stores.length === 0) return [];

  return stores
    .map((store) => {
      let total = 0;
      let pricedCount = 0;

      const items = list.items.map((item) => {
        const entry = item.prices.find((p) => p.storeId === store.id);
        if (entry) {
          total += entry.price * item.quantity;
          pricedCount++;
        }
        return { ...item, storePrice: entry ? entry.price : null };
      });

      return { store, total, pricedCount, totalItems: list.items.length, items };
    })
    .filter((s) => s.pricedCount > 0)
    .sort((a, b) => {
      if (b.pricedCount !== a.pricedCount) return b.pricedCount - a.pricedCount;
      return a.total - b.total;
    });
}

function StoreSummaryCard({ data, rank, isBest }) {
  const coverage = Math.round((data.pricedCount / data.totalItems) * 100);
  return (
    <View style={[styles.summaryCard, isBest && styles.summaryCardBest]}>
      {isBest && (
        <View style={styles.bestBadge}>
          <Ionicons name="trophy" size={11} color={colors.warning} />
          <Text style={styles.bestBadgeText}>MELHOR PREÇO</Text>
        </View>
      )}

      <View style={styles.summaryRankRow}>
        <View style={[styles.rankCircle, isBest && styles.rankCircleBest]}>
          <Text style={[styles.rankText, isBest && styles.rankTextBest]}>#{rank}</Text>
        </View>
        <View style={styles.summaryStoreInfo}>
          <View style={styles.summaryStoreIconWrap}>
            <Ionicons name="storefront" size={18} color={isBest ? colors.success : colors.accent} />
          </View>
          <Text style={[styles.summaryStoreName, isBest && styles.summaryStoreNameBest]} numberOfLines={1}>
            {data.store.name}
          </Text>
        </View>
      </View>

      <Text style={[styles.summaryTotal, isBest && styles.summaryTotalBest]}>
        {formatPrice(data.total)}
      </Text>

      <View style={styles.summaryCoverageRow}>
        <View style={styles.coverageBarBg}>
          <View style={[styles.coverageBarFill, { width: `${coverage}%`, backgroundColor: isBest ? colors.success : colors.primaryLight }]} />
        </View>
        <Text style={styles.coverageText}>
          {data.pricedCount}/{data.totalItems} itens
        </Text>
      </View>

      {data.pricedCount < data.totalItems && (
        <Text style={styles.partialNote}>
          * Total parcial — {data.totalItems - data.pricedCount} item{data.totalItems - data.pricedCount > 1 ? 's' : ''} sem preço
        </Text>
      )}
    </View>
  );
}

function ItemBreakdownRow({ item, storeResults }) {
  const prices = storeResults.map((s) => {
    const entry = s.items.find((i) => i.id === item.id);
    return entry?.storePrice ?? null;
  });

  const validPrices = prices.filter((p) => p !== null);
  const minPrice = validPrices.length > 0 ? Math.min(...validPrices) : null;

  return (
    <View style={styles.breakRow}>
      <View style={styles.breakItemInfo}>
        <Text style={styles.breakItemName} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.breakItemQty}>
          {item.quantity} {item.unit}
        </Text>
      </View>
      <View style={styles.breakPrices}>
        {storeResults.map((s) => {
          const entry = s.items.find((i) => i.id === item.id);
          const price = entry?.storePrice ?? null;
          const isBest = price !== null && price === minPrice && validPrices.length > 1;
          return (
            <View key={s.store.id} style={[styles.breakPriceCell, isBest && styles.breakPriceCellBest]}>
              <Text style={[styles.breakPrice, isBest && styles.breakPriceBest, price === null && styles.breakPriceNull]}>
                {price !== null ? formatPrice(price) : '—'}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

export default function CompareScreen({ navigation, route }) {
  const { listId } = route.params;
  const { lists, stores } = useApp();

  const list = lists.find((l) => l.id === listId);
  const storeResults = useMemo(() => buildComparison(list, stores), [list, stores]);

  if (!list) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Lista não encontrada</Text>
        </View>
      </SafeAreaView>
    );
  }

  const hasPrices = storeResults.length > 0;
  const cheapest = hasPrices ? storeResults[0] : null;
  const savings =
    storeResults.length > 1 ? storeResults[storeResults.length - 1].total - storeResults[0].total : null;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} hitSlop={8}>
          <Ionicons name="arrow-back" size={24} color={colors.white} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Comparação de Preços</Text>
          <Text style={styles.headerSubtitle}>{list.name}</Text>
        </View>
        <View style={styles.headerIconWrap}>
          <Ionicons name="bar-chart" size={22} color={colors.white} />
        </View>
      </View>

      {!hasPrices ? (
        <View style={styles.emptyWrap}>
          <View style={styles.emptyIcon}>
            <Ionicons name="pricetag-outline" size={56} color={colors.primaryLight} />
          </View>
          <Text style={styles.emptyTitle}>Sem preços registrados</Text>
          <Text style={styles.emptySubtitle}>
            Adicione preços aos itens da lista para ver a comparação entre lojas.
          </Text>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={16} color={colors.primary} />
            <Text style={styles.backButtonText}>Voltar para a lista</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Savings banner */}
          {savings !== null && savings > 0 && (
            <View style={styles.savingsBanner}>
              <Ionicons name="wallet-outline" size={20} color={colors.success} />
              <Text style={styles.savingsText}>
                Economize até{' '}
                <Text style={styles.savingsAmount}>{formatPrice(savings)}</Text>{' '}
                escolhendo a loja mais barata
              </Text>
            </View>
          )}

          {/* Section: Store cards */}
          <Text style={styles.sectionLabel}>Resumo por loja</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.summaryRow}
          >
            {storeResults.map((data, idx) => (
              <StoreSummaryCard
                key={data.store.id}
                data={data}
                rank={idx + 1}
                isBest={idx === 0}
              />
            ))}
          </ScrollView>

          {/* Section: Item breakdown */}
          <Text style={styles.sectionLabel}>Detalhamento por item</Text>

          {/* Table header */}
          <View style={styles.tableCard}>
            <View style={styles.breakRow}>
              <View style={styles.breakItemInfo}>
                <Text style={styles.tableHeaderCell}>Produto</Text>
              </View>
              <View style={styles.breakPrices}>
                {storeResults.map((s) => (
                  <View key={s.store.id} style={styles.breakPriceCell}>
                    <Text style={styles.tableHeaderStore} numberOfLines={1}>
                      {s.store.name}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            {list.items.map((item) => (
              <ItemBreakdownRow key={item.id} item={item} storeResults={storeResults} />
            ))}

            {/* Total row */}
            <View style={[styles.breakRow, styles.totalRow]}>
              <View style={styles.breakItemInfo}>
                <Text style={styles.totalLabel}>TOTAL</Text>
              </View>
              <View style={styles.breakPrices}>
                {storeResults.map((s, idx) => (
                  <View key={s.store.id} style={[styles.breakPriceCell, idx === 0 && styles.breakPriceCellBest]}>
                    <Text style={[styles.totalPrice, idx === 0 && styles.totalPriceBest]}>
                      {formatPrice(s.total)}
                    </Text>
                    {s.pricedCount < s.totalItems && (
                      <Text style={styles.totalNote}>*parcial</Text>
                    )}
                  </View>
                ))}
              </View>
            </View>
          </View>

          {/* Footer note */}
          {cheapest && cheapest.pricedCount < cheapest.totalItems && (
            <Text style={styles.footerNote}>
              * Totais baseados apenas nos itens com preço cadastrado. Itens sem preço não são contabilizados.
            </Text>
          )}
        </ScrollView>
      )}
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
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  headerCenter: {
    flex: 1,
  },
  headerTitle: {
    ...typography.h4,
    color: colors.white,
  },
  headerSubtitle: {
    ...typography.caption,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 1,
  },
  headerIconWrap: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  savingsBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.successSurface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: colors.success,
  },
  savingsText: {
    ...typography.body,
    color: colors.text,
    flex: 1,
  },
  savingsAmount: {
    fontWeight: '700',
    color: colors.success,
  },
  sectionLabel: {
    ...typography.label,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    marginTop: spacing.xs,
  },
  summaryRow: {
    gap: spacing.sm,
    paddingBottom: spacing.md,
    paddingRight: spacing.md,
  },
  summaryCard: {
    width: 180,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    ...shadows.md,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  summaryCardBest: {
    borderColor: colors.success,
    backgroundColor: colors.successSurface,
  },
  bestBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.warningSurface,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    alignSelf: 'flex-start',
    marginBottom: spacing.sm,
  },
  bestBadgeText: {
    ...typography.label,
    color: colors.warning,
    fontSize: 10,
  },
  summaryRankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  rankCircle: {
    width: 26,
    height: 26,
    borderRadius: radius.full,
    backgroundColor: colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankCircleBest: {
    backgroundColor: colors.success,
  },
  rankText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  rankTextBest: {
    color: colors.white,
  },
  summaryStoreInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  summaryStoreIconWrap: {
    width: 28,
    height: 28,
    borderRadius: radius.sm,
    backgroundColor: colors.accentSurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryStoreName: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  summaryStoreNameBest: {
    color: colors.primaryDark,
  },
  summaryTotal: {
    ...typography.h3,
    color: colors.text,
    marginVertical: spacing.sm,
  },
  summaryTotalBest: {
    color: colors.success,
  },
  summaryCoverageRow: {
    gap: 4,
  },
  coverageBarBg: {
    height: 4,
    backgroundColor: colors.border,
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  coverageBarFill: {
    height: '100%',
    borderRadius: radius.full,
  },
  coverageText: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  partialNote: {
    ...typography.caption,
    color: colors.warning,
    marginTop: 4,
    fontStyle: 'italic',
  },

  // Breakdown table
  tableCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    overflow: 'hidden',
    ...shadows.sm,
    marginBottom: spacing.sm,
  },
  breakRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  breakItemInfo: {
    flex: 1.5,
    padding: spacing.sm,
    justifyContent: 'center',
  },
  breakItemName: {
    ...typography.bodySmall,
    fontWeight: '500',
    color: colors.text,
  },
  breakItemQty: {
    ...typography.caption,
    color: colors.textTertiary,
    marginTop: 1,
  },
  breakPrices: {
    flex: 2,
    flexDirection: 'row',
  },
  breakPriceCell: {
    flex: 1,
    padding: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    borderLeftWidth: 1,
    borderLeftColor: colors.borderLight,
  },
  breakPriceCellBest: {
    backgroundColor: 'rgba(34,197,94,0.08)',
  },
  breakPrice: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
  breakPriceBest: {
    color: colors.success,
    fontWeight: '700',
  },
  breakPriceNull: {
    color: colors.textTertiary,
    fontWeight: '400',
  },
  tableHeaderCell: {
    ...typography.label,
    color: colors.textSecondary,
    fontSize: 10,
  },
  tableHeaderStore: {
    ...typography.label,
    color: colors.textSecondary,
    fontSize: 9,
    textAlign: 'center',
  },
  totalRow: {
    backgroundColor: colors.borderLight,
    borderBottomWidth: 0,
  },
  totalLabel: {
    ...typography.label,
    color: colors.text,
    fontSize: 11,
  },
  totalPrice: {
    ...typography.bodySmall,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
  },
  totalPriceBest: {
    color: colors.success,
  },
  totalNote: {
    ...typography.caption,
    color: colors.textTertiary,
    fontSize: 9,
  },
  footerNote: {
    ...typography.caption,
    color: colors.textTertiary,
    textAlign: 'center',
    lineHeight: 16,
    marginTop: spacing.sm,
    fontStyle: 'italic',
  },

  // Empty
  emptyWrap: {
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
    marginBottom: spacing.lg,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  backButtonText: {
    ...typography.bodyMedium,
    color: colors.primary,
  },
});
