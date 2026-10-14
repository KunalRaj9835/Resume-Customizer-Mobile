import React, { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { View, StyleProp, ViewStyle } from 'react-native';
import { Canvas, useFrame } from '@react-three/fiber/native';
import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system/legacy';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as THREE from 'three';

const MODELS = { statue: require('../../assets/models/statue.glb'), curve: require('../../assets/models/curve.glb') };
export type Variant = 'statue' | 'curve' | 'core';

/** Load a bundled .glb ourselves (bypasses R3F's native asset loader): asset -> base64 -> ArrayBuffer -> GLTFLoader.parse */
function useGlbGeometry(variant: 'statue' | 'curve') {
  const [geo, setGeo] = useState<THREE.BufferGeometry | null>(null);
  useEffect(() => {
    let dead = false;
    (async () => {
      const asset = Asset.fromModule(MODELS[variant]); await asset.downloadAsync();
      const uri = asset.localUri ?? asset.uri;
      const b64 = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
      const bin = atob(b64); const buf = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i);
      new GLTFLoader().parse(buf.buffer, '', (gltf: any) => {
        let g: THREE.BufferGeometry | null = null;
        gltf.scene.traverse((o: any) => { if (!g && o.isMesh) g = o.geometry.clone(); });
        if (!dead && g) setGeo(g);
      }, (e: any) => console.warn('GLB parse failed', e));
    })().catch((e) => console.warn('GLB load failed', e));
    return () => { dead = true; };
  }, [variant]);
  return geo;
}
/** Centers + scales the model, renders dark metal with an orange holographic wire shell. */
function Model({ variant, size }: { variant: 'statue' | 'curve'; size: number }) {
  const geometry = useGlbGeometry(variant);
  const fit = useMemo(() => {
    if (!geometry) return null;
    geometry.computeBoundingBox(); const b = geometry.boundingBox!; const c = new THREE.Vector3(); b.getCenter(c);
    const dim = new THREE.Vector3(); b.getSize(dim);
    return { scale: size / Math.max(dim.x, dim.y, dim.z), offset: c.negate() };
  }, [geometry, size]);
  if (!geometry || !fit) return null;
  return (
    <group scale={fit.scale}>
      <group position={fit.offset}>
        <mesh geometry={geometry}><meshStandardMaterial color="#0a0a0a" metalness={0.95} roughness={0.22} /></mesh>
        <mesh geometry={geometry} scale={1.004}><meshBasicMaterial color="#FF4A00" wireframe transparent opacity={0.22} /></mesh>
      </group>
    </group>
  );
}
function Core() {
  return (<group>
    <mesh><icosahedronGeometry args={[1.5, 1]} /><meshBasicMaterial color="#FF4A00" wireframe /></mesh>
    <mesh><torusKnotGeometry args={[0.55, 0.16, 120, 16]} /><meshStandardMaterial color="#000" metalness={0.9} roughness={0.25} /></mesh>
  </group>);
}
function Dust({ n = 160 }: { n?: number }) {
  const ref = useRef<THREE.Points>(null!);
  const pos = useMemo(() => { const a = new Float32Array(n * 3); for (let i = 0; i < n * 3; i++) a[i] = (Math.random() - 0.5) * 7; return a; }, [n]);
  useFrame((_, dt) => { ref.current.rotation.y -= dt * 0.05; });
  return <points ref={ref}><bufferGeometry><bufferAttribute attach="attributes-position" args={[pos, 3]} /></bufferGeometry><pointsMaterial color="#FF4A00" size={0.035} sizeAttenuation /></points>;
}
function Rig({ variant, speed }: { variant: Variant; speed: number }) {
  const g = useRef<THREE.Group>(null!); const r1 = useRef<THREE.Mesh>(null!); const r2 = useRef<THREE.Mesh>(null!);
  useFrame(({ clock }, dt) => {
    const t = clock.elapsedTime * speed;
    g.current.rotation.y += dt * 0.5 * speed; g.current.position.y = Math.sin(t) * 0.07;
    r1.current.rotation.z += dt * 0.8 * speed; r2.current.rotation.x -= dt * 0.6 * speed;
  });
  return (<>
    <Dust />
    <mesh ref={r1} rotation={[Math.PI / 2.4, 0, 0]}><torusGeometry args={[2.2, 0.012, 8, 120]} /><meshBasicMaterial color="#000" /></mesh>
    <mesh ref={r2} rotation={[0, Math.PI / 3, 0]}><torusGeometry args={[2.5, 0.012, 8, 120]} /><meshBasicMaterial color="#FF4A00" /></mesh>
    <group ref={g}>{variant === 'core' ? <Core /> : <Model variant={variant} size={variant === 'statue' ? 3 : 3.4} />}</group>
  </>);
}
class Boundary extends React.Component<{ fallback: React.ReactNode; children: React.ReactNode }, { err: boolean }> {
  state = { err: false }; static getDerivedStateFromError() { return { err: true }; }
  render() { return this.state.err ? this.props.fallback : this.props.children; }
}
export default function Scene3D({ style, speed = 1, variant = 'core' }: { style?: StyleProp<ViewStyle>; speed?: number; variant?: Variant }) {
  const scene = (v: Variant) => (
    <Canvas camera={{ position: [0, 0, 6], fov: 45 }} gl={{ alpha: true }} style={{ backgroundColor: 'transparent' }}>
      <ambientLight intensity={0.6} />
      <directionalLight position={[3, 4, 5]} intensity={2.5} color="#ffffff" />
      <directionalLight position={[-4, -2, 3]} intensity={3} color="#FF4A00" />
      <Suspense fallback={null}><Rig variant={v} speed={speed} /></Suspense>
    </Canvas>);
  return (
    <View pointerEvents="none" accessible={false} importantForAccessibility="no-hide-descendants" style={style}>
      <Boundary fallback={scene('core')}>{scene(variant)}</Boundary>
    </View>);
}
