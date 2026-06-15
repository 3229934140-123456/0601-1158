export type SceneType = 'lobby' | 'station-select' | 'equipment' | 'accident' | 'collaboration' | 'playback' | 'results' | 'admin'

export type UserRole = 'trainee' | 'admin'

export interface Avatar {
  id: string
  name: string
  skinTone: string
  hairStyle: string
  uniformColor: string
}

export interface Workshop {
  id: string
  name: string
  description: string
  icon: string
  difficulty: 'easy' | 'medium' | 'hard'
  estimatedTime: number
}

export interface Equipment {
  id: string
  name: string
  type: 'machine' | 'tool' | 'safety'
  description: string
  warning: string
  position: [number, number, number]
  modelUrl?: string
}

export interface ProtectiveGear {
  id: string
  name: string
  type: 'helmet' | 'goggles' | 'gloves' | 'mask' | 'boots' | 'earmuffs'
  description: string
  position: [number, number, number]
  required: boolean
}

export interface HazardZone {
  id: string
  name: string
  type: 'electrical' | 'chemical' | 'mechanical' | 'fire' | 'fall'
  severity: 'low' | 'medium' | 'high'
  position: [number, number, number]
  radius: number
  description: string
}

export interface ActionRecord {
  id: string
  actionName: string
  timestamp: number
  isCorrect: boolean
  position?: [number, number, number]
  details?: Record<string, unknown>
}

export interface VoiceGuide {
  id: string
  text: string
  audioUrl?: string
  trigger: string
}

export interface TrainingTask {
  id: string
  title: string
  workshopId: string
  description: string
  scenarios: string[]
  duration: number
  passingScore: number
  deadline: string
  assignedUsers: string[]
  status: 'draft' | 'published' | 'completed'
}

export interface ScoreBreakdown {
  equipmentIdentification: number
  hazardRecognition: number
  emergencyResponse: number
  teamwork: number
  operationSequence: number
}

export interface TrainingResult {
  id: string
  userId: string
  userName: string
  taskId: string
  workshopId: string
  score: number
  maxScore: number
  breakdown: ScoreBreakdown
  passed: boolean
  duration: number
  completedAt: string
  actions: ActionRecord[]
  needsRetraining: boolean
  unlockedLevels: string[]
}

export interface SafetyCard {
  id: string
  title: string
  category: 'equipment' | 'hazard' | 'emergency' | 'regulation'
  content: string
  icon: string
  unlocked: boolean
}

export interface Teammate {
  id: string
  name: string
  avatar: Avatar
  status: 'ready' | 'speaking' | 'acting' | 'waiting'
  currentTask: string
}
