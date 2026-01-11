import { render, screen, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import TaskBoard from '../TaskBoard'

// Mock DnD Kit
jest.mock('@dnd-kit/core', () => ({
    DndContext: ({ children }) => <div>{children}</div>,
    useSensor: jest.fn(),
    useSensors: jest.fn(() => []),
    PointerSensor: jest.fn(),
    KeyboardSensor: jest.fn(),
    closestCorners: jest.fn(),
    useDroppable: jest.fn(() => ({
        setNodeRef: jest.fn(),
        isOver: false,
    })),
    useDraggable: jest.fn(() => ({
        attributes: {},
        listeners: {},
        setNodeRef: jest.fn(),
        transform: null,
        transition: null,
        isDragging: false,
    })),
}))

jest.mock('@dnd-kit/utilities', () => ({
    CSS: {
        Translate: {
            toString: jest.fn(() => ''),
        },
    },
}))

describe('TaskBoard', () => {
    const mockProps = {
        projectId: 'project-123',
        initialTasks: [
            {
                id: 'task-1',
                title: 'Test Task 1',
                description: 'Description 1',
                status: 'PENDING',
                assignee: {
                    id: 'user-1',
                    name: 'John Doe',
                    email: 'john@example.com',
                },
                estimatedHours: 5,
            },
            {
                id: 'task-2',
                title: 'Test Task 2',
                description: 'Description 2',
                status: 'IN_PROGRESS',
                assignee: null,
                estimatedHours: 3,
            },
        ],
        isAdmin: true,
        currentUserId: 'user-1',
        sprints: [],
        onTaskUpdate: jest.fn(),
        onTaskDelete: jest.fn(),
        onTaskCreate: jest.fn(),
        disableCreate: false,
    }

    beforeEach(() => {
        jest.clearAllMocks()
        // Mock fetch for members API call
        global.fetch.mockImplementation(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve({ members: [], permissions: {} }),
            })
        )
    })

    it('renders without crashing', async () => {
        render(<TaskBoard {...mockProps} />)

        await waitFor(() => {
            expect(screen.getByText(/Task Board/i)).toBeInTheDocument()
        })
    })

    it('displays tasks', async () => {
        render(<TaskBoard {...mockProps} />)

        await waitFor(() => {
            expect(screen.getByText('Test Task 1')).toBeInTheDocument()
            expect(screen.getByText('Test Task 2')).toBeInTheDocument()
        })
    })

    it('shows assignee information', async () => {
        render(<TaskBoard {...mockProps} />)

        await waitFor(() => {
            expect(screen.getByText('John Doe')).toBeInTheDocument()
            expect(screen.getByText('Unassigned')).toBeInTheDocument()
        })
    })

    it('renders empty state when no tasks exist', async () => {
        render(<TaskBoard {...mockProps} initialTasks={[]} />)

        await waitFor(() => {
            const emptyMessages = screen.getAllByText(/No tasks/i)
            expect(emptyMessages.length).toBeGreaterThan(0)
        })
    })

    it('renders component successfully', async () => {
        const { container } = render(<TaskBoard {...mockProps} />)

        await waitFor(() => {
            expect(container).toBeInTheDocument()
        })
    })
})
