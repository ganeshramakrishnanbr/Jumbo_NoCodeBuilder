# Technical Details

## Technology Stack
- React 18.3.1
- TypeScript
- Vite
- Tailwind CSS
- React Router v6
- Context API
- Local Storage

## Project Structure
```
src/
├── components/
│   ├── designer/
│   │   ├── canvas/
│   │   ├── controls/
│   │   ├── properties/
│   │   └── tabs/
│   └── layout/
├── contexts/
├── pages/
├── services/
└── types/
```

## Component Architecture

### Designer Components
- DesignerTabs: Main container for design, preview, and JSON tabs
- ControlPalette: Draggable control library
- DesignCanvas: Drop target for controls
- PropertiesPanel: Control configuration

### Context Providers
- QuestionnaireContext: Manages questionnaire state
- DragDropContext: Handles drag and drop operations

### Control Implementation
Each control type implements:
- Rendering logic
- Property configuration
- Validation rules
- Event handling

## State Management
- Context API for global state
- Local component state for UI
- Local storage for persistence

## Validation System
- Field-level validation
- Required field checking
- Custom validation rules
- Error message display

## Drag and Drop System
- HTML5 Drag and Drop API
- Custom drag sources
- Drop targets
- Visual feedback

## Styling System
- Tailwind CSS for utility classes
- Custom CSS for specific components
- Responsive design utilities
- Theme customization

## Data Flow
1. User interactions trigger state updates
2. Context providers manage state changes
3. Components re-render with updated data
4. Changes persist to local storage

## Performance Optimizations
- React.memo for expensive components
- Debounced updates
- Efficient re-rendering
- Code splitting

## Type System
- TypeScript interfaces for controls
- Strict type checking
- Type safety for props
- Enum types for control types

## Error Handling
- Try-catch blocks
- Error boundaries
- Validation feedback
- Console logging

## Testing Strategy
- Unit tests for components
- Integration tests for features
- Accessibility testing
- Browser compatibility testing