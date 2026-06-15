import { create } from 'zustand'
import type { SceneType, Avatar, ActionRecord, TrainingResult, ScoreBreakdown, UserRole, Teammate } from '../types'
import { sampleResults, safetyCards } from '../data/mockData'

interface UserState {
  role: UserRole
  userId: string
  userName: string
  avatar: Avatar
  setRole: (role: UserRole) => void
  setUserName: (name: string) => void
  setAvatar: (avatar: Avatar) => void
}

interface SceneState {
  currentScene: SceneType
  previousScene: SceneType | null
  selectedWorkshopId: string | null
  setScene: (scene: SceneType) => void
  setSelectedWorkshop: (id: string | null) => void
}

interface TrainingState {
  isTraining: boolean
  isPaused: boolean
  startTime: number | null
  currentStep: number
  totalSteps: number
  recordedActions: ActionRecord[]
  collectedGears: string[]
  identifiedHazards: string[]
  errorCount: number
  teammates: Teammate[]
  voiceGuideEnabled: boolean
  startTraining: (totalSteps: number) => void
  pauseTraining: () => void
  resumeTraining: () => void
  stopTraining: () => void
  recordAction: (action: Omit<ActionRecord, 'id' | 'timestamp'>) => void
  collectGear: (gearId: string) => void
  identifyHazard: (hazardId: string) => void
  incrementError: () => void
  setCurrentStep: (step: number) => void
  toggleVoiceGuide: () => void
  resetTraining: () => void
}

interface ResultState {
  currentResult: TrainingResult | null
  results: TrainingResult[]
  isPlayingBack: boolean
  playbackIndex: number
  setCurrentResult: (result: TrainingResult | null) => void
  addResult: (result: TrainingResult) => void
  generateResult: () => TrainingResult
  startPlayback: () => void
  stopPlayback: () => void
  setPlaybackIndex: (index: number) => void
}

interface CardState {
  unlockedCards: string[]
  isCardModalOpen: boolean
  selectedCardId: string | null
  unlockCard: (cardId: string) => void
  openCard: (cardId: string) => void
  closeCard: () => void
}

interface StoreState extends UserState, SceneState, TrainingState, ResultState, CardState {}

const defaultAvatar: Avatar = {
  id: 'default',
  name: '新员工',
  skinTone: '#f5d0a9',
  hairStyle: 'short',
  uniformColor: '#1890ff'
}

export const useStore = create<StoreState>((set, get) => ({
  role: 'trainee',
  userId: 'u1',
  userName: '',
  avatar: defaultAvatar,
  setRole: (role) => set({ role }),
  setUserName: (name) => set({ userName: name }),
  setAvatar: (avatar) => set({ avatar }),

  currentScene: 'lobby',
  previousScene: null,
  selectedWorkshopId: null,
  setScene: (scene) => set((state) => ({ previousScene: state.currentScene, currentScene: scene })),
  setSelectedWorkshop: (id) => set({ selectedWorkshopId: id }),

  isTraining: false,
  isPaused: false,
  startTime: null,
  currentStep: 0,
  totalSteps: 0,
  recordedActions: [],
  collectedGears: [],
  identifiedHazards: [],
  errorCount: 0,
  teammates: [
    {
      id: 'tm1',
      name: '李师傅',
      avatar: { ...defaultAvatar, id: 'tm1', name: '李师傅', uniformColor: '#52c41a' },
      status: 'ready',
      currentTask: '安全监护'
    },
    {
      id: 'tm2',
      name: '王班长',
      avatar: { ...defaultAvatar, id: 'tm2', name: '王班长', uniformColor: '#faad14' },
      status: 'ready',
      currentTask: '操作指导'
    }
  ],
  voiceGuideEnabled: true,
  startTraining: (totalSteps) => set({
    isTraining: true,
    isPaused: false,
    startTime: Date.now(),
    currentStep: 0,
    totalSteps,
    recordedActions: [],
    collectedGears: [],
    identifiedHazards: [],
    errorCount: 0
  }),
  pauseTraining: () => set({ isPaused: true }),
  resumeTraining: () => set({ isPaused: false }),
  stopTraining: () => set({ isTraining: false, isPaused: false }),
  recordAction: (action) => set((state) => ({
    recordedActions: [
      ...state.recordedActions,
      {
        ...action,
        id: `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now()
      }
    ]
  })),
  collectGear: (gearId) => set((state) => ({
    collectedGears: state.collectedGears.includes(gearId)
      ? state.collectedGears
      : [...state.collectedGears, gearId]
  })),
  identifyHazard: (hazardId) => set((state) => ({
    identifiedHazards: state.identifiedHazards.includes(hazardId)
      ? state.identifiedHazards
      : [...state.identifiedHazards, hazardId]
  })),
  incrementError: () => set((state) => ({ errorCount: state.errorCount + 1 })),
  setCurrentStep: (step) => set({ currentStep: step }),
  toggleVoiceGuide: () => set((state) => ({ voiceGuideEnabled: !state.voiceGuideEnabled })),
  resetTraining: () => set({
    isTraining: false,
    isPaused: false,
    startTime: null,
    currentStep: 0,
    totalSteps: 0,
    recordedActions: [],
    collectedGears: [],
    identifiedHazards: [],
    errorCount: 0
  }),

  currentResult: null,
  results: sampleResults,
  isPlayingBack: false,
  playbackIndex: 0,
  setCurrentResult: (result) => set({ currentResult: result }),
  addResult: (result) => set((state) => ({ results: [...state.results, result] })),
  generateResult: () => {
    const state = get()
    const { recordedActions, collectedGears, identifiedHazards, errorCount, startTime } = state

    const correctActions = recordedActions.filter(a => a.isCorrect).length
    const totalActions = recordedActions.length || 1
    const actionScore = Math.round((correctActions / totalActions) * 25)

    const gearScore = Math.round((collectedGears.length / 3) * 20)

    const hazardScore = Math.round((identifiedHazards.length / 3) * 25)

    const errorPenalty = Math.min(errorCount * 3, 15)
    const emergencyScore = Math.max(0, 20 - errorPenalty)

    const teamworkScore = 15

    const breakdown: ScoreBreakdown = {
      equipmentIdentification: gearScore,
      hazardRecognition: hazardScore,
      emergencyResponse: emergencyScore,      teamwork: teamworkScore,
      operationSequence: actionScore
    }

    const score = Object.values(breakdown).reduce((a, b) => a + b, 0)
    const maxScore = 100
    const passed = score >= 80
    const duration = startTime ? Math.round((Date.now() - startTime) / 1000) : 0

    const unlockedLevels: string[] = []
    if (score >= 85) unlockedLevels.push('w2', 'w3')
    if (score >= 90) unlockedLevels.push('w4', 'w5')

    const result: TrainingResult = {
      id: `result_${Date.now()}`,
      userId: state.userId,
      userName: state.userName || state.avatar.name,
      taskId: 't1',
      workshopId: state.selectedWorkshopId || 'w1',
      score,
      maxScore,
      breakdown,
      passed,
      duration,
      completedAt: new Date().toLocaleString('zh-CN'),
      actions: recordedActions,
      needsRetraining: !passed,
      unlockedLevels
    }

    set({ currentResult: result, results: [...state.results, result] })

    if (passed) {
      const cardsToUnlock = safetyCards.filter(c => !c.unlocked).slice(0, 2).map(c => c.id)
      set((s) => ({ unlockedCards: [...s.unlockedCards, ...cardsToUnlock] }))
    }

    return result
  },
  startPlayback: () => set({ isPlayingBack: true, playbackIndex: 0 }),
  stopPlayback: () => set({ isPlayingBack: false, playbackIndex: 0 }),
  setPlaybackIndex: (index) => set({ playbackIndex: index }),

  unlockedCards: safetyCards.filter(c => c.unlocked).map(c => c.id),
  isCardModalOpen: false,
  selectedCardId: null,
  unlockCard: (cardId) => set((state) => ({
    unlockedCards: state.unlockedCards.includes(cardId)
      ? state.unlockedCards
      : [...state.unlockedCards, cardId]
  })),
  openCard: (cardId) => set({ isCardModalOpen: true, selectedCardId: cardId }),
  closeCard: () => set({ isCardModalOpen: false, selectedCardId: null })
}))
