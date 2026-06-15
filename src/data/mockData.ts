import type { Workshop, Equipment, ProtectiveGear, HazardZone, SafetyCard, TrainingTask, TrainingResult } from '../types'

export const workshops: Workshop[] = [
  {
    id: 'w1',
    name: '机械加工车间',
    description: '学习车床、铣床、磨床等机械设备的安全操作规程',
    icon: '⚙️',
    difficulty: 'medium',
    estimatedTime: 20
  },
  {
    id: 'w2',
    name: '电气装配车间',
    description: '掌握高压设备操作、电路检修、触电急救等安全知识',
    icon: '⚡',
    difficulty: 'hard',
    estimatedTime: 25
  },
  {
    id: 'w3',
    name: '化工原料车间',
    description: '了解化学品存储、泄漏处理、防护用品使用等规范',
    icon: '🧪',
    difficulty: 'hard',
    estimatedTime: 30
  },
  {
    id: 'w4',
    name: '焊接作业区',
    description: '学习焊接安全防护、防火措施、有害气体防护等',
    icon: '🔥',
    difficulty: 'medium',
    estimatedTime: 20
  },
  {
    id: 'w5',
    name: '物流仓储区',
    description: '掌握叉车作业、货物堆放、消防设施使用等安全要点',
    icon: '📦',
    difficulty: 'easy',
    estimatedTime: 15
  }
]

export const equipments: Equipment[] = [
  {
    id: 'e1',
    name: 'CNC数控车床',
    type: 'machine',
    description: '高精度数控机床，用于复杂零件加工',
    warning: '开机前必须检查防护罩，运行中禁止打开防护门',
    position: [2, 0, -3]
  },
  {
    id: 'e2',
    name: '工业机器人',
    type: 'machine',
    description: '六轴焊接机器人，自动化生产主力设备',
    warning: '进入工作范围前必须按下急停按钮并挂牌',
    position: [-2, 0, -3]
  },
  {
    id: 'e3',
    name: '高压配电柜',
    type: 'machine',
    description: '380V主配电装置，控制车间动力电源',
    warning: '操作时必须穿戴绝缘用具，单人禁止作业',
    position: [0, 0, -5]
  },
  {
    id: 'e4',
    name: '化学品储存柜',
    type: 'machine',
    description: '防爆防腐化学品储存设备',
    warning: '开启前必须确认通风良好，分类存放不同化学品',
    position: [3, 0, 2]
  }
]

export const protectiveGears: ProtectiveGear[] = [
  {
    id: 'p1',
    name: '安全帽',
    type: 'helmet',
    description: '防止头部撞击伤害',
    position: [-1, 1.5, 1],
    required: true
  },
  {
    id: 'p2',
    name: '防护眼镜',
    type: 'goggles',
    description: '防止碎屑、液体飞溅伤害眼睛',
    position: [0, 1.5, 1],
    required: true
  },
  {
    id: 'p3',
    name: '防割手套',
    type: 'gloves',
    description: '防止金属切削和尖锐物划伤',
    position: [1, 1.5, 1],
    required: true
  },
  {
    id: 'p4',
    name: '防毒面具',
    type: 'mask',
    description: '防止有害气体和粉尘吸入',
    position: [2, 1.5, 1],
    required: false
  },
  {
    id: 'p5',
    name: '绝缘鞋',
    type: 'boots',
    description: '防止触电伤害',
    position: [-2, 1.5, 1],
    required: false
  },
  {
    id: 'p6',
    name: '隔音耳罩',
    type: 'earmuffs',
    description: '防止高分贝噪音听力损伤',
    position: [3, 1.5, 1],
    required: false
  }
]

export const hazardZones: HazardZone[] = [
  {
    id: 'h1',
    name: '高压危险区',
    type: 'electrical',
    severity: 'high',
    position: [0, 0, -5],
    radius: 2,
    description: '高压配电设备，非授权人员禁止靠近'
  },
  {
    id: 'h2',
    name: '机械旋转区',
    type: 'mechanical',
    severity: 'high',
    position: [2, 0, -3],
    radius: 2.5,
    description: '车床旋转部件，禁止穿戴手套和宽松衣物靠近'
  },
  {
    id: 'h3',
    name: '化学品泄漏点',
    type: 'chemical',
    severity: 'medium',
    position: [3, 0, 2],
    radius: 3,
    description: '腐蚀性化学品储存区，泄漏时需立即疏散'
  },
  {
    id: 'h4',
    name: '高空作业区',
    type: 'fall',
    severity: 'medium',
    position: [-3, 0, 0],
    radius: 2,
    description: '2米以上作业必须系挂安全带'
  },
  {
    id: 'h5',
    name: '易燃易爆区',
    type: 'fire',
    severity: 'high',
    position: [0, 0, 3],
    radius: 4,
    description: '焊接作业区，禁止携带明火和使用非防爆电器'
  }
]

export const safetyCards: SafetyCard[] = [
  {
    id: 'c1',
    title: '三不伤害原则',
    category: 'regulation',
    content: '不伤害自己、不伤害他人、不被他人伤害。这是安全生产的基本原则，每位员工必须牢记在心。',
    icon: '🛡️',
    unlocked: true
  },
  {
    id: 'c2',
    title: '触电急救方法',
    category: 'emergency',
    content: '1.立即切断电源或用绝缘物使触电者脱离电源；2.判断意识和呼吸；3.进行心肺复苏；4.拨打急救电话。',
    icon: '⚡',
    unlocked: true
  },
  {
    id: 'c3',
    title: '灭火器使用步骤',
    category: 'equipment',
    content: '提（提起灭火器）→ 拔（拔掉保险销）→ 瞄（对准火源根部）→ 压（压下压把喷射）。',
    icon: '🧯',
    unlocked: true
  },
  {
    id: 'c4',
    title: '化学品泄漏处理',
    category: 'hazard',
    content: '1.立即停止作业；2.穿戴适当防护用品；3.控制泄漏源；4.用吸附材料处理；5.按规定处置废弃物。',
    icon: '☣️',
    unlocked: false
  },
  {
    id: 'c5',
    title: '机械安全防护',
    category: 'equipment',
    content: '设备运转时严禁拆除安全防护罩；严禁用手清理铁屑；两人以上操作必须有主有从，统一指挥。',
    icon: '⚙️',
    unlocked: false
  },
  {
    id: 'c6',
    title: '高处作业安全',
    category: 'hazard',
    content: '凡在坠落高度基准面2米以上（含2米）有可能坠落的高处进行作业，均称为高处作业，必须系好安全带。',
    icon: '⚠️',
    unlocked: false
  }
]

export const sampleTasks: TrainingTask[] = [
  {
    id: 't1',
    title: '新员工入职安全培训',
    workshopId: 'w1',
    description: '完成机械加工车间基础安全知识学习和模拟演练',
    scenarios: ['equipment', 'accident'],
    duration: 30,
    passingScore: 80,
    deadline: '2026-07-01',
    assignedUsers: ['u1', 'u2', 'u3'],
    status: 'published'
  },
  {
    id: 't2',
    title: '电气安全专项培训',
    workshopId: 'w2',
    description: '高压设备操作安全和触电应急处理',
    scenarios: ['equipment', 'accident', 'collaboration'],
    duration: 45,
    passingScore: 90,
    deadline: '2026-06-30',
    assignedUsers: ['u1'],
    status: 'published'
  }
]

export const sampleResults: TrainingResult[] = [
  {
    id: 'r1',
    userId: 'u1',
    userName: '张三',
    taskId: 't1',
    workshopId: 'w1',
    score: 85,
    maxScore: 100,
    breakdown: {
      equipmentIdentification: 18,
      hazardRecognition: 20,
      emergencyResponse: 17,
      teamwork: 15,
      operationSequence: 15
    },
    passed: true,
    duration: 1420,
    completedAt: '2026-06-14 14:30:00',
    actions: [],
    needsRetraining: false,
    unlockedLevels: ['w2', 'w3']
  },
  {
    id: 'r2',
    userId: 'u2',
    userName: '李四',
    taskId: 't1',
    workshopId: 'w1',
    score: 72,
    maxScore: 100,
    breakdown: {
      equipmentIdentification: 15,
      hazardRecognition: 14,
      emergencyResponse: 14,
      teamwork: 15,
      operationSequence: 14
    },
    passed: false,
    duration: 1680,
    completedAt: '2026-06-13 10:15:00',
    actions: [],
    needsRetraining: true,
    unlockedLevels: []
  },
  {
    id: 'r3',
    userId: 'u3',
    userName: '王五',
    taskId: 't1',
    workshopId: 'w1',
    score: 92,
    maxScore: 100,
    breakdown: {
      equipmentIdentification: 20,
      hazardRecognition: 20,
      emergencyResponse: 18,
      teamwork: 17,
      operationSequence: 17
    },
    passed: true,
    duration: 1250,
    completedAt: '2026-06-12 16:45:00',
    actions: [],
    needsRetraining: false,
    unlockedLevels: ['w2', 'w3', 'w4']
  }
]

export const voiceGuides = [
  { id: 'v1', text: '欢迎来到VR安全培训中心，请先创建您的虚拟身份。', trigger: 'lobby_start' },
  { id: 'v2', text: '请选择您要进行培训的车间区域。', trigger: 'station_select' },
  { id: 'v3', text: '在开始作业前，请先正确穿戴个人防护用品。', trigger: 'gear_start' },
  { id: 'v4', text: '请靠近设备查看详细的安全操作说明。', trigger: 'equipment_view' },
  { id: 'v5', text: '警告！您已进入危险区域，请立即撤离！', trigger: 'hazard_enter' },
  { id: 'v6', text: '发生紧急情况，请立即按下紧急停止按钮！', trigger: 'emergency' },
  { id: 'v7', text: '检测到化学品泄漏，请佩戴防毒面具并启动应急预案。', trigger: 'leak' },
  { id: 'v8', text: '请与队友配合完成断电操作，一人操作一人监护。', trigger: 'collab_start' },
  { id: 'v9', text: '操作有误，请回顾正确步骤后重新尝试。', trigger: 'wrong_action' },
  { id: 'v10', text: '恭喜完成培训！正在生成您的成绩报告。', trigger: 'training_complete' }
]
