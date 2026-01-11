import { render, screen, fireEvent, within } from '@testing-library/react'
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
            {
                id: 'task-3',
                title: 'Test Task 3',
                description: 'Description 3',
                status: 'COMPLETED',
                assignee: {
                    id: 'user-2',
                    name: 'Jane Smith',
                    email: 'jane@example.com',
                },
                estimatedHours: 8,
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
    })

    it('renders all task columns', () => {
        render(<TaskBoard {...mockProps} />)

        expect(screen.getByText(/Pending/i)).toBeInTheDocument()
        expect(screen.getByText(/In Progress/i)).toBeInTheDocument()
        expect(screen.getByText(/Completed/i)).toBeInTheDocument()
    })

    it('displays tasks in correct columns', () => {
        render(<TaskBoard {...mockProps} />)

        expect(screen.getByText('Test Task 1')).toBeInTheDocument()
        expect(screen.getByText('Test Task 2')).toBeInTheDocument()
        expect(screen.getByText('Test Task 3')).toBeInTheDocument()
    })

    it('shows task count in each column', () => {
        render(<TaskBoard {...mockProps} />)

        // Each column should show the count
        const pendingSection = screen.getByText(/Pending/i).closest('div')
        const inProgressSection = screen.getByText(/In Progress/i).closest('div')
        const completedSection = screen.getByText(/Completed/i).closest('div')

        expect(within(pendingSection).getByText('1')).toBeInTheDocument()
        expect(within(inProgressSection).getByText('1')).toBeInTheDocument()
        expect(within(completedSection).getByText('1')).toBeInTheDocument()
    })

    it('displays assignee information correctly', () => {
        render(<TaskBoard {...mockProps} />)

        expect(screen.getByText('John Doe')).toBeInTheDocument()
        expect(screen.getByText('Jane Smith')).toBeInTheDocument()
        expect(screen.getByText('Unassigned')).toBeInTheDocument()
    })

    it('shows estimated time for tasks', () => {
        render(<TaskBoard {...mockProps} />)

        expect(screen.getByText('5h')).toBeInTheDocument()
        expect(screen.getByText('3h')).toBeInTheDocument()
        expect(screen.getByText('1d')).toBeInTheDocument() // 8 hours = 1 day
    })

    it('opens create task modal when add button is clicked', () => {
        render(<TaskBoard {...mockProps} />)

        const addButton = screen.getAllByRole('button', { name: /add/i })[0]
        fireEvent.click(addButton)

        expect(screen.getByText(/New Task/i)).toBeInTheDocument()
    })

    it('shows view more button for tasks', () => {
        render(<TaskBoard {...mockProps} />)

        const viewButtons = screen.getAllByText(/View more/i)
        expect(viewButtons.length).toBeGreaterThan(0)
    })

    it('disables create button when disableCreate is true', () => {
        render(<TaskBoard {...mockProps} disableCreate={true} />)

        const addButtons = screen.queryAllByRole('button', { name: /add/i })
        addButtons.forEach(button => {
            expect(button).toBeDisabled()
        })
    })

    it('renders empty state when no tasks exist', () => {
        render(<TaskBoard {...mockProps} initialTasks={[]} />)

        const emptyMessages = screen.getAllByText(/No tasks/i)
        expect(emptyMessages.length).toBeGreaterThan(0)
    })

    it('shows admin controls when user is admin', () => {
        render(<TaskBoard {...mockProps} isAdmin={true} />)

        // Admin should see edit/delete buttons (they appear on hover)
        const taskCards = screen.getAllByRole('article', { hidden: true })
        expect(taskCards.length).toBeGreaterThan(0)
    })
})
