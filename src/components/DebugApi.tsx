import React from 'react'
import { itemsApi, checkHealth } from '@/api'

export function DebugApi() {
  const [itemsResult, setItemsResult] = React.useState<any>(null)
  const [healthResult, setHealthResult] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(false)

  const testItems = async () => {
    setLoading(true)
    try {
      console.log('Testing /api/items...')
      const items = await itemsApi.getAll()
      console.log('Items response:', items)
      setItemsResult({ success: true, data: items })
    } catch (error) {
      console.error('Items error:', error)
      setItemsResult({ success: false, error: error.message })
    }
    setLoading(false)
  }

  const testHealth = async () => {
    setLoading(true)
    try {
      console.log('Testing /healthz...')
      const health = await checkHealth()
      console.log('Health response:', health)
      setHealthResult({ success: true, data: health })
    } catch (error) {
      console.error('Health error:', error)
      setHealthResult({ success: false, error: error.message })
    }
    setLoading(false)
  }

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-2xl font-bold">API Debug Panel</h2>
      
      <div className="space-x-4">
        <button 
          onClick={testItems}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          Test Items API
        </button>
        
        <button 
          onClick={testHealth}
          disabled={loading}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
        >
          Test Health API
        </button>
      </div>

      {loading && <p>Loading...</p>}

      {itemsResult && (
        <div className="p-4 border rounded">
          <h3 className="font-bold">Items API Result:</h3>
          <pre className="mt-2 text-sm overflow-auto">
            {JSON.stringify(itemsResult, null, 2)}
          </pre>
        </div>
      )}

      {healthResult && (
        <div className="p-4 border rounded">
          <h3 className="font-bold">Health API Result:</h3>
          <pre className="mt-2 text-sm overflow-auto">
            {JSON.stringify(healthResult, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}
