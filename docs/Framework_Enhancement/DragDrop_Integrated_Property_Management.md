# Integrated Property Management in Parent Controls

## Overview

This document details the architecture and implementation of the integrated property management system that resides directly within parent controls in the design tab. This approach provides an improved user experience by allowing properties to be edited in context, without switching to a separate panel.

## Architecture

### Integrated Property Component

The property management is implemented through a component that is embedded directly in the parent control's UI:

```typescript
interface IntegratedPropertyPanelProps {
  control: Control;
  onChange: (propertyName: string, value: any) => void;
  propertyGroups?: PropertyGroup[];
}

interface PropertyGroup {
  name: string;
  label: string;
  properties: string[];
  collapsed?: boolean;
}

export const IntegratedPropertyPanel: React.FC<IntegratedPropertyPanelProps> = ({
  control,
  onChange,
  propertyGroups
}) => {
  // Render properties grouped by category
  return (
    <div className="integrated-property-panel">
      {propertyGroups?.map(group => (
        <PropertyGroupComponent 
          key={group.name}
          group={group}
          control={control}
          onChange={onChange}
        />
      ))}
    </div>
  );
};
```

### Parent Control Structure with Properties

Parent controls are enhanced to include the property panel as a tab or section within their UI:

```typescript
export const TabControl: React.FC<TabControlProps> = ({ control, children }) => {
  const [activeTab, setActiveTab] = useState('content');
  const handlePropertyChange = (name: string, value: any) => {
    // Update control
  };
  
  return (
    <div className="parent-control tab-control">
      {/* Control header with tabs */}
      <div className="control-header">
        <div className="control-tabs">
          <div 
            className={`control-tab ${activeTab === 'content' ? 'active' : ''}`}
            onClick={() => setActiveTab('content')}
          >
            Content
          </div>
          <div 
            className={`control-tab ${activeTab === 'properties' ? 'active' : ''}`}
            onClick={() => setActiveTab('properties')}
          >
            Properties
          </div>
        </div>
      </div>
      
      {/* Control content */}
      <div className="control-content">
        {activeTab === 'content' ? (
          <div className="tab-content">{children}</div>
        ) : (
          <IntegratedPropertyPanel 
            control={control}
            onChange={handlePropertyChange}
            propertyGroups={getPropertyGroupsForControl(control)}
          />
        )}
      </div>
    </div>
  );
};
```

### Property Definition System

Properties are defined using a type-safe system that allows for validation and appropriate UI rendering:

```typescript
interface PropertyDefinition {
  name: string;
  label: string;
  type: 'string' | 'number' | 'boolean' | 'select' | 'color' | 'custom';
  defaultValue?: any;
  category: string;
  options?: any[];
  validation?: PropertyValidation;
  visible?: (control: Control) => boolean;
  customEditor?: React.ComponentType<PropertyEditorProps>;
}

interface PropertyValidation {
  required?: boolean;
  min?: number;
  max?: number;
  pattern?: string;
  custom?: (value: any, control: Control) => { valid: boolean; message?: string };
}

// Example property definitions for a Tab control
const tabControlProperties: PropertyDefinition[] = [
  {
    name: 'label',
    label: 'Label',
    type: 'string',
    defaultValue: 'Tab Control',
    category: 'Basic'
  },
  {
    name: 'tabPosition',
    label: 'Tab Position',
    type: 'select',
    defaultValue: 'top',
    options: [
      { value: 'top', label: 'Top' },
      { value: 'bottom', label: 'Bottom' },
      { value: 'left', label: 'Left' },
      { value: 'right', label: 'Right' }
    ],
    category: 'Layout'
  },
  {
    name: 'allowReordering',
    label: 'Allow Tab Reordering',
    type: 'boolean',
    defaultValue: true,
    category: 'Behavior'
  }
];
```

## Property Inheritance

Parent controls can define properties that are inherited by their child controls:

```typescript
interface InheritableProperty {
  name: string;
  sourceProperty: string;
  applyToTypes: ControlType[];
  transform?: (value: any) => any;
}

// Example inheritability configuration for a Tab control
const tabControlInheritableProperties: InheritableProperty[] = [
  {
    name: 'enabled',
    sourceProperty: 'enabled',
    applyToTypes: [
      ControlType.TextBox,
      ControlType.Checkbox,
      ControlType.RadioButton
    ]
  },
  {
    name: 'visible',
    sourceProperty: 'childrenVisible',
    applyToTypes: [
      ControlType.TextBox,
      ControlType.Checkbox,
      ControlType.RadioButton
    ]
  }
];
```

## Property Management Implementation

### Property Registry

A central registry manages property definitions for all control types:

```typescript
class PropertyRegistry {
  private static instance: PropertyRegistry;
  private propertyDefinitions: Map<ControlType, PropertyDefinition[]> = new Map();
  private inheritableProperties: Map<ControlType, InheritableProperty[]> = new Map();
  
  public static getInstance(): PropertyRegistry {
    if (!PropertyRegistry.instance) {
      PropertyRegistry.instance = new PropertyRegistry();
    }
    return PropertyRegistry.instance;
  }
  
  public registerProperties(
    controlType: ControlType, 
    properties: PropertyDefinition[]
  ): void {
    this.propertyDefinitions.set(controlType, properties);
  }
  
  public registerInheritableProperties(
    controlType: ControlType,
    properties: InheritableProperty[]
  ): void {
    this.inheritableProperties.set(controlType, properties);
  }
  
  public getProperties(controlType: ControlType): PropertyDefinition[] {
    return this.propertyDefinitions.get(controlType) || [];
  }
  
  public getInheritableProperties(controlType: ControlType): InheritableProperty[] {
    return this.inheritableProperties.get(controlType) || [];
  }
}
```

### Property Manager

The Property Manager handles the application and inheritance of properties:

```typescript
class PropertyManager {
  private registry = PropertyRegistry.getInstance();
  
  public applyProperty(control: Control, propertyName: string, value: any): Control {
    // Create a copy of the control to maintain immutability
    const updatedControl = { ...control };
    
    // Apply the property
    updatedControl[propertyName] = value;
    
    // Check for child controls that inherit this property
    if (updatedControl.children) {
      const inheritableProps = this.registry.getInheritableProperties(control.type);
      const inheritedProp = inheritableProps.find(p => p.sourceProperty === propertyName);
      
      if (inheritedProp) {
        // Apply to children of appropriate types
        updatedControl.children = updatedControl.children.map(child => {
          if (inheritedProp.applyToTypes.includes(child.type)) {
            const transformedValue = inheritedProp.transform 
              ? inheritedProp.transform(value)
              : value;
            
            return {
              ...child,
              [inheritedProp.name]: transformedValue
            };
          }
          return child;
        });
      }
    }
    
    return updatedControl;
  }
  
  public validateProperty(
    control: Control, 
    propertyName: string, 
    value: any
  ): { valid: boolean; message?: string } {
    const properties = this.registry.getProperties(control.type);
    const propDef = properties.find(p => p.name === propertyName);
    
    if (!propDef) {
      return { valid: false, message: 'Unknown property' };
    }
    
    // No validation defined
    if (!propDef.validation) {
      return { valid: true };
    }
    
    const validation = propDef.validation;
    
    // Required check
    if (validation.required && (value === undefined || value === null || value === '')) {
      return { valid: false, message: `${propDef.label} is required` };
    }
    
    // Type-specific validations
    if (propDef.type === 'number') {
      if (validation.min !== undefined && value < validation.min) {
        return { valid: false, message: `${propDef.label} must be at least ${validation.min}` };
      }
      
      if (validation.max !== undefined && value > validation.max) {
        return { valid: false, message: `${propDef.label} must be at most ${validation.max}` };
      }
    }
    
    if (propDef.type === 'string' && validation.pattern) {
      const regex = new RegExp(validation.pattern);
      if (!regex.test(value)) {
        return { valid: false, message: `${propDef.label} has an invalid format` };
      }
    }
    
    // Custom validation
    if (validation.custom) {
      return validation.custom(value, control);
    }
    
    return { valid: true };
  }
}
```

## UI Components

### Property Editors

The system includes specialized editors for different property types:

```typescript
interface PropertyEditorProps {
  definition: PropertyDefinition;
  value: any;
  onChange: (value: any) => void;
  control: Control;
}

// String property editor
export const StringPropertyEditor: React.FC<PropertyEditorProps> = ({
  definition,
  value,
  onChange
}) => (
  <div className="property-editor string-editor">
    <label>{definition.label}</label>
    <input
      type="text"
      value={value || ''}
      onChange={e => onChange(e.target.value)}
      placeholder={definition.defaultValue}
    />
  </div>
);

// Select property editor
export const SelectPropertyEditor: React.FC<PropertyEditorProps> = ({
  definition,
  value,
  onChange
}) => (
  <div className="property-editor select-editor">
    <label>{definition.label}</label>
    <select
      value={value || definition.defaultValue}
      onChange={e => onChange(e.target.value)}
    >
      {definition.options?.map(option => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </div>
);

// Boolean property editor
export const BooleanPropertyEditor: React.FC<PropertyEditorProps> = ({
  definition,
  value,
  onChange
}) => (
  <div className="property-editor boolean-editor">
    <label>
      <input
        type="checkbox"
        checked={value ?? definition.defaultValue ?? false}
        onChange={e => onChange(e.target.checked)}
      />
      {definition.label}
    </label>
  </div>
);
```

### Property Group Component

Groups related properties for better organization:

```typescript
interface PropertyGroupComponentProps {
  group: PropertyGroup;
  control: Control;
  onChange: (propertyName: string, value: any) => void;
}

export const PropertyGroupComponent: React.FC<PropertyGroupComponentProps> = ({
  group,
  control,
  onChange
}) => {
  const [collapsed, setCollapsed] = useState(group.collapsed || false);
  const registry = PropertyRegistry.getInstance();
  const properties = registry.getProperties(control.type);
  
  // Filter properties in this group
  const groupProperties = properties.filter(prop => 
    group.properties.includes(prop.name)
  );
  
  return (
    <div className="property-group">
      <div 
        className="property-group-header"
        onClick={() => setCollapsed(!collapsed)}
      >
        <span>{group.label}</span>
        <span className={`collapse-icon ${collapsed ? 'collapsed' : ''}`}>
          {collapsed ? '►' : '▼'}
        </span>
      </div>
      
      {!collapsed && (
        <div className="property-group-content">
          {groupProperties.map(prop => (
            <PropertyEditorComponent
              key={prop.name}
              definition={prop}
              value={control[prop.name]}
              onChange={value => onChange(prop.name, value)}
              control={control}
            />
          ))}
        </div>
      )}
    </div>
  );
};
```

### Property Editor Factory

Creates the appropriate editor for each property type:

```typescript
export const PropertyEditorComponent: React.FC<PropertyEditorProps> = (props) => {
  const { definition } = props;
  
  // Check visibility condition
  if (definition.visible && !definition.visible(props.control)) {
    return null;
  }
  
  // Use custom editor if specified
  if (definition.customEditor) {
    const CustomEditor = definition.customEditor;
    return <CustomEditor {...props} />;
  }
  
  // Use built-in editor based on type
  switch (definition.type) {
    case 'string':
      return <StringPropertyEditor {...props} />;
    case 'number':
      return <NumberPropertyEditor {...props} />;
    case 'boolean':
      return <BooleanPropertyEditor {...props} />;
    case 'select':
      return <SelectPropertyEditor {...props} />;
    case 'color':
      return <ColorPropertyEditor {...props} />;
    default:
      return <div>Unknown property type: {definition.type}</div>;
  }
};
```

## CSS Organization

The CSS for integrated property panels is organized in a modular structure:

```
src/
  styles/
    properties/
      integrated-property-panel.css   # Base styles for property panel
      property-editors.css            # Styles for property editors
      property-groups.css             # Styles for property grouping
    controls/
      parent/
        tab-control-properties.css    # Tab-specific property panel styles
        accordion-properties.css      # Accordion-specific property panel styles
        column-layout-properties.css  # Column layout-specific property panel styles
```

## Integration with Drag and Drop System

The property panel is integrated with the drag and drop system to ensure proper behavior:

1. **Drag Avoidance in Property Areas**: Property editing areas are marked with a special class to prevent drag initiation.

2. **Context-Aware Preview**: When dragging controls, the preview adjusts based on whether the drop target is a property panel or content area.

3. **Property State Preservation**: When moving controls, their property values are preserved during drag and drop operations.

## Implementation Best Practices

### 1. Isolating Property Updates

Property changes are isolated to minimize unnecessary re-renders:

```typescript
const handlePropertyChange = (name: string, value: any) => {
  const propertyManager = new PropertyManager();
  const validationResult = propertyManager.validateProperty(control, name, value);
  
  if (validationResult.valid) {
    const updatedControl = propertyManager.applyProperty(control, name, value);
    onControlUpdate(updatedControl);
  } else {
    // Handle validation error
    showValidationError(validationResult.message);
  }
};
```

### 2. Performance Optimization

For controls with many properties, performance is optimized through:

1. Lazy loading of property editors
2. Virtualization for long property lists
3. Memoization of property components

```typescript
const MemoizedPropertyEditor = React.memo(PropertyEditorComponent, 
  (prevProps, nextProps) => {
    return prevProps.value === nextProps.value && 
           prevProps.control.id === nextProps.control.id;
  }
);
```

### 3. Consistent Property Groups

Property groups are standardized across control types:

- **Basic**: Common properties like label, name, ID
- **Layout**: Size, position, alignment
- **Appearance**: Colors, borders, styles
- **Behavior**: Interactive behaviors and validations
- **Advanced**: Complex settings and configurations

## Testing

### Unit Tests

```typescript
describe('PropertyManager', () => {
  let propertyManager: PropertyManager;
  
  beforeEach(() => {
    propertyManager = new PropertyManager();
    // Register test properties
  });
  
  test('applyProperty should update control property', () => {
    const control = { id: 'test', type: ControlType.Tab, label: 'Test' };
    const updated = propertyManager.applyProperty(control, 'label', 'Updated');
    
    expect(updated.label).toBe('Updated');
    expect(updated).not.toBe(control); // Should be a new object (immutability)
  });
  
  test('applyProperty should handle property inheritance', () => {
    const control = {
      id: 'parent',
      type: ControlType.Tab,
      enabled: true,
      children: [
        { id: 'child1', type: ControlType.TextBox },
        { id: 'child2', type: ControlType.Checkbox }
      ]
    };
    
    const updated = propertyManager.applyProperty(control, 'enabled', false);
    
    expect(updated.enabled).toBe(false);
    expect(updated.children[0].enabled).toBe(false);
    expect(updated.children[1].enabled).toBe(false);
  });
});
```

### Integration Tests

```typescript
describe('IntegratedPropertyPanel', () => {
  test('should render all properties for control type', () => {
    const control = {
      id: 'test',
      type: ControlType.Tab,
      label: 'Test Tab'
    };
    
    render(
      <IntegratedPropertyPanel 
        control={control}
        onChange={jest.fn()}
      />
    );
    
    // Should render all property editors from registry
    const propertyEditors = screen.getAllByTestId('property-editor');
    expect(propertyEditors.length).toBeGreaterThan(0);
    
    // Should render specific properties
    expect(screen.getByLabelText('Label')).toBeInTheDocument();
    expect(screen.getByLabelText('Tab Position')).toBeInTheDocument();
  });
  
  test('should call onChange when property value changes', () => {
    const control = {
      id: 'test',
      type: ControlType.Tab,
      label: 'Test Tab'
    };
    
    const onChange = jest.fn();
    
    render(
      <IntegratedPropertyPanel 
        control={control}
        onChange={onChange}
      />
    );
    
    // Change the label property
    const labelInput = screen.getByLabelText('Label');
    fireEvent.change(labelInput, { target: { value: 'Updated Label' } });
    
    expect(onChange).toHaveBeenCalledWith('label', 'Updated Label');
  });
});
```

## Conclusion

The integrated property management system provides a seamless user experience by embedding property editing directly within parent controls in the design tab. This approach offers several benefits:

1. **Contextual Editing**: Properties are edited in the context of their parent control
2. **Reduced UI Switching**: No need to switch between separate panels
3. **Improved Workflow**: More intuitive design process
4. **Visual Connection**: Clear visual relationship between controls and their properties

By following these implementation patterns and best practices, the system can be easily extended to support new control types while maintaining a consistent user experience.
