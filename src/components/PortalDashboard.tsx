/**
 * Portal Dashboard Component
 * Main hub after login - displays available management tools as cards
 */

import { useNavigate } from 'react-router-dom'
import { LogOut, User } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import portalLogo from '../assets/portal-logo.png'
import faqIcon from '../assets/faq-icon-new.png'
import usageIcon from '../assets/usage-icon.png'

interface ToolCard {
  id: string
  title: string
  description: string
  icon: string
  path: string
  available: boolean
}

const tools: ToolCard[] = [
  {
    id: 'faq-manager',
    title: 'FAQ Manager',
    description: 'Manage frequently asked questions, categories, and test AI responses',
    icon: faqIcon,
    path: '/faq',
    available: true,
  },
  {
    id: 'usage-insights',
    title: 'Usage Insights',
    description: 'View usage statistics, analytics, and performance metrics',
    icon: usageIcon,
    path: '/usage',
    available: false, // Coming soon
  },
]

export default function PortalDashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const handleToolClick = (tool: ToolCard) => {
    if (tool.available) {
      navigate(tool.path)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700/50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <img src={portalLogo} alt="Management Portal" className="w-10 h-10" />
            <h1 className="text-xl font-bold text-white">Management Portal</h1>
          </div>

          {/* User Menu */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-slate-300">
              <User className="w-5 h-5" />
              <span className="text-sm">{user?.username}</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        {/* Welcome Section */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-3">Welcome back, {user?.username}!</h2>
          <p className="text-slate-400">Select a tool to get started</p>
        </div>

        {/* Tool Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool) => (
            <button
              key={tool.id}
              onClick={() => handleToolClick(tool)}
              disabled={!tool.available}
              className={`
                relative group p-6 rounded-2xl border text-left transition-all duration-300
                ${tool.available
                  ? 'bg-slate-800/50 border-slate-700/50 hover:bg-slate-800 hover:border-primary-500/50 hover:shadow-lg hover:shadow-primary-500/10 cursor-pointer'
                  : 'bg-slate-800/30 border-slate-700/30 cursor-not-allowed opacity-60'
                }
              `}
            >
              {/* Coming Soon Badge */}
              {!tool.available && (
                <span className="absolute top-4 right-4 px-2 py-1 text-xs font-medium bg-slate-700 text-slate-300 rounded-full">
                  Coming Soon
                </span>
              )}

              {/* Icon */}
              <div className="mb-4">
                <img
                  src={tool.icon}
                  alt={tool.title}
                  className={`w-16 h-16 ${tool.available ? 'group-hover:scale-110 transition-transform duration-300' : ''}`}
                />
              </div>

              {/* Title */}
              <h3 className={`text-xl font-semibold mb-2 ${tool.available ? 'text-white' : 'text-slate-400'}`}>
                {tool.title}
              </h3>

              {/* Description */}
              <p className="text-slate-400 text-sm leading-relaxed">
                {tool.description}
              </p>

              {/* Hover Arrow */}
              {tool.available && (
                <div className="mt-4 flex items-center text-primary-400 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>Open</span>
                  <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              )}
            </button>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 py-4 text-center text-slate-500 text-sm">
        <p>Management Portal</p>
      </footer>
    </div>
  )
}
