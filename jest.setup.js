// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'

// Mock Next.js router
jest.mock('next/navigation', () => ({
    useRouter() {
        return {
            push: jest.fn(),
            replace: jest.fn(),
            prefetch: jest.fn(),
            back: jest.fn(),
            pathname: '/',
            query: {},
            asPath: '/',
        }
    },
    useSearchParams() {
        return new URLSearchParams()
    },
    usePathname() {
        return '/'
    },
}))

// Mock Clerk
jest.mock('@clerk/nextjs', () => ({
    useAuth: () => ({
        userId: 'test-user-id',
        isLoaded: true,
        isSignedIn: true,
    }),
    useUser: () => ({
        user: {
            id: 'test-user-id',
            firstName: 'Test',
            lastName: 'User',
            emailAddresses: [{ emailAddress: 'test@example.com' }],
        },
        isLoaded: true,
    }),
    ClerkProvider: ({ children }) => children,
    SignIn: () => <div>Sign In Mock</div>,
    SignUp: () => <div>Sign Up Mock</div>,
}))

// Mock fetch globally
global.fetch = jest.fn()

// Reset mocks after each test
afterEach(() => {
    jest.clearAllMocks()
})
