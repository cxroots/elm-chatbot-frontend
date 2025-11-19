import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { chatApi, ChatMessage, ChatResponse, Source } from '../api/chat'
import SourceCitation from './SourceCitation'

interface MessageWithMetadata extends ChatMessage {
  sources?: Source[]
  confidence?: number
}

export default function ChatWindow() {
  const navigate = useNavigate()
  const [messages, setMessages] = useState<MessageWithMetadata[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [conversationId, setConversationId] = useState<string | undefined>()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!inputMessage.trim() || isLoading) return

    const userMessage = inputMessage.trim()
    setInputMessage('')
    setError(null)

    // Add user message to UI immediately
    const newUserMessage: ChatMessage = {
      role: 'user',
      content: userMessage,
      timestamp: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, newUserMessage])
    setIsLoading(true)

    try {
      // Send to API
      const response: ChatResponse = await chatApi.sendMessage({
        message: userMessage,
        conversation_id: conversationId,
        user_id: 'demo_user',
      })

      // Update conversation ID
      if (!conversationId) {
        setConversationId(response.conversation_id)
      }

      // Add assistant response to UI with sources
      const assistantMessage: MessageWithMetadata = {
        role: 'assistant',
        content: response.response,
        timestamp: response.timestamp,
        sources: response.sources,
        confidence: response.confidence,
      }
      setMessages((prev) => [...prev, assistantMessage])
    } catch (err: any) {
      console.error('Chat error:', err)
      setError(err.response?.data?.detail || 'Failed to send message. Please try again.')

      // Remove the user message if API call failed
      setMessages((prev) => prev.slice(0, -1))
      setInputMessage(userMessage) // Restore the message
    } finally {
      setIsLoading(false)
    }
  }

  const handleNewConversation = () => {
    setMessages([])
    setConversationId(undefined)
    setError(null)
  }

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto p-4">
      {/* Header */}
      <div className="bg-white rounded-t-lg shadow-lg p-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">RAG Chatbot</h1>
          <p className="text-sm text-gray-500">
            {conversationId ? `Conversation: ${conversationId.slice(0, 8)}...` : 'Start a new conversation'}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => navigate('/data')}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Manage Data
          </button>
          <button
            onClick={handleNewConversation}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            New Chat
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 bg-white shadow-lg overflow-y-auto p-6 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 mt-20">
            <svg
              className="w-16 h-16 mx-auto mb-4 text-gray-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
              />
            </svg>
            <p className="text-lg">Start a conversation by typing a message below</p>
          </div>
        )}

        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[70%] rounded-lg p-4 ${
                message.role === 'user'
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              <p className="whitespace-pre-wrap">{message.content}</p>

              {/* Show sources for assistant messages */}
              {message.role === 'assistant' && message.sources && message.sources.length > 0 && (
                <SourceCitation sources={message.sources} confidence={message.confidence || 0} />
              )}

              {message.timestamp && (
                <p
                  className={`text-xs mt-2 ${
                    message.role === 'user' ? 'text-primary-100' : 'text-gray-500'
                  }`}
                >
                  {new Date(message.timestamp).toLocaleTimeString()}
                </p>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg p-4">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mx-0">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Input Area */}
      <div className="bg-white rounded-b-lg shadow-lg p-4">
        <form onSubmit={handleSendMessage} className="flex space-x-4">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!inputMessage.trim() || isLoading}
            className="px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Sending...' : 'Send'}
          </button>
        </form>
      </div>
    </div>
  )
}
