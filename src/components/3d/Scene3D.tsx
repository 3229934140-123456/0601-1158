import React, { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { XR, Controllers, Hands } from '@react-three/xr'
import { OrbitControls, Sky, Stars } from '@react-three/drei'
import * as THREE from 'three'

interface SceneProps {
  children: React.ReactNode
  enableVR?: boolean
  cameraPosition?: [number, number, number]
}

function Floor() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
      <planeGeometry args={[100, 100]} />
      <meshStandardMaterial color="#1a1f3a" roughness={0.8} metalness={0.2} />
    </mesh>
  )
}

function GridFloor() {
  return (
    <group position={[0, 0, 0]}>
      <gridHelper args={[50, 50, '#00d4ff', '#2a3050']} position={[0, 0.01, 0]} />
    </group>
  )
}

function AnimatedLights() {
  const lightRef = useRef<THREE.PointLight>(null)

  useFrame((state) => {
    if (lightRef.current) {
      lightRef.current.intensity = 1.5 + Math.sin(state.clock.elapsedTime * 2) * 0.3
    }
  })

  return (
    <>
      <ambientLight intensity={0.4} color="#a0c4ff" />
      <directionalLight
        position={[10, 20, 10]}
        intensity={0.8}
        color="#ffffff"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <pointLight ref={lightRef} position={[0, 5, 0]} intensity={1.5} color="#00d4ff" distance={30} />
      <pointLight position={[-5, 3, -5]} intensity={0.8} color="#ff6b6b" distance={20} />
      <pointLight position={[5, 3, -5]} intensity={0.8} color="#51cf66" distance={20} />
    </>
  )
}

function FactoryWalls() {
  return (
    <group>
      <mesh position={[0, 3, -15]} castShadow receiveShadow>
        <boxGeometry args={[30, 6, 0.5]} />
        <meshStandardMaterial color="#252a48" roughness={0.9} metalness={0.1} />
      </mesh>
      <mesh position={[-15, 3, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.5, 6, 30]} />
        <meshStandardMaterial color="#2d3255" roughness={0.9} metalness={0.1} />
      </mesh>
      <mesh position={[15, 3, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.5, 6, 30]} />
        <meshStandardMaterial color="#2d3255" roughness={0.9} metalness={0.1} />
      </mesh>
      <mesh position={[0, 5.9, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial color="#1e2240" roughness={0.7} metalness={0.3} />
      </mesh>
    </group>
  )
}

export default function Scene3D({ children, enableVR = false, cameraPosition = [0, 2, 8] }: SceneProps) {
  return (
    <div style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}>
      <Canvas
        shadows
        camera={{ position: cameraPosition, fov: 70 }}
        gl={{ antialias: true }}
      >
        <color attach="background" args={['#0a0e27']} />
        <fog attach="fog" args={['#0a0e27', 20, 60]} />

        <XR>
          <AnimatedLights />
          <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

          <Floor />
          <GridFloor />
          <FactoryWalls />

          {children}

          <Controllers />
          <Hands />
        </XR>

        {!enableVR && <OrbitControls enablePan={true} enableZoom={true} minDistance={3} maxDistance={30} />}
      </Canvas>
    </div>
  )
}
