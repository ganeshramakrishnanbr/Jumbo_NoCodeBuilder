# Code Writing Style Guidelines

## General Principles
1. **Consistency:** Follow established patterns
2. **Readability:** Write clear, self-documenting code
3. **Maintainability:** Think about future maintenance
4. **Performance:** Consider performance implications

## Code Formatting

### Indentation & Spacing
- Use 2 spaces for indentation
- No trailing whitespace
- One space after keywords
- Spaces around operators
```typescript
if (condition) {
  doSomething();
}
```

### Line Length & Wrapping
- Maximum line length: 100 characters
- Break chained methods:
```typescript
const result = someObject
  .methodOne()
  .methodTwo()
  .methodThree();
```

### Quotes & Strings
- Single quotes for strings in TS/JS
- Double quotes for JSX attributes
- Template literals for string interpolation
```typescript
const name = 'John';
const greeting = `Hello ${name}`;
<div className="container">
```

## TypeScript Usage

### Type Definitions
```typescript
// Interfaces for object shapes
interface User {
  id: string;
  name: string;
  age: number;
}

// Type aliases for unions/intersections
type Status = 'pending' | 'active' | 'deleted';

// Enums for fixed sets
enum Role {
  Admin = 'ADMIN',
  User = 'USER'
}
```

### Type Assertions & Generics
- Use type assertions sparingly
- Prefer generics for reusable code
```typescript
function getFirst<T>(array: T[]): T | undefined {
  return array[0];
}
```

## React Patterns

### Component Structure
```typescript
import React, { useState, useEffect } from 'react';
import { SomeType } from '../types';

interface Props {
  data: SomeType;
  onUpdate: (data: SomeType) => void;
}

export const Component: React.FC<Props> = ({ data, onUpdate }) => {
  // State declarations
  const [state, setState] = useState<string>('');

  // Effects
  useEffect(() => {
    // Effect logic
  }, [dependencies]);

  // Event handlers
  const handleClick = () => {
    // Handler logic
  };

  // Render helpers
  const renderItem = (item: Item) => {
    return <div>{item.name}</div>;
  };

  // Main render
  return (
    <div>
      {/* JSX */}
    </div>
  );
};
```

### Hook Usage
```typescript
// Custom hook
const useCustomHook = (param: string) => {
  const [state, setState] = useState(param);
  
  useEffect(() => {
    // Effect logic
  }, [param]);

  return state;
};
```

## Comments & Documentation

### JSDoc Comments
```typescript
/**
 * Component description
 * @param props - Props description
 * @returns JSX element
 */
```

### Inline Comments
```typescript
// TODO: Implementation needed
// FIXME: Known issue
// NOTE: Important information
```

## Error Handling
```typescript
try {
  await riskyOperation();
} catch (error) {
  if (error instanceof CustomError) {
    handleCustomError(error);
  } else {
    console.error('Unexpected error:', error);
  }
}
```

## Import Organization
```typescript
// External imports
import React, { useState } from 'react';
import { someUtil } from 'external-lib';

// Internal imports
import { MyComponent } from './components';
import { useCustomHook } from './hooks';
import { someHelper } from './utils';

// Types
import type { MyType } from './types';

// Styles
import './styles.css';
```

## CSS & Styling
```typescript
// Tailwind classes - Group by purpose
<div className="
  flex items-center justify-between  // Layout
  p-4 mb-2                         // Spacing
  bg-white rounded-lg shadow-md    // Visual
  hover:bg-gray-50                 // Interactive
  transition-colors duration-200   // Animation
">
```

## Testing Patterns
```typescript
describe('Component', () => {
  it('should render correctly', () => {
    const { getByText } = render(<Component />);
    expect(getByText('Expected Text')).toBeInTheDocument();
  });

  it('should handle user interactions', () => {
    const handleClick = jest.fn();
    const { getByRole } = render(<Component onClick={handleClick} />);
    
    fireEvent.click(getByRole('button'));
    expect(handleClick).toHaveBeenCalled();
  });
});
```

## Best Practices

### Component Design
```typescript
// Prefer composition over inheritance
// ❌ Don't use inheritance
class BaseQuestion extends React.Component {
  // base implementation
}
class NumericQuestion extends BaseQuestion {
  // specific implementation
}

// ✅ Do use composition
interface QuestionProps {
  value: any;
  onChange: (value: any) => void;
  validation?: ValidationConfig;
}

const NumericQuestion: React.FC<QuestionProps> = (props) => {
  return <QuestionWrapper {...props}>
    <NumericInput />
    <ValidationMessage />
  </QuestionWrapper>;
};
```

### State Management
```typescript
// ❌ Don't use global state unnecessarily
const globalState = {};

// ✅ Do use React Context for shared state
export const QuestionnaireContext = createContext<QuestionnaireContextType>({});

export const QuestionnaireProvider: React.FC = ({ children }) => {
  const [questionnaire, setQuestionnaire] = useState<Questionnaire>({});
  
  return (
    <QuestionnaireContext.Provider value={{ questionnaire, setQuestionnaire }}>
      {children}
    </QuestionnaireContext.Provider>
  );
};
```

### Performance Optimization
```typescript
// ❌ Don't create new objects in render
const Component = () => {
  return <Child options={{ foo: 'bar' }} />; // New object every render
};

// ✅ Do memoize objects and callbacks
const Component = () => {
  const options = useMemo(() => ({ foo: 'bar' }), []);
  const handleChange = useCallback((value) => {
    // handle change
  }, []);
  
  return <Child options={options} onChange={handleChange} />;
};
```

## Error Handling

### API Error Handling
```typescript
// Service layer
interface ApiError extends Error {
  statusCode: number;
  details: Record<string, any>;
}

const fetchQuestionnaire = async (id: string): Promise<Questionnaire> => {
  try {
    const response = await api.get(`/questionnaires/${id}`);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(`Failed to fetch questionnaire: ${error.message}`);
    }
    throw error;
  }
};

// Component layer
const QuestionnaireComponent: React.FC = () => {
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchQuestionnaire(id);
        // handle success
      } catch (error) {
        setError(error as Error);
        // Log to monitoring service
        logError('QuestionnaireComponent', error);
      }
    };
    loadData();
  }, [id]);

  if (error) {
    return <ErrorBoundary error={error} />;
  }
  // render component
};
```

### Form Validation
```typescript
interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

const validateQuestion = (question: Question): ValidationResult => {
  const errors: Record<string, string> = {};
  
  if (question.required && !question.value) {
    errors.value = 'This field is required';
  }
  
  if (question.type === 'numeric' && isNaN(Number(question.value))) {
    errors.value = 'Please enter a valid number';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};
```

## Patterns

### Repository Pattern
```typescript
// Define interface
interface QuestionRepository {
  getById(id: string): Promise<Question>;
  save(question: Question): Promise<void>;
  delete(id: string): Promise<void>;
}

// Implementation
class APIQuestionRepository implements QuestionRepository {
  async getById(id: string): Promise<Question> {
    const response = await api.get(`/questions/${id}`);
    return response.data;
  }
  
  async save(question: Question): Promise<void> {
    await api.post('/questions', question);
  }
  
  async delete(id: string): Promise<void> {
    await api.delete(`/questions/${id}`);
  }
}
```

### Factory Pattern
```typescript
// Question factory for creating different question types
class QuestionFactory {
  static createQuestion(type: QuestionType, config: QuestionConfig): Question {
    switch (type) {
      case QuestionType.Text:
        return {
          type,
          validation: { required: config.required },
          ...config
        };
      case QuestionType.Numeric:
        return {
          type,
          validation: { 
            required: config.required,
            min: config.min,
            max: config.max
          },
          ...config
        };
      // Add other question types
      default:
        throw new Error(`Unsupported question type: ${type}`);
    }
  }
}
```

### Strategy Pattern
```typescript
// Different strategies for question validation
interface ValidationStrategy {
  validate(value: any): ValidationResult;
}

class NumericValidationStrategy implements ValidationStrategy {
  validate(value: any): ValidationResult {
    const errors: string[] = [];
    if (isNaN(Number(value))) {
      errors.push('Must be a valid number');
    }
    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

class RequiredValidationStrategy implements ValidationStrategy {
  validate(value: any): ValidationResult {
    const errors: string[] = [];
    if (!value) {
      errors.push('This field is required');
    }
    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

// Usage in components
const QuestionValidator = {
  getStrategy(type: QuestionType): ValidationStrategy {
    switch (type) {
      case QuestionType.Numeric:
        return new NumericValidationStrategy();
      default:
        return new RequiredValidationStrategy();
    }
  }
};
```

These patterns are implemented throughout the project, particularly in:
- `components/designer/` for question design patterns
- `components/questions/` for different question type implementations
- `context/QuestionsContext.tsx` for state management patterns
- `types/index.ts` for type definitions and interfaces
