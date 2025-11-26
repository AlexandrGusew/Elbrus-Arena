import type {CSSProperties} from 'react';
import { commonStyles, colors, mergeStyles } from '../styles/common.styles';

export const styles: Record<string, CSSProperties | ((arg: number) => CSSProperties)> = {
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
  staminaBarInner: (staminaPercent: number): CSSProperties => ({
    background: staminaPercent > 50 ? '#3498db' : staminaPercent > 25 ? '#e67e22' : '#e74c3c',
    height: '100%',
    width: `${staminaPercent}%`,
    transition: 'width 0.3s',
  }),
  expBarInner: (expPercent: number): CSSProperties => ({
    background: 'linear-gradient(90deg, #e0e0e0 0%, #ffffff 100%)',
    height: '100%',
    width: `${expPercent}%`,
    transition: 'width 0.3s',
    boxShadow: '0 0 10px rgba(255, 255, 255, 0.5)',
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
  navigationGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '15px',
  },
  linkButton: {
    textDecoration: 'none',
  },
  buttonDungeon: mergeStyles(commonStyles.button, commonStyles.buttonPrimary),
  buttonInventory: mergeStyles(commonStyles.button, {
    background: '#9c27b0',
    color: colors.text,
  }),
  buttonBlacksmith: mergeStyles(commonStyles.button, commonStyles.buttonSecondary),
  loadingContainer: commonStyles.loadingContainer,
  errorContainer: commonStyles.errorContainer,
};