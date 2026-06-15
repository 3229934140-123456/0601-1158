import React, { useRef, useState } from 'react'
import { useFrame, ThreeEvent } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import { useStore } from '../../store'

interface InteractiveButtonProps {
  position: [number, number, number]
  label: string
  onClick?: () => void
  color?: string
  size?: [number, number, number]
  icon?: string
}

export function InteractiveButton({ position, label, onClick, color = '#1890ff', size = [1.5, 0.8, 0.2], icon }: InteractiveButtonProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = useState(false)

  useFrame((state) => {
    if (meshRef.current) {
      const targetScale = hovered ? 1.1 : 1
      meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1)
    }
  })

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    onClick?.()
  }

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        onClick={handleClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        castShadow
      >
        <boxGeometry args={size} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={hovered ? 0.5 : 0.2}
          roughness={0.3}
          metalness={0.7}
        />
      </mesh>
      <Html position={[0, 0, size[2] / 2 + 0.01]} center>
        <div style={{
          color: 'white',
          fontSize: '16px',
          fontWeight: 'bold',
          whiteSpace: 'nowrap',
          userSelect: 'none',
          textShadow: '0 0 10px rgba(0,0,0,0.8)'
        }}>
          {icon && <span style={{ marginRight: '8px' }}>{icon}</span>}
          {label}
        </div>
      </Html>
    </group>
  )
}

interface InteractivePanelProps {
  position: [number, number, number]
  title: string
  content: React.ReactNode
  width?: number
  height?: number
}

export function InteractivePanel({ position, title, content, width = 4, height = 3 }: InteractivePanelProps) {
  return (
    <group position={position}>
      <mesh>
        <boxGeometry args={[width, height, 0.1]} />
        <meshStandardMaterial
          color="#141e3c"
          transparent
          opacity={0.95}
          roughness={0.5}
          metalness={0.3}
        />
      </mesh>
      <mesh position={[0, 0, 0.06]}>
        <boxGeometry args={[width - 0.1, height - 0.1, 0.02]} />
        <meshBasicMaterial color="#00d4ff" transparent opacity={0.15} />
      </mesh>
      <Html position={[0, 0, 0.1]} center transform distanceFactor={8}>
        <div style={{
          width: width * 60,
          height: height * 60,
          padding: '16px',
          color: 'white',
          fontFamily: 'sans-serif'
        }}>
          <h3 style={{ margin: '0 0 12px 0', color: '#00d4ff', fontSize: '18px' }}>{title}</h3>
          <div style={{ fontSize: '14px', lineHeight: 1.6 }}>{content}</div>
        </div>
      </Html>
    </group>
  )
}

interface FloatingTextProps {
  position: [number, number, number]
  text: string
  color?: string
  fontSize?: number
}

export function FloatingText({ position, text, color = '#00d4ff', fontSize = 14 }: FloatingTextProps) {
  const ref = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (ref.current) {
      ref.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.1
    }
  })

  return (
    <group ref={ref} position={position}>
      <Html center distanceFactor={10}>
        <div style={{
          color: color,
          fontSize: `${fontSize}px`,
          fontWeight: 'bold',
          textShadow: `0 0 10px ${color}`,
          userSelect: 'none',
          whiteSpace: 'nowrap'
        }}>
          {text}
        </div>
      </Html>
    </group>
  )
}

interface WarningZoneProps {
  position: [number, number, number]
  radius: number
  type: 'electrical' | 'chemical' | 'mechanical' | 'fire' | 'fall'
  active?: boolean
}

export function WarningZone({ position, radius, type, active = false }: WarningZoneProps) {
  const ref = useRef<THREE.Mesh>(null)
  const identifyHazard = useStore(s => s.identifyHazard)
  const recordAction = useStore(s => s.recordAction)

  const colors: Record<string, string> = {
    electrical: '#ff4d4f',
    chemical: '#722ed1',
    mechanical: '#fa8c16',
    fire: '#ff4d4f',
    fall: '#faad14'
  }

  useFrame((state) => {
    if (ref.current) {
      const material = ref.current.material as THREE.MeshBasicMaterial
      material.opacity = 0.2 + Math.sin(state.clock.elapsedTime * 3) * 0.1
    }
  })

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    identifyHazard(`${type}_${position[0]}_${position[2]}`)
    recordAction({
      actionName: `识别${type}危险区域`,
      isCorrect: true,
      position
    })
  }

  return (
    <group position={[position[0], 0.02, position[2]]}>
      <mesh ref={ref} rotation={[-Math.PI / 2, 0, 0]} onClick={handleClick}>
        <ringGeometry args={[radius * 0.8, radius, 32]} />
        <meshBasicMaterial
          color={colors[type]}
          transparent
          opacity={0.3}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[radius - 0.05, radius, 32]} />
        <meshBasicMaterial color={colors[type]} />
      </mesh>
    </group>
  )
}
