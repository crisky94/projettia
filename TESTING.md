# Testing Documentation

## Overview

This project uses **Jest** and **React Testing Library** for comprehensive testing coverage.

## Test Structure

```
projettia/
├── app/
│   ├── components/
│   │   └── projects/
│   │       └── __tests__/
│   │           ├── ProjectDashboard.test.jsx
│   │           ├── TaskBoard.test.jsx
│   │           └── SprintManager.test.jsx
│   └── api/
│       └── __tests__/
│           └── api.test.js
├── jest.config.js
└── jest.setup.js
```

## Running Tests

### Run all tests
```bash
npm test
```

### Run tests in watch mode
```bash
npm run test:watch
```

### Run tests with coverage report
```bash
npm run test:coverage
```

### Run specific test file
```bash
npm test ProjectDashboard.test
```

### Run tests matching a pattern
```bash
npm test -- --testNamePattern="renders"
```

## Test Coverage

Current test coverage includes:

### Components
- ✅ **ProjectDashboard**: Loading states, project rendering, modal interactions, error handling
- ✅ **TaskBoard**: Column rendering, task distribution, drag-and-drop, assignee display
- ✅ **SprintManager**: Sprint rendering, backlog management, metrics calculation

### API Routes (Structure ready)
- 📝 Projects CRUD operations
- 📝 Tasks management
- 📝 Sprints management
- 📝 Members management

## Writing New Tests

### Component Test Example

```javascript
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import YourComponent from '../YourComponent'

describe('YourComponent', () => {
  it('renders correctly', () => {
    render(<YourComponent />)
    expect(screen.getByText('Expected Text')).toBeInTheDocument()
  })

  it('handles user interaction', () => {
    render(<YourComponent />)
    const button = screen.getByRole('button')
    fireEvent.click(button)
    expect(screen.getByText('Updated Text')).toBeInTheDocument()
  })
})
```

### API Test Example

```javascript
describe('API Endpoint', () => {
  it('returns correct data', async () => {
    const response = await fetch('/api/endpoint')
    const data = await response.json()
    expect(data).toHaveProperty('expectedField')
  })
})
```

## Mocking

### Mocked Dependencies

The following are automatically mocked in `jest.setup.js`:

- **Next.js Router**: `next/navigation`
- **Clerk Authentication**: `@clerk/nextjs`
- **Global fetch**: `global.fetch`

### Custom Mocks

To mock a module in a specific test:

```javascript
jest.mock('../path/to/module', () => ({
  functionName: jest.fn(() => 'mocked value'),
}))
```

## Best Practices

### 1. Test Behavior, Not Implementation
```javascript
// ❌ Bad - Testing implementation details
expect(component.state.count).toBe(5)

// ✅ Good - Testing user-visible behavior
expect(screen.getByText('Count: 5')).toBeInTheDocument()
```

### 2. Use Descriptive Test Names
```javascript
// ❌ Bad
it('works', () => { ... })

// ✅ Good
it('displays error message when API call fails', () => { ... })
```

### 3. Arrange-Act-Assert Pattern
```javascript
it('increments counter when button is clicked', () => {
  // Arrange
  render(<Counter />)
  
  // Act
  fireEvent.click(screen.getByRole('button'))
  
  // Assert
  expect(screen.getByText('Count: 1')).toBeInTheDocument()
})
```

### 4. Clean Up After Tests
```javascript
afterEach(() => {
  jest.clearAllMocks()
  cleanup()
})
```

## Common Testing Patterns

### Testing Async Operations
```javascript
it('loads data asynchronously', async () => {
  render(<AsyncComponent />)
  
  await waitFor(() => {
    expect(screen.getByText('Loaded Data')).toBeInTheDocument()
  })
})
```

### Testing User Events
```javascript
import userEvent from '@testing-library/user-event'

it('handles form submission', async () => {
  const user = userEvent.setup()
  render(<Form />)
  
  await user.type(screen.getByLabelText('Email'), 'test@example.com')
  await user.click(screen.getByRole('button', { name: /submit/i }))
  
  expect(screen.getByText('Success!')).toBeInTheDocument()
})
```

### Testing Error States
```javascript
it('displays error message on failure', async () => {
  global.fetch.mockRejectedValueOnce(new Error('API Error'))
  
  render(<Component />)
  
  await waitFor(() => {
    expect(screen.getByText(/error/i)).toBeInTheDocument()
  })
})
```

## Coverage Goals

Target coverage metrics:
- **Statements**: > 80%
- **Branches**: > 75%
- **Functions**: > 80%
- **Lines**: > 80%

## Continuous Integration

Tests are automatically run on:
- Every commit (pre-commit hook)
- Pull requests
- Before deployment

## Troubleshooting

### Common Issues

**Issue**: Tests fail with "Cannot find module"
```bash
# Solution: Regenerate Jest cache
npm test -- --clearCache
```

**Issue**: Tests timeout
```javascript
// Solution: Increase timeout for specific test
it('slow test', async () => {
  // test code
}, 10000) // 10 second timeout
```

**Issue**: Mock not working
```javascript
// Solution: Ensure mock is defined before import
jest.mock('./module')
import Component from './Component'
```

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

## Contributing

When adding new features:
1. Write tests first (TDD approach)
2. Ensure all tests pass
3. Maintain coverage above 80%
4. Update this documentation if needed
