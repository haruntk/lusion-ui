import * as React from 'react'
import { useState, useEffect } from 'react'
import { Button, Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { getModelUrls } from '@/api/ar'
import { type ArModelData } from '@/types/ar.schema'

interface ArModelTestProps {
  itemId: string
}

export function ArModelTest({ itemId }: ArModelTestProps) {
  const [modelData, setModelData] = useState<ArModelData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchModelData = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const data = await getModelUrls(itemId)
      setModelData(data)
      console.log('AR Model Data:', data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch AR model data')
      console.error('Error fetching AR model data:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>AR Model Test</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex gap-4">
            <Button 
              onClick={fetchModelData}
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Fetch AR Model Data'}
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => setModelData(null)}
              disabled={loading || !modelData}
            >
              Clear Results
            </Button>
          </div>
          
          {error && (
            <div className="p-4 bg-destructive/10 text-destructive rounded-lg">
              <h4 className="font-bold mb-1">Error</h4>
              <p>{error}</p>
            </div>
          )}
          
          {modelData && (
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-bold mb-2">Model Data</h4>
              <pre className="text-xs overflow-auto max-h-64 p-2 bg-background rounded border">
                {JSON.stringify(modelData, null, 2)}
              </pre>
            </div>
          )}
          
          <div className="text-sm text-muted-foreground">
            <p>Item ID: <code>{itemId}</code></p>
            <p>Status: {loading ? 'Loading...' : modelData ? 'Data loaded' : 'Idle'}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
