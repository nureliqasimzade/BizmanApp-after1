import { BarChart } from "@/components/BarChart";
import { PieChart } from "@/components/PieChart";
import { StatCard } from "@/components/StatCard";
import { useAuth } from "@/context/AuthContext";
import { getClients } from "@/database/clientRepository";
import { getDashboardStats, getSalesByClientId } from "@/database/saleRepository";
import { palette } from "@/theme/theme";
import { ClientSummary, DashboardStats, Sale } from "@/types/models";
import { money } from "@/utils/format";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Alert, ScrollView, StyleSheet, View } from "react-native";
import {
  ActivityIndicator,
  Button,
  Divider,
  Modal,
  Portal,
  Text,
} from "react-native-paper";

export default function DashboardPage() {
  const { signOut } = useAuth();

  const [stats, setStats] = useState<DashboardStats | null>(null);

  const [clients, setClients] = useState<ClientSummary[]>([]);

  const [loading, setLoading] = useState(true);

  const [selectedClient, setSelectedClient] = useState<ClientSummary | null>(
    null,
  );

  const [sales, setSales] = useState<Sale[]>([]);

  const [salesLoading, setSalesLoading] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      setLoading(true);

      Promise.all([getDashboardStats(), getClients()])
        .then(([statsData, clientsData]) => {
          if (active) {
            setStats(statsData);
            setClients(clientsData.filter((client) => client.totalSales > 0));
          }
        })
        .catch((error) => {
          console.error(error);

          if (active) {
            Alert.alert("Xeta", "Statistikani yuklemek olmadi");
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
    }, []),
  );

  const openClient = async (client: ClientSummary) => {
    setSelectedClient(client);
    setSales([]);
    setSalesLoading(true);

    try {
      const data = await getSalesByClientId(client.id);
      setSales(data);
    } catch (error) {
      console.error(error);
      Alert.alert("Xeta", "Satishlari yuklemek olmadi");
    } finally {
      setSalesLoading(false);
    }
  };

  const closeModal = () => {
    setSelectedClient(null);
    setSales([]);
  };

  const logout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error(error);
      Alert.alert("Xeta", "Chixish zamani xeta yarandi");
    }
  };

  return (
    <>
      <ScrollView style={styles.page} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View style={styles.heading}>
            <Text variant="headlineMedium" style={styles.title}>
              Bizman CRM
            </Text>

            <Text style={styles.subtitle}>Biznesiniz bir baxishda</Text>
          </View>

          <Button icon="logout" mode="text" compact onPress={logout}>
            Chixish
          </Button>
        </View>

        {loading ? (
          <ActivityIndicator size="large" style={styles.spinner} />
        ) : (
          <>
            <View style={styles.grid}>
              <StatCard
                label="Mushteriler"
                value={String(stats?.clientCount ?? 0)}
              />

              <StatCard
                label="Satishlar"
                value={String(stats?.saleCount ?? 0)}
                accent={palette.success}
              />

              <StatCard
                label="Gelir"
                value={String(stats?.revenue ?? 0)}
                accent="#F1AA34"
              />
            </View>

            <PieChart
              title="Mushterilere gore satishlar"
              clients={clients}
              onSlicePress={openClient}
            />

            <BarChart
              title="Son 6 satish ayi"
              points={stats?.monthlySales ?? []}
            />

            <Button
              icon="account-plus"
              mode="contained"
              style={styles.action}
              onPress={() => router.push("/clients")}
            >
              Mushterilere kech
            </Button>
          </>
        )}
      </ScrollView>

      <Portal>
        <Modal
          visible={selectedClient !== null}
          onDismiss={closeModal}
          contentContainerStyle={styles.modal}
        >
          {selectedClient && (
            <>
              <Text variant="headlineSmall" style={styles.name}>
                {selectedClient.name}
              </Text>

              <Text style={styles.detail}>Telefon: {selectedClient.phone}</Text>

              <Text style={styles.detail}>Email: {selectedClient.email}</Text>

              <Divider style={styles.divider} />

              <Text style={styles.total}>
                {selectedClient.salesCount} satish -{" "}
                {money(selectedClient.totalSales)}
              </Text>

              <Text variant="titleMedium" style={styles.salesTitle}>
                Satishlar
              </Text>

              {salesLoading ? (
                <ActivityIndicator style={styles.salesSpinner} />
              ) : (
                <ScrollView style={styles.salesList}>
                  {sales.map((sale) => (
                    <View key={sale.id} style={styles.saleRow}>
                      <Text style={styles.saleAmount}>
                        {money(sale.amount)}
                      </Text>

                      <Text style={styles.date}>{sale.date}</Text>
                    </View>
                  ))}
                </ScrollView>
              )}

              <Button mode="contained" style={styles.close} onPress={closeModal}>
                Bagla
              </Button>
            </>
          )}
        </Modal>
      </Portal>
    </>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: palette.background,
  },

  content: {
    padding: 18,
    paddingTop: 48,
    paddingBottom: 40,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 23,
  },

  heading: {
    flex: 1,
  },

  title: {
    color: palette.navy,
    fontWeight: "800",
  },

  subtitle: {
    color: palette.muted,
    marginTop: 3,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },

  spinner: {
    marginTop: 60,
  },

  action: {
    marginTop: 20,
    borderRadius: 12,
  },

  modal: {
    backgroundColor: palette.surface,
    margin: 20,
    padding: 20,
    borderRadius: 18,
  },

  name: {
    fontWeight: "700",
    color: palette.navy,
  },

  detail: {
    marginTop: 8,
    color: palette.muted,
  },

  divider: {
    marginVertical: 14,
  },

  total: {
    color: palette.success,
    fontWeight: "700",
    fontSize: 16,
  },

  salesTitle: {
    color: palette.navy,
    fontWeight: "700",
    marginTop: 16,
    marginBottom: 10,
  },

  salesSpinner: {
    marginVertical: 20,
  },

  salesList: {
    maxHeight: 250,
  },

  saleRow: {
    backgroundColor: palette.background,
    padding: 14,
    marginBottom: 8,
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

  close: {
    marginTop: 14,
    borderRadius: 12,
  },
});
