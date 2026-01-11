import { render, screen, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import ProjectDashboard from '../ProjectDashboard'

// Mock fetch
global.fetch = jest.fn()

describe('ProjectDashboard', () => {
    const mockUserId = 'test-user-123'

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('renders loading state initially', () => {
        global.fetch.mockImplementation(() =>
            new Promise(() => { }) // Never resolves to keep loading state
        )

        render(<ProjectDashboard userId={mockUserId} />)

        // Check for loading spinner
        const loadingElement = document.querySelector('.animate-spin')
        expect(loadingElement).toBeInTheDocument()
    })

    it('renders empty state when no projects exist', async () => {
        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => [],
        })

        render(<ProjectDashboard userId={mockUserId} />)

        await waitFor(() => {
            expect(screen.getByText(/No active projects/i)).toBeInTheDocument()
        })
    })

    it('renders projects list when projects exist', async () => {
        const mockProjects = [
            {
                id: '1',
                name: 'Test Project 1',
                description: 'Test Description 1',
                _count: { tasks: 10, members: 5 },
                tasks: [
                    { status: 'COMPLETED' },
                    { status: 'COMPLETED' },
                    { status: 'PENDING' },
                ],
            },
        ]

        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockProjects,
        })

        render(<ProjectDashboard userId={mockUserId} />)

        await waitFor(() => {
            expect(screen.getByText('Test Project 1')).toBeInTheDocument()
        })
    })

    it('handles API errors gracefully', async () => {
        global.fetch.mockRejectedValueOnce(new Error('API Error'))

        render(<ProjectDashboard userId={mockUserId} />)

        await waitFor(() => {
            expect(screen.getByText(/Failed to load projects/i)).toBeInTheDocument()
        })
    })

    it('renders component successfully', () => {
        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => [],
        })

        const { container } = render(<ProjectDashboard userId={mockUserId} />)
        expect(container).toBeInTheDocument()
    })
})
