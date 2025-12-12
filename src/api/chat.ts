/**
 * Chat API client
 */

import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp?: string
  sources?: Source[]
  confidence?: number
}

export interface Source {
  title: string
  excerpt: string
  score: number
}

export interface ChatRequest {
  message: string
  conversation_id?: string
  user_id?: string
}

export interface ChatResponse {
  response: string
  conversation_id: string
  confidence: number
  sources: Source[]
  timestamp: string
}

export interface Document {
  id: string
  title: string
  text: string
  category: string
  metadata?: any
  created_at?: string
}

export interface DocumentsResponse {
  documents: Document[]
  total: number
}

export const chatApi = {
  /**
   * Send a chat message
   */
  async sendMessage(request: ChatRequest): Promise<ChatResponse> {
    const response = await axios.post<ChatResponse>(`${API_URL}/api/chat`, request)
    return response.data
  },

  /**
   * Get conversation history
   */
  async getConversation(conversationId: string): Promise<any> {
    const response = await axios.get(`${API_URL}/api/conversations/${conversationId}`)
    return response.data
  },

  /**
   * Delete a conversation
   */
  async deleteConversation(conversationId: string): Promise<void> {
    await axios.delete(`${API_URL}/api/conversations/${conversationId}`)
  },

  /**
   * Health check
   */
  async healthCheck(): Promise<any> {
    const response = await axios.get(`${API_URL}/health`)
    return response.data
  },

  /**
   * Get all documents
   */
  async getAllDocuments(): Promise<DocumentsResponse> {
    const response = await axios.get<DocumentsResponse>(`${API_URL}/api/documents`)
    return response.data
  },

  /**
   * Ingest documents
   */
  async ingestDocuments(documents: any[]): Promise<any> {
    const response = await axios.post(`${API_URL}/api/documents/ingest`, { documents })
    return response.data
  },

  /**
   * Delete a document
   */
  async deleteDocument(docId: string): Promise<any> {
    const response = await axios.delete(`${API_URL}/api/documents/${docId}`)
    return response.data
  },

  /**
   * Update a document
   */
  async updateDocument(docId: string, document: Partial<Document>): Promise<any> {
    const response = await axios.put(`${API_URL}/api/documents/${docId}`, document)
    return response.data
  },
}
