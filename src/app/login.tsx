import { useAuth } from "@/context/AuthContext";
import { palette } from "@/theme/theme";
import { useState } from "react";
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    View,
} from "react-native";
import { Button, Surface, Text, TextInput } from "react-native-paper";

export default function LoginPage() {
  const { signIn } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [passwordVisible, setPasswordVisible] = useState(false);
  const [busy, setBusy] = useState(false);

  const handleLogin = async () => {
    if (busy) return;
    setBusy(true);

    try {
      const success = await signIn(username, password);
      if (!success) {
        Alert.alert("Failed to log in", "Username or passwrod is incorrect");
      }
    } catch (error) {
      Alert.alert("ERROR", "Failed to save session");
      console.error(error);
    } finally {
      setBusy(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.header}>
        <Text variant="displaySmall" style={styles.brand}>
          Bizman
        </Text>
        <Text variant="bodyLarge" style={styles.brand}>
          CRM
        </Text>
      </View>

      <Surface style={styles.form} elevation={1}>
        <Text variant="titleLarge" style={styles.title}>
          Xoş gəldiniz
        </Text>

        <TextInput
          label="İstifadəçi adı"
          mode="outlined"
          autoCapitalize="none"
          value={username}
          onChangeText={setUsername}
          style={styles.field}
        />

        <TextInput
          label="Şifrə"
          mode="outlined"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!passwordVisible}
          right={
            <TextInput.Icon
              icon={passwordVisible ? "eye-off" : "eye"}
              onPress={() => setPasswordVisible(!passwordVisible)}
            />
          }
          style={styles.field}
        />

        <Button
          mode="contained"
          loading={busy}
          disabled={busy}
          onPress={handleLogin}
          style={styles.button}
        >
          Giriş
        </Button>

        <Text variant="bodySmall" style={styles.hint}>
          Demo: admin / admin
        </Text>
      </Surface>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
    backgroundColor: palette.background,
  },

  header: {
    alignItems: "center",
    marginBottom: 30,
  },

  brand: {
    color: palette.primary,
    fontWeight: "800",
  },

  subtitle: {
    marginTop: 5,
    color: palette.muted,
    textAlign: "center",
  },

  form: {
    borderRadius: 20,
    padding: 22,
    backgroundColor: palette.surface,
  },

  title: {
    color: palette.navy,
    fontWeight: "700",
    marginBottom: 18,
  },

  field: {
    marginBottom: 14,
    backgroundColor: palette.surface,
  },

  button: {
    marginTop: 8,
    borderRadius: 10,
    paddingVertical: 5,
  },

  hint: {
    marginTop: 17,
    textAlign: "center",
    color: palette.muted,
  },
});
