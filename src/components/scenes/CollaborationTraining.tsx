import React, { useState, useEffect } from 'react'
import { useStore } from '../../store'
import { Header, ProgressIndicator, StatusBadge, VoiceGuidePanel, Toast, Dialog } from '../ui/CommonUI'
import Scene3D from '../3d/Scene3D'
import { InteractiveButton, FloatingText, InteractivePanel } from '../3d/InteractiveElements'
import { workshops } from '../../data/mockData'
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface TaskStep {
  id: number
  name: string
  description: string
  role: 'operator' | 'supervisor' | 'both'
  completed: boolean
  correctOrder: number
}

function AvatarModel({ position, color, name, isSpeaking }: {
  position: [number, number, number]
  color: string
  name: string
  isSpeaking: boolean
}) {
  const ref = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (ref.current) {
      ref.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.05
    }
  })

  return (
    <group ref={ref} position={position}>
      <mesh castShadow>
        <cylinderGeometry args={[0.35, 0.4, 1.2, 16]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[0, 1, 0]} castShadow>
        <sphereGeometry args={[0.35, 16, 16]} />
        <meshStandardMaterial color="#f5d0a9" />
      </mesh>
      <mesh position={[0, 0.2, 0]} castShadow>
        <boxGeometry args={[0.9, 0.05, 0.5]} />
        <meshStandardMaterial color={color} />
      </mesh>

      {isSpeaking && (
        <>
          <FloatingText position={[0, 2, 0]} text="💬 说话中..." color="#52c41a" fontSize={12} />
          <mesh position={[0, 1.9, 0.3]}>
            <sphereGeometry args={[0.1, 8, 8]} />
            <meshStandardMaterial color="#52c41a" emissive="#52c41a" emissiveIntensity={0.8} />
          </mesh>
        </>
      )}

      <FloatingText position={[0, -0.3, 0]} text={name} color="#ffffff" fontSize={12} />
    </group>
  )
}

function CollaborationScene3D({ steps, currentStep, onCompleteStep, onFinish }: {
  steps: TaskStep[]
  currentStep: number
  onCompleteStep: (stepId: number) => void
  onFinish: () => void
}) {
  return (
    <Scene3D cameraPosition={[0, 3, 12]}>
      <FloatingText position={[0, 5.5, -2]} text="协作演练 - 团队配合作业" color="#00d4ff" fontSize={24} />

      <AvatarModel position={[-3, 0, -2]} color="#52c41a" name="李师傅(监护)" isSpeaking={currentStep === 1 || currentStep === 3} />
      <AvatarModel position={[-1, 0, -2]} color="#faad14" name="王班长(指导)" isSpeaking={currentStep === 2 || currentStep === 4} />
      <AvatarModel position={[1, 0, -2]} color="#1890ff" name="你(操作员)" isSpeaking={currentStep === 0 || currentStep === 5} />

      <InteractivePanel
        position={[0, 3, -6]}
        title={`任务步骤 ${currentStep + 1}/${steps.length}`}
        content={
          <div>
            <p style={{ fontSize: '14px', fontWeight: 'bold' }}>{steps[currentStep]?.name}</p>
            <p style={{ fontSize: '12px', marginTop: 8, color: '#aaa' }}>{steps[currentStep]?.description}</p>
            <p style={{ fontSize: '12px', marginTop: 8, color: '#52c41a' }}>
              角色：{steps[currentStep]?.role === 'operator' ? '操作员(你)' : steps[currentStep]?.role === 'supervisor' ? '监护员' : '双方配合'}
            </p>
          </div>
        }
        width={5}
        height={3}
      />

      {steps.map((step, idx) => (
        idx === currentStep && !step.completed && (
          <InteractiveButton
            key={step.id}
            position={[0, 1.5, 2]}
            label={`执行：${step.name}`}
            icon="✅"
            color="#52c41a"
            size={[3, 0.8, 0.2]}
            onClick={() => onCompleteStep(step.id)}
          />
        )
      ))}

      {currentStep >= steps.length && (
        <InteractiveButton
          position={[0, 1.5, 2]}
          label="完成演练，查看成绩"
          icon="🏆"
          color="#faad14"
          size={[3.5, 1, 0.25]}
          onClick={onFinish}
        />
      )}

      <InteractivePanel
        position={[-7, 3, 0]}
        title="💬 语音通讯"
        content={
          <div style={{ fontSize: '12px' }}>
            <p style={{ color: '#52c41a' }}>李师傅：已就位，准备监护</p>
            <p style={{ color: '#faad14', marginTop: 6 }}>王班长：请按步骤操作</p>
            <p style={{ color: '#1890ff', marginTop: 6 }}>你：收到，开始执行</p>
          </div>
        }
        width={3}
        height={3.5}
      />

      <InteractivePanel
        position={[7, 3, 0]}
        title="📋 操作记录表"
        content={
          <div style={{ fontSize: '12px' }}>
            {steps.filter(s => s.completed).map(s => (
              <p key={s.id} style={{ color: '#52c41a', marginTop: 4 }}>
                ✓ {s.name}
              </p>
            ))}
            {steps.filter(s => !s.completed).length === 0 && (
              <p style={{ color: '#faad14', marginTop: 8 }}>全部操作已记录！</p>
            )}
          </div>
        }
        width={3}
        height={3.5}
      />
    </Scene3D>
  )
}

export default function CollaborationTraining() {
  const teammates = useStore(s => s.teammates)
  const recordAction = useStore(s => s.recordAction)
  const generateResult = useStore(s => s.generateResult)
  const setScene = useStore(s => s.setScene)
  const selectedWorkshopId = useStore(s => s.selectedWorkshopId)
  const recordedActions = useStore(s => s.recordedActions)

  const workshop = workshops.find(w => w.id === selectedWorkshopId)

  const [steps, setSteps] = useState<TaskStep[]>([
    { id: 1, name: '确认作业许可', description: '与监护人核对作业票证内容，确认作业范围和安全措施', role: 'both', completed: false, correctOrder: 1 },
    { id: 2, name: '安全技术交底', description: '班长对操作步骤、风险点、应急措施进行交底', role: 'supervisor', completed: false, correctOrder: 2 },
    { id: 3, name: '安全检查确认', description: '监护人检查设备状态、安全装置、防护用品', role: 'supervisor', completed: false, correctOrder: 3 },
    { id: 4, name: '执行设备操作', description: '操作员按照规程进行设备操作，监护人全程监护', role: 'operator', completed: false, correctOrder: 4 },
    { id: 5, name: '操作过程确认', description: '每完成一步操作，双方确认状态正常后继续', role: 'both', completed: false, correctOrder: 5 },
    { id: 6, name: '作业完成收尾', description: '关闭设备，清理现场，双方签字确认', role: 'both', completed: false, correctOrder: 6 }
  ])

  const [currentStep, setCurrentStep] = useState(0)
  const [showToast, setShowToast] = useState(false)
  const [toastMsg, setToastMsg] = useState('')
  const [toastType, setToastType] = useState<'success' | 'error' | 'warning' | 'info'>('info')
  const [showTeamPanel, setShowTeamPanel] = useState(false)
  const [voiceMessages, setVoiceMessages] = useState<string[]>([])

  const showNotification = (msg: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    setToastMsg(msg)
    setToastType(type)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 2500)
  }

  useEffect(() => {
    const messages = [
      '李师傅：现场安全措施已确认，可以开始作业',
      '王班长：请严格按照操作步骤执行，不要跳步',
      '李师傅：设备状态正常，监护到位',
      '王班长：操作正确，继续下一步',
      '李师傅：注意观察设备仪表参数',
      '王班长：作业完成，请做好收尾工作'
    ]
    if (currentStep < messages.length) {
      const timer = setTimeout(() => {
        setVoiceMessages(prev => [...prev.slice(-3), messages[currentStep]])
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [currentStep])

  const handleCompleteStep = (stepId: number) => {
    const stepIndex = steps.findIndex(s => s.id === stepId)
    const step = steps[stepIndex]

    if (stepIndex !== currentStep) {
      recordAction({
        actionName: `操作顺序错误：${step?.name}`,
        isCorrect: false
      })
      showNotification('❌ 操作顺序错误！请按正确步骤执行', 'error')
      return
    }

    setSteps(prev => prev.map(s => s.id === stepId ? { ...s, completed: true } : s))

    recordAction({
      actionName: step.name,
      isCorrect: true,
      details: { step: step.correctOrder, role: step.role }
    })

    showNotification(`✅ 步骤 ${step.correctOrder} 完成：${step.name}`, 'success')

    setTimeout(() => {
      setCurrentStep(prev => prev + 1)
    }, 1000)
  }

  const handleFinish = () => {
    generateResult()
    setScene('results')
  }

  return (
    <div className="w-full h-full relative">
      <CollaborationScene3D
        steps={steps}
        currentStep={currentStep}
        onCompleteStep={handleCompleteStep}
        onFinish={handleFinish}
      />

      <Header title={workshop ? `👥 ${workshop.name} - 协作演练` : '👥 协作演练'} showBack />

      <div className="absolute top-24 left-6 z-20 w-80 space-y-4">
        <div className="vr-panel p-5">
          <ProgressIndicator
            current={steps.filter(s => s.completed).length}
            total={steps.length}
            label="协作任务进度"
          />
        </div>

        <div className="vr-panel p-5 space-y-2">
          <h3 className="font-bold mb-3 flex items-center gap-2">
            <span>📋</span> 操作步骤
          </h3>
          {steps.map((step, idx) => (
            <div
              key={step.id}
              className={`p-3 rounded-lg flex items-start gap-3 ${
                step.completed
                  ? 'safety-success'
                  : idx === currentStep
                  ? 'bg-primary-500/20 border border-primary-500'
                  : 'bg-white/5 border border-white/10'
              }`}
            >
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                step.completed ? 'bg-safety-success' :
                idx === currentStep ? 'bg-vr-glow text-black animate-pulse' : 'bg-white/20'
              }`}>
                {step.completed ? '✓' : step.correctOrder}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm">{step.name}</div>
                <div className="text-xs text-white/50 mt-0.5">
                  {step.role === 'operator' ? '👤 你操作' : step.role === 'supervisor' ? '👥 队友执行' : '🤝 双方配合'}
                </div>
              </div>
              {step.completed && <StatusBadge status="success" text="完成" />}
            </div>
          ))}
        </div>
      </div>

      <div className="absolute top-24 right-6 z-20 w-72 space-y-4">
        <div className="vr-panel p-5">
          <h3 className="font-bold mb-3 flex items-center gap-2">
            <span>👥</span> 团队成员
          </h3>
          <div className="space-y-3">
            {teammates.map(teammate => (
              <div key={teammate.id} className="flex items-center gap-3 p-2 rounded-lg bg-white/5">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
                  style={{ backgroundColor: teammate.avatar.uniformColor }}
                >
                  👤
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">{teammate.name}</div>
                  <div className="text-xs text-white/50 truncate">{teammate.currentTask}</div>
                </div>
                <StatusBadge
                  status={teammate.status === 'speaking' ? 'success' : 'info'}
                  text={teammate.status === 'speaking' ? '通话中' : '在线'}
                />
              </div>
            ))}
          </div>
          <button
            onClick={() => setShowTeamPanel(true)}
            className="vr-button vr-button-secondary w-full mt-3 !py-2 text-sm"
          >
            📞 语音呼叫队友
          </button>
        </div>

        <div className="vr-panel p-5">
          <h3 className="font-bold mb-3 flex items-center gap-2">
            <span>💬</span> 语音通讯记录
          </h3>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {voiceMessages.length === 0 ? (
              <p className="text-white/40 text-xs">等待队友语音...</p>
            ) : (
              voiceMessages.map((msg, idx) => (
                <div key={idx} className="p-2 rounded bg-white/5 text-xs">
                  <span className="text-vr-glow">{msg.split('：')[0]}：</span>
                  <span className="text-white/80">{msg.split('：')[1]}</span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="vr-panel p-5">
          <h3 className="font-bold mb-2 flex items-center gap-2">
            <span>📝</span> 已记录操作
          </h3>
          <p className="text-2xl font-bold text-center text-vr-glow">{recordedActions.length}</p>
          <p className="text-xs text-white/50 text-center mt-1">条操作记录</p>
        </div>
      </div>

      <VoiceGuidePanel
        text={
          currentStep < steps.length
            ? `当前任务：${steps[currentStep]?.name}。请与队友语音配合，按照正确的顺序执行操作。`
            : '所有协作任务已完成！请点击完成按钮查看培训成绩。'
        }
      />

      {showToast && <Toast message={toastMsg} type={toastType} />}

      <Dialog
        isOpen={showTeamPanel}
        onClose={() => setShowTeamPanel(false)}
        title="📞 语音呼叫队友"
        footer={
          <button onClick={() => setShowTeamPanel(false)} className="vr-button">
            关闭
          </button>
        }
      >
        <div className="space-y-3">
          {teammates.map(teammate => (
            <div key={teammate.id} className="vr-card p-4 flex items-center gap-4">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center text-2xl"
                style={{ backgroundColor: teammate.avatar.uniformColor }}
              >
                👤
              </div>
              <div className="flex-1">
                <div className="font-bold text-lg">{teammate.name}</div>
                <div className="text-sm text-white/60">{teammate.currentTask}</div>
              </div>
              <button className="vr-button !py-2 !px-4">
                🎙 呼叫
              </button>
            </div>
          ))}
        </div>
      </Dialog>
    </div>
  )
}
