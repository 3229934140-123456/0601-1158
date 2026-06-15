import React, { useState, useEffect, useRef } from 'react'
import { useStore } from '../../store'
import { Header, ProgressIndicator, StatusBadge, VoiceGuidePanel, Toast, Dialog } from '../ui/CommonUI'
import Scene3D from '../3d/Scene3D'
import { InteractiveButton, WarningZone, FloatingText, InteractivePanel } from '../3d/InteractiveElements'
import { hazardZones, workshops } from '../../data/mockData'
import { useFrame, ThreeEvent } from '@react-three/fiber'
import * as THREE from 'three'

type AccidentType = 'power' | 'leak' | 'fire' | 'mechanical'

interface AccidentState {
  type: AccidentType | null
  isActive: boolean
  isResolved: boolean
  hasError: boolean
}

function EmergencyButton({ position, onClick, label = '紧急停止', color = '#ff4d4f' }: {
  position: [number, number, number]
  onClick: () => void
  label?: string
  color?: string
}) {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (meshRef.current) {
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 4) * 0.1
      meshRef.current.scale.set(pulse, pulse, pulse)
    }
  })

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    onClick()
  }

  return (
    <group position={position}>
      <mesh ref={meshRef} onClick={handleClick} castShadow>
        <cylinderGeometry args={[0.4, 0.4, 0.2, 20]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.6}
          roughness={0.3}
          metalness={0.7}
        />
      </mesh>
      <FloatingText position={[0, 0.6, 0]} text={label} color="#ffffff" fontSize={14} />
    </group>
  )
}

function LeakEffect({ position, active }: { position: [number, number, number]; active: boolean }) {
  const ref = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (ref.current && active) {
      ref.current.children.forEach((child, i) => {
        const particle = child as THREE.Mesh
        particle.position.y += 0.02
        if (particle.position.y > 3) {
          particle.position.y = 0
        }
        particle.position.x += Math.sin(state.clock.elapsedTime + i) * 0.005
      })
    }
  })

  if (!active) return null

  return (
    <group ref={ref} position={position}>
      {[...Array(20)].map((_, i) => (
        <mesh key={i} position={[
          Math.sin(i * 0.5) * 0.5,
          (i * 0.15) % 3,
          Math.cos(i * 0.5) * 0.5
        ]}>
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshStandardMaterial color="#722ed1" emissive="#722ed1" emissiveIntensity={0.5} transparent opacity={0.7} />
        </mesh>
      ))}
    </group>
  )
}

function AccidentScene3D({ state, allCompleted, onAction, onGoToCollaboration }: {
  state: AccidentState
  allCompleted: boolean
  onAction: (action: string, correct: boolean) => void
  onGoToCollaboration: () => void
}) {
  const [alarmOn, setAlarmOn] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => {
      setAlarmOn(prev => !prev)
    }, 500)
    return () => clearInterval(interval)
  }, [])

  return (
    <Scene3D cameraPosition={[0, 3, 10]}>
      <FloatingText
        position={[0, 5.5, -4]}
        text={state.isActive ? '⚠️ 紧急情况！请立即处理！' : '事故模拟场景'}
        color={state.isActive ? '#ff4d4f' : '#00d4ff'}
        fontSize={24}
      />

      {alarmOn && state.isActive && (
        <mesh position={[0, 8, 0]}>
          <sphereGeometry args={[15, 16, 16]} />
          <meshBasicMaterial color="#ff4d4f" transparent opacity={0.1} side={THREE.BackSide} />
        </mesh>
      )}

      {hazardZones.map(hazard => (
        <WarningZone
          key={hazard.id}
          position={hazard.position}
          radius={hazard.radius}
          type={hazard.type}
          active={state.isActive}
        />
      ))}

      {state.type === 'power' && state.isActive && (
        <>
          <FloatingText position={[0, 0, -5]} text="⚡ 高压设备异常！请立即断电！" color="#ff4d4f" fontSize={20} />
          <EmergencyButton
            position={[0, 2, -5]}
            onClick={() => onAction('shutdown_power', true)}
            label="切断主电源"
          />
        </>
      )}

      {state.type === 'leak' && state.isActive && (
        <>
          <LeakEffect position={[3, 0, 2]} active={state.isActive} />
          <FloatingText position={[3, 2, 2]} text="☣️ 化学品泄漏！启动应急预案！" color="#722ed1" fontSize={18} />
          <EmergencyButton
            position={[3, 1.5, 4]}
            onClick={() => onAction('activate_leak_protocol', true)}
            label="启动泄漏预案"
            color="#722ed1"
          />
          <InteractiveButton
            position={[5, 1.5, 2]}
            label="疏散人员"
            icon="🚶"
            color="#faad14"
            onClick={() => onAction('evacuate', true)}
          />
        </>
      )}

      {state.type === 'fire' && state.isActive && (
        <>
          <FloatingText position={[0, 2, 3]} text="🔥 发生火情！使用灭火器！" color="#ff4d4f" fontSize={18} />
          <EmergencyButton
            position={[0, 1.5, 5]}
            onClick={() => onAction('use_fire_extinguisher', true)}
            label="使用灭火器"
            color="#fa541c"
          />
          <InteractiveButton
            position={[-2, 1.5, 5]}
            label="按下火警报警"
            icon="🔔"
            color="#ff4d4f"
            onClick={() => onAction('fire_alarm', true)}
          />
        </>
      )}

      {state.type === 'mechanical' && state.isActive && (
        <>
          <FloatingText position={[2, 2, -3]} text="⚙️ 机械故障！人员卷入风险！" color="#faad14" fontSize={18} />
          <EmergencyButton
            position={[2, 1.5, -1]}
            onClick={() => onAction('emergency_stop', true)}
            label="按下急停"
            color="#ff4d4f"
          />
        </>
      )}

      <InteractivePanel
        position={[-8, 3, 0]}
        title="应急处理步骤"
        content={
          <div style={{ fontSize: '12px' }}>
            <p>1. 保持冷静，判断情况</p>
            <p>2. 确保自身安全</p>
            <p>3. 执行相应应急操作</p>
            <p>4. 报告上级</p>
          </div>
        }
        width={3}
        height={3}
      />

      {allCompleted && (
        <InteractiveButton
          position={[0, 1.5, 8]}
          label="进入协作演练 →"
          icon="👥"
          color="#52c41a"
          size={[2.5, 0.8, 0.2]}
          onClick={onGoToCollaboration}
        />
      )}
      {!allCompleted && state.type && (
        <FloatingText
          position={[0, 2, 8]}
          text="完成所有事故模拟后解锁协作演练"
          color="#faad14"
          fontSize={14}
        />
      )}
    </Scene3D>
  )
}

export default function AccidentSimulation() {
  const [accidentState, setAccidentState] = useState<AccidentState>({
    type: null,
    isActive: false,
    isResolved: false,
    hasError: false
  })
  const [currentScenario, setCurrentScenario] = useState(0)
  const [showToast, setShowToast] = useState(false)
  const [toastMsg, setToastMsg] = useState('')
  const [toastType, setToastType] = useState<'success' | 'error' | 'warning' | 'info'>('info')
  const [showErrorHint, setShowErrorHint] = useState(false)

  const recordAction = useStore(s => s.recordAction)
  const incrementError = useStore(s => s.incrementError)
  const setScene = useStore(s => s.setScene)
  const selectedWorkshopId = useStore(s => s.selectedWorkshopId)
  const errorCount = useStore(s => s.errorCount)
  const identifiedHazards = useStore(s => s.identifiedHazards)

  const workshop = workshops.find(w => w.id === selectedWorkshopId)

  const scenarios: { type: AccidentType; name: string; description: string; correctAction: string }[] = [
    { type: 'power', name: '触电事故模拟', description: '模拟高压设备漏电导致的触电风险，学习正确的断电流程', correctAction: 'shutdown_power' },
    { type: 'leak', name: '化学品泄漏', description: '模拟危险化学品泄漏场景，学习应急处置和疏散流程', correctAction: 'activate_leak_protocol' },
    { type: 'fire', name: '火灾事故', description: '模拟车间起火场景，学习灭火器使用和报警流程', correctAction: 'use_fire_extinguisher' },
    { type: 'mechanical', name: '机械伤害', description: '模拟设备异常运转导致的机械伤害风险', correctAction: 'emergency_stop' }
  ]

  const allScenariosCompleted =
    currentScenario === scenarios.length - 1 && accidentState.isResolved

  const handleGoToCollaboration = () => {
    if (allScenariosCompleted) {
      setScene('collaboration')
    }
  }

  const showNotification = (msg: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    setToastMsg(msg)
    setToastType(type)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }

  const startScenario = (index: number) => {
    const scenario = scenarios[index]
    setCurrentScenario(index)
    setAccidentState({
      type: scenario.type,
      isActive: true,
      isResolved: false,
      hasError: false
    })
    showNotification(`🚨 ${scenario.name}开始！请立即处理！`, 'warning')
  }

  const handleAction = (action: string, correct: boolean) => {
    recordAction({
      actionName: action,
      isCorrect: correct,
      position: [0, 0, 0]
    })

    if (correct) {
      setAccidentState(prev => ({ ...prev, isResolved: true, isActive: false }))

      const isLast = currentScenario === scenarios.length - 1
      showNotification(
        isLast
          ? '🎉 所有事故模拟完成！可以进入协作演练了'
          : '✅ 事故已成功处置！操作正确。',
        isLast ? 'success' : 'success'
      )

      setTimeout(() => {
        if (currentScenario < scenarios.length - 1) {
          startScenario(currentScenario + 1)
        }
      }, 2500)
    } else {
      incrementError()
      setAccidentState(prev => ({ ...prev, hasError: true }))
      setShowErrorHint(true)
      showNotification('❌ 操作错误！请回顾正确的应急处理步骤。', 'error')
    }
  }

  return (
    <div className="w-full h-full relative">
      <AccidentScene3D
        state={accidentState}
        allCompleted={allScenariosCompleted}
        onAction={handleAction}
        onGoToCollaboration={handleGoToCollaboration}
      />

      <Header title={workshop ? `⚠️ ${workshop.name} - 事故模拟` : '⚠️ 事故模拟'} showBack />

      <div className="absolute top-24 left-6 z-20 w-80 space-y-4">
        <div className="vr-panel p-5">
          <ProgressIndicator
            current={currentScenario + (accidentState.isResolved ? 1 : 0)}
            total={scenarios.length}
            label="事故模拟进度"
          />
        </div>

        <div className="vr-panel p-5 space-y-3">
          <h3 className="font-bold flex items-center gap-2">
            <span>🎯</span> 事故场景
          </h3>
          {scenarios.map((scenario, idx) => (
            <div
              key={scenario.type}
              className={`p-3 rounded-lg ${
                idx === currentScenario && accidentState.isActive
                  ? 'safety-danger'
                  : idx < currentScenario || (idx === currentScenario && accidentState.isResolved)
                  ? 'safety-success'
                  : 'bg-white/5 border border-white/10'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-sm">{scenario.name}</span>
                {idx < currentScenario || (idx === currentScenario && accidentState.isResolved) ? (
                  <StatusBadge status="success" text="已完成" />
                ) : idx === currentScenario && accidentState.isActive ? (
                  <StatusBadge status="danger" text="进行中" />
                ) : (
                  <StatusBadge status="info" text="待开始" />
                )}
              </div>
              <p className="text-xs text-white/60">{scenario.description}</p>
            </div>
          ))}
        </div>

        {allScenariosCompleted ? (
          <button
            onClick={handleGoToCollaboration}
            className="vr-button w-full !py-3 animate-pulse-glow"
          >
            👥 进入协作演练 →
          </button>
        ) : (
          <button
            onClick={() => !accidentState.isActive && !accidentState.isResolved && startScenario(currentScenario)}
            disabled={accidentState.isActive}
            className="vr-button w-full !py-3 disabled:opacity-50"
          >
            {accidentState.isActive ? '处理中...' : accidentState.isResolved ? '等待下一阶段' : '▶ 开始模拟'}
          </button>
        )}

        {!allScenariosCompleted && !accidentState.isActive && !accidentState.isResolved && currentScenario > 0 && (
          <p className="text-center text-white/50 text-xs mt-2">
            进度：{currentScenario} / {scenarios.length} 个事故场景已完成
          </p>
        )}
        {allScenariosCompleted && (
          <p className="text-center text-safety-success text-sm mt-2">
            ✅ 全部 {scenarios.length} 个场景已完成
          </p>
        )}
      </div>

      <div className="absolute top-24 right-6 z-20 w-72 space-y-4">
        <div className={`vr-panel p-5 ${accidentState.hasError ? 'safety-danger' : ''}`}>
          <h3 className="font-bold mb-3 flex items-center gap-2">
            <span>❌</span> 错误操作
          </h3>
          <div className="text-3xl font-bold text-center">
            <span className={errorCount > 0 ? 'text-safety-danger' : 'text-safety-success'}>
              {errorCount}
            </span>
            <span className="text-lg text-white/50"> / 3 次</span>
          </div>
          {errorCount >= 3 && (
            <p className="text-xs text-safety-danger mt-2 text-center">
              ⚠️ 错误次数过多，建议回顾安全知识
            </p>
          )}
        </div>

        <div className="vr-panel p-5">
          <h3 className="font-bold mb-3 flex items-center gap-2">
            <span>🎯</span> 当前任务
          </h3>
          {accidentState.isActive ? (
            <div>
              <p className="text-lg font-bold text-safety-danger mb-2">
                {scenarios[currentScenario]?.name}
              </p>
              <p className="text-sm text-white/70">
                {scenarios[currentScenario]?.description}
              </p>
              <p className="text-xs text-vr-glow mt-3">
                💡 请点击场景中的紧急按钮进行处理
              </p>
            </div>
          ) : (
            <p className="text-white/50 text-sm">点击"开始模拟"按钮启动事故场景</p>
          )}
        </div>

        <div className="vr-panel p-5">
          <h3 className="font-bold mb-3 flex items-center gap-2">
            <span>⚠️</span> 已识别危险源
          </h3>
          <p className="text-2xl font-bold text-safety-success text-center">
            {identifiedHazards.length}
          </p>
        </div>
      </div>

      <VoiceGuidePanel
        text={
          allScenariosCompleted
            ? '🎉 恭喜！您已完成所有事故模拟训练。现在可以进入协作演练环节，与队友配合作业。'
            : accidentState.isActive
            ? `警告！发生${scenarios[currentScenario]?.name}，请保持冷静，立即采取正确的应急处理措施！`
            : currentScenario === 0 && !accidentState.isResolved
            ? '请点击"开始模拟"按钮启动事故场景。遇到紧急情况时，确保自身安全是第一位的。'
            : `已完成 ${currentScenario} / ${scenarios.length} 个事故场景，请继续处理下一个。`
        }
      />

      {showToast && <Toast message={toastMsg} type={toastType} />}

      <Dialog
        isOpen={showErrorHint}
        onClose={() => setShowErrorHint(false)}
        title="❌ 操作错误提示"
        footer={
          <button onClick={() => setShowErrorHint(false)} className="vr-button">
            我知道了
          </button>
        }
      >
        <div className="space-y-4">
          <div className="safety-danger p-4 rounded-lg">
            <p className="font-bold text-safety-danger mb-2">错误操作已记录</p>
            <p className="text-sm">请仔细回顾应急处理步骤，避免在真实场景中发生同样的错误。</p>
          </div>
          <div className="vr-panel p-4">
            <h4 className="font-bold mb-2 text-vr-glow">正确的应急处理流程：</h4>
            <ol className="text-sm text-white/80 space-y-1 list-decimal list-inside">
              <li>保持冷静，立即评估现场情况</li>
              <li>确保自身安全，穿戴必要防护用品</li>
              <li>按下对应的紧急处置按钮</li>
              <li>疏散周围无关人员</li>
              <li>及时报告上级和安全部门</li>
            </ol>
          </div>
        </div>
      </Dialog>
    </div>
  )
}
