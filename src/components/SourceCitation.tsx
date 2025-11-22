import { Source } from '../api/chat'

interface SourceCitationProps {
  sources: Source[]
  confidence: number
}

export default function SourceCitation({ sources, confidence }: SourceCitationProps) {
  if (sources.length === 0) return null

  const getConfidenceBadge = (conf: number) => {
    if (conf >= 0.7) {
      return <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">High Confidence</span>
    } else if (conf >= 0.5) {
      return <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">Medium Confidence</span>
    } else {
      return <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">Low Confidence</span>
    }
  }

  const getSimilarityColor = (score: number) => {
    if (score >= 0.7) return 'text-green-600'
    if (score >= 0.5) return 'text-yellow-600'
    if (score >= 0.3) return 'text-orange-600'
    return 'text-red-600'
  }

  return (
    <div className="mt-3 pt-3 border-t border-gray-200">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-gray-600">Sources</span>
        {getConfidenceBadge(confidence)}
      </div>

      <div className="space-y-2">
        {sources.map((source, index) => (
          <details key={index} className="group">
            <summary className="cursor-pointer text-xs text-blue-600 hover:text-blue-800 list-none">
              <div className="flex items-center">
                <svg
                  className="w-3 h-3 mr-1 transform group-open:rotate-90 transition-transform"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="font-medium">
                  {source.title}
                  <span className={`ml-2 font-semibold ${getSimilarityColor(source.score)}`}>
                    {(source.score * 100).toFixed(0)}% match
                  </span>
                </span>
              </div>
            </summary>
            <div className="mt-1 ml-4 text-xs text-gray-600 bg-gray-50 p-2 rounded">
              {source.excerpt}
            </div>
          </details>
        ))}
      </div>
    </div>
  )
}
