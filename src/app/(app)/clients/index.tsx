import { useCallback, useMemo, useState } from "react";

import { Alert, FlatList, StyleSheet, View } from "react-native";

import { router, useFocusEffect } from "expo-router";

import {
    Button,
    IconButton,
    Searchbar,
    Text,
    TextInput,
} from "react-native-paper";

import {
    createClient,
    deleteClient,
    getClients,
    updateClient,
} from "../../../database/clientRepository";

import { palette } from "../../../theme/theme";

import type { ClientSummary } from "../../../types/models";

import { money } from "../../../utils/format";

const PAGE_SIZE = 3;

export default function ClientsPage() {
  const [clients, setClients] = useState<ClientSummary[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const [editingId, setEditingId] = useState<number | null>(null);

  const [saving, setSaving] = useState(false);

  const refresh = useCallback(async () => {
    const result = await getClients(search);
    setClients(result);
  }, [search]);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      getClients(search)
        .then((data) => {
          if (active) {
            setClients(data);
          }
        })
        .catch((error) => {
          console.error(error);

          if (active) {
            Alert.alert("Xəta", "Müştərilər yüklənmədi.");
          }
        });

      return () => {
        active = false;
      };
    }, [search]),
  );

  const clearForm = () => {
    setName("");
    setPhone("");
    setEmail("");
    setEditingId(null);
  };

  const saveClient = async () => {
    if (!name.trim() || !phone.trim() || !email.trim()) {
      Alert.alert(
        "Məlumat çatışmır",
        "Ad, telefon və email daxil edilməlidir.",
      );
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      Alert.alert("Email xətası", "Düzgün email formatı daxil edin.");
      return;
    }

    if (saving) return;

    setSaving(true);

    try {
      const data = {
        name,
        phone,
        email,
      };

      if (editingId !== null) {
        await updateClient(editingId, data);
      } else {
        await createClient(data);
      }

      clearForm();
      setPage(0);
      await refresh();
    } catch (error) {
      console.error(error);

      Alert.alert("Xəta", "Müştərini yadda saxlamaq mümkün olmadı.");
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (client: ClientSummary) => {
    setEditingId(client.id);
    setName(client.name);
    setPhone(client.phone);
    setEmail(client.email);
  };

  const confirmDelete = (client: ClientSummary) => {
    Alert.alert(
      "Müştərini sil?",
      `${client.name} və bütün satışları silinəcək.`,
      [
        {
          text: "Ləğv et",
          style: "cancel",
        },
        {
          text: "Sil",
          style: "destructive",
          onPress: () => {
            void (async () => {
              try {
                await deleteClient(client.id);

                if (editingId === client.id) {
                  clearForm();
                }

                setPage(0);
                await refresh();
              } catch (error) {
                console.error(error);

                Alert.alert("Xəta", "Müştərini silmək mümkün olmadı.");
              }
            })();
          },
        },
      ],
    );
  };

  const totalPages = Math.max(1, Math.ceil(clients.length / PAGE_SIZE));

  const safePage = Math.min(page, totalPages - 1);

  const shown = useMemo(
    () => clients.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE),
    [clients, safePage],
  );

  return (
    <FlatList
      style={styles.page}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      data={shown}
      keyExtractor={(item) => String(item.id)}
      onRefresh={() => {
        void refresh();
      }}
      refreshing={false}
      ListHeaderComponent={
        <>
          <Text variant="titleLarge" style={styles.title}>
            Müştəriləri idarə et
          </Text>

          <Searchbar
            placeholder="Ad, telefon, email üzrə axtar"
            value={search}
            onChangeText={(value) => {
              setSearch(value);
              setPage(0);
            }}
            style={styles.search}
          />

          <View style={styles.form}>
            <Text variant="titleMedium" style={styles.formTitle}>
              {editingId === null
                ? "Yeni müştəri"
                : `Müştərini redaktə et #${editingId}`}
            </Text>

            <TextInput
              label="Ad, soyad"
              mode="outlined"
              value={name}
              onChangeText={setName}
              style={styles.field}
            />

            <TextInput
              label="Telefon"
              mode="outlined"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              style={styles.field}
            />

            <TextInput
              label="Email"
              mode="outlined"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.field}
            />

            <Button
              mode="contained"
              loading={saving}
              disabled={saving}
              onPress={saveClient}
            >
              {editingId === null ? "Müştəri əlavə et" : "Yadda saxla"}
            </Button>

            {editingId !== null && (
              <Button style={styles.cancel} onPress={clearForm}>
                Redaktəni ləğv et
              </Button>
            )}
          </View>

          <View style={styles.listHeading}>
            <Text variant="titleMedium" style={styles.title}>
              Müştəri siyahısı
            </Text>

            <Text style={styles.muted}>{clients.length} nəticə</Text>
          </View>
        </>
      }
      renderItem={({ item }) => (
        <View style={styles.clientCard}>
          <View style={styles.clientHeader}>
            <View style={{ flex: 1 }}>
              <Text variant="titleMedium" style={styles.clientName}>
                {item.name}
              </Text>

              <Text style={styles.muted}>{item.phone}</Text>

              <Text style={styles.muted}>{item.email}</Text>

              <Text style={styles.saleInfo}>
                {item.salesCount} satış · {money(item.totalSales)}
              </Text>
            </View>

            <View style={styles.actions}>
              <IconButton
                icon="pencil-outline"
                size={21}
                onPress={() => startEdit(item)}
              />

              <IconButton
                icon="trash-can-outline"
                size={21}
                iconColor="#D43D54"
                onPress={() => confirmDelete(item)}
              />
            </View>
          </View>

          <Button
            compact
            mode="outlined"
            onPress={() =>
              router.push({
                pathname: "/clients/[id]",
                params: {
                  id: String(item.id),
                },
              })
            }
          >
            Detallara bax
          </Button>
        </View>
      )}
      ListEmptyComponent={<Text style={styles.empty}>Müştəri tapılmadı.</Text>}
      ListFooterComponent={
        <View style={styles.pagination}>
          <Button
            disabled={safePage === 0}
            onPress={() => setPage(safePage - 1)}
          >
            Əvvəlki
          </Button>

          <Text>
            {safePage + 1} / {totalPages}
          </Text>

          <Button
            disabled={safePage >= totalPages - 1}
            onPress={() => setPage(safePage + 1)}
          >
            Növbəti
          </Button>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: palette.background,
  },

  content: {
    padding: 16,
    paddingBottom: 40,
  },

  title: {
    color: palette.navy,
    fontWeight: "700",
  },

  search: {
    backgroundColor: palette.surface,
    marginVertical: 14,
  },

  form: {
    backgroundColor: palette.surface,
    padding: 16,
    borderRadius: 18,
    marginBottom: 22,
  },

  formTitle: {
    color: palette.navy,
    fontWeight: "700",
    marginBottom: 10,
  },

  field: {
    backgroundColor: palette.surface,
    marginBottom: 10,
  },

  cancel: {
    marginTop: 7,
  },

  listHeading: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },

  muted: {
    color: palette.muted,
    marginTop: 2,
  },

  saleInfo: {
    color: palette.success,
    fontWeight: "600",
    marginTop: 10,
  },

  clientCard: {
    backgroundColor: palette.surface,
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
  },

  clientHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
  },

  clientName: {
    color: palette.navy,
    fontWeight: "700",
    marginBottom: 5,
  },

  actions: {
    flexDirection: "row",
    marginTop: -8,
    marginRight: -9,
  },

  empty: {
    color: palette.muted,
    textAlign: "center",
    paddingVertical: 24,
  },

  pagination: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 5,
  },
});
