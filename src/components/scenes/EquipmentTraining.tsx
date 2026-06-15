import React, { useState } from 'react'
import { useStore } from '../../store'
import { equipments, protectiveGears, workshops } from '../../data/mockData'
import { Header, ProgressIndicator, StatusBadge, VoiceGuidePanel, Toast } from '../ui/CommonUI'
import Scene3D from '../3d/Scene3D'
import { EquipmentModel, ProtectiveGearModel } from '../3d/EquipmentModels'
import { WarningZone, FloatingText, InteractiveButton } from '../3d/InteractiveElements'
import { hazardZones } from '../../data/mockData'

function EquipmentScene3D({ onNext, canProceed, step }: {
  onNext: () => void
  canProceed: boolean
  step: number
}) {
  return (
    <Scene3D cameraPosition={[0, 3, 10]}>
      <FloatingText position={[0, 5.5, -4]} text="设备认知与防护用品佩戴" color="#00d4ff" fontSize={24} />

      {equipments.map(equipment => (
        <EquipmentModel key={equipment.id} equipment={equipment} />
      ))}

      {protectiveGears.map(gear => (
        <ProtectiveGearModel key={gear.id} gear={gear} />
      ))}

      {hazardZones.slice(0, 3).map(hazard => (
        <WarningZone
          key={hazard.id}
          position={hazard.position}
          radius={hazard.radius}
          type={hazard.type}
        />
      ))}

      <InteractiveButton
        position={[0, 1.5, 6]}
        label={step < 2 ? "下一步 →" : "进入事故模拟 →"}
        icon="⚠️"
        color={canProceed ? "#faad14" : "#8c8c8c"}
        size={[2.5, 0.8, 0.2]}
        onClick={onNext}
      />
    </Scene3D>
  )
}

export default function EquipmentTraining() {
  const collectedGears = useStore(s => s.collectedGears)
  const identifiedHazards = useStore(s => s.identifiedHazards)
  const recordedActions = useStore(s => s.recordedActions)
  const selectedWorkshopId = useStore(s => s.selectedWorkshopId)
  const setScene = useStore(s => s.setScene)
  const setCurrentStep = useStore(s => s.setCurrentStep)
  const currentStep = useStore(s => s.currentStep)
  const [showToast, setShowToast] = useState(false)
  const [toastMsg, setToastMsg] = useState('')
  const [toastType, setToastType] = useState<'success' | 'error' | 'warning' | 'info'>('warning')

  const workshop = workshops.find(w => w.id === selectedWorkshopId)
  const requiredGears = protectiveGears.filter(g => g.required)
  const missingGears = requiredGears.filter(g => !collectedGears.includes(g.id))
  const allRequiredCollected = missingGears.length === 0

  const showNotification = (msg: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    setToastMsg(msg)
    setToastType(type)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3500)
  }

  const handleNext = () => {
    if (currentStep === 0 && !allRequiredCollected) {
      const missingNames = missingGears.map(g => g.name).join('、')
      showNotification(`⚠️ 还缺少必需防护用品：${missingNames}，请先佩戴后再继续`, 'warning')
      return
    }

    if (currentStep < 2) {
      setCurrentStep(currentStep + 1)
      if (currentStep === 0) {
        showNotification('✅ 防护用品已正确佩戴！现在请查看设备安全标牌', 'success')
      } else if (currentStep === 1) {
        showNotification('👍 设备认知完成！请识别场景中的危险区域', 'success')
      }
    } else {
      setScene('accident')
    }
  }

  const canProceedToNext = currentStep > 0 || allRequiredCollected

  const steps = [
    { id: 1, title: '防护用品佩戴', desc: '抓取并佩戴必需的个人防护用品' },
    { id: 2, title: '设备认知学习', desc: '点击设备查看安全操作说明' },
    { id: 3, title: '危险区域识别', desc: '识别场景中的危险区域' }
  ]

  return (
    <div className="w-full h-full relative">
      <EquipmentScene3D
        onNext={handleNext}
        canProceed={canProceedToNext}
        step={currentStep}
      />

      <Header title={workshop ? `🛠 ${workshop.name} - 设备认知培训` : '🛠 设备认知培训'} showBack />

      <div className="absolute top-24 left-6 z-20 w-80">
        <div className="vr-panel p-5 space-y-5">
          <ProgressIndicator
            current={currentStep + 1}
            total={3}
            label="培训进度"
          />

          <div className="space-y-2">
            {steps.map(step => (
              <div
                key={step.id}
                className={`p-3 rounded-lg flex items-start gap-3 ${
                  currentStep + 1 >= step.id
                    ? 'bg-primary-500/20 border border-primary-500'
                    : 'bg-white/5 border border-white/10'
                }`}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                  currentStep + 1 > step.id ? 'bg-safety-success' :
                  currentStep + 1 === step.id ? 'bg-vr-glow text-black' : 'bg-white/20'
                }`}>
                  {currentStep + 1 > step.id ? '✓' : step.id}
                </div>
                <div>
                  <div className="font-medium text-sm">{step.title}</div>
                  <div className="text-xs text-white/50">{step.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="absolute top-24 right-6 z-20 w-72 space-y-4">
        <div className="vr-panel p-5">
          <h3 className="font-bold mb-3 flex items-center gap-2">
            <span>🦺</span> 防护用品佩戴情况
          </h3>
          <div className="space-y-2">
            {protectiveGears.map(gear => {
              const collected = collectedGears.includes(gear.id)
              return (
                <div key={gear.id} className="flex items-center justify-between text-sm">
                  <span className={gear.required ? 'font-medium' : 'text-white/60'}>
                    {gear.required && '★ '}{gear.name}
                  </span>
                  {collected ? (
                    <StatusBadge status="success" text="已佩戴" />
                  ) : (
                    <StatusBadge status="warning" text="未佩戴" />
                  )}
                </div>
              )
            })}
          </div>
          {allRequiredCollected && (
            <div className="mt-4 p-3 rounded-lg safety-success text-sm">
              ✅ 所有必需防护用品已正确佩戴
            </div>
          )}
        </div>

        <div className="vr-panel p-5">
          <h3 className="font-bold mb-3 flex items-center gap-2">
            <span>📋</span> 已识别危险源
          </h3>
          <div className="text-sm text-white/70">
            {identifiedHazards.length > 0 ? (
              <div className="space-y-1">
                <p>已识别 <span className="text-safety-success font-bold">{identifiedHazards.length}</span> 个危险区域</p>
                <p className="text-xs text-white/50">点击地面上的危险区域标记来识别</p>
              </div>
            ) : (
              <p className="text-white/50 text-xs">请点击场景中闪烁的危险区域进行识别</p>
            )}
          </div>
        </div>

        <div className="vr-panel p-5">
          <h3 className="font-bold mb-3 flex items-center gap-2">
            <span>📝</span> 操作记录
          </h3>
          <div className="text-sm text-white/70">
            <p>已记录 <span className="text-vr-glow font-bold">{recordedActions.length}</span> 项操作</p>
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30">
        <button
          onClick={handleNext}
          className={`vr-button text-lg !px-12 !py-4 ${canProceedToNext ? 'animate-pulse-glow' : 'opacity-60'}`}
        >
          {currentStep < 2 ? '下一步 →' : '进入事故模拟 →'}
        </button>
        {!canProceedToNext && (
          <p className="text-center text-safety-warning text-sm mt-3">
            ⚠️ 请先佩戴所有必需防护用品
          </p>
        )}
      </div>

      <VoiceGuidePanel
        text={
          currentStep === 0
            ? '在开始作业前，请先正确佩戴个人防护用品。点击悬浮的防护用品进行抓取。必需用品会标有★标记。'
            : currentStep === 1
            ? '请点击周围的设备，查看详细的安全操作说明和警告事项。'
            : '请识别场景中的危险区域，点击地面上闪烁的危险区域标记进行识别。'
        }
      />

      {showToast && <Toast message={toastMsg} type={toastType} />}
    </div>
  )
}
