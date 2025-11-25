import { CSSProperties } from 'react';
import { commonStyles, colors, mergeStyles } from '../styles/common.styles';

export const styles: Record<string, CSSProperties> = {
  container: commonStyles.container,
  header: {
    fontSize: '18px',
    color: colors.textGray,
    marginBottom: '20px',
  },
  statsBlock: commonStyles.card,
  statsGrid: commonStyles.gridTwoColumns,
  hpBarContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '8px',
  },
  hpBarOuter: {
    background: colors.backgroundLight,
    height: '20px',
    borderRadius: '10px',
    overflow: 'hidden',
  },
  hpBarInner: (hpPercent: number): CSSProperties => ({
    background: hpPercent > 50 ? colors.success : hpPercent > 25 ? colors.warning : '#f44336',
    height: '100%',
    width: `${hpPercent}%`,
    transition: 'width 0.3s',
  }),
  resourcesGrid: {
    ...commonStyles.gridTwoColumns,
    marginBottom: '20px',
  },
  resourceCard: commonStyles.card,
  resourceValue: {
    fontSize: '24px',
    fontWeight: 'bold',
    marginTop: '5px',
  },
  inventoryEmpty: {
    color: colors.textMuted,
  },
  inventoryGrid: commonStyles.gridItems,
  inventoryItem: mergeStyles(commonStyles.inventoryItem, {
    padding: '10px',
    borderRadius: '4px',
  }),
  inventoryItemEquipped: mergeStyles(commonStyles.inventoryItemEquipped, {
    padding: '10px',
    borderRadius: '4px',
  }),
  itemName: commonStyles.itemName,
  itemStats: {
    fontSize: '12px',
    color: colors.textGray,
  },
  navigationGrid: commonStyles.gridTwoColumns,
  linkButton: {
    textDecoration: 'none',
  },
  buttonDungeon: mergeStyles(commonStyles.button, commonStyles.buttonPrimary),
  buttonBlacksmith: mergeStyles(commonStyles.button, commonStyles.buttonSecondary),
  loadingContainer: commonStyles.loadingContainer,
  errorContainer: commonStyles.errorContainer,
};