# Architecture & Project Structure Guidelines

## Directory Structure
```
src/
├── components/      # UI components
│   ├── designer/   # Designer-specific components
│   ├── layout/     # Layout components (Header, Sidebar)
│   └── questions/  # Question type components
├── contexts/       # React context providers
├── pages/         # Top-level route components
├── services/      # API and business logic
├── types/         # TypeScript types and interfaces
├── utils/         # Utility/helper functions
└── hooks/         # Custom React hooks
```

## Component Organization
### Atomic Design Principles
- **Atoms:** Basic building blocks (buttons, inputs)
- **Molecules:** Simple component combinations
- **Organisms:** Complex components (forms, sections)
- **Templates:** Page layouts
- **Pages:** Complete screens

### Component Guidelines
1. **Single Responsibility:** Each component should do one thing well
2. **Modularity:** Components should be self-contained
3. **Reusability:** Design for reuse when possible
4. **Testability:** Components should be easy to test in isolation

## State Management
1. **Local State:**
   - Use `useState` for component-specific state
   - Keep state as close as possible to where it's used

2. **Context:**
   - Use for global state (user preferences, theme)
   - Avoid prop drilling
   - Split contexts by domain (Questions, Designer, etc.)

3. **Props:**
   - Pass only what's needed
   - Use TypeScript interfaces for prop definitions
   - Document required vs optional props

## Data Flow
1. **Unidirectional Data Flow:**
   - Props flow down
   - Events/callbacks flow up
   - Use context for cross-cutting concerns

2. **API Integration:**
   - Keep API calls in services
   - Use custom hooks for data fetching
   - Handle loading and error states consistently

## Testing Structure
```
src/
└── components/
    └── MyComponent/
        ├── MyComponent.tsx
        ├── MyComponent.test.tsx
        └── __mocks__/
```

## Performance Considerations
1. **Code Splitting:**
   - Lazy load routes
   - Split large components
   - Use dynamic imports for heavy features

2. **Memoization:**
   - Use `React.memo` for expensive renders
   - Implement `useMemo` for costly computations
   - Apply `useCallback` for stable callbacks

## Security
1. **Input Validation:**
   - Validate all user inputs
   - Sanitize data before rendering
   - Use proper encoding for user-generated content

2. **Authentication/Authorization:**
   - Implement proper auth checks
   - Protect sensitive routes
   - Handle expired sessions

## Error Handling
1. **Error Boundaries:**
   - Implement at key points in the component tree
   - Provide fallback UIs
   - Log errors appropriately

2. **API Errors:**
   - Handle network errors gracefully
   - Show user-friendly error messages
   - Implement retry mechanisms where appropriate

## Configuration Management
1. **Environment Variables:**
   - Use `.env` files
   - Never commit secrets
   - Document all required variables

2. **Feature Flags:**
   - Implement feature toggling
   - Document feature flag usage
   - Plan for graceful degradation
