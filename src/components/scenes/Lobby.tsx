import React, { useState, useEffect } from 'react'
import Scene3D from '../3d/Scene3D'
import { InteractiveButton, FloatingText, InteractivePanel } from '../3d/InteractiveElements'
import { useStore } from '../../store'
import { VoiceGuidePanel, Dialog, StatusBadge } from '../ui/CommonUI'
import { SafetyCardList, SafetyCardViewer } from '../ui/SafetyCards'
import { safetyCards } from '../../data/mockData'

const skinTones = ['#f5d0a9', '#e0b88a', '#c9976b', '#a67c52', '#8b5a3c']
const hairStyles = ['short', 'medium', 'long', 'bald']
const uniformColors = ['#1890ff', '#52c41a', '#faad14', '#722ed1', '#eb2f96']

function AvatarCustomizer({ onComplete }: { onComplete: () => void }) {
  const setUserName = useStore(s => s.setUserName)
  const setAvatar = useStore(s => s.setAvatar)
  const avatar = useStore(s => s.avatar)
  const userName = useStore(s => s.userName)
  const [step, setStep] = useState(1)

  const handleNext = () => {
    if (step === 1 && !userName.trim()) return
    setStep(step + 1)
  }

  const handleComplete = () => {
    onComplete()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-vr-dark/95 p-6">
      <div className="vr-panel p-8 max-w-2xl w-full">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-glow mb-2">创建您的虚拟身份</h2>
          <p className="text-white/60">步骤 {step} / 2</p>
        </div>

        <div className="progress-bar h-2 mb-8">
          <div className="progress-bar-fill" style={{ width: `${step * 50}%` }} />
        </div>

        {step === 1 && (
          <div className="space-y-6">
            <div>
              <label className="block text-white/80 mb-3 text-lg">请输入您的姓名</label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="请输入真实姓名..."
                className="vr-input w-full text-lg"
                maxLength={20}
              />
            </div>
            <div className="vr-panel p-6">
              <h3 className="text-lg font-bold text-vr-glow mb-4">👋 欢迎加入安全培训</h3>
              <p className="text-white/70 leading-relaxed">
                本平台采用VR沉浸式培训方式，帮助您快速掌握工厂安全操作规程。
                您将学习设备操作、危险识别、应急处理等关键技能，确保上岗安全。
              </p>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div className="flex gap-8">
              <div className="flex-1">
                <div className="vr-panel p-6 h-64 flex items-center justify-center">
                  <div className="text-center">
                    <div
                      className="w-32 h-32 rounded-full mx-auto mb-4 flex items-center justify-center text-6xl"
                      style={{ backgroundColor: avatar.skinTone }}
                    >
                      {avatar.hairStyle === 'bald' ? '🧑‍🦲' : '👤'}
                    </div>
                    <div
                      className="w-24 h-8 mx-auto rounded-t-lg"
                      style={{ backgroundColor: avatar.uniformColor }}
                    />
                  </div>
                </div>
              </div>

              <div className="flex-1 space-y-5">
                <div>
                  <label className="block text-white/80 mb-2">肤色选择</label>
                  <div className="flex gap-2">
                    {skinTones.map(tone => (
                      <button
                        key={tone}
                        onClick={() => setAvatar({ ...avatar, skinTone: tone })}
                        className={`w-10 h-10 rounded-full border-2 transition-all ${avatar.skinTone === tone ? 'border-vr-glow scale-110' : 'border-white/20'}`}
                        style={{ backgroundColor: tone }}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-white/80 mb-2">发型选择</label>
                  <div className="flex gap-2">
                    {hairStyles.map(style => (
                      <button
                        key={style}
                        onClick={() => setAvatar({ ...avatar, hairStyle: style })}
                        className={`px-4 py-2 rounded-lg text-sm transition-all ${avatar.hairStyle === style ? 'bg-vr-glow/30 border border-vr-glow' : 'bg-white/5 border border-white/10'}`}
                      >
                        {style === 'short' ? '短发' : style === 'medium' ? '中发' : style === 'long' ? '长发' : '光头'}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-white/80 mb-2">工装颜色</label>
                  <div className="flex gap-2">
                    {uniformColors.map(color => (
                      <button
                        key={color}
                        onClick={() => setAvatar({ ...avatar, uniformColor: color })}
                        className={`w-10 h-10 rounded-lg border-2 transition-all ${avatar.uniformColor === color ? 'border-vr-glow scale-110' : 'border-white/20'}`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-4 mt-8">
          {step > 1 && (
            <button
              onClick={() => setStep(step - 1)}
              className="vr-button vr-button-secondary flex-1"
            >
              上一步
            </button>
          )}
          {step < 2 ? (
            <button
              onClick={handleNext}
              disabled={!userName.trim()}
              className="vr-button flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              下一步
            </button>
          ) : (
            <button onClick={handleComplete} className="vr-button flex-1">
              开始培训
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function Lobby3D() {
  const setScene = useStore(s => s.setScene)
  const userName = useStore(s => s.userName)
  const avatar = useStore(s => s.avatar)

  return (
    <Scene3D cameraPosition={[0, 3, 10]}>
      <FloatingText position={[0, 6, -8]} text="VR工厂安全培训中心" color="#00d4ff" fontSize={32} />

      <group position={[0, 0, 0]}>
        <mesh position={[0, 1.5, 0]} castShadow>
          <cylinderGeometry args={[0.6, 0.6, 2.5, 16]} />
          <meshStandardMaterial color={avatar.skinTone} />
        </mesh>
        <mesh position={[0, 3.2, 0]} castShadow>
          <sphereGeometry args={[0.5, 16, 16]} />
          <meshStandardMaterial color={avatar.skinTone} />
        </mesh>
        <mesh position={[0, 1, 0]} castShadow>
          <cylinderGeometry args={[0.8, 0.8, 0.5, 16]} />
          <meshStandardMaterial color={avatar.uniformColor} />
        </mesh>
      </group>

      <InteractivePanel
        position={[0, 3, -8]}
        title={`欢迎，${userName || '新员工'}！`}
        content={
          <div>
            <p>请选择下方的培训模块开始学习</p>
            <p style={{ marginTop: 8, color: '#faad14' }}>共包含5个车间培训路线</p>
          </div>
        }
        width={6}
        height={2.5}
      />

      <InteractiveButton
        position={[-4, 2, -5]}
        label="开始培训"
        icon="🎯"
        color="#1890ff"
        onClick={() => setScene('station-select')}
      />
      <InteractiveButton
        position={[0, 2, -5]}
        label="成绩查看"
        icon="📊"
        color="#52c41a"
        onClick={() => setScene('results')}
      />
      <InteractiveButton
        position={[4, 2, -5]}
        label="管理员"
        icon="⚙️"
        color="#722ed1"
        onClick={() => setScene('admin')}
      />
      <InteractiveButton
        position={[0, 1, -3]}
        label="知识卡片"
        icon="📚"
        color="#faad14"
        size={[2, 0.6, 0.15]}
        onClick={() => setScene('lobby')}
      />
    </Scene3D>
  )
}

export default function Lobby() {
  const setScene = useStore(s => s.setScene)
  const userName = useStore(s => s.userName)
  const avatar = useStore(s => s.avatar)
  const [showAvatarCreator, setShowAvatarCreator] = useState(false)
  const [showCards, setShowCards] = useState(false)
  const setRole = useStore(s => s.setRole)
  const [isFirstVisit, setIsFirstVisit] = useState(() => {
    return !userName || userName.trim() === ''
  })

  const handleStationSelect = () => {
    if (!userName || userName.trim() === '') {
      setShowAvatarCreator(true)
      setIsFirstVisit(true)
    } else {
      setScene('station-select')
    }
  }

  useEffect(() => {
    if (isFirstVisit && (!userName || userName.trim() === '')) {
      setShowAvatarCreator(true)
    }
  }, [isFirstVisit, userName])

  const handleAvatarComplete = () => {
    setShowAvatarCreator(false)
    setIsFirstVisit(false)
  }

  return (
    <div className="w-full h-full relative">
      <Lobby3D />

      {showAvatarCreator && (
        <AvatarCustomizer onComplete={handleAvatarComplete} />
      )}

      <div className="absolute top-0 left-0 right-0 z-30 p-6">
        <div className="vr-panel px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-glow">🏭 VR工厂安全培训中心</h1>
            <StatusBadge status="info" text="大厅" />
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowCards(true)}
              className="vr-button vr-button-secondary !py-2 !px-4 text-sm flex items-center gap-2"
            >
              <span>📚</span> 安全知识卡
            </button>
            <button
              onClick={() => setRole('admin')}
              className="vr-button vr-button-secondary !py-2 !px-4 text-sm"
            >
              切换管理员
            </button>
          </div>
        </div>
      </div>

      <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-30">
        <div className="vr-panel px-8 py-5 flex gap-6">
          <button
            onClick={() => setShowAvatarCreator(true)}
            className="vr-card px-8 py-4 flex flex-col items-center gap-2 hover:border-vr-glow"
          >
            <span className="text-4xl">👤</span>
            <span className="font-bold">虚拟身份</span>
            <span className="text-xs text-white/50">创建/编辑</span>
          </button>
          <button
            onClick={handleStationSelect}
            className="vr-card px-8 py-4 flex flex-col items-center gap-2 hover:border-vr-glow"
          >
            <span className="text-4xl">🏭</span>
            <span className="font-bold">岗位选择</span>
            <span className="text-xs text-white/50">选择培训车间</span>
          </button>
          <button
            onClick={() => setScene('results')}
            className="vr-card px-8 py-4 flex flex-col items-center gap-2 hover:border-vr-glow"
          >
            <span className="text-4xl">🔄</span>
            <span className="font-bold">考核回放</span>
            <span className="text-xs text-white/50">复习培训内容</span>
          </button>
          <button
            onClick={() => setShowCards(true)}
            className="vr-card px-8 py-4 flex flex-col items-center gap-2 hover:border-vr-glow"
          >
            <span className="text-4xl">📚</span>
            <span className="font-bold">知识卡片</span>
            <span className="text-xs text-white/50">
              已解锁 {useStore.getState().unlockedCards.length}/{safetyCards.length}
            </span>
          </button>
        </div>
      </div>

      <VoiceGuidePanel text="欢迎来到VR工厂安全培训中心！请先创建您的虚拟身份，然后选择培训车间开始学习。" />

      {showCards && (
        <Dialog isOpen={showCards} onClose={() => setShowCards(false)} title="📚 安全知识卡片库">
          <SafetyCardList />
        </Dialog>
      )}

      <SafetyCardViewer />
    </div>
  )
}
