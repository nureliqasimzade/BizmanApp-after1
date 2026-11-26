import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";

import type { ChartPoint } from "../types/models";
import { palette } from "../theme/theme";

type Props = {
  title: string;
  points: ChartPoint[];
};

export function BarChart({ title, points }: Props) {
  const max = Math.max(1, ...points.map((p) => p.value));

  return (
    <View style={styles.card}>
      <Text variant="titleMedium" style={styles.title}>
        {title}
      </Text>

      {points.length === 0 ? (
        <Text style={styles.empty}>
          Hələ qrafik üçün satış məlumatı yoxdur.
        </Text>
      ) : (
        <View style={styles.chart}>
          {points.map((p, index) => {
            const percent = Math.max(3, (p.value / max) * 100);

            return (
              <View style={styles.column} key={`${p.label}-${index}`}>
                <Text style={styles.amount} numberOfLines={1}>
                  {p.value.toLocaleString("en-US", {
                    maximumFractionDigits: 0,
                  })}
                </Text>

                <View style={styles.barSpace}>
                  <View
                    style={[
                      styles.bar,
                      {
                        height: `${percent}%` as `${number}%`,
                      },
                    ]}
                  />
                </View>

                <Text style={styles.caption} numberOfLines={1}>
                  {p.label}
                </Text>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    backgroundColor: palette.surface,
    borderRadius: 18,
    marginTop: 18,
  },

  title: {
    fontWeight: "700",
    color: palette.navy,
  },

  empty: {
    color: palette.muted,
    paddingVertical: 25,
    textAlign: "center",
  },

  chart: {
    flexDirection: "row",
    alignItems: "flex-end",
    height: 190,
    marginTop: 20,
    gap: 7,
  },

  column: {
    flex: 1,
    alignItems: "center",
    height: "100%",
  },

  amount: {
    color: palette.muted,
    fontSize: 10,
    marginBottom: 7,
  },

  barSpace: {
    width: "74%",
    flex: 1,
    justifyContent: "flex-end",
  },

  bar: {
    backgroundColor: palette.primary,
    width: "100%",
    minHeight: 3,
    borderTopLeftRadius: 7,
    borderTopRightRadius: 7,
  },

  caption: {
    color: palette.muted,
    fontSize: 11,
    marginTop: 7,
  },
});
