import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import {
    FlatList,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const STORAGE_KEY = "paycheck-history";

type HistoryEntry = {
  id: string;
  date: string;
  paycheck: number;
  savePct: number;
  saveAmount: number;
  spendAmount: number;
};

export default function Index() {
  const [paycheck, setPaycheck] = useState("");
  const [savePct, setSavePct] = useState("50");
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

  const calculate = () => {
    const amount = parseFloat(paycheck);
    const pct = parseFloat(savePct);

    if (isNaN(amount) || amount <= 0 || isNaN(pct) || pct < 0 || pct > 100)
      return;

    const saveAmount = +(amount * (pct / 100)).toFixed(2);
    const spendAmount = +(amount - saveAmount).toFixed(2);

    const entry: HistoryEntry = {
      id: Date.now().toString(),
      date: new Date().toLocaleDateString(),
      paycheck: amount,
      savePct: pct,
      saveAmount,
      spendAmount,
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
        <Text style={styles.title}>Paycheck Split</Text>

        <Text style={styles.label}>Paycheck amount</Text>
        <TextInput
          style={styles.input}
          keyboardType="decimal-pad"
          placeholder="e.g. 1500"
          value={paycheck}
          onChangeText={setPaycheck}
        />

        <Text style={styles.label}>Save %</Text>
        <TextInput
          style={styles.input}
          keyboardType="decimal-pad"
          value={savePct}
          onChangeText={setSavePct}
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
            <Text style={styles.save}>
              Save ({item.savePct}%): ${item.saveAmount.toFixed(2)}
            </Text>
            <Text style={styles.spend}>
              Spend: ${item.spendAmount.toFixed(2)}
            </Text>
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
  save: { color: "#2f4a4f", fontWeight: "600" },
  spend: { color: "#a15c00", fontWeight: "600" },
  empty: { color: "#999", fontStyle: "italic" },
  clear: { color: "#c0392b", textAlign: "center", marginTop: 12 },
});
