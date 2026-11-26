import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import Svg, { Circle, Path } from "react-native-svg";

import { palette } from "../theme/theme";
import type { ClientSummary } from "../types/models";

const COLORS = ["#2367E8", "#068D6E", "#F1AA34", "#D43D54", "#8E44AD", "#16A2B8"];

const SIZE = 220;
const RADIUS = SIZE / 2;

type Props = {
  title: string;
  clients: ClientSummary[];
  onSlicePress: (client: ClientSummary) => void;
};

function getPoint(angle: number) {
  const radian = ((angle - 90) * Math.PI) / 180;

  return {
    x: RADIUS + RADIUS * Math.cos(radian),
    y: RADIUS + RADIUS * Math.sin(radian),
  };
}

function getSlicePath(startAngle: number, endAngle: number) {
  const start = getPoint(startAngle);
  const end = getPoint(endAngle);

  const largeArc = endAngle - startAngle > 180 ? 1 : 0;

  return `M ${RADIUS} ${RADIUS} L ${start.x} ${start.y} A ${RADIUS} ${RADIUS} 0 ${largeArc} 1 ${end.x} ${end.y} Z`;
}

export function PieChart({ title, clients, onSlicePress }: Props) {
  const total = clients.reduce((sum, client) => sum + client.totalSales, 0);

  let startAngle = 0;

  return (
    <View style={styles.card}>
      <Text variant="titleMedium" style={styles.title}>
        {title}
      </Text>

      {clients.length === 0 ? (
        <Text style={styles.empty}>Hələ satış edən müştəri yoxdur.</Text>
      ) : (
        <>
          <View style={styles.chart}>
            <Svg width={SIZE} height={SIZE}>
              {clients.length === 1 ? (
                <Circle
                  cx={RADIUS}
                  cy={RADIUS}
                  r={RADIUS}
                  fill={COLORS[0]}
                  onPress={() => onSlicePress(clients[0])}
                />
              ) : (
                clients.map((client, index) => {
                  const angle = (client.totalSales / total) * 360;
                  const endAngle = startAngle + angle;

                  const path = getSlicePath(startAngle, endAngle);

                  startAngle = endAngle;

                  return (
                    <Path
                      key={client.id}
                      d={path}
                      fill={COLORS[index % COLORS.length]}
                      stroke={palette.surface}
                      strokeWidth={2}
                      onPress={() => onSlicePress(client)}
                    />
                  );
                })
              )}
            </Svg>
          </View>

          {clients.map((client, index) => (
            <View key={client.id} style={styles.legendRow}>
              <View
                style={[
                  styles.dot,
                  { backgroundColor: COLORS[index % COLORS.length] },
                ]}
              />

              <Text style={styles.legendName} numberOfLines={1}>
                {client.name}
              </Text>

              <Text style={styles.percent}>
                {((client.totalSales / total) * 100).toFixed(1)}%
              </Text>
            </View>
          ))}

          <Text style={styles.hint}>Detallar üçün dilimə toxunun</Text>
        </>
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
    alignItems: "center",
    marginVertical: 20,
  },

  legendRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },

  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
  },

  legendName: {
    flex: 1,
    color: palette.navy,
  },

  percent: {
    color: palette.muted,
    fontWeight: "600",
  },

  hint: {
    color: palette.muted,
    fontSize: 12,
    textAlign: "center",
    marginTop: 8,
  },
});
