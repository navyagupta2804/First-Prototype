// app/tabs/dashboard.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { getAuth } from "firebase/auth";
import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  where,
  Timestamp,
  doc,
  getDoc,
  documentId,
} from "firebase/firestore";
import { LineChart, BarChart } from "react-native-chart-kit";
import { db } from "../../firebaseConfig";

import StatCard from "../components/dashboard/StatCard";
import Section from "../components/dashboard/Section";

const DAY_MS = 24 * 60 * 60 * 1000;
const screenWidth = Dimensions.get("window").width;

export default function DashboardScreen() {
  const [loading, setLoading] = useState(true);
  const [adminLoading, setAdminLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const [events, setEvents] = useState([]);
  const [usersCount, setUsersCount] = useState(0);
  const [posts, setPosts] = useState([]);
  const [emailByUid, setEmailByUid] = useState({});
  const [nameByUid, setNameByUid] = useState({});


  const auth = getAuth();
  const uid = auth?.currentUser?.uid;

  // ====== ADMIN CHECK (reads users/{uid}.isAdmin) ======
  useEffect(() => {
    (async () => {
      try {
        if (!uid) {
          setIsAdmin(false);
          return;
        }
        const userSnap = await getDoc(doc(db, "users", uid));
        const data = userSnap.data();
        setIsAdmin(!!data?.isAdmin);
      } catch (e) {
        console.warn("Admin check failed:", e?.message);
        setIsAdmin(false);
      } finally {
        setAdminLoading(false);
      }
    })();
  }, [uid]);

  // ====== LOAD DASHBOARD DATA (admins only) ======
  useEffect(() => {
    if (!isAdmin) return;

    (async () => {
      setLoading(true);
      try {
        const since7d = Timestamp.fromDate(new Date(Date.now() - 7 * DAY_MS));
        const since30d = Timestamp.fromDate(new Date(Date.now() - 30 * DAY_MS));

        // --- events (last 30 days) ---
        const evQ = query(
          collection(db, "events"),
          where("ts", ">=", since30d),
          orderBy("ts", "desc"),
          limit(2000)
        );
        const evSnap = await getDocs(evQ);
        const evs = evSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setEvents(evs);

        // --- users total ---
        const usersSnap = await getDocs(collection(db, "users"));
        setUsersCount(usersSnap.size);

        // --- posts (last 7 days) ---
        // change "posts" / "createdAt" if your schema differs
        const postsQ = query(
          collection(db, "posts"),
          where("createdAt", ">=", since7d),
          orderBy("createdAt", "desc"),
          limit(500)
        );
        const postsSnap = await getDocs(postsQ);
        const ps = postsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setPosts(ps);
      } catch (e) {
        console.warn("Dashboard load error:", e?.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [isAdmin]);

  // ====== DERIVED METRICS ======
  const { dau, wau, eventsByDay, eventsByType, postsByDay, topUsers } =
    useMemo(() => {
      const now = Date.now();

      const dayBuckets = Array.from({ length: 7 }, (_, i) => {
        const start = new Date(now - (6 - i) * DAY_MS);
        start.setHours(0, 0, 0, 0);
        return start.getTime();
      });

      const mkEmpty = () =>
        Object.fromEntries(dayBuckets.map((t) => [t, 0]));

      const evDay = mkEmpty();
      const postDay = mkEmpty();
      const typeCounts = {};
      const userCounts = {};
      const dauSet = new Set();
      const wauSet = new Set();

      for (const ev of events) {
        const ts = ev.ts?.toDate?.() ? ev.ts.toDate().getTime() : null;
        if (!ts) continue;

        const bucket = dayBuckets.findLast((t) => ts >= t) ?? null;
        if (bucket) evDay[bucket]++;

        typeCounts[ev.type] = (typeCounts[ev.type] || 0) + 1;

        if (ev.uid) {
          userCounts[ev.uid] = (userCounts[ev.uid] || 0) + 1;

          if (ts >= now - DAY_MS) dauSet.add(ev.uid);
          if (ts >= now - 7 * DAY_MS) wauSet.add(ev.uid);
        }
      }

      for (const p of posts) {
        const ts = p.createdAt?.toDate?.()
          ? p.createdAt.toDate().getTime()
          : null;
        if (!ts) continue;

        const bucket = dayBuckets.findLast((t) => ts >= t) ?? null;
        if (bucket) postDay[bucket]++;
      }

      const top = Object.entries(userCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([uid, count]) => ({ uid, count }));

      return {
        dau: dauSet.size,
        wau: wauSet.size,
        eventsByDay: evDay,
        eventsByType: typeCounts,
        postsByDay: postDay,
        topUsers: top,
      };
    }, [events, posts]);
    useEffect(() => {
        (async () => {
            try {
                if (!topUsers || topUsers.length === 0) return;

                const uids = topUsers.map(u => u.uid);

                const usersQ = query(
                    collection(db, "users"),
                    where(documentId(), "in", uids)
                );

                const snap = await getDocs(usersQ);

                const emailMap = {};
                const nameMap = {};

                snap.forEach(d => {
                    const data = d.data();
                    emailMap[d.id] = data?.email || "";
                    nameMap[d.id] = data?.displayName || "";
                });

                setEmailByUid(emailMap);
                setNameByUid(nameMap);

            } catch (e) {
                console.warn("Failed to fetch top user info:", e?.message);
            }
        })();
    }, [topUsers]);


  const chartLabels = Object.keys(eventsByDay).map((t) => {
    const d = new Date(Number(t));
    return `${d.getMonth() + 1}/${d.getDate()}`;
  });

  const eventsDayValues = Object.values(eventsByDay);
  const postsDayValues = Object.values(postsByDay);

  // ====== UI STATES ======
  if (adminLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
        <Text style={{ color: "#999", marginTop: 8 }}>
          Checking admin access…
        </Text>
      </View>
    );
  }

  if (!isAdmin) {
    return (
      <View style={styles.center}>
        <Text style={{ color: "#999" }}>
          Admin dashboard is not enabled for this account.
        </Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
        <Text style={{ color: "#999", marginTop: 8 }}>
          Loading dashboard…
        </Text>
      </View>
    );
  }

  // ====== MAIN DASHBOARD ======
  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      <Text style={styles.header}>Pantry Admin Dashboard</Text>
      <Text style={styles.sub}>Last 30d events, last 7d charts</Text>

      <View style={styles.statsRow}>
        <StatCard label="Total Users" value={usersCount} />
        <StatCard label="Daily Active Users" value={dau} sublabel="active last 24h" />
        <StatCard label="Weekly Active Users" value={wau} sublabel="active last 7d" />
        <StatCard
          label="Events (30d)"
          value={events.length}
          sublabel="logged interactions"
        />
      </View>

      <Section title="Events per day (last 7 days)">
        <LineChart
          data={{
            labels: chartLabels,
            datasets: [{ data: eventsDayValues }],
          }}
          width={screenWidth - 32}
          height={220}
          yAxisInterval={1}
          chartConfig={chartConfig}
          bezier
          style={styles.chart}
        />
      </Section>

      <Section title="Posts per day (last 7 days)">
        <BarChart
          data={{
            labels: chartLabels,
            datasets: [{ data: postsDayValues }],
          }}
          width={screenWidth - 32}
          height={220}
          chartConfig={chartConfig}
          style={styles.chart}
          fromZero
        />
      </Section>

      <Section title="Top Event Types (30 days)">
        {Object.entries(eventsByType)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 8)
          .map(([type, count]) => (
            <View key={type} style={styles.row}>
              <Text style={styles.rowLabel}>{type}</Text>
              <Text style={styles.rowValue}>{count}</Text>
            </View>
          ))}
      </Section>

      <Section title="Most Active Users (by events)">
        {topUsers.length === 0 && (
          <Text style={{ color: "#888" }}>No user activity yet.</Text>
        )}
        {topUsers.map((u) => (
          <View key={u.uid} style={styles.row}>
            <Text style={styles.rowLabel} numberOfLines={1}>
                {nameByUid[u.uid]
                    ? `${nameByUid[u.uid]} (${emailByUid[u.uid] || ""})`
                    : (emailByUid[u.uid] || u.uid)
                }
            </Text>
            <Text style={styles.rowValue}>{u.count}</Text>
          </View>
        ))}
      </Section>
    </ScrollView>
  );
}

const chartConfig = {
  backgroundGradientFrom: "#0c0c0c",
  backgroundGradientTo: "#0c0c0c",
  decimalPlaces: 0,
  color: () => "white",
  labelColor: () => "#aaa",
  propsForDots: { r: "3" },
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "black" },
  header: { color: "white", fontSize: 22, fontWeight: "800" },
  sub: { color: "#888", marginTop: 4 },

  statsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 14,
  },

  chart: { borderRadius: 12 },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#1c1c1c",
  },
  rowLabel: { color: "#ddd", flex: 1, marginRight: 8 },
  rowValue: { color: "white", fontWeight: "700" },

  center: {
    flex: 1,
    backgroundColor: "black",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
});
