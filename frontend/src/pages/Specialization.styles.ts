import type { CSSProperties } from 'react';
import { commonStyles, colors, mergeStyles } from '../styles/common.styles';

export const styles: Record<string, CSSProperties> = {
  container: commonStyles.container,
  header: {
    fontSize: '24px',
    fontWeight: 'bold',
    marginBottom: '20px',
    textAlign: 'center',
  },
  infoBlock: commonStyles.card,
  branchGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '15px',
    marginTop: '20px',
  },
  branchCard: {
    ...commonStyles.card,
    cursor: 'pointer',
    transition: 'all 0.3s',
    border: `2px solid ${colors.backgroundLight}`,
  },
  branchCardSelected: {
    ...commonStyles.card,
    cursor: 'pointer',
    border: `2px solid ${colors.primary}`,
    boxShadow: `0 0 10px ${colors.primary}`,
  },
  branchCardDisabled: {
    ...commonStyles.card,
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  branchName: {
    fontSize: '18px',
    fontWeight: 'bold',
    marginBottom: '10px',
  },
  tierList: {
    marginTop: '15px',
  },
  tierItem: {
    marginBottom: '10px',
    padding: '10px',
    background: colors.backgroundLight,
    borderRadius: '4px',
  },
  tierItemUnlocked: {
    marginBottom: '10px',
    padding: '10px',
    background: colors.backgroundLight,
    borderRadius: '4px',
    border: `1px solid ${colors.success}`,
  },
  tierItemLocked: {
    marginBottom: '10px',
    padding: '10px',
    background: colors.backgroundLight,
    borderRadius: '4px',
    opacity: 0.6,
  },
  tierName: {
    fontSize: '14px',
    fontWeight: 'bold',
    marginBottom: '5px',
  },
  tierDescription: {
    fontSize: '12px',
    color: colors.textGray,
  },
  buttonPrimary: mergeStyles(commonStyles.button, commonStyles.buttonPrimary),
  buttonSecondary: mergeStyles(commonStyles.button, commonStyles.buttonSecondary),
  buttonDanger: mergeStyles(commonStyles.button, {
    background: '#f44336',
    color: colors.text,
  }),
  buttonDisabled: mergeStyles(commonStyles.button, {
    background: colors.backgroundLight,
    color: colors.textMuted,
    cursor: 'not-allowed',
  }),
  buttonRow: {
    display: 'flex',
    gap: '10px',
    marginTop: '20px',
  },
  loadingContainer: commonStyles.loadingContainer,
  errorContainer: commonStyles.errorContainer,
  messageSuccess: {
    padding: '10px',
    background: colors.success,
    borderRadius: '4px',
    marginBottom: '15px',
    textAlign: 'center',
  },
  messageError: {
    padding: '10px',
    background: '#f44336',
    borderRadius: '4px',
    marginBottom: '15px',
    textAlign: 'center',
  },
};
