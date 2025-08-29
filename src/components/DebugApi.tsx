import React from 'react'
import { itemsApi, checkHealth } from '@/api'
import { type Item } from '@/types'
import { Button, Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { logger } from '@/utils'

interface TestResult {
  success: boolean
  data?: Item[] | { status: string; message: string } | unknown
  error?: string
}

export function DebugApi() {
  const [itemsResult, setItemsResult] = React.useState<TestResult | null>(null)
  const [healthResult, setHealthResult] = React.useState<TestResult | null>(null)
  const [loading, setLoading] = React.useState(false)

  const testItems = async () => {
    setLoading(true)
    try {
      logger.debug('Testing /api/items...')
      const items = await itemsApi.getAll()
      logger.debug('Items response received', { count: items.length })
      setItemsResult({ success: true, data: items })
    } catch (error) {
      logger.error('Items API test failed', { error })
      setItemsResult({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      })
    }
    setLoading(false)
  }

  const testHealth = async () => {
    setLoading(true)
    try {
      logger.debug('Testing /healthz...')
      const health = await checkHealth()
      logger.debug('Health response received', { status: health.status })
      setHealthResult({ success: true, data: health })
    } catch (error) {
      logger.error('Health API test failed', { error })
      setHealthResult({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      })
    }
    setLoading(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-4">
        <Button 
          onClick={testItems}
          disabled={loading}
          loading={loading}
          variant="default"
        >
          Test Items API
        </Button>
        
        <Button 
          onClick={testHealth}
          disabled={loading}
          loading={loading}
          variant="secondary"
        >
          Test Health API
        </Button>
      </div>

      {itemsResult && (
        <Card>
          <CardHeader>
            <CardTitle className={`text-lg ${itemsResult.success ? 'text-green-700' : 'text-red-700'}`}>
              Items API Result: {itemsResult.success ? 'Success' : 'Failed'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-sm bg-muted p-3 rounded overflow-auto max-h-64">
              {JSON.stringify(itemsResult, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}

      {healthResult && (
        <Card>
          <CardHeader>
            <CardTitle className={`text-lg ${healthResult.success ? 'text-green-700' : 'text-red-700'}`}>
              Health API Result: {healthResult.success ? 'Success' : 'Failed'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-sm bg-muted p-3 rounded overflow-auto max-h-64">
              {JSON.stringify(healthResult, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
