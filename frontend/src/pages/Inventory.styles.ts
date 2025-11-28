import { CSSProperties } from 'react';
import { commonStyles, colors } from '../styles/common.styles';

export const styles: Record<string, CSSProperties> = {
  container: {
    ...commonStyles.container,
    maxWidth: '1200px',
    margin: '0 auto',
  },

  mainLayout: {
    display: 'grid',
    gridTemplateColumns: '400px 1fr',
    gap: '20px',
    marginTop: '20px',
  },

  equipmentSection: {
    ...commonStyles.card,
  },

  characterInfo: {
    marginBottom: '20px',
    padding: '15px',
    background: colors.backgroundDark,
    borderRadius: '8px',
  },

  characterName: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: '5px',
  },

  characterClass: {
    fontSize: '14px',
    color: colors.textSecondary,
  },

  equipmentSlots: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },

  equipmentSlot: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px',
    background: colors.backgroundDark,
    borderRadius: '8px',
    gap: '12px',
  },

  slotIcon: {
    fontSize: '32px',
    width: '40px',
    textAlign: 'center',
  },

  slotContent: {
    flex: 1,
  },

  slotName: {
    fontSize: '12px',
    color: colors.textSecondary,
    marginBottom: '4px',
  },

  slotItem: {
    cursor: 'pointer',
    padding: '8px',
    background: colors.backgroundLight,
    borderRadius: '4px',
    transition: 'all 0.2s',
  },

  slotItemName: {
    fontSize: '14px',
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: '4px',
  },

  slotItemStats: {
    fontSize: '12px',
    color: colors.textSecondary,
  },

  slotEmpty: {
    fontSize: '14px',
    color: colors.textSecondary,
    fontStyle: 'italic',
  },

  inventorySection: {
    ...commonStyles.card,
  },

  inventoryEmpty: {
    ...commonStyles.inventoryEmpty,
    padding: '60px 20px',
    textAlign: 'center',
  },

  inventoryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '15px',
  },

  inventoryItem: {
    ...commonStyles.inventoryItem,
    cursor: 'pointer',
    transition: 'all 0.2s',
  },

  itemHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px',
  },

  itemIcon: {
    fontSize: '24px',
  },

  itemBadge: {
    background: colors.primary,
    color: colors.text,
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: 'bold',
  },

  itemName: {
    ...commonStyles.itemName,
    fontSize: '16px',
    marginBottom: '8px',
  },

  enhancement: {
    color: colors.primary,
    fontWeight: 'bold',
  },

  itemStats: {
    ...commonStyles.itemStats,
    fontSize: '12px',
    marginBottom: '10px',
  },

  equipButton: {
    width: '100%',
    padding: '8px',
    fontSize: '14px',
    fontWeight: 'bold',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    background: colors.primary,
    color: colors.text,
    transition: 'all 0.2s',
  },

  buttonContainer: {
    display: 'flex',
    gap: '8px',
    marginTop: '10px',
  },

  sellButton: {
    flex: 1,
    padding: '8px',
    fontSize: '14px',
    fontWeight: 'bold',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    background: '#f44336',
    color: colors.text,
    transition: 'all 0.2s',
  },

  sellPrice: {
    fontSize: '12px',
    color: '#ffd700',
    marginTop: '8px',
    textAlign: 'center',
  },

  backLink: {
    textDecoration: 'none',
    display: 'block',
    marginTop: '20px',
  },

  backButton: {
    ...commonStyles.button,
    ...commonStyles.buttonSecondary,
    width: '100%',
  },
};