import { BarChart } from "@/components/BarChart";
import { getClientById } from "@/database/clientRepository";
import { getSalesByClientId } from "@/database/saleRepository";
import { palette } from "@/theme/theme";
import { Client, Sale } from "@/types/models";
import { money } from "@/utils/format";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useState } from "react";
import { Alert, ScrollView, StyleSheet, View } from "react-native";
import { ActivityIndicator, Button, Divider, Text } from "react-native-paper";

export default function ClientsDetailsPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const clientId = Number(id);

  const [client, setClient] = useState<Client | null>(null);

  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      setLoading(true);

      if (!Number.isInteger(clientId) || clientId <= 0) {
        setLoading(false);

        return () => {
          active = false;
        };
      }

      Promise.all([getClientById(clientId), getSalesByClientId(clientId)])
        .then(([clientData, salesData]) => {
          if (active) {
            setClient(clientData);
            setSales(salesData);
          }
        })
        .catch((error) => {
          console.error(error);
          if (active) {
            Alert.alert("Xeta", "Melumati yuklemek alinmadi");
          }
        })
        .finally(() => {
          if (active) {
            setLoading(false);
          }
        });

      return () => {
        active = false;
      };
    }, [clientId]),
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!client) {
    return (
      <View style={styles.center}>
        <Text>Mushteri Tapilmadi</Text>
      </View>
    );
  }

  const total = sales.reduce((sum, sale) => sum + sale.amount, 0);

  const points = [...sales]
    .reverse()
    .slice(-6)
    .map((sale) => ({
      label: sale.date.slice(5),
      value: sale.amount,
    }));

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <Text variant="headlineSmall" style={styles.name}>
          {client.name}
        </Text>

        <Text style={styles.detail}>Telefon: {client.phone}</Text>

        <Text style={styles.detail}>Email: {client.email}</Text>

        <Divider style={styles.divider} />

        <Text style={styles.total}>
          {sales.length} satish - {money(total)}
        </Text>
      </View>

      <BarChart title="Son 6 satishin meblegi" points={points} />

      <View style={styles.heading}>
        <Text variant="titleLarge" style={styles.name}>
          Satish Tarixchesi
        </Text>

        <Button
          mode="contained"
          icon="plus"
          onPress={() => {
            router.push({
              pathname: "/clients/[id]/add-sale",
              params: {
                id: String(client.id),
              },
            });
          }}
        >
          Satish Elave et
        </Button>
      </View>
      {sales.length === 0 ? (
        <Text style={styles.empty}>Bu müştəri üçün satış yoxdur.</Text>
      ) : (
        sales.map((sale) => (
          <View key={sale.id} style={styles.saleRow}>
            <Text style={styles.saleAmount}>{money(sale.amount)}</Text>

            <Text style={styles.date}>{sale.date}</Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: palette.background,
  },

  content: {
    padding: 16,
    paddingBottom: 38,
  },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: palette.background,
  },

  card: {
    backgroundColor: palette.surface,
    borderRadius: 18,
    padding: 20,
  },

  name: {
    fontWeight: "700",
    color: palette.navy,
  },

  detail: {
    marginTop: 10,
    color: palette.muted,
  },

  divider: {
    marginVertical: 16,
  },

  total: {
    color: palette.success,
    fontWeight: "700",
    fontSize: 16,
  },

  heading: {
    marginTop: 22,
    marginBottom: 12,
    gap: 10,
  },

  empty: {
    color: palette.muted,
    padding: 15,
  },

  saleRow: {
    backgroundColor: palette.surface,
    padding: 15,
    marginBottom: 9,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  saleAmount: {
    color: palette.navy,
    fontWeight: "700",
  },

  date: {
    color: palette.muted,
  },
});
