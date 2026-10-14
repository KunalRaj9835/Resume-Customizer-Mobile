import React, { useEffect, useRef } from 'react';
import { Alert, Animated, Pressable, Text, View, ActivityIndicator, StyleSheet, TextInput, TextInputProps, useWindowDimensions } from 'react-native';
// Tokens mirror the Upthrust web design: black / white / #FF4A00, Anton display, Inter body, square edges.
export const C = { bg: '#FFFFFF', card: '#FFFFFF', accent: '#FF4A00', brand: '#FF4A00', text: '#000000', ink: '#000000', muted: '#555555', danger: '#B91C1C', border: '#000000', grid: '#0000000D' };
export const F = { display: 'Anton_400Regular', body: 'Inter_400Regular', semi: 'Inter_600SemiBold', bold: 'Inter_800ExtraBold' };

export const Button = ({ title, onPress, disabled, loading, variant = 'primary' }: any) => {
  const ghost = variant === 'ghost', light = variant === 'light';
  const bg = variant === 'danger' ? C.danger : light ? '#fff' : ghost ? 'transparent' : C.brand;
  const fg = light ? C.brand : ghost ? '#000' : variant === 'danger' ? '#fff' : '#000';
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={title} disabled={disabled || loading} onPress={onPress}
      style={({ pressed }) => [s.btn, { backgroundColor: pressed ? '#000' : bg, borderColor: '#000', borderWidth: ghost ? 2 : 0 }, (disabled || loading) && { opacity: 0.6 }]}>
      {({ pressed }) => loading ? <ActivityIndicator color={fg} /> : <Text style={[s.btnT, { color: pressed ? '#fff' : fg }]}>{title}</Text>}
    </Pressable>);
};
export const Card = ({ children, onPress }: any) => {
  const a = useRef(new Animated.Value(0)).current;
  useEffect(() => { Animated.timing(a, { toValue: 1, duration: 450, useNativeDriver: true }).start(); }, [a]);
  return (<Animated.View style={{ opacity: a, transform: [{ translateY: a.interpolate({ inputRange: [0, 1], outputRange: [24, 0] }) }] }}>
    <Pressable onPress={onPress} disabled={!onPress} style={({ pressed }) => [s.card, pressed && { transform: [{ translateX: 3 }, { translateY: 3 }], shadowOffset: { width: 1, height: 1 } }]}>{children}</Pressable>
  </Animated.View>);
};
export const Badge = ({ children }: any) => (
  <View style={{ alignSelf: 'flex-start', backgroundColor: C.brand, paddingHorizontal: 8, paddingVertical: 2 }}>
    <Text style={{ fontFamily: F.bold, fontSize: 11, textTransform: 'uppercase', color: '#000' }}>{children}</Text></View>);
export const confirm = (title: string, msg: string, onYes: () => void, yes = 'Delete') =>
  Alert.alert(title, msg, [{ text: 'Cancel', style: 'cancel' }, { text: yes, style: 'destructive', onPress: onYes }]);
/** Anton, uppercase, skewed headline like the web hero. */
export const H = ({ children, size = 26, color = '#000', skew = true }: any) => (
  <Text accessibilityRole="header" style={{ fontFamily: F.display, fontSize: size, color, textTransform: 'uppercase', letterSpacing: 0.5, transform: skew ? [{ skewX: '-12deg' }] : [] }}>{children}</Text>);
export const Muted = ({ children }: any) => <Text style={{ color: C.muted, fontSize: 14, fontFamily: F.body }}>{children}</Text>;
/** Uppercase extrabold annotation, like the hero "notes". */
export const Note = ({ children, underline }: any) => (
  <Text style={{ fontFamily: F.bold, textTransform: 'uppercase', fontSize: 13, color: '#000', textDecorationLine: underline ? 'underline' : 'none', textDecorationColor: C.brand, textDecorationStyle: 'dashed' }}>{children}</Text>);
export const Field = (p: TextInputProps & { label: string }) => (
  <View style={{ gap: 4 }}><Note>{p.label}</Note>
    <TextInput accessibilityLabel={p.label} placeholderTextColor={C.muted} {...p} style={[s.input, p.multiline && { minHeight: 160, textAlignVertical: 'top' }]} /></View>);
/** Light blueprint grid background (non-interactive). */
export const Grid = ({ dark }: { dark?: boolean }) => {
  const { width, height } = useWindowDimensions(); const step = 48;
  const col = dark ? '#ffffff12' : C.grid;
  return <View pointerEvents="none" style={StyleSheet.absoluteFill}>
    {Array.from({ length: Math.ceil(width / step) }, (_, i) => <View key={'v' + i} style={{ position: 'absolute', left: i * step, top: 0, bottom: 0, width: 1, backgroundColor: col }} />)}
    {Array.from({ length: Math.ceil(height / step) }, (_, i) => <View key={'h' + i} style={{ position: 'absolute', top: i * step, left: 0, right: 0, height: 1, backgroundColor: col }} />)}
  </View>;
};
export const Loading = () => <ActivityIndicator style={{ marginTop: 40 }} size="large" color={C.brand} />;
export const ErrorState = ({ error, retry }: { error: Error; retry?: () => void }) => (
  <View style={{ padding: 24, gap: 12 }}><Text style={{ color: C.danger, fontFamily: F.semi }}>{error.message}</Text>{retry && <Button title="Retry" variant="ghost" onPress={retry} />}</View>);
export const Empty = ({ text }: { text: string }) => <View style={{ padding: 32 }}><Muted>{text}</Muted></View>;
const s = StyleSheet.create({
  btn: { minHeight: 48, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  btnT: { fontFamily: F.bold, fontSize: 15, textTransform: 'uppercase', letterSpacing: 1 },
  card: { backgroundColor: '#fff', borderWidth: 2, borderColor: '#000', padding: 16, gap: 4, shadowColor: '#000', shadowOffset: { width: 4, height: 4 }, shadowOpacity: 1, shadowRadius: 0, elevation: 0 },
  input: { backgroundColor: '#fff', borderWidth: 2, borderColor: '#000', padding: 12, fontSize: 16, fontFamily: F.body },
});
