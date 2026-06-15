import React from 'react'
import { useStore } from '../../store'
import { safetyCards } from '../../data/mockData'
import { Dialog } from './CommonUI'

export function SafetyCardViewer() {
  const isCardModalOpen = useStore(s => s.isCardModalOpen)
  const selectedCardId = useStore(s => s.selectedCardId)
  const closeCard = useStore(s => s.closeCard)
  const unlockedCards = useStore(s => s.unlockedCards)

  const selectedCard = safetyCards.find(c => c.id === selectedCardId)

  const categoryColors = {
    equipment: 'from-primary-500 to-primary-700',
    hazard: 'from-safety-danger to-red-700',
    emergency: 'from-safety-warning to-orange-700',
    regulation: 'from-safety-success to-green-700'
  }

  const categoryLabels = {
    equipment: '设备安全',
    hazard: '危险识别',
    emergency: '应急处理',
    regulation: '安全规章'
  }

  return (
    <Dialog isOpen={isCardModalOpen} onClose={closeCard} title="安全知识卡">
      {selectedCard && (
        <div className="space-y-6">
          <div className={`p-6 rounded-xl bg-gradient-to-r ${categoryColors[selectedCard.category]} bg-opacity-30 border border-white/20`}>
            <div className="flex items-start gap-4">
              <div className="text-5xl">{selectedCard.icon}</div>
              <div className="flex-1">
                <div className="text-xs text-white/70 mb-1">{categoryLabels[selectedCard.category]}</div>
                <h3 className="text-2xl font-bold text-white">{selectedCard.title}</h3>
              </div>
              {!unlockedCards.includes(selectedCard.id) && (
                <span className="px-3 py-1 rounded-full bg-black/40 text-xs">🔒 未解锁</span>
              )}
            </div>
          </div>

          <div className="vr-panel p-6">
            <p className="text-white/90 text-lg leading-relaxed whitespace-pre-line">
              {unlockedCards.includes(selectedCard.id)
                ? selectedCard.content
                : '完成相关培训后即可解锁此安全知识卡内容。'}
            </p>
          </div>

          <div className="text-sm text-white/50 text-center">
            已解锁 {unlockedCards.length} / {safetyCards.length} 张知识卡
          </div>
        </div>
      )}
    </Dialog>
  )
}

export function SafetyCardList() {
  const openCard = useStore(s => s.openCard)
  const unlockedCards = useStore(s => s.unlockedCards)

  const categoryColors = {
    equipment: 'border-primary-500 bg-primary-500/10',
    hazard: 'border-safety-danger bg-safety-danger/10',
    emergency: 'border-safety-warning bg-safety-warning/10',
    regulation: 'border-safety-success bg-safety-success/10'
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {safetyCards.map(card => {
        const isUnlocked = unlockedCards.includes(card.id)
        return (
          <div
            key={card.id}
            onClick={() => isUnlocked && openCard(card.id)}
            className={`vr-card p-5 border-2 ${categoryColors[card.category]} ${isUnlocked ? 'cursor-pointer hover:scale-105' : 'opacity-50 cursor-not-allowed'}`}
          >
            <div className="flex items-start gap-3">
              <span className="text-3xl">{isUnlocked ? card.icon : '🔒'}</span>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-white truncate">{card.title}</h4>
                <p className="text-xs text-white/50 mt-1">
                  {isUnlocked ? '点击查看详情' : '完成培训解锁'}
                </p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
