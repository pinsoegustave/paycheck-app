import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import {
    FlatList,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const STORAGE_KEY = "paycheck_history";
const BILL_RESERVE = 16;

const SPLIT = {
  save: 0.5,
  groceries: 0.15,
  clothesDecor: 0.2,
  buffer: 0.15,
};

type HistoryEntry = {
  id: string;
  date: string;
  paycheck: number;
  billReserve: number;
  save: number;
  groceries: number;
  clothesDecor: number;
  buffer: number;
};

export default function Index() {
  const [paycheck, setPaycheck] = useState("");
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) setHistory(JSON.parse(raw));
    } catch (e) {
      console.error("Failed to load history", e);
    }
  };

  const saveHistory = async (updated: HistoryEntry[]) => {
    setHistory(updated);

    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error("Failed to save history", e);
    }
  };

  const round = (n: number) => +n.toFixed(2);

  const calculate = () => {
    Keyboard.dismiss();
    const amount = parseFloat(paycheck);

    if (isNaN(amount) || amount <= 0) return;

    const remaining = Math.max(amount - BILL_RESERVE, 0);

    const entry: HistoryEntry = {
      id: Date.now().toString(),
      date: new Date().toLocaleDateString(),
      paycheck: amount,
      billReserve: round(Math.min(amount, BILL_RESERVE)),
      save: round(remaining * SPLIT.save),
      groceries: round(remaining * SPLIT.groceries),
      clothesDecor: round(remaining * SPLIT.clothesDecor),
      buffer: round(remaining * SPLIT.buffer),
    };

    saveHistory([entry, ...history]);
    setPaycheck("");
  };

  const clearHistory = () => saveHistory([]);

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <Text style={styles.title}>Weekly Paycheck Split</Text>

        <Text style={styles.label}>Paycheck amount</Text>
        <TextInput
          style={styles.input}
          keyboardType="decimal-pad"
          placeholder="e.g. 400"
          value={paycheck}
          onChangeText={setPaycheck}
        />

        <TouchableOpacity style={styles.button} onPress={calculate}>
          <Text style={styles.buttonText}>Calculate</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>

      <Text style={styles.historyTitle}>History</Text>
      <FlatList
        data={history}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardDate}>{item.date}</Text>
            <Text>Paycheck: ${item.paycheck.toFixed(2)}</Text>
            <Text style={styles.bills}>
              {" "}
              Bills: ${item.billReserve.toFixed(2)}
            </Text>
            <Text style={styles.save}>
              Save/Invest: ${item.save.toFixed(2)}
            </Text>
            <Text>Groceries: ${item.groceries.toFixed(2)}</Text>
            <Text>Clothes/Decor: ${item.clothesDecor.toFixed(2)}</Text>
            <Text>Buffer: ${item.buffer.toFixed(2)}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No entries yet</Text>}
      />

      {history.length > 0 && (
        <TouchableOpacity onPress={clearHistory}>
          <Text style={styles.clear}>Clear history</Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: "#555",
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginTop: 4,
  },
  button: {
    backgroundColor: "#2f7a4f",
    borderRadius: 8,
    padding: 14,
    alignItems: "center",
    marginTop: 16,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 24,
    marginBottom: 8,
  },
  card: {
    backgroundColor: "#f4f4f4",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  cardDate: {
    fontSize: 12,
    color: "#888",
    marginBottom: 4,
  },
  bills: { fontSize: 12, color: "#888", marginBottom: 4 },
  save: { color: "#2f4a4f", fontWeight: "600" },
  // spend: { color: "#a15c00", fontWeight: "600" },
  empty: { color: "#999", fontStyle: "italic" },
  clear: { color: "#c0392b", textAlign: "center", marginTop: 12 },
});
