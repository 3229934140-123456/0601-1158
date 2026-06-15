import React, { useState, useEffect } from 'react'
import { useStore } from '../../store'
import { sampleResults, sampleTasks, workshops } from '../../data/mockData'
import type { TrainingTask } from '../../types'
import { Header, StatusBadge, VoiceGuidePanel, Dialog, ProgressIndicator } from '../ui/CommonUI'
import { SafetyCardViewer } from '../ui/SafetyCards'

function ScoreRing({ score, size = 180 }: { score: number; size?: number }) {
  const strokeWidth = 16
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (score / 100) * circumference
  const color = score >= 90 ? '#52c41a' : score >= 80 ? '#13c2c2' : score >= 60 ? '#faad14' : '#ff4d4f'

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-5xl font-bold" style={{ color }}>{score}</span>
        <span className="text-white/50 text-sm">分</span>
      </div>
    </div>
  )
}

function PlaybackTimeline({ actions, currentIndex, onSelect }: {
  actions: { id: string; actionName: string; timestamp: number; isCorrect: boolean }[]
  currentIndex: number
  onSelect: (index: number) => void
}) {
  const [progress, setProgress] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>
    if (isPlaying && currentIndex < actions.length - 1) {
      interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            onSelect(Math.min(currentIndex + 1, actions.length - 1))
            return 0
          }
          return prev + 2
        })
      }, 50)
    }
    return () => clearInterval(interval)
  }, [isPlaying, currentIndex, actions.length, onSelect])

  return (
    <div className="vr-panel p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold flex items-center gap-2">
          <span>🎬</span> 操作回放时间线
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => { setIsPlaying(!isPlaying) }}
            className="vr-button !py-2 !px-4 text-sm"
          >
            {isPlaying ? '⏸ 暂停' : '▶ 播放'}
          </button>
          <button
            onClick={() => { onSelect(0); setProgress(0); setIsPlaying(false) }}
            className="vr-button vr-button-secondary !py-2 !px-4 text-sm"
          >
            ⏮ 重置
          </button>
        </div>
      </div>

      <div className="progress-bar h-3 mb-4">
        <div
          className="progress-bar-fill"
          style={{ width: `${((currentIndex + progress / 100) / actions.length) * 100}%` }}
        />
      </div>

      <div className="relative flex justify-between items-center">
        {actions.map((action, idx) => (
          <div key={action.id} className="relative flex flex-col items-center" style={{ flex: 1 }}>
            <button
              onClick={() => { onSelect(idx); setProgress(0); setIsPlaying(false) }}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold z-10 transition-all ${
                idx < currentIndex
                  ? action.isCorrect ? 'bg-safety-success text-white' : 'bg-safety-danger text-white'
                  : idx === currentIndex
                  ? 'bg-vr-glow text-black scale-125 ring-4 ring-vr-glow/30'
                  : 'bg-white/10 text-white/40'
              }`}
            >
              {idx + 1}
            </button>
            <div className={`mt-2 text-xs text-center max-w-[80px] truncate ${
              idx <= currentIndex ? 'text-white' : 'text-white/40'
            }`}>
              {action.actionName.slice(0, 8)}
            </div>
          </div>
        ))}
        <div className="absolute top-4 left-0 right-0 h-0.5 bg-white/10 -z-0" />
      </div>
    </div>
  )
}

export default function Results() {
  const currentResult = useStore(s => s.currentResult)
  const results = useStore(s => s.results)
  const setScene = useStore(s => s.setScene)
  const resetTraining = useStore(s => s.resetTraining)
  const setSelectedWorkshop = useStore(s => s.setSelectedWorkshop)
  const startTraining = useStore(s => s.startTraining)
  const isPlayingBack = useStore(s => s.isPlayingBack)
  const playbackIndex = useStore(s => s.playbackIndex)
  const startPlayback = useStore(s => s.startPlayback)
  const stopPlayback = useStore(s => s.stopPlayback)
  const setPlaybackIndex = useStore(s => s.setPlaybackIndex)
  const selectedTaskId = useStore(s => s.selectedTaskId)
  const setSelectedTask = useStore(s => s.setSelectedTask)

  const allResults = currentResult ? [currentResult, ...results.filter(r => r.id !== currentResult.id)] : results

  const filteredResults = selectedTaskId
    ? allResults.filter(r => r.taskId === selectedTaskId)
    : allResults

  const [selectedResult, setSelectedResult] = useState(filteredResults[0] || currentResult || results[0])
  const [showPlayback, setShowPlayback] = useState(false)
  const [showRetrainConfirm, setShowRetrainConfirm] = useState(false)

  const displayResult = selectedResult || currentResult || (filteredResults[0] ?? results[0])

  const taskName = selectedTaskId
    ? (sampleTasks.find(t => t.id === selectedTaskId)?.title || `任务 ${selectedTaskId}`)
    : null

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}分${secs}秒`
  }

  const handleRetrain = () => {
    resetTraining()
    setSelectedWorkshop(displayResult.workshopId)
    startTraining(10)
    setShowRetrainConfirm(false)
    setScene('equipment')
  }

  const breakdownItems = [
    { key: 'equipmentIdentification', label: '设备认知', icon: '🛠', maxScore: 20 },
    { key: 'hazardRecognition', label: '危险识别', icon: '⚠️', maxScore: 25 },
    { key: 'emergencyResponse', label: '应急响应', icon: '🚨', maxScore: 20 },
    { key: 'teamwork', label: '团队协作', icon: '👥', maxScore: 15 },
    { key: 'operationSequence', label: '操作规范', icon: '📋', maxScore: 20 }
  ] as const

  const allActions = displayResult?.actions.length > 0
    ? displayResult.actions
    : [
        { id: 'a1', actionName: '佩戴安全帽', timestamp: 0, isCorrect: true },
        { id: 'a2', actionName: '佩戴防护眼镜', timestamp: 1, isCorrect: true },
        { id: 'a3', actionName: '查看CNC车床', timestamp: 2, isCorrect: true },
        { id: 'a4', actionName: '识别高压危险区', timestamp: 3, isCorrect: true },
        { id: 'a5', actionName: '切断主电源', timestamp: 4, isCorrect: true },
        { id: 'a6', actionName: '启动泄漏预案', timestamp: 5, isCorrect: true },
        { id: 'a7', actionName: '确认作业许可', timestamp: 6, isCorrect: true },
        { id: 'a8', actionName: '完成作业收尾', timestamp: 7, isCorrect: true }
      ]

  return (
    <div className="w-full h-full relative overflow-y-auto bg-vr-dark">
      <Header title="🏆 培训成绩与考核回放" showBack />

      <div className="pt-24 pb-12 px-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="vr-panel p-6">
            {taskName && (
              <div className="mb-4 flex items-center gap-3 p-3 rounded-lg bg-primary-500/10 border border-primary-500/30">
                <span className="text-lg">📋</span>
                <div className="flex-1">
                  <span className="text-white/60 text-sm">当前筛选任务：</span>
                  <span className="font-bold text-vr-glow ml-2">{taskName}</span>
                </div>
                <button
                  onClick={() => setSelectedTask(null)}
                  className="text-sm text-safety-danger hover:underline"
                >
                  清除筛选
                </button>
              </div>
            )}

            <div className="flex gap-2 overflow-x-auto pb-2">
              {filteredResults.length > 0 ? (
                filteredResults.map(result => (
                  <button
                    key={result.id}
                    onClick={() => setSelectedResult(result)}
                    className={`px-5 py-3 rounded-lg whitespace-nowrap transition-all ${
                      displayResult?.id === result.id
                        ? 'bg-vr-glow/20 border-2 border-vr-glow'
                        : 'bg-white/5 border border-white/10 hover:border-white/30'
                    }`}
                  >
                    <div className="font-medium">{result.userName}</div>
                    <div className="text-xs text-white/50">{result.completedAt}</div>
                  </button>
                ))
              ) : (
                <div className="py-8 text-center w-full text-white/50">
                  <div className="text-3xl mb-2">📭</div>
                  <p>该任务暂无成绩记录</p>
                </div>
              )}
            </div>
          </div>

          {displayResult && (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="vr-panel p-8 flex flex-col items-center justify-center">
                  <h2 className="text-xl font-bold mb-6 text-vr-glow">综合评分</h2>
                  <ScoreRing score={displayResult.score} size={200} />
                  <div className="mt-6">
                    {displayResult.passed ? (
                      <StatusBadge status="success" text="✅ 考核通过" />
                    ) : (
                      <StatusBadge status="danger" text="❌ 未通过，需复训" />
                    )}
                  </div>
                  <p className="text-white/50 mt-3 text-sm">
                    完成时间：{formatDuration(displayResult.duration)}
                  </p>
                </div>

                <div className="vr-panel p-6 col-span-2">
                  <h2 className="text-xl font-bold mb-6 text-vr-glow">📊 分项得分</h2>
                  <div className="space-y-5">
                    {breakdownItems.map(item => {
                      const score = displayResult.breakdown[item.key] || 0
                      const percentage = Math.round((score / item.maxScore) * 100)
                      return (
                        <div key={item.key}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="flex items-center gap-2">
                              <span className="text-xl">{item.icon}</span>
                              <span className="font-medium">{item.label}</span>
                            </span>
                            <span className="font-bold text-vr-glow">
                              {score} / {item.maxScore}
                            </span>
                          </div>
                          <div className="progress-bar h-3">
                            <div
                              className={`progress-bar-fill ${percentage < 60 ? 'warning-bar' : ''}`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>

              <PlaybackTimeline
                actions={allActions}
                currentIndex={playbackIndex}
                onSelect={(idx) => setPlaybackIndex(idx)}
              />

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="vr-panel p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-lg flex items-center gap-2">
                      <span>🎬</span> 操作动作回放
                    </h3>
                    <button
                      onClick={() => setShowPlayback(true)}
                      className="vr-button !py-2 !px-4 text-sm"
                    >
                      查看详情
                    </button>
                  </div>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {allActions.map((action, idx) => (
                      <div
                        key={action.id}
                        className={`p-3 rounded-lg flex items-center gap-3 ${
                          idx === playbackIndex
                            ? 'bg-vr-glow/20 border border-vr-glow'
                            : action.isCorrect
                            ? 'bg-white/5'
                            : 'bg-safety-danger/10 border border-safety-danger/30'
                        }`}
                      >
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          action.isCorrect ? 'bg-safety-success' : 'bg-safety-danger'
                        }`}>
                          {action.isCorrect ? '✓' : '✗'}
                        </span>
                        <span className="text-sm">{idx + 1}. {action.actionName}</span>
                        <span className="ml-auto text-xs text-white/50">
                          {action.isCorrect ? '+分' : '错误'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="vr-panel p-6">
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <span>📋</span> 培训报告摘要
                  </h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-lg bg-white/5">
                        <div className="text-sm text-white/60">培训车间</div>
                        <div className="font-bold text-lg">
                          {workshops.find(w => w.id === displayResult.workshopId)?.name || '未知车间'}
                        </div>
                      </div>
                      <div className="p-4 rounded-lg bg-white/5">
                        <div className="text-sm text-white/60">完成时间</div>
                        <div className="font-bold text-lg">{formatDuration(displayResult.duration)}</div>
                      </div>
                      <div className="p-4 rounded-lg bg-white/5">
                        <div className="text-sm text-white/60">总操作数</div>
                        <div className="font-bold text-lg">{allActions.length} 项</div>
                      </div>
                      <div className="p-4 rounded-lg bg-white/5">
                        <div className="text-sm text-white/60">正确率</div>
                        <div className="font-bold text-lg text-safety-success">
                          {Math.round((allActions.filter(a => a.isCorrect).length / allActions.length) * 100)}%
                        </div>
                      </div>
                    </div>

                    {displayResult.unlockedLevels.length > 0 && (
                      <div className="p-4 rounded-lg safety-success">
                        <div className="font-bold mb-2">🎉 已解锁新关卡</div>
                        <div className="flex flex-wrap gap-2">
                          {displayResult.unlockedLevels.map(levelId => {
                            const w = workshops.find(w => w.id === levelId)
                            return w ? (
                              <span key={levelId} className="px-3 py-1 rounded-full bg-safety-success/20 text-sm">
                                {w.icon} {w.name}
                              </span>
                            ) : null
                          })}
                        </div>
                      </div>
                    )}

                    {displayResult.needsRetraining && (
                      <div className="p-4 rounded-lg safety-warning">
                        <div className="font-bold mb-2">⚠️ 需要复训</div>
                        <p className="text-sm">您的考核成绩未达到合格标准，请重新参加培训。</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 justify-center">
                {displayResult.needsRetraining && (
                  <button
                    onClick={() => setShowRetrainConfirm(true)}
                    className="vr-button !px-8 !py-4 text-lg"
                  >
                    🔄 重新培训
                  </button>
                )}
                <button
                  onClick={() => { resetTraining(); setScene('station-select') }}
                  className="vr-button vr-button-secondary !px-8 !py-4 text-lg"
                >
                  🏭 选择其他车间
                </button>
                <button
                  onClick={() => setScene('lobby')}
                  className="vr-button vr-button-secondary !px-8 !py-4 text-lg"
                >
                  🏠 返回大厅
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <VoiceGuidePanel
        text={
          displayResult?.passed
            ? `恭喜您以${displayResult.score}分通过考核！您已解锁更多培训内容，继续加油！`
            : `本次考核成绩为${displayResult?.score || 0}分，未达到合格标准。建议重新学习后再次参加培训。`
        }
      />

      <Dialog
        isOpen={showPlayback}
        onClose={() => setShowPlayback(false)}
        title="🎬 操作回放详情"
        footer={
          <button onClick={() => setShowPlayback(false)} className="vr-button">
            关闭
          </button>
        }
      >
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {allActions.map((action, idx) => (
            <div
              key={action.id}
              className={`p-4 rounded-lg border ${
                action.isCorrect
                  ? 'bg-safety-success/10 border-safety-success/30'
                  : 'bg-safety-danger/10 border-safety-danger/30'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold">
                  步骤 {idx + 1}: {action.actionName}
                </span>
                <StatusBadge
                  status={action.isCorrect ? 'success' : 'danger'}
                  text={action.isCorrect ? '正确' : '错误'}
                />
              </div>
              {!action.isCorrect && (
                <p className="text-sm text-safety-danger mt-2">
                  💡 提示：请回顾该步骤的正确操作流程
                </p>
              )}
            </div>
          ))}
        </div>
      </Dialog>

      <Dialog
        isOpen={showRetrainConfirm}
        onClose={() => setShowRetrainConfirm(false)}
        title="🔄 重新培训确认"
        footer={
          <>
            <button
              onClick={() => setShowRetrainConfirm(false)}
              className="vr-button vr-button-secondary"
            >
              取消
            </button>
            <button onClick={handleRetrain} className="vr-button">
              确认重新培训
            </button>
          </>
        }
      >
        <p className="text-white/80">
          系统将重置您本次培训的所有进度，重新开始
          <strong className="text-vr-glow mx-1">
            {workshops.find(w => w.id === displayResult?.workshopId)?.name}
          </strong>
          的安全培训。是否继续？
        </p>
      </Dialog>

      <SafetyCardViewer />
    </div>
  )
}
