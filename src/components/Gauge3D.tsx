import React, { useRef } from 'react';
import { View, Text } from 'react-native';
import { Canvas, useFrame } from '@react-three/fiber/native';
import type { Group } from 'three';
import { F } from './ui';
// 3D match-score ring. Only render with a score supplied by the backend; never invent one.
function Ring({ score }: { score: number }) {
  const g = useRef<Group>(null!);
  useFrame(({ clock }) => { g.current.rotation.y = Math.sin(clock.elapsedTime * 0.8) * 0.5; g.current.rotation.x = Math.sin(clock.elapsedTime * 0.5) * 0.15; });
  const arc = (Math.max(0, Math.min(100, score)) / 100) * Math.PI * 2;
  return (
    <group ref={g}>
      <mesh><torusGeometry args={[1, 0.05, 12, 80]} /><meshBasicMaterial color="#000000" /></mesh>
      <mesh rotation={[0, 0, Math.PI / 2]}><torusGeometry args={[1, 0.17, 16, 80, arc]} /><meshBasicMaterial color="#FF4A00" /></mesh>
      <mesh><torusGeometry args={[1.3, 0.012, 8, 80]} /><meshBasicMaterial color="#000000" /></mesh>
    </group>
  );
}
export default function Gauge3D({ score }: { score: number }) {
  return (
    <View accessible accessibilityLabel={`Match score ${Math.round(score)} out of 100`} style={{ height: 180, alignItems: 'center', justifyContent: 'center' }}>
      <View pointerEvents="none" style={{ position: 'absolute', inset: 0 } as any}>
        <Canvas camera={{ position: [0, 0, 4], fov: 45 }} gl={{ alpha: true }} style={{ backgroundColor: 'transparent' }}><Ring score={score} /></Canvas>
      </View>
      <Text style={{ fontFamily: F.display, fontSize: 44, color: '#000' }}>{Math.round(score)}</Text>
      <Text style={{ fontFamily: F.bold, fontSize: 11, textTransform: 'uppercase' }}>Match</Text>
    </View>
  );
}
