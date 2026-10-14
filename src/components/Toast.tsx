import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import { Animated, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { F, C } from './ui';
const Ctx = createContext<(msg: string, kind?: 'ok' | 'error') => void>(() => {});
export const useToast = () => useContext(Ctx);
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [t, setT] = useState<{ msg: string; kind: string } | null>(null);
  const a = useRef(new Animated.Value(0)).current; const insets = useSafeAreaInsets();
  const show = useCallback((msg: string, kind: 'ok' | 'error' = 'ok') => {
    setT({ msg, kind });
    Animated.sequence([Animated.timing(a, { toValue: 1, duration: 200, useNativeDriver: true }), Animated.delay(2400), Animated.timing(a, { toValue: 0, duration: 250, useNativeDriver: true })]).start();
  }, [a]);
  return <Ctx.Provider value={show}>{children}
    <Animated.View pointerEvents="none" accessibilityLiveRegion="polite" style={{ position: 'absolute', left: 16, right: 16, top: insets.top + 8, opacity: a, transform: [{ translateY: a.interpolate({ inputRange: [0, 1], outputRange: [-20, 0] }) }], backgroundColor: '#000', borderLeftWidth: 6, borderLeftColor: t?.kind === 'error' ? C.danger : C.brand, padding: 14 }}>
      <Text style={{ color: '#fff', fontFamily: F.semi }}>{t?.msg}</Text></Animated.View></Ctx.Provider>;
}
