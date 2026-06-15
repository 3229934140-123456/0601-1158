import React, { useState } from 'react'
import { useStore } from '../../store'
import { workshops, sampleTasks } from '../../data/mockData'
import { Header, StatusBadge, VoiceGuidePanel, Dialog } from '../ui/CommonUI'

interface TaskForm {
  title: string
  workshopId: string
  description: string
  duration: number
  passingScore: number
  deadline: string
}

export default function AdminPanel() {
  const setScene = useStore(s => s.setScene)
  const results = useStore(s => s.results)
  const setRole = useStore(s => s.setRole)

  const [activeTab, setActiveTab] = useState<'tasks' | 'results' | 'stats'>('tasks')
  const [showNewTaskModal, setShowNewTaskModal] = useState(false)
  const [tasks, setTasks] = useState(sampleTasks)
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)

  const [taskForm, setTaskForm] = useState<TaskForm>({
    title: '',
    workshopId: 'w1',
    description: '',
    duration: 30,
    passingScore: 80,
    deadline: '2026-07-01'
  })

  const handleCreateTask = () => {
    if (!taskForm.title.trim()) return

    const newTask = {
      id: `t_${Date.now()}`,
      ...taskForm,
      scenarios: ['equipment', 'accident', 'collaboration'],
      assignedUsers: [],
      status: 'published' as const
    }

    setTasks([newTask, ...tasks])
    setShowNewTaskModal(false)
    setTaskForm({
      title: '',
      workshopId: 'w1',
      description: '',
      duration: 30,
      passingScore: 80,
      deadline: '2026-07-01'
    })
  }

  const selectedTask = tasks.find(t => t.id === selectedTaskId)

  const taskResults = selectedTask
    ? results.filter(r => r.taskId === selectedTaskId)
    : results

  const passRate = taskResults.length > 0
    ? Math.round((taskResults.filter(r => r.passed).length / taskResults.length) * 100)
    : 0

  const avgScore = taskResults.length > 0
    ? Math.round(taskResults.reduce((sum, r) => sum + r.score, 0) / taskResults.length)
    : 0

  return (
    <div className="w-full h-full relative overflow-y-auto bg-vr-dark">
      <Header title="⚙️ 管理员控制台" showBack />

      <div className="pt-24 pb-12 px-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="vr-panel p-4 flex items-center justify-between">
            <div className="flex gap-2">
              {[
                { id: 'tasks', label: '📋 任务管理', icon: '📋' },
                { id: 'results', label: '📊 成绩查看', icon: '📊' },
                { id: 'stats', label: '📈 数据统计', icon: '📈' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`px-6 py-3 rounded-lg font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-vr-glow/20 border border-vr-glow text-vr-glow'
                      : 'bg-white/5 border border-white/10 hover:bg-white/10'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <StatusBadge status="success" text="管理员模式" />
              <button
                onClick={() => { setRole('trainee'); setScene('lobby') }}
                className="vr-button vr-button-secondary !py-2 !px-4 text-sm"
              >
                切换学员模式
              </button>
            </div>
          </div>

          {activeTab === 'tasks' && (
            <div className="space-y-6">
              <div className="vr-panel p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold">📋 培训任务列表</h2>
                  <button
                    onClick={() => setShowNewTaskModal(true)}
                    className="vr-button"
                  >
                    + 发布新任务
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left py-4 px-4 text-white/60 font-medium">任务名称</th>
                        <th className="text-left py-4 px-4 text-white/60 font-medium">所属车间</th>
                        <th className="text-left py-4 px-4 text-white/60 font-medium">时长</th>
                        <th className="text-left py-4 px-4 text-white/60 font-medium">及格分</th>
                        <th className="text-left py-4 px-4 text-white/60 font-medium">截止日期</th>
                        <th className="text-left py-4 px-4 text-white/60 font-medium">状态</th>
                        <th className="text-left py-4 px-4 text-white/60 font-medium">操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tasks.map(task => (
                        <tr
                          key={task.id}
                          className="border-b border-white/5 hover:bg-white/5 cursor-pointer"
                          onClick={() => { setSelectedTaskId(task.id); setActiveTab('results') }}
                        >
                          <td className="py-4 px-4 font-medium">{task.title}</td>
                          <td className="py-4 px-4">
                            {workshops.find(w => w.id === task.workshopId)?.icon}{' '}
                            {workshops.find(w => w.id === task.workshopId)?.name}
                          </td>
                          <td className="py-4 px-4">{task.duration} 分钟</td>
                          <td className="py-4 px-4">{task.passingScore} 分</td>
                          <td className="py-4 px-4">{task.deadline}</td>
                          <td className="py-4 px-4">
                            <StatusBadge
                              status={task.status === 'published' ? 'success' : task.status === 'completed' ? 'info' : 'warning'}
                              text={task.status === 'published' ? '已发布' : task.status === 'completed' ? '已完成' : '草稿'}
                            />
                          </td>
                          <td className="py-4 px-4">
                            <button className="text-primary-500 hover:underline text-sm mr-3">
                              编辑
                            </button>
                            <button className="text-safety-danger hover:underline text-sm">
                              删除
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'results' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="vr-panel p-5">
                  <div className="text-white/60 text-sm mb-2">总参考人数</div>
                  <div className="text-3xl font-bold text-vr-glow">{taskResults.length}</div>
                </div>
                <div className="vr-panel p-5">
                  <div className="text-white/60 text-sm mb-2">通过人数</div>
                  <div className="text-3xl font-bold text-safety-success">
                    {taskResults.filter(r => r.passed).length}
                  </div>
                </div>
                <div className="vr-panel p-5">
                  <div className="text-white/60 text-sm mb-2">通过率</div>
                  <div className="text-3xl font-bold" style={{ color: passRate >= 80 ? '#52c41a' : passRate >= 60 ? '#faad14' : '#ff4d4f' }}>
                    {passRate}%
                  </div>
                </div>
                <div className="vr-panel p-5">
                  <div className="text-white/60 text-sm mb-2">平均分数</div>
                  <div className="text-3xl font-bold text-vr-glow">{avgScore}</div>
                </div>
              </div>

              {selectedTask && (
                <div className="vr-panel p-4 flex items-center gap-4">
                  <span className="text-white/60">当前筛选：</span>
                  <StatusBadge status="info" text={selectedTask.title} />
                  <button
                    onClick={() => setSelectedTaskId(null)}
                    className="text-sm text-safety-danger hover:underline"
                  >
                    清除筛选
                  </button>
                </div>
              )}

              <div className="vr-panel p-6">
                <h2 className="text-xl font-bold mb-6">📊 学员成绩详情（批量查看）</h2>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left py-4 px-4 text-white/60 font-medium">学员姓名</th>
                        <th className="text-left py-4 px-4 text-white/60 font-medium">所属车间</th>
                        <th className="text-left py-4 px-4 text-white/60 font-medium">得分</th>
                        <th className="text-left py-4 px-4 text-white/60 font-medium">设备认知</th>
                        <th className="text-left py-4 px-4 text-white/60 font-medium">危险识别</th>
                        <th className="text-left py-4 px-4 text-white/60 font-medium">应急响应</th>
                        <th className="text-left py-4 px-4 text-white/60 font-medium">团队协作</th>
                        <th className="text-left py-4 px-4 text-white/60 font-medium">操作规范</th>
                        <th className="text-left py-4 px-4 text-white/60 font-medium">用时</th>
                        <th className="text-left py-4 px-4 text-white/60 font-medium">状态</th>
                        <th className="text-left py-4 px-4 text-white/60 font-medium">完成时间</th>
                      </tr>
                    </thead>
                    <tbody>
                      {taskResults.map(result => (
                        <tr
                          key={result.id}
                          className="border-b border-white/5 hover:bg-white/5"
                        >
                          <td className="py-4 px-4 font-medium">{result.userName}</td>
                          <td className="py-4 px-4">
                            {workshops.find(w => w.id === result.workshopId)?.icon}{' '}
                            {workshops.find(w => w.id === result.workshopId)?.name}
                          </td>
                          <td className="py-4 px-4">
                            <span className={`font-bold ${
                              result.score >= 90 ? 'text-safety-success' :
                              result.score >= 80 ? 'text-vr-glow' :
                              result.score >= 60 ? 'text-safety-warning' : 'text-safety-danger'
                            }`}>
                              {result.score}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-white/70">{result.breakdown.equipmentIdentification}/20</td>
                          <td className="py-4 px-4 text-white/70">{result.breakdown.hazardRecognition}/25</td>
                          <td className="py-4 px-4 text-white/70">{result.breakdown.emergencyResponse}/20</td>
                          <td className="py-4 px-4 text-white/70">{result.breakdown.teamwork}/15</td>
                          <td className="py-4 px-4 text-white/70">{result.breakdown.operationSequence}/20</td>
                          <td className="py-4 px-4 text-white/70">
                            {Math.floor(result.duration / 60)}分{result.duration % 60}秒
                          </td>
                          <td className="py-4 px-4">
                            {result.passed ? (
                              <StatusBadge status="success" text="✅ 通过" />
                            ) : (
                              <StatusBadge status="danger" text="❌ 需复训" />
                            )}
                          </td>
                          <td className="py-4 px-4 text-white/60 text-sm">{result.completedAt}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {taskResults.length === 0 && (
                  <div className="text-center py-12 text-white/50">
                    <div className="text-5xl mb-4">📭</div>
                    <p>暂无成绩数据</p>
                  </div>
                )}
              </div>

              <div className="vr-panel p-6">
                <h3 className="font-bold mb-4">📤 批量操作</h3>
                <div className="flex flex-wrap gap-4">
                  <button className="vr-button">📥 导出成绩报表 (Excel)</button>
                  <button className="vr-button vr-button-secondary">📧 发送成绩通知</button>
                  <button className="vr-button vr-button-secondary">🔄 批量分配复训</button>
                  <button className="vr-button vr-button-secondary">🏆 生成排行榜</button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'stats' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="vr-panel p-6">
                <h3 className="text-xl font-bold mb-6">🏭 各车间培训情况</h3>
                <div className="space-y-5">
                  {workshops.map(workshop => {
                    const wResults = results.filter(r => r.workshopId === workshop.id)
                    const count = wResults.length
                    const avg = count > 0 ? Math.round(wResults.reduce((s, r) => s + r.score, 0) / count) : 0
                    const passR = count > 0 ? Math.round((wResults.filter(r => r.passed).length / count) * 100) : 0

                    return (
                      <div key={workshop.id}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="flex items-center gap-2">
                            <span className="text-xl">{workshop.icon}</span>
                            <span className="font-medium">{workshop.name}</span>
                          </span>
                          <span className="text-sm text-white/60">{count}人参考 | 平均分{avg} | 通过率{passR}%</span>
                        </div>
                        <div className="progress-bar h-3">
                          <div
                            className="progress-bar-fill"
                            style={{ width: `${passR}%`, background: passR >= 80 ? 'linear-gradient(90deg, #52c41a, #13c2c2)' : passR >= 60 ? 'linear-gradient(90deg, #faad14, #ff4d4f)' : '#ff4d4f' }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="vr-panel p-6">
                <h3 className="text-xl font-bold mb-6">⚠️ 薄弱项分析</h3>
                <div className="space-y-4">
                  {[
                    { name: '应急响应能力', avg: results.length ? Math.round(results.reduce((s, r) => s + r.breakdown.emergencyResponse, 0) / results.length) : 0, total: 20 },
                    { name: '危险区域识别', avg: results.length ? Math.round(results.reduce((s, r) => s + r.breakdown.hazardRecognition, 0) / results.length) : 0, total: 25 },
                    { name: '设备安全操作', avg: results.length ? Math.round(results.reduce((s, r) => s + r.breakdown.equipmentIdentification, 0) / results.length) : 0, total: 20 },
                    { name: '团队协作配合', avg: results.length ? Math.round(results.reduce((s, r) => s + r.breakdown.teamwork, 0) / results.length) : 0, total: 15 },
                    { name: '操作流程规范', avg: results.length ? Math.round(results.reduce((s, r) => s + r.breakdown.operationSequence, 0) / results.length) : 0, total: 20 }
                  ].map(item => {
                    const pct = Math.round((item.avg / item.total) * 100)
                    return (
                      <div key={item.name} className={`p-4 rounded-lg ${pct < 70 ? 'safety-warning' : 'bg-white/5'}`}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">{item.name}</span>
                          <span className={`font-bold ${pct < 70 ? 'text-safety-warning' : 'text-safety-success'}`}>
                            {item.avg}/{item.total} ({pct}%)
                          </span>
                        </div>
                        {pct < 70 && <p className="text-xs text-safety-warning">⚠️ 建议加强此方面的培训</p>}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <VoiceGuidePanel text="欢迎使用管理员控制台。您可以在此发布培训任务、批量查看学员成绩、分析培训数据。" />

      <Dialog
        isOpen={showNewTaskModal}
        onClose={() => setShowNewTaskModal(false)}
        title="📝 发布新培训任务"
        footer={
          <>
            <button
              onClick={() => setShowNewTaskModal(false)}
              className="vr-button vr-button-secondary"
            >
              取消
            </button>
            <button
              onClick={handleCreateTask}
              disabled={!taskForm.title.trim()}
              className="vr-button disabled:opacity-50"
            >
              发布任务
            </button>
          </>
        }
      >
        <div className="space-y-5">
          <div>
            <label className="block text-white/80 mb-2">任务名称 *</label>
            <input
              type="text"
              value={taskForm.title}
              onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
              placeholder="请输入任务名称..."
              className="vr-input w-full"
            />
          </div>

          <div>
            <label className="block text-white/80 mb-2">培训车间</label>
            <select
              value={taskForm.workshopId}
              onChange={(e) => setTaskForm({ ...taskForm, workshopId: e.target.value })}
              className="vr-input w-full"
            >
              {workshops.map(w => (
                <option key={w.id} value={w.id}>{w.icon} {w.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-white/80 mb-2">任务描述</label>
            <textarea
              value={taskForm.description}
              onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
              placeholder="请输入任务描述..."
              rows={3}
              className="vr-input w-full resize-none"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-white/80 mb-2">培训时长 (分钟)</label>
              <input
                type="number"
                value={taskForm.duration}
                onChange={(e) => setTaskForm({ ...taskForm, duration: +e.target.value })}
                className="vr-input w-full"
                min={5}
                max={120}
              />
            </div>
            <div>
              <label className="block text-white/80 mb-2">及格分数</label>
              <input
                type="number"
                value={taskForm.passingScore}
                onChange={(e) => setTaskForm({ ...taskForm, passingScore: +e.target.value })}
                className="vr-input w-full"
                min={0}
                max={100}
              />
            </div>
            <div>
              <label className="block text-white/80 mb-2">截止日期</label>
              <input
                type="date"
                value={taskForm.deadline}
                onChange={(e) => setTaskForm({ ...taskForm, deadline: e.target.value })}
                className="vr-input w-full"
              />
            </div>
          </div>
        </div>
      </Dialog>
    </div>
  )
}
