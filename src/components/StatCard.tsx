import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

import { palette } from '../theme/theme';

type Props = {
  label: string;
  value: string;
  accent?: string;
};

export function StatCard({
  label,
  value,
  accent = palette.primary,
}: Props) {
  return (
    <View style={[styles.card, { borderTopColor: accent }]}>
      <Text variant="labelLarge" style={styles.label}>
        {label}
      </Text>

      <Text
        variant="headlineSmall"
        style={styles.value}
        numberOfLines={1}
        adjustsFontSizeToFit
      >
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 145,
    padding: 16,
    borderRadius: 16,
    backgroundColor: palette.surface,
    borderTopWidth: 3,
    borderColor: palette.border,
    elevation: 1,
  },

  label: {
    color: palette.muted,
  },

  value: {
    marginTop: 9,
    fontWeight: '700',
    color: palette.navy,
  },
});