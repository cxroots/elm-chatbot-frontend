import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { chatApi, Document } from '../api/chat'

export default function DataManagement() {
  const navigate = useNavigate()
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(false)
  const [jsonInput, setJsonInput] = useState('')
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Load documents on component mount
  useEffect(() => {
    loadDocuments()
  }, [])

  const loadDocuments = async () => {
    try {
      setLoading(true)
      const response = await chatApi.getAllDocuments()
      setDocuments(response.documents)
    } catch (error) {
      console.error('Error loading documents:', error)
      setMessage({ type: 'error', text: 'Failed to load documents' })
    } finally {
      setLoading(false)
    }
  }

  const handleIngest = async () => {
    try {
      setLoading(true)
      setMessage(null)

      // Parse JSON
      const docs = JSON.parse(jsonInput)

      // Validate it's an array
      if (!Array.isArray(docs)) {
        throw new Error('JSON must be an array of documents')
      }

      // Ingest
      const result = await chatApi.ingestDocuments(docs)

      setMessage({
        type: 'success',
        text: `Successfully ingested ${result.total_documents} documents!`
      })

      // Clear input and reload
      setJsonInput('')
      await loadDocuments()
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.message || 'Failed to ingest documents'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (docId: string) => {
    if (!confirm(`Delete document ${docId}?`)) return

    try {
      setLoading(true)
      await chatApi.deleteDocument(docId)
      setMessage({ type: 'success', text: 'Document deleted' })
      await loadDocuments()
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to delete document' })
    } finally {
      setLoading(false)
    }
  }

  const loadSampleJSON = () => {
    const sample = [
      {
        "id": "faq_example_001",
        "title": "Example FAQ",
        "text": "This is an example FAQ document.",
        "category": "general",
        "metadata": {
          "tags": ["example", "test"]
        }
      }
    ]
    setJsonInput(JSON.stringify(sample, null, 2))
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Data Management</h1>
            <p className="text-gray-600">
              Manage your FAQ database - view, add, and delete documents
            </p>
          </div>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            ← Back to Chat
          </button>
        </div>

        {/* Message */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              message.type === 'success'
                ? 'bg-green-50 text-green-800 border border-green-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Add Documents Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Add New Documents</h2>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Paste JSON Array of Documents:
            </label>
            <textarea
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              placeholder='[{"id": "faq_001", "title": "...", "text": "...", "category": "general"}]'
              className="w-full h-64 p-3 border border-gray-300 rounded-lg font-mono text-sm"
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleIngest}
              disabled={loading || !jsonInput.trim()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing...' : 'Ingest Documents'}
            </button>
            <button
              onClick={loadSampleJSON}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              Load Sample JSON
            </button>
            <button
              onClick={() => setJsonInput('')}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              Clear
            </button>
          </div>

          <div className="mt-4 text-sm text-gray-600">
            <p className="font-medium mb-1">Expected JSON format:</p>
            <pre className="bg-gray-50 p-2 rounded text-xs overflow-x-auto">
{`[
  {
    "id": "unique_id",
    "title": "Document Title",
    "text": "Document content...",
    "category": "category_name",
    "metadata": { "tags": [...] }
  }
]`}
            </pre>
          </div>
        </div>

        {/* Documents List */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Current Documents ({documents.length})</h2>
            <button
              onClick={loadDocuments}
              disabled={loading}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Refresh'}
            </button>
          </div>

          {documents.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg mb-2">No documents found</p>
              <p className="text-sm">Add documents using the form above</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 text-left">
                    <th className="pb-3 font-semibold text-gray-700">ID</th>
                    <th className="pb-3 font-semibold text-gray-700">Title</th>
                    <th className="pb-3 font-semibold text-gray-700">Category</th>
                    <th className="pb-3 font-semibold text-gray-700">Content Preview</th>
                    <th className="pb-3 font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {documents.map((doc) => (
                    <tr key={doc.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 text-sm font-mono text-gray-600">{doc.id}</td>
                      <td className="py-3 font-medium text-gray-900">{doc.title}</td>
                      <td className="py-3">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                          {doc.category}
                        </span>
                      </td>
                      <td className="py-3 text-sm text-gray-600 max-w-md truncate">
                        {doc.text.substring(0, 100)}...
                      </td>
                      <td className="py-3">
                        <button
                          onClick={() => handleDelete(doc.id)}
                          disabled={loading}
                          className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 disabled:opacity-50 text-sm"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
