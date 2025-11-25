import { CSSProperties } from 'react';
import { commonStyles, colors, mergeStyles } from '../styles/common.styles';

export const styles: Record<string, CSSProperties> = {
  container: commonStyles.container,
  statsBlock: commonStyles.card,
  inventoryGrid: commonStyles.gridItems,
  inventoryEmpty: commonStyles.inventoryEmpty,
  inventoryItem: commonStyles.inventoryItem,
  inventoryItemEquipped: commonStyles.inventoryItemEquipped,
  inventoryItemHover: {
    background: colors.backgroundLight,
  },
  itemHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
  },
  itemName: {
    ...commonStyles.itemName,
    fontSize: '16px',
  },
  itemBadge: {
    background: colors.primary,
    color: colors.text,
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: 'bold',
  },
  itemStats: commonStyles.itemStats,
  itemButton: {
    width: '100%',
    padding: '8px',
    marginTop: '8px',
    fontSize: '14px',
    fontWeight: 'bold',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  equipButton: {
    background: colors.primary,
    color: colors.text,
  },
  unequipButton: {
    background: colors.backgroundGray,
    color: colors.text,
  },
  backButton: mergeStyles(commonStyles.button, commonStyles.buttonSecondary, {
    textDecoration: 'none',
    display: 'block',
    textAlign: 'center',
  }),
};