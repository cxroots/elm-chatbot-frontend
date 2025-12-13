/**
 * Login Page Component
 * First page users see - provides access to FAQ management
 */

import { useState, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogIn, Database, MessageCircle, Sparkles, AlertCircle, Loader2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import faqIcon from '../assets/faq-icon.png'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      await login({ username, password })
      navigate('/data')
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.detail || 'Invalid credentials. Please try again.'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col">
      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Logo & Title */}
          <div className="text-center mb-8">
            <img
              src={faqIcon}
              alt="FAQ Manager"
              className="w-20 h-20 mx-auto mb-4 drop-shadow-lg"
            />
            <h1 className="text-3xl font-bold text-white mb-2">FAQ Manager</h1>
            <p className="text-slate-400">Intelligent FAQ Management System</p>
          </div>

          {/* Login Card */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 shadow-xl">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Error Message */}
              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Username Input */}
              <div>
                <label
                  htmlFor="username"
                  className="block text-sm font-medium text-slate-300 mb-2"
                >
                  Username
                </label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all"
                  placeholder="Enter your username"
                  required
                  disabled={isLoading}
                />
              </div>

              {/* Password Input */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-slate-300 mb-2"
                >
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all"
                  placeholder="Enter your password"
                  required
                  disabled={isLoading}
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading || !username || !password}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-medium rounded-xl hover:from-primary-600 hover:to-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-primary-500/25"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <LogIn className="w-5 h-5" />
                    Sign In
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Features Info */}
          <div className="mt-8 grid grid-cols-3 gap-4">
            <div className="text-center p-4 rounded-xl bg-slate-800/30 border border-slate-700/30">
              <Database className="w-6 h-6 text-primary-400 mx-auto mb-2" />
              <p className="text-xs text-slate-400">Manage FAQs</p>
            </div>
            <div className="text-center p-4 rounded-xl bg-slate-800/30 border border-slate-700/30">
              <MessageCircle className="w-6 h-6 text-primary-400 mx-auto mb-2" />
              <p className="text-xs text-slate-400">Test Chat</p>
            </div>
            <div className="text-center p-4 rounded-xl bg-slate-800/30 border border-slate-700/30">
              <Sparkles className="w-6 h-6 text-primary-400 mx-auto mb-2" />
              <p className="text-xs text-slate-400">AI Powered</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-4 text-center text-slate-500 text-sm">
        <p>FAQ Management System</p>
      </footer>
    </div>
  )
}
