/**
 * BUTLER AI — INTEL TAB (Analytics / Execution Logs) v1.0
 * Shows execution history, counters, and live stats.
 *
 * © 2024-2026 Andrej Sladkovic. All Rights Reserved.
 */
import React, { useCallback, useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { TabErrorBoundary } from '@/components/ui/TabErrorBoundary';
import { TabPageHeader } from '@/components/ui/TabPageHeader';
import { COLOR, FONT, glow, SHADOW } from '@/constants/tokens';
import { executionCounter } from '@/services/executionCounter';
import { haptics } from '@/services/haptics';

const MONO: any = FONT.mono;
const PAD = 14;

type LogEntry = {
  id:        string;
  scriptName:string;
  status:    'success' | 'error' | 'running';
  output:    string;
  ms:        number;
  timestamp: number;
};

function StatCard({ label, value, color, icon }: { label: string; value: string | number; color: string; icon: string }) {
  return (
    <View style={[sc.root, { borderTopColor: color, borderColor: color + '28' }]}>
      <MaterialCommunityIcons name={icon as any} size={18} color={color} />
      <Text style={[sc.value, { color }]} numberOfLines={1} adjustsFontSizeToFit>{String(value)}</Text>
      <Text style={sc.label}>{label}</Text>
    </View>
  );
}
const sc = StyleSheet.create({
  root:  { flex: 1, backgroundColor: '#0B1728', borderRadius: 10, borderWidth: 1.5, borderTopWidth: 3, padding: 12, gap: 4, alignItems: 'center', minWidth: 80 },
  value: { fontFamily: MONO, fontSize: 22, fontWeight: '900', textAlign: 'center', lineHeight: 28 },
  label: { fontFamily: MONO, fontSize: 8.5, color: COLOR.mid, letterSpacing: 0.5, fontWeight: '700', textAlign: 'center' },
});

function LogRow({ item }: { item: LogEntry }) {
  const col = item.status === 'success' ? COLOR.green : item.status === 'error' ? COLOR.red : COLOR.amber;
  return (
    <View style={[lr.root, { borderLeftColor: col }]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
        <MaterialCommunityIcons
          name={item.status === 'success' ? 'check-circle' : item.status === 'error' ? 'close-circle' : 'clock-outline'}
          size={14} color={col}
        />
        <Text style={[lr.name, { color: col }]} numberOfLines={1}>{item.scriptName}</Text>
        <View style={{ flex: 1 }} />
        <Text style={lr.ms}>{item.ms}ms</Text>
      </View>
      <Text style={lr.out} numberOfLines={3}>{item.output || '(no output)'}</Text>
      <Text style={lr.ts}>{new Date(item.timestamp).toLocaleTimeString()}</Text>
    </View>
  );
}
const lr = StyleSheet.create({
  root: { backgroundColor: '#0A1520', borderRadius: 10, borderLeftWidth: 3, padding: 12, gap: 2 },
  name: { fontFamily: MONO, fontSize: 12, fontWeight: '900', flex: 1 },
  out:  { fontFamily: MONO, fontSize: 11, color: '#8092A8', lineHeight: 16 },
  ms:   { fontFamily: MONO, fontSize: 10, color: COLOR.mid, fontWeight: '700' },
  ts:   { fontFamily: MONO, fontSize: 9,  color: COLOR.dim, marginTop: 4 },
});

function IntelScreenInner() {
  const insets = useSafeAreaInsets();
  const [logs, setLogs]       = useState<LogEntry[]>([]);
  const [counts, setCounts]   = useState({ total: 0, success: 0, error: 0 });
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const c = await executionCounter.load();
      setCounts({ total: c?.total ?? 0, success: c?.success ?? 0, error: c?.error ?? 0 });
    } catch {}
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const onRefresh = useCallback(async () => {
    haptics.light();
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  const onClear = useCallback(async () => {
    haptics.warning();
    setLogs([]);
    setCounts({ total: 0, success: 0, error: 0 });
  }, []);

  return (
    <View style={s.root}>
      <TabPageHeader
        safeTop={insets.top}
        accent={COLOR.blue}
        icon="chart-line"
        iconLib="community"
        eyebrow="EXECUTION ANALYTICS · HISTORY · INTEL"
        title={
          <>
            <Text style={{ color: '#FFF' }}>INTEL</Text>
            <Text style={{ color: COLOR.blue }}> LOG</Text>
          </>
        }
        subtitle="script runs · analytics · performance"
        showConn={false}
        showSec={false}
        rightSlot={
          <TouchableOpacity
            onPress={onClear}
            style={{ borderWidth: 1, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6,
              borderColor: COLOR.red + '55', backgroundColor: COLOR.red + '0A' }}
          >
            <Text style={{ fontFamily: MONO, fontSize: 9, fontWeight: '900', color: COLOR.red }}>CLEAR</Text>
          </TouchableOpacity>
        }
      />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: PAD, gap: 14, paddingBottom: 120 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLOR.blue} />}
      >
        {/* Stats row */}
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <StatCard label="TOTAL" value={counts.total}   color={COLOR.cyan}  icon="script-text"   />
          <StatCard label="OK"    value={counts.success} color={COLOR.green} icon="check-circle"  />
          <StatCard label="ERRORS"value={counts.error}   color={COLOR.red}   icon="close-circle"  />
        </View>

        {/* Log list */}
        <Text style={{ fontFamily: MONO, fontSize: 9, color: COLOR.mid, letterSpacing: 1.5, fontWeight: '700' }}>
          EXECUTION LOG ({logs.length} entries)
        </Text>
        {logs.length === 0 ? (
          <View style={{ alignItems: 'center', padding: 40, gap: 10 }}>
            <MaterialCommunityIcons name="chart-line" size={36} color={COLOR.dim} />
            <Text style={{ fontFamily: MONO, fontSize: 12, color: COLOR.mid, textAlign: 'center' }}>
              No executions yet.{'\n'}Run a script from the FORGE tab.
            </Text>
          </View>
        ) : (
          <View style={{ gap: 8 }}>
            {[...logs].reverse().map((item, i) => <LogRow key={i} item={item} />)}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

export default function IntelScreen() {
  return (
    <TabErrorBoundary name="INTEL">
      <IntelScreenInner />
    </TabErrorBoundary>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#010508' },
});
