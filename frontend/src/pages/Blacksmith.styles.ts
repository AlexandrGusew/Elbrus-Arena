import { CSSProperties } from 'react';
import { commonStyles, colors } from '../styles/common.styles';

export const styles: Record<string, CSSProperties> = {
  container: {
    ...commonStyles.container,
    maxWidth: '1200px',
    margin: '0 auto',
  },

  blacksmithHeader: {
    ...commonStyles.card,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },

  blacksmithTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
  },

  blacksmithSubtitle: {
    fontSize: '14px',
    color: colors.textSecondary,
    marginTop: '5px',
  },

  goldDisplay: {
    fontSize: '20px',
    fontWeight: 'bold',
  },

  goldAmount: {
    color: colors.primary,
  },

  emptyMessage: {
    ...commonStyles.card,
    padding: '60px 20px',
    textAlign: 'center',
    color: colors.textSecondary,
  },

  itemsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '20px',
    marginBottom: '20px',
  },

  blacksmithItem: {
    ...commonStyles.card,
    cursor: 'pointer',
    transition: 'all 0.3s',
    border: `2px solid transparent`,
  },

  blacksmithItemSelected: {
    border: `2px solid ${colors.primary}`,
    transform: 'scale(1.02)',
  },

  itemHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px',
  },

  itemIcon: {
    fontSize: '28px',
  },

  itemBadge: {
    background: colors.primary,
    color: colors.text,
    padding: '4px 10px',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: 'bold',
  },

  itemName: {
    ...commonStyles.itemName,
    fontSize: '18px',
    marginBottom: '8px',
  },

  enhancement: {
    color: colors.primary,
    fontWeight: 'bold',
  },

  equippedBadge: {
    display: 'inline-block',
    background: colors.backgroundLight,
    color: colors.primary,
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: 'bold',
    marginBottom: '8px',
  },

  itemStats: {
    ...commonStyles.itemStats,
    fontSize: '14px',
    marginBottom: '12px',
  },

  enhancementInfo: {
    background: colors.backgroundDark,
    padding: '12px',
    borderRadius: '6px',
    marginBottom: '12px',
  },

  currentEnhancement: {
    fontSize: '14px',
    fontWeight: 'bold',
    marginBottom: '4px',
  },

  nextEnhancement: {
    fontSize: '12px',
    color: colors.primary,
  },

  costInfo: {
    textAlign: 'center',
    marginBottom: '12px',
    fontSize: '14px',
  },

  costAmount: {
    fontSize: '18px',
    fontWeight: 'bold',
    marginTop: '4px',
  },

  costCanAfford: {
    color: colors.primary,
  },

  costCannotAfford: {
    color: '#ff6b6b',
  },

  enhanceButton: {
    width: '100%',
    padding: '12px',
    fontSize: '16px',
    fontWeight: 'bold',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },

  enhanceButtonEnabled: {
    background: colors.primary,
    color: colors.text,
  },

  enhanceButtonDisabled: {
    background: colors.backgroundGray,
    color: colors.textSecondary,
    cursor: 'not-allowed',
  },

  backLink: {
    textDecoration: 'none',
    display: 'block',
  },

  backButton: {
    ...commonStyles.button,
    ...commonStyles.buttonSecondary,
    width: '100%',
  },
};