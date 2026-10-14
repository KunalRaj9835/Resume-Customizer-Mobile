import React, { useRef } from 'react';
import { View, StyleProp, ViewStyle } from 'react-native';
import { Canvas, useFrame } from '@react-three/fiber/native';
import type { Group, Mesh } from 'three';
// Floating stack of "resume" sheets with an orange scan beam, echoing the AI-tailoring flow.
const LINES: [number, number][] = [[0.5, 0.9], [0.2, 1.1], [-0.05, 0.8], [-0.3, 1.1], [-0.55, 0.6], [-0.8, 1.0]];
function Sheet({ z, tilt, accent }: { z: number; tilt: number; accent?: boolean }) {
  return (
    <group position={[0, 0, z]} rotation={[0, tilt, 0]}>
      <mesh position={[0, 0, -0.012]}><boxGeometry args={[1.58, 2.08, 0.03]} /><meshBasicMaterial color="#000000" /></mesh>
      <mesh><boxGeometry args={[1.5, 2, 0.04]} /><meshBasicMaterial color="#ffffff" /></mesh>
      <mesh position={[-0.2, 0.82, 0.03]}><boxGeometry args={[0.8, 0.12, 0.01]} /><meshBasicMaterial color="#FF4A00" /></mesh>
      {LINES.map(([y, w], i) => (
        <mesh key={i} position={[-0.7 + w / 2 - 0.05, y, 0.03]}>
          <boxGeometry args={[w, 0.06, 0.01]} /><meshBasicMaterial color={accent && i % 3 === 1 ? '#FF4A00' : '#000000'} />
        </mesh>))}
    </group>
  );
}
function Stack({ speed }: { speed: number }) {
  const g = useRef<Group>(null!); const beam = useRef<Mesh>(null!);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime * speed;
    g.current.rotation.y = Math.sin(t * 0.5) * 0.5 - 0.3; g.current.rotation.x = Math.sin(t * 0.3) * 0.12;
    g.current.position.y = Math.sin(t) * 0.08;
    beam.current.position.y = Math.sin(t * 1.4) * 1.0;
  });
  return (
    <group ref={g}>
      <Sheet z={-0.5} tilt={0.18} /><Sheet z={-0.25} tilt={0.09} /><Sheet z={0} tilt={0} accent />
      <mesh ref={beam} position={[0, 0, 0.12]}><boxGeometry args={[1.95, 0.05, 0.05]} /><meshBasicMaterial color="#FF4A00" /></mesh>
    </group>
  );
}
export default function ResumeScene3D({ style, speed = 1 }: { style?: StyleProp<ViewStyle>; speed?: number }) {
  return (
    <View pointerEvents="none" accessible={false} importantForAccessibility="no-hide-descendants" style={style}>
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }} gl={{ alpha: true }} style={{ backgroundColor: 'transparent' }}>
        <Stack speed={speed} />
      </Canvas>
    </View>
  );
}
