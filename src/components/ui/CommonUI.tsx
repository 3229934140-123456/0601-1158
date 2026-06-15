import React from 'react'
import { useStore } from '../../store'

interface HeaderProps {
  title: string
  showBack?: boolean
  onBack?: () => void
}

export function Header({ title, showBack = false, onBack }: HeaderProps) {
  const setScene = useStore(s => s.setScene)
  const userName = useStore(s => s.userName)
  const avatar = useStore(s => s.avatar)
  const voiceGuideEnabled = useStore(s => s.voiceGuideEnabled)
  const toggleVoiceGuide = useStore(s => s.toggleVoiceGuide)

  return (
    <div className="fixed top-0 left-0 right-0 z-50 px-6 py-4">
      <div className="vr-panel px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {showBack && (
            <button
              onClick={onBack || (() => setScene('lobby'))}
              className="vr-button-secondary vr-button !py-2 !px-4 text-sm"
            >
              ← 返回
            </button>
          )}
          <h1 className="text-2xl font-bold text-glow">{title}</h1>
        </div>

        <div className="flex items-center gap-6">
          <button
            onClick={toggleVoiceGuide}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${voiceGuideEnabled ? 'bg-safety-success/30 border border-safety-success' : 'bg-white/5 border border-white/20'}`}
          >
            <span className="text-xl">{voiceGuideEnabled ? '🔊' : '🔇'}</span>
            <span className="text-sm">语音指引</span>
          </button>

          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-xl"
              style={{ backgroundColor: avatar.uniformColor }}
            >
              👤
            </div>
            <span className="text-white font-medium">{userName || avatar.name}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

interface ProgressIndicatorProps {
  current: number
  total: number
  label?: string
}

export function ProgressIndicator({ current, total, label }: ProgressIndicatorProps) {
  const percentage = Math.round((current / total) * 100)

  return (
    <div className="vr-panel px-6 py-4 min-w-[300px]">
      {label && (
        <div className="flex justify-between mb-2">
          <span className="text-sm text-white/70">{label}</span>
          <span className="text-sm font-bold text-vr-glow">{current} / {total}</span>
        </div>
      )}
      <div className="progress-bar h-3">
        <div className="progress-bar-fill" style={{ width: `${percentage}%` }} />
      </div>
    </div>
  )
}

interface StatusBadgeProps {
  status: 'success' | 'warning' | 'danger' | 'info'
  text: string
}

export function StatusBadge({ status, text }: StatusBadgeProps) {
  const colors = {
    success: 'bg-safety-success/20 text-safety-success border-safety-success',
    warning: 'bg-safety-warning/20 text-safety-warning border-safety-warning',
    danger: 'bg-safety-danger/20 text-safety-danger border-safety-danger',
    info: 'bg-primary-500/20 text-primary-500 border-primary-500'
  }

  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${colors[status]}`}>
      {text}
    </span>
  )
}

interface DialogProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  footer?: React.ReactNode
}

export function Dialog({ isOpen, onClose, title, children, footer }: DialogProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60">
      <div className="vr-panel w-full max-w-xl p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-glow">{title}</h2>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white text-2xl leading-none"
          >
            ×
          </button>
        </div>
        <div className="mb-6">{children}</div>
        {footer && <div className="flex gap-4 justify-end">{footer}</div>}
      </div>
    </div>
  )
}

interface ToastProps {
  message: string
  type?: 'success' | 'error' | 'warning' | 'info'
  duration?: number
}

export function Toast({ message, type = 'info' }: ToastProps) {
  const colors = {
    success: 'border-safety-success bg-safety-success/20',
    error: 'border-safety-danger bg-safety-danger/20',
    warning: 'border-safety-warning bg-safety-warning/20',
    info: 'border-primary-500 bg-primary-500/20'
  }

  const icons = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️'
  }

  return (
    <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50">
      <div className={`vr-panel px-6 py-4 border-2 ${colors[type]} flex items-center gap-3 animate-float`}>
        <span className="text-2xl">{icons[type]}</span>
        <span className="text-white font-medium">{message}</span>
      </div>
    </div>
  )
}

interface VoiceGuidePanelProps {
  text: string
}

export function VoiceGuidePanel({ text }: VoiceGuidePanelProps) {
  const voiceGuideEnabled = useStore(s => s.voiceGuideEnabled)

  if (!voiceGuideEnabled || !text) return null

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40 max-w-3xl w-full mx-6">
      <div className="vr-panel px-8 py-5 flex items-start gap-4 glow-border">
        <div className="text-3xl animate-pulse">🤖</div>
        <div className="flex-1">
          <div className="text-vr-glow text-sm font-medium mb-1">语音指引</div>
          <p className="text-white text-lg">{text}</p>
        </div>
        <div className="flex gap-1">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="w-1 bg-vr-glow rounded-full animate-pulse"
              style={{
                height: `${12 + i * 4}px`,
                animationDelay: `${i * 0.1}s`
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
