import React from 'react'
import { useStore } from '../../store'
import { workshops } from '../../data/mockData'
import { Header, StatusBadge, VoiceGuidePanel } from '../ui/CommonUI'
import Scene3D from '../3d/Scene3D'
import { InteractiveButton, FloatingText, InteractivePanel } from '../3d/InteractiveElements'

function StationSelect3D() {
  const setScene = useStore(s => s.setScene)
  const setSelectedWorkshop = useStore(s => s.setSelectedWorkshop)
  const startTraining = useStore(s => s.startTraining)

  const handleSelect = (workshopId: string) => {
    setSelectedWorkshop(workshopId)
    startTraining(10)
    setScene('equipment')
  }

  const positions: [number, number, number][] = [
    [-5, 0, -5],
    [0, 0, -6],
    [5, 0, -5],
    [-3, 0, 2],
    [3, 0, 2]
  ]

  return (
    <Scene3D cameraPosition={[0, 4, 12]}>
      <FloatingText position={[0, 6, -4]} text="请选择培训车间" color="#00d4ff" fontSize={28} />

      {workshops.map((workshop, index) => (
        <group key={workshop.id} position={positions[index]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[3, 3, 3]} />
            <meshStandardMaterial
              color={workshop.difficulty === 'easy' ? '#52c41a' : workshop.difficulty === 'medium' ? '#faad14' : '#ff4d4f'}
              emissive={workshop.difficulty === 'easy' ? '#52c41a' : workshop.difficulty === 'medium' ? '#faad14' : '#ff4d4f'}
              emissiveIntensity={0.15}
              roughness={0.3}
              metalness={0.6}
            />
          </mesh>

          <FloatingText
            position={[0, 2.5, 0]}
            text={`${workshop.icon} ${workshop.name}`}
            color="#ffffff"
            fontSize={18}
          />

          <group position={[0, -2, 0]}>
            <InteractiveButton
              position={[0, 0, 2]}
              label="进入培训"
              icon="▶"
              color="#1890ff"
              size={[2, 0.6, 0.15]}
              onClick={() => handleSelect(workshop.id)}
            />
          </group>
        </group>
      ))}

      <InteractivePanel
        position={[0, 2, 8]}
        title="选择提示"
        content={
          <div>
            <p>🟢 绿色 = 初级难度</p>
            <p>🟡 黄色 = 中级难度</p>
            <p>🔴 红色 = 高级难度</p>
          </div>
        }
        width={4}
        height={2.5}
      />
    </Scene3D>
  )
}

export default function StationSelect() {
  const setScene = useStore(s => s.setScene)
  const setSelectedWorkshop = useStore(s => s.setSelectedWorkshop)
  const startTraining = useStore(s => s.startTraining)

  const handleSelect = (workshopId: string) => {
    setSelectedWorkshop(workshopId)
    startTraining(10)
    setScene('equipment')
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'success'
      case 'medium': return 'warning'
      case 'hard': return 'danger'
      default: return 'info'
    }
  }

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return '初级'
      case 'medium': return '中级'
      case 'hard': return '高级'
      default: return '未知'
    }
  }

  return (
    <div className="w-full h-full relative overflow-y-auto">
      <StationSelect3D />

      <Header title="🏭 岗位选择 - 请选择培训车间" showBack />

      <div className="absolute top-24 left-0 right-0 z-20 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="vr-panel p-6 mb-6">
            <h2 className="text-xl font-bold mb-2 text-vr-glow">请选择您的培训车间路线</h2>
            <p className="text-white/70">
              根据您的岗位需求，选择对应的车间进行安全培训。每个车间包含设备认知、事故模拟、协作演练等模块。
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workshops.map(workshop => (
              <div
                key={workshop.id}
                className="vr-card p-6 border-2 border-transparent hover:border-vr-glow cursor-pointer transition-all group"
                onClick={() => handleSelect(workshop.id)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="text-5xl">{workshop.icon}</div>
                  <StatusBadge
                    status={getDifficultyColor(workshop.difficulty) as 'success' | 'warning' | 'danger'}
                    text={getDifficultyText(workshop.difficulty)}
                  />
                </div>

                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-vr-glow transition-colors">
                  {workshop.name}
                </h3>
                <p className="text-white/60 text-sm mb-4 leading-relaxed">
                  {workshop.description}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                  <span className="text-white/50 text-sm">
                    ⏱ 预计 {workshop.estimatedTime} 分钟
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleSelect(workshop.id)
                    }}
                    className="vr-button !py-2 !px-4 text-sm"
                  >
                    开始培训 →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <VoiceGuidePanel text="请选择您要进行培训的车间区域。建议从初级难度开始，循序渐进地学习安全知识。" />
    </div>
  )
}
