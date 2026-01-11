import { render, screen, fireEvent, waitFor } from '@testing-library/react'
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

        expect(screen.getByRole('status', { hidden: true })).toBeInTheDocument()
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
            {
                id: '2',
                name: 'Test Project 2',
                description: 'Test Description 2',
                _count: { tasks: 5, members: 3 },
                tasks: [],
            },
        ]

        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockProjects,
        })

        render(<ProjectDashboard userId={mockUserId} />)

        await waitFor(() => {
            expect(screen.getByText('Test Project 1')).toBeInTheDocument()
            expect(screen.getByText('Test Project 2')).toBeInTheDocument()
        })
    })

    it('opens create project modal when button is clicked', async () => {
        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => [],
        })

        render(<ProjectDashboard userId={mockUserId} />)

        await waitFor(() => {
            expect(screen.getByText(/No active projects/i)).toBeInTheDocument()
        })

        const createButton = screen.getByText(/Create Project/i)
        fireEvent.click(createButton)

        await waitFor(() => {
            expect(screen.getByText(/New Project/i)).toBeInTheDocument()
        })
    })

    it('handles API errors gracefully', async () => {
        global.fetch.mockRejectedValueOnce(new Error('API Error'))

        render(<ProjectDashboard userId={mockUserId} />)

        await waitFor(() => {
            expect(screen.getByText(/Failed to load projects/i)).toBeInTheDocument()
        })
    })

    it('calculates project progress correctly', async () => {
        const mockProjects = [
            {
                id: '1',
                name: 'Test Project',
                description: 'Test',
                _count: { tasks: 4, members: 2 },
                tasks: [
                    { status: 'COMPLETED' },
                    { status: 'COMPLETED' },
                    { status: 'PENDING' },
                    { status: 'IN_PROGRESS' },
                ],
            },
        ]

        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockProjects,
        })

        render(<ProjectDashboard userId={mockUserId} />)

        await waitFor(() => {
            // 2 completed out of 4 total = 50%
            expect(screen.getByText('50')).toBeInTheDocument()
        })
    })
})
