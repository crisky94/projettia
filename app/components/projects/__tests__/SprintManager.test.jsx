import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import SprintManager from '../SprintManager'

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

describe('SprintManager', () => {
    const mockProps = {
        projectId: 'project-123',
        isAdmin: true,
        allMembers: [
            {
                userId: 'user-1',
                user: { name: 'John Doe', email: 'john@example.com' },
                role: 'ADMIN',
            },
            {
                userId: 'user-2',
                user: { name: 'Jane Smith', email: 'jane@example.com' },
                role: 'MEMBER',
            },
        ],
        tasks: [
            {
                id: 'task-1',
                title: 'Sprint Task 1',
                description: 'Description',
                status: 'IN_PROGRESS',
                sprintId: 'sprint-1',
                assignee: { id: 'user-1', name: 'John Doe' },
                estimatedHours: 5,
            },
            {
                id: 'task-2',
                title: 'Backlog Task',
                description: 'Description',
                status: 'PENDING',
                sprintId: null,
                assignee: null,
                estimatedHours: 3,
            },
        ],
        sprints: [
            {
                id: 'sprint-1',
                name: 'Sprint 1',
                description: 'First sprint',
                startDate: '2024-01-01',
                endDate: '2024-01-15',
                status: 'ACTIVE',
            },
        ],
        onTaskUpdate: jest.fn(),
        onTaskDelete: jest.fn(),
        onTaskCreate: jest.fn(),
        onRefreshTasks: jest.fn(),
        onRefreshSprints: jest.fn(),
        disableCreate: false,
    }

    beforeEach(() => {
        jest.clearAllMocks()
        global.fetch = jest.fn()
    })

    it('renders sprint list', () => {
        render(<SprintManager {...mockProps} />)

        expect(screen.getByText('Sprint 1')).toBeInTheDocument()
    })

    it('displays backlog section for tasks without sprint', () => {
        render(<SprintManager {...mockProps} />)

        expect(screen.getByText(/Backlog/i)).toBeInTheDocument()
        expect(screen.getByText('Backlog Task')).toBeInTheDocument()
    })

    it('shows create sprint button', () => {
        render(<SprintManager {...mockProps} />)

        const createButton = screen.getByRole('button', { name: /Create Sprint/i })
        expect(createButton).toBeInTheDocument()
    })

    it('opens create sprint modal when button is clicked', () => {
        render(<SprintManager {...mockProps} />)

        const createButton = screen.getByRole('button', { name: /Create Sprint/i })
        fireEvent.click(createButton)

        expect(screen.getByText(/New Sprint/i)).toBeInTheDocument()
    })

    it('displays sprint status correctly', () => {
        render(<SprintManager {...mockProps} />)

        expect(screen.getByText('ACTIVE')).toBeInTheDocument()
    })

    it('shows sprint date range', () => {
        render(<SprintManager {...mockProps} />)

        // Dates should be formatted
        expect(screen.getByText(/Jan/i)).toBeInTheDocument()
    })

    it('displays task count for sprint', () => {
        render(<SprintManager {...mockProps} />)

        // Sprint 1 has 1 task
        expect(screen.getByText(/1 tasks/i)).toBeInTheDocument()
    })

    it('shows sprint progress metrics', () => {
        render(<SprintManager {...mockProps} />)

        // Should show completed/total tasks
        expect(screen.getByText(/0\/1 tasks/i)).toBeInTheDocument()
    })

    it('allows expanding and collapsing sprints', () => {
        render(<SprintManager {...mockProps} />)

        const expandButton = screen.getAllByRole('button', { name: /expand/i })[0]
        fireEvent.click(expandButton)

        // Tasks should be visible after expanding
        expect(screen.getByText('Sprint Task 1')).toBeInTheDocument()
    })

    it('shows admin controls for sprint management', () => {
        render(<SprintManager {...mockProps} isAdmin={true} />)

        // Admin should see edit/delete buttons
        const editButtons = screen.queryAllByTitle(/Edit sprint/i)
        expect(editButtons.length).toBeGreaterThan(0)
    })

    it('disables create when disableCreate is true', () => {
        render(<SprintManager {...mockProps} disableCreate={true} />)

        const createButton = screen.getByRole('button', { name: /Create Sprint/i })
        expect(createButton).toBeDisabled()
    })

    it('handles empty sprint list', () => {
        render(<SprintManager {...mockProps} sprints={[]} />)

        expect(screen.getByText(/No sprints/i)).toBeInTheDocument()
    })

    it('calculates total estimated hours for sprint', () => {
        render(<SprintManager {...mockProps} />)

        // Sprint 1 has task with 5 hours
        expect(screen.getByText(/5h estimated/i)).toBeInTheDocument()
    })
})
