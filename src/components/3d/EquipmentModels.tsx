import React, { useRef, useState } from 'react'
import { useFrame, ThreeEvent } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import { useStore } from '../../store'
import type { Equipment, ProtectiveGear } from '../../types'

interface EquipmentModelProps {
  equipment: Equipment
  showLabel?: boolean
}

export function EquipmentModel({ equipment, showLabel = true }: EquipmentModelProps) {
  const groupRef = useRef<THREE.Group>(null)
  const [showInfo, setShowInfo] = useState(false)
  const recordAction = useStore(s => s.recordAction)

  useFrame((state) => {
    if (groupRef.current && showInfo) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1
    }
  })

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    setShowInfo(!showInfo)
    recordAction({
      actionName: `查看设备：${equipment.name}`,
      isCorrect: true,
      position: equipment.position
    })
  }

  const getEquipmentColor = () => {
    switch (equipment.type) {
      case 'machine': return '#4a5568'
      case 'tool': return '#718096'
      case 'safety': return '#48bb78'
      default: return '#4a5568'
    }
  }

  return (
    <group ref={groupRef} position={equipment.position}>
      <mesh onClick={handleClick} castShadow receiveShadow>
        <boxGeometry args={[1.8, 1.5, 1.2]} />
        <meshStandardMaterial
          color={getEquipmentColor()}
          roughness={0.4}
          metalness={0.8}
        />
      </mesh>
      <mesh position={[0, 0.9, 0]} castShadow>
        <boxGeometry args={[1.5, 0.3, 0.9]} />
        <meshStandardMaterial color="#2d3748" metalness={0.9} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.9, 0.46]}>
        <boxGeometry args={[1.2, 0.2, 0.02]} />
        <meshStandardMaterial color="#00d4ff" emissive="#00d4ff" emissiveIntensity={0.5} />
      </mesh>

      <mesh position={[0.6, 0.5, 0.61]} castShadow>
        <cylinderGeometry args={[0.15, 0.15, 0.3, 16]} />
        <meshStandardMaterial color="#e53e3e" metalness={0.5} roughness={0.5} />
      </mesh>

      {showLabel && (
        <Html position={[0, 2, 0]} center distanceFactor={10}>
          <div style={{
            background: 'rgba(20, 30, 60, 0.9)',
            border: '1px solid #00d4ff',
            borderRadius: '8px',
            padding: '8px 16px',
            color: 'white',
            fontSize: '14px',
            fontWeight: 'bold',
            whiteSpace: 'nowrap'
          }}>
            {equipment.name}
          </div>
        </Html>
      )}

      {showInfo && (
        <Html position={[0, -0.8, 1]} center distanceFactor={6}>
          <div style={{
            background: 'rgba(10, 14, 39, 0.95)',
            border: '1px solid #00d4ff',
            borderRadius: '12px',
            padding: '20px',
            width: '320px',
            color: 'white',
            boxShadow: '0 0 30px rgba(0, 212, 255, 0.3)'
          }}>
            <h3 style={{ margin: '0 0 12px 0', color: '#00d4ff', fontSize: '18px' }}>
              设备标牌：{equipment.name}
            </h3>
            <p style={{ margin: '0 0 8px 0', fontSize: '14px', lineHeight: 1.6 }}>
              <strong>设备描述：</strong>{equipment.description}
            </p>
            <div style={{
              background: 'rgba(255, 77, 79, 0.2)',
              border: '1px solid #ff4d4f',
              borderRadius: '8px',
              padding: '12px',
              marginTop: '12px'
            }}>
              <p style={{ margin: 0, color: '#ff7875', fontSize: '13px' }}>
                ⚠️ <strong>安全警告：</strong>{equipment.warning}
              </p>
            </div>
          </div>
        </Html>
      )}
    </group>
  )
}

interface ProtectiveGearModelProps {
  gear: ProtectiveGear
}

export function ProtectiveGearModel({ gear }: ProtectiveGearModelProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const [collected, setCollected] = useState(false)
  const [hovered, setHovered] = useState(false)
  const collectGear = useStore(s => s.collectGear)
  const collectedGears = useStore(s => s.collectedGears)
  const recordAction = useStore(s => s.recordAction)

  useFrame((state) => {
    if (meshRef.current && !collected) {
      meshRef.current.rotation.y = state.clock.elapsedTime
      meshRef.current.position.y = gear.position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.15
    }
  })

  const isCollected = collected || collectedGears.includes(gear.id)

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    if (!isCollected) {
      collectGear(gear.id)
      setCollected(true)
      recordAction({
        actionName: `抓取防护用品：${gear.name}`,
        isCorrect: true,
        position: gear.position
      })
    }
  }

  const getGearColor = () => {
    switch (gear.type) {
      case 'helmet': return '#faad14'
      case 'goggles': return '#13c2c2'
      case 'gloves': return '#8c8c8c'
      case 'mask': return '#52c41a'
      case 'boots': return '#595959'
      case 'earmuffs': return '#722ed1'
      default: return '#1890ff'
    }
  }

  if (isCollected) {
    return null
  }

  return (
    <group position={[gear.position[0], gear.position[1], gear.position[2]]}>
      <mesh
        ref={meshRef}
        onClick={handleClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        castShadow
      >
        {gear.type === 'helmet' && <sphereGeometry args={[0.25, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />}
        {gear.type === 'goggles' && <boxGeometry args={[0.35, 0.15, 0.1]} />}
        {gear.type === 'gloves' && <boxGeometry args={[0.15, 0.3, 0.1]} />}
        {gear.type === 'mask' && <boxGeometry args={[0.2, 0.25, 0.1]} />}
        {gear.type === 'boots' && <boxGeometry args={[0.2, 0.35, 0.4]} />}
        {gear.type === 'earmuffs' && <torusGeometry args={[0.2, 0.05, 8, 16]} />}
        <meshStandardMaterial
          color={getGearColor()}
          emissive={hovered ? getGearColor() : '#000000'}
          emissiveIntensity={hovered ? 0.5 : 0}
          roughness={0.4}
          metalness={0.6}
        />
      </mesh>

      <Html position={[0, 0.5, 0]} center distanceFactor={8}>
        <div style={{
          background: gear.required ? 'rgba(82, 196, 26, 0.9)' : 'rgba(24, 144, 255, 0.9)',
          borderRadius: '6px',
          padding: '4px 10px',
          color: 'white',
          fontSize: '12px',
          fontWeight: 'bold',
          whiteSpace: 'nowrap'
        }}>
          {gear.required && '★ '}{gear.name}
        </div>
      </Html>
    </group>
  )
}
