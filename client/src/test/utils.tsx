import { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/contexts/AuthContext';
import { TavusProvider } from '@/contexts/TavusContext';

interface RenderWithProvidersOptions extends Omit<RenderOptions, 'wrapper'> {
  initialRoute?: string;
}

/**
 * Render component with all necessary providers
 * @param component - React component to render
 * @param options - Render options including initial route
 */
export function renderWithProviders(
  component: ReactElement,
  { initialRoute = '/', ...renderOptions }: RenderWithProvidersOptions = {}
) {
  // Create a new QueryClient for each test to avoid state leakage
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  // Set initial route if provided
  if (initialRoute !== '/') {
    window.history.pushState({}, 'Test page', initialRoute);
  }

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <TavusProvider>
            {children}
          </TavusProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );

  return render(component, { wrapper: Wrapper, ...renderOptions });
}

/**
 * Create mock user for testing
 */
export function createMockUser(overrides?: Partial<any>) {
  return {
    id: 'test-user-id',
    email: 'test@example.com',
    fullName: 'Test User',
    avatarUrl: 'https://example.com/avatar.jpg',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    ...overrides,
  };
}

/**
 * Create mock API response
 */
export function createMockApiResponse<T>(
  data: T,
  overrides?: Partial<any>
) {
  return {
    data,
    error: null,
    meta: {
      timestamp: new Date(),
      requestId: 'test-request-id',
    },
    ...overrides,
  };
}

// Re-export everything from testing library
export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';
