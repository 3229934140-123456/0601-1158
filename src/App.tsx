import React from 'react'
import { useStore } from './store'
import Lobby from './components/scenes/Lobby'
import StationSelect from './components/scenes/StationSelect'
import EquipmentTraining from './components/scenes/EquipmentTraining'
import AccidentSimulation from './components/scenes/AccidentSimulation'
import CollaborationTraining from './components/scenes/CollaborationTraining'
import Results from './components/scenes/Results'
import AdminPanel from './components/scenes/AdminPanel'

export default function App() {
  const currentScene = useStore(s => s.currentScene)
  const role = useStore(s => s.role)

  const renderScene = () => {
    switch (currentScene) {
      case 'lobby':
        return <Lobby />
      case 'station-select':
        return <StationSelect />
      case 'equipment':
        return <EquipmentTraining />
      case 'accident':
        return <AccidentSimulation />
      case 'collaboration':
        return <CollaborationTraining />
      case 'playback':
      case 'results':
        return <Results />
      case 'admin':
        return <AdminPanel />
      default:
        return <Lobby />
    }
  }

  return (
    <div className="w-full h-full bg-vr-dark">
      {renderScene()}
    </div>
  )
}
