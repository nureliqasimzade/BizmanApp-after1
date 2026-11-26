import { useState } from 'react';

import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  View,
} from 'react-native';

import {
  router,
  useLocalSearchParams,
} from 'expo-router';

import {
  Button,
  Text,
  TextInput,
} from 'react-native-paper';

import {
  createSale,
} from '../../../../database/saleRepository';

import { palette } from '../../../../theme/theme';

import {
  isIsoDate,
  localToday,
} from '../../../../utils/format';

export default function AddSalePage() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const clientId = Number(id);

  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(localToday());
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    const numericAmount = Number(
      amount.trim().replace(',', '.')
    );

    if (
      !Number.isInteger(clientId) ||
      clientId <= 0
    ) {
      Alert.alert(
        'Xəta',
        'Müştəri ID-si düzgün deyil.'
      );
      return;
    }

    if (
      !amount.trim() ||
      !Number.isFinite(numericAmount) ||
      numericAmount <= 0
    ) {
      Alert.alert(
        'Məbləğ yanlışdır',
        '0-dan böyük düzgün satış məbləği daxil edin.'
      );
      return;
    }

    if (!isIsoDate(date.trim())) {
      Alert.alert(
        'Tarix yanlışdır',
        'Tarixi YYYY-MM-DD formatında daxil edin.'
      );
      return;
    }

    if (saving) return;

    setSaving(true);

    try {
      await createSale(
        clientId,
        numericAmount,
        date.trim()
      );

      router.back();
    } catch (error) {
      console.error(error);

      Alert.alert(
        'Xəta',
        'Satışı yadda saxlamaq mümkün olmadı.'
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.page}
      behavior={
        Platform.OS === 'ios'
          ? 'padding'
          : undefined
      }
    >
      <View style={styles.card}>
        <Text
          variant="titleLarge"
          style={styles.title}
        >
          Yeni satış
        </Text>

        <Text style={styles.description}>
          Müştəri #{clientId} üçün satış qeydiyyatı
        </Text>

        <TextInput
          label="Məbləğ (AZN)"
          mode="outlined"
          keyboardType="decimal-pad"
          value={amount}
          onChangeText={setAmount}
          style={styles.field}
        />

        <TextInput
          label="Tarix (YYYY-MM-DD)"
          mode="outlined"
          value={date}
          onChangeText={setDate}
          style={styles.field}
        />

        <Button
          mode="contained"
          icon="content-save"
          disabled={saving}
          loading={saving}
          onPress={handleSave}
          style={styles.button}
        >
          Satışı yadda saxla
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: palette.background,
    padding: 16,
  },

  card: {
    backgroundColor: palette.surface,
    borderRadius: 18,
    padding: 18,
  },

  title: {
    fontWeight: '700',
    color: palette.navy,
  },

  description: {
    color: palette.muted,
    marginTop: 8,
    marginBottom: 16,
  },

  field: {
    backgroundColor: palette.surface,
    marginBottom: 12,
  },

  button: {
    marginTop: 9,
  },
});