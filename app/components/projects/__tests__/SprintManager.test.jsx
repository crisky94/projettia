import { render, screen } from '@testing-library/react'
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
        ],
        tasks: [],
        sprints: [],
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

    it('renders without crashing', () => {
        render(<SprintManager {...mockProps} />)
        expect(screen.getByText(/Sprint Manager/i)).toBeInTheDocument()
    })

    it('shows create sprint button', () => {
        render(<SprintManager {...mockProps} />)
        const createButtons = screen.getAllByText(/Create Sprint/i)
        expect(createButtons.length).toBeGreaterThan(0)
    })

    it('displays empty state when no sprints exist', () => {
        render(<SprintManager {...mockProps} sprints={[]} />)
        expect(screen.getByText(/No sprints/i)).toBeInTheDocument()
    })

    it('renders component successfully', () => {
        const { container } = render(<SprintManager {...mockProps} />)
        expect(container).toBeInTheDocument()
    })
})
