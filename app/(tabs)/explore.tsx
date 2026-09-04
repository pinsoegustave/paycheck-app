import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const STORAGE_KEY = "paycheck_history";

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

export default function History() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  const loadHistory = useCallback(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        setHistory(raw ? JSON.parse(raw) : []);
      } catch (e) {
        console.error("Failed to load history", e);
      }
    })();
  }, []);

  // Reload every time this tab is focused, so it stays in sync
  // with entries added on the Paycheck tab.
  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, [loadHistory]),
  );

  const clearHistory = async () => {
    setHistory([]);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify([]));
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>History</Text>
      <FlatList
        data={history}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardDate}>{item.date}</Text>
            <Text>Paycheck: ${item.paycheck.toFixed(2)}</Text>
            <Text style={styles.bills}>
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
  container: { flex: 1, padding: 20, paddingTop: 60 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  card: {
    backgroundColor: "#f4f4f4",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  cardDate: { fontSize: 12, color: "#888", marginBottom: 4 },
  bills: { color: "#a15c00", fontWeight: "600" },
  save: { color: "#2f7a4f", fontWeight: "600" },
  empty: { color: "#999", fontStyle: "italic" },
  clear: { color: "#c0392b", textAlign: "center", marginTop: 12 },
});
