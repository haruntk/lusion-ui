import * as React from "react"
import { Button, Card, CardContent, CardHeader, CardTitle } from "@/components/ui"
import { apiClient } from "@/api"
import { DebugApi } from "@/components/DebugApi"

export function DebugPage() {
  const [results, setResults] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(false)

  const testEndpoint = async (endpoint: string, description: string) => {
    setLoading(true)
    const startTime = Date.now()
    
    try {
      console.log(`Testing ${endpoint}...`)
      const response = await apiClient.get(endpoint)
      const duration = Date.now() - startTime
      
      const result = {
        endpoint,
        description,
        status: 'success',
        statusCode: response.status,
        data: response.data,
        duration: `${duration}ms`,
        timestamp: new Date().toISOString()
      }
      
      console.log(`✅ ${endpoint} success:`, result)
      setResults(prev => [...prev, result])
    } catch (error: any) {
      const duration = Date.now() - startTime
      
      const result = {
        endpoint,
        description,
        status: 'error',
        statusCode: error.response?.status || 'Network Error',
        error: error.message,
        data: error.response?.data,
        duration: `${duration}ms`,
        timestamp: new Date().toISOString()
      }
      
      console.error(`❌ ${endpoint} failed:`, result)
      setResults(prev => [...prev, result])
    }
    
    setLoading(false)
  }

  const runAllTests = async () => {
    setResults([])
    await testEndpoint('/items', 'Fetch all menu items')
    await testEndpoint('/healthz', 'Basic health check')
    await testEndpoint('/qr/test', 'Test QR generation')
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* New Debug API Component */}
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Quick API Test</CardTitle>
        </CardHeader>
        <CardContent>
          <DebugApi />
        </CardContent>
      </Card>

      {/* Original Debug Console */}
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>API Debug Console</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button onClick={runAllTests} disabled={loading}>
              {loading ? 'Testing...' : 'Test All Endpoints'}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setResults([])}
            >
              Clear Results
            </Button>
          </div>

          <div className="space-y-4">
            {results.map((result, index) => (
              <Card key={index} className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">{result.description}</h3>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded text-xs ${
                      result.status === 'success' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {result.status.toUpperCase()}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {result.statusCode}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {result.duration}
                    </span>
                  </div>
                </div>
                
                <div className="text-sm">
                  <p><strong>Endpoint:</strong> {result.endpoint}</p>
                  {result.error && (
                    <p className="text-red-600"><strong>Error:</strong> {result.error}</p>
                  )}
                </div>
                
                <details className="mt-2">
                  <summary className="cursor-pointer text-xs text-muted-foreground">
                    View Response Data
                  </summary>
                  <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto max-h-32">
                    {JSON.stringify(result.data, null, 2)}
                  </pre>
                </details>
              </Card>
            ))}
          </div>

          {results.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              Click "Test All Endpoints" to check API connectivity
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
