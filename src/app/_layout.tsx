import { AuthProvider, useAuth } from "@/context/AuthContext";
import { getDatabase } from "@/database/database";
import { appTheme, palette } from "@/theme/theme";
import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { ActivityIndicator, PaperProvider, Text } from "react-native-paper";

import { Stack } from "expo-router";

function RootNavigator() {
  const { token, isLoading } = useAuth();

  const [databaseReady, setDatabaseReady] = useState(false);
  const [databaseError, setDatabaseError] = useState(false);

  useEffect(() => {
    let mounted = true;

    getDatabase()
      .then(() => {
        if (mounted) {
          setDatabaseReady(true);
        }
      })
      .catch((error) => {
        console.error("Database initialization failed", error);

        if (mounted) {
          setDatabaseError(true);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  if (databaseError) {
    return (
      <View style={styles.center}>
        <Text variant="titleMedium">Database achila bilmedi</Text>

        <Text>Loglari yoxlayib tetbiqi yeniden bashladin</Text>
      </View>
    );
  }

  if (isLoading || !databaseReady) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={!token}>
        <Stack.Screen name="login" />
      </Stack.Protected>

      <Stack.Protected guard={!!token}>
        <Stack.Screen name="(app)" />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout(){
    return (
        <PaperProvider theme={appTheme}>
            <AuthProvider>
                <RootNavigator />
            </AuthProvider>
        </PaperProvider>
    )
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    padding: 24,
    backgroundColor: palette.background,
  },
});
