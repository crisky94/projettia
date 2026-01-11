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

// Mock fetch globally with proper response
global.fetch = jest.fn(() =>
    Promise.resolve({
        ok: true,
        json: () => Promise.resolve([]),
        text: () => Promise.resolve(''),
        status: 200,
    })
)

// Suppress console errors in tests
const originalError = console.error
beforeAll(() => {
    console.error = (...args) => {
        if (
            typeof args[0] === 'string' &&
            (args[0].includes('Warning: ReactDOM.render') ||
                args[0].includes('Warning: An update to') ||
                args[0].includes('Not wrapped in act'))
        ) {
            return
        }
        originalError.call(console, ...args)
    }
})

afterAll(() => {
    console.error = originalError
})

// Reset mocks after each test
afterEach(() => {
    jest.clearAllMocks()
})
