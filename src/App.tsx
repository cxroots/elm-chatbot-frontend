import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import ChatWindow from './components/ChatWindow'
import DataManagement from './components/DataManagement'
import './index.css'

function App() {
  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
              <ChatWindow />
            </div>
          }
        />
        <Route path="/data" element={<DataManagement />} />
      </Routes>
    </Router>
  )
}

export default App
