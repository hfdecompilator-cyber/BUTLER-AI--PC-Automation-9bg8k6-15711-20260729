/**
 * BUTLER AI — BUTLR TAB (AI Chat) v2.0
 * AI Chat interface powered by local Ollama.
 *
 * © 2024-2026 Andrej Sladkovic. All Rights Reserved.
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput,
  TouchableOpacity, KeyboardAvoidingView, Platform,
  Animated, Dimensions, ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { TabErrorBoundary } from '@/components/ui/TabErrorBoundary';
import { TabPageHeader } from '@/components/ui/TabPageHeader';
import { COLOR, FONT, glow } from '@/constants/tokens';
import { serverConnection } from '@/services/serverConnection';
import { haptics } from '@/services/haptics';
import { useFocusEffect } from 'expo-router';

const MONO: any = FONT.mono;
const SW = Math.max(320, Dimensions.get('window').width);
const PAD = 14;

type Msg = { role: 'user' | 'ai'; text: string; ts: number };

async function sendToOllama(
  ip: string, port: string, token: string,
  model: string, messages: Msg[], prompt: string,
  onChunk: (chunk: string) => void,
): Promise<string> {
  const url = `http://${ip}:${port}/api/ollama/chat`;
  const history = messages.slice(-10).map(m => ({
    role: m.role === 'ai' ? 'assistant' : 'user',
    content: m.text,
  }));
  history.push({ role: 'user', content: prompt });
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `****** } : {}),
      },
      body: JSON.stringify({ model, messages: history, stream: false }),
    });
    if (!res.ok) return `Error ${res.status}`;
    const json = await res.json();
    return json?.message?.content ?? json?.response ?? '(empty response)';
  } catch (e: any) {
    return `Connection error: ${e.message}`;
  }
}

function ButlerScreenInner() {
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState<Msg[]>([
    { role: 'ai', text: 'Butler AI online. I\'m connected to your local Ollama. Ask me anything!', ts: Date.now() },
  ]);
  const [input, setInput]     = useState('');
  const [loading, setLoading] = useState(false);
  const [isConn, setIsConn]   = useState(false);
  const [model, setModel]     = useState('llama3.2');
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    setIsConn(serverConnection.isConnected());
  }, []);

  useFocusEffect(useCallback(() => {
    setIsConn(serverConnection.isConnected());
  }, []));

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || loading) return;
    haptics.light();
    setInput('');
    const userMsg: Msg = { role: 'user', text, ts: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);

    const ip    = serverConnection.getIP() ?? '';
    const port  = serverConnection.getPort() ?? '8099';
    const token = serverConnection.getToken() ?? '';

    if (!ip) {
      setMessages(prev => [...prev, {
        role: 'ai', text: 'No server connected. Pair your PC from the PAIR tab first.', ts: Date.now(),
      }]);
      setLoading(false);
      return;
    }

    const reply = await sendToOllama(ip, port, token, model, messages, text, () => {});
    setMessages(prev => [...prev, { role: 'ai', text: reply, ts: Date.now() }]);
    setLoading(false);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  }, [input, loading, messages, model]);

  return (
    <KeyboardAvoidingView
      style={s.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <TabPageHeader
        safeTop={insets.top}
        accent={COLOR.cyan}
        icon="robot-happy-outline"
        iconLib="community"
        eyebrow="LOCAL AI · OLLAMA · ZERO CLOUD"
        title={
          <>
            <Text style={{ color: COLOR.cyan }}>{'{'}</Text>
            <Text style={{ color: '#FFF' }}>BUTLER</Text>
            <Text style={{ color: COLOR.green }}>_AI</Text>
            <Text style={{ color: COLOR.cyan }}>{'}'}</Text>
          </>
        }
        subtitle={`local ollama · model: ${model}`}
        isConn={isConn}
        connLabel="PC LIVE"
      />

      {/* Chat area */}
      <ScrollView
        ref={scrollRef}
        style={s.chat}
        contentContainerStyle={{ padding: PAD, gap: 12, paddingBottom: 20 }}
        onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}
      >
        {messages.map((msg, i) => (
          <View
            key={i}
            style={[
              s.bubble,
              msg.role === 'user' ? s.userBubble : s.aiBubble,
            ]}
          >
            {msg.role === 'ai' && (
              <View style={s.aiIcon}>
                <MaterialCommunityIcons name="robot-happy-outline" size={13} color={COLOR.cyan} />
              </View>
            )}
            <Text style={[s.bubbleTxt, msg.role === 'user' ? s.userTxt : s.aiTxt]}>
              {msg.text}
            </Text>
          </View>
        ))}
        {loading && (
          <View style={[s.bubble, s.aiBubble]}>
            <ActivityIndicator size="small" color={COLOR.cyan} />
            <Text style={[s.bubbleTxt, s.aiTxt]}>Thinking...</Text>
          </View>
        )}
      </ScrollView>

      {/* Input bar */}
      <View style={[s.inputBar, { paddingBottom: insets.bottom + 10 }]}>
        <TextInput
          style={s.input}
          value={input}
          onChangeText={setInput}
          placeholder="Ask Butler AI anything…"
          placeholderTextColor={COLOR.dim}
          multiline
          maxLength={2000}
          onSubmitEditing={sendMessage}
          returnKeyType="send"
        />
        <TouchableOpacity
          onPress={sendMessage}
          activeOpacity={0.85}
          disabled={loading || !input.trim()}
          style={[s.sendBtn, { backgroundColor: input.trim() ? COLOR.cyan : COLOR.dim }]}
        >
          <MaterialIcons name="send" size={18} color={input.trim() ? '#000' : '#555'} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

export default function ButlerScreen() {
  return (
    <TabErrorBoundary name="BUTLR">
      <ButlerScreenInner />
    </TabErrorBoundary>
  );
}

const s = StyleSheet.create({
  root:       { flex: 1, backgroundColor: '#010508' },
  chat:       { flex: 1 },
  bubble:     { flexDirection: 'row', alignItems: 'flex-start', gap: 8, maxWidth: SW - 40, flexWrap: 'wrap' },
  aiBubble:   { alignSelf: 'flex-start', backgroundColor: '#0B1728', borderRadius: 12, borderWidth: 1, borderColor: COLOR.cyan + '22', padding: 12 },
  userBubble: { alignSelf: 'flex-end', backgroundColor: glow(COLOR.cyan, 12), borderRadius: 12, borderWidth: 1, borderColor: COLOR.cyan + '40', padding: 12 },
  aiIcon:     { marginTop: 1 },
  bubbleTxt:  { fontFamily: MONO, fontSize: 13, lineHeight: 20, flexShrink: 1, flex: 1 },
  aiTxt:      { color: '#D4E8F6' },
  userTxt:    { color: '#FFFFFF' },
  inputBar:   { flexDirection: 'row', alignItems: 'flex-end', gap: 10, paddingHorizontal: PAD, paddingTop: 10, backgroundColor: '#020810', borderTopWidth: 1, borderTopColor: COLOR.cyan + '14' },
  input:      { flex: 1, backgroundColor: '#0B1728', borderRadius: 12, borderWidth: 1, borderColor: COLOR.cyan + '22', paddingHorizontal: 14, paddingVertical: 10, color: '#D4E8F6', fontFamily: MONO, fontSize: 13, maxHeight: 100 },
  sendBtn:    { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
});

