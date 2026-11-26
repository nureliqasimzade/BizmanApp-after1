import { Stack } from "expo-router";

import { palette } from "../../../theme/theme";

export default function ClientStackLayout() {
  return (
    <Stack
      screenOptions={{
        headerTintColor: palette.navy,

        headerStyle: {
          backgroundColor: palette.surface,
        },

        contentStyle: {
          backgroundColor: palette.background,
        },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: "Müştərilər",
        }}
      />

      <Stack.Screen
        name="[id]"
        options={{
          title: "Müştəri məlumatları",
        }}
      />

      <Stack.Screen
        name="[id]/add-sale"
        options={{
          title: "Satış əlavə et",
        }}
      />
    </Stack>
  );
}
