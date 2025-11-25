import { CSSProperties } from 'react';
import { commonStyles, colors, mergeStyles } from '../styles/common.styles';

export const styles: Record<string, CSSProperties> = {
  container: commonStyles.containerNarrow,
  inputGroup: commonStyles.inputGroup,
  label: commonStyles.label,
  input: commonStyles.input,
  classLabel: {
    display: 'block',
    marginBottom: '12px',
    fontWeight: 'bold',
  },
  classCard: {
    padding: '15px',
    marginBottom: '10px',
    borderRadius: '8px',
    cursor: 'pointer',
  },
  classCardSelected: {
    border: `2px solid ${colors.primary}`,
    background: colors.primaryDark,
  },
  classCardDefault: {
    border: `1px solid ${colors.border}`,
    background: colors.backgroundDark,
  },
  className: {
    fontWeight: 'bold',
    fontSize: '18px',
    marginBottom: '5px',
  },
  classStats: commonStyles.itemStats,
  error: commonStyles.errorMessage,
  button: mergeStyles(commonStyles.button, {
    fontSize: '18px',
  }),
  buttonActive: {
    ...commonStyles.buttonPrimary,
    cursor: 'pointer',
  },
  buttonDisabled: commonStyles.buttonDisabled,
};