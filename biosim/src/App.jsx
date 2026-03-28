import { useState } from 'react'
import { CURRICULUM, getUnitForChapter } from './data/curriculum'
import { TopBar, Sidebar, WelcomeScreen, ChapterView } from './components/layout'

export default function App() {
  const [activeChapter, setActiveChapter] = useState(null)

  const activeUnit = activeChapter
    ? getUnitForChapter(activeChapter.id)
    : null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <TopBar />

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <Sidebar
          curriculum={CURRICULUM}
          activeChapter={activeChapter}
          onSelect={setActiveChapter}
        />

        <main style={{
          flex: 1,
          overflowY: 'auto',
          maxHeight: 'calc(100vh - 60px)',
          background: 'var(--bg)',
        }}>
          {activeChapter ? (
            <ChapterView
              chapter={activeChapter}
              unitColor={activeUnit?.color || 'var(--cyan)'}
            />
          ) : (
            <WelcomeScreen
              curriculum={CURRICULUM}
              onSelect={setActiveChapter}
            />
          )}
        </main>
      </div>
    </div>
  )
}
