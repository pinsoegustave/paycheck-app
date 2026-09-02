import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";

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
}
