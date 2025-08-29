import { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { ToastProvider } from '@/components/ui'

// Custom render function that includes providers
function customRender(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <BrowserRouter>
        <ToastProvider>
          {children}
        </ToastProvider>
      </BrowserRouter>
    )
  }

  return render(ui, { wrapper: Wrapper, ...options })
}

// Mock data for testing
export const mockItem = {
  id: 'test-item-1',
  name: 'Test Kebap',
  description: 'A delicious test kebap',
  category: 'Ana Yemek',
  price: '50.00',
  image: 'https://example.com/test-image.jpg',
  model: 'https://example.com/test-model.glb',
}

export const mockItems = [
  mockItem,
  {
    id: 'test-item-2',
    name: 'Test Soup',
    description: 'A warm test soup',
    category: 'Çorba',
    price: '25.00',
    image: 'https://example.com/test-soup.jpg',
    model: 'https://example.com/test-soup.glb',
  },
]

// Re-export everything
// eslint-disable-next-line react-refresh/only-export-components
export * from '@testing-library/react'
export { customRender as render }
