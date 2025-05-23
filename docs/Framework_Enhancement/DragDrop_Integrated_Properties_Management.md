# Integrated Properties Management Specification

## Overview

This document details the integrated properties management approach in the enhanced drag and drop system. Properties are directly embedded within the parent control UI in the design tab, providing an intuitive and contextual property editing experience.

## Key Concepts

### 1. In-Context Property Editing

Properties are directly accessible within the parent control's UI, eliminating the need for a separate properties panel and maintaining design context.

```
┌─────────────────────────────────────────────────────────────────┐
│ Tab Control                                                      │
│                                                                  │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐   ┌─────────────────────┐  │
│  │ Tab 1   │ │ Tab 2   │ │ Tab 3   │   │    Properties       │  │
│  └─────────┘ └─────────┘ └─────────┘   │                     │  │
│                                        │ Label: [Tab Group]   │  │
│  ┌─────────────────────────────────────┐ Position: [Top  ▼]   │  │
│  │                                     │ Width:    [100%   ]  │  │
│  │            Tab Content              │ Required: [✓]        │  │
│  │                                     │                      │  │
│  └─────────────────────────────────────┘                      │  │
│                                         └─────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### 2. Property Tab Integration

Property editing is integrated as an additional tab or panel within parent controls:

1. **Tab Control**: Properties appear as a special tab alongside content tabs
2. **Accordion**: Properties appear as a dedicated section within the accordion
3. **Column Layout**: Properties appear in an expandable panel at the top

### 3. Contextual Property Groups

Properties are organized into logical groups based on the control type:

- **Common Properties**: Label, visibility, enabled state
- **Layout Properties**: Width, height, alignment, margins
- **Control-Specific Properties**: Special properties for each control type
- **Data Properties**: Data binding, validation rules, default values
- **Appearance Properties**: Colors, borders, typography

## Architecture Components

### 1. Integrated Properties Manager

```typescript
export class IntegratedPropertiesManager {
  // Get properties for a control type
  public getProperties(controlType: ControlType): PropertyDefinition[] {
    const registry = PropertyRegistry.getInstance();
    return registry.getPropertiesForControlType(controlType);
  }
  
  // Render properties within a parent control
  public renderInlineProperties(
    parentElement: HTMLElement,
    control: Control,
    onChange: (prop: string, value: any) => void
  ): void {
    // Create property panel
    const panel = this.createPropertyPanel(control);
    
    // Add property editors
    const properties = this.getProperties(control.type);
    properties.forEach(property => {
      const editor = this.createPropertyEditor(property, control, onChange);
      panel.appendChild(editor);
    });
    
    // Add panel to parent element
    parentElement.appendChild(panel);
  }
  
  // Helper methods
  private createPropertyPanel(control: Control): HTMLElement { /* ... */ }
  private createPropertyEditor(
    property: PropertyDefinition, 
    control: Control, 
    onChange: (prop: string, value: any) => void
  ): HTMLElement { /* ... */ }
}
```

### 2. Property Definition System

```typescript
export interface PropertyDefinition {
  name: string;                   // Property name
  type: PropertyType;             // Data type
  defaultValue?: any;             // Default value
  category: PropertyCategory;     // Logical grouping
  label: string;                  // Display label
  description?: string;           // Tooltip text
  required?: boolean;             // Is required?
  min?: number;                   // Min value (numeric)
  max?: number;                   // Max value (numeric)
  options?: PropertyOption[];     // Options for selects
  validator?: PropertyValidator;  // Custom validation
  visible?: (control: Control) => boolean; // Dynamic visibility
}

export enum PropertyType {
  String = "string",
  Number = "number",
  Boolean = "boolean",
  Select = "select",
  Color = "color",
  Size = "size",
  Font = "font",
  Icon = "icon",
  Expression = "expression"
}

export enum PropertyCategory {
  Basic = "basic",
  Layout = "layout",
  Appearance = "appearance",
  Data = "data",
  Advanced = "advanced"
}

export interface PropertyOption {
  value: string | number | boolean;
  label: string;
  icon?: string;
}
```

### 3. Property Registry

```typescript
export class PropertyRegistry {
  private static instance: PropertyRegistry;
  private properties: Map<ControlType, PropertyDefinition[]> = new Map();
  
  public static getInstance(): PropertyRegistry {
    if (!PropertyRegistry.instance) {
      PropertyRegistry.instance = new PropertyRegistry();
      PropertyRegistry.instance.registerDefaultProperties();
    }
    return PropertyRegistry.instance;
  }
  
  public registerProperties(
    controlType: ControlType, 
    properties: PropertyDefinition[]
  ): void {
    this.properties.set(controlType, properties);
  }
  
  public getPropertiesForControlType(controlType: ControlType): PropertyDefinition[] {
    const commonProps = this.getCommonProperties();
    const specificProps = this.properties.get(controlType) || [];
    return [...commonProps, ...specificProps];
  }
  
  private getCommonProperties(): PropertyDefinition[] {
    return [
      {
        name: "label",
        type: PropertyType.String,
        defaultValue: "",
        category: PropertyCategory.Basic,
        label: "Label",
        required: false
      },
      {
        name: "visible",
        type: PropertyType.Boolean,
        defaultValue: true,
        category: PropertyCategory.Basic,
        label: "Visible"
      },
      {
        name: "enabled",
        type: PropertyType.Boolean,
        defaultValue: true,
        category: PropertyCategory.Basic,
        label: "Enabled"
      }
      // Other common properties
    ];
  }
  
  private registerDefaultProperties(): void {
    // Register properties for each control type
    this.registerTabProperties();
    this.registerAccordionProperties();
    this.registerColumnLayoutProperties();
    this.registerTextBoxProperties();
    // Other control types...
  }
  
  private registerTabProperties(): void {
    this.registerProperties(ControlType.Tab, [
      {
        name: "position",
        type: PropertyType.Select,
        defaultValue: "top",
        category: PropertyCategory.Layout,
        label: "Tab Position",
        options: [
          { value: "top", label: "Top" },
          { value: "bottom", label: "Bottom" },
          { value: "left", label: "Left" },
          { value: "right", label: "Right" }
        ]
      },
      {
        name: "tabStyle",
        type: PropertyType.Select,
        defaultValue: "default",
        category: PropertyCategory.Appearance,
        label: "Tab Style",
        options: [
          { value: "default", label: "Default" },
          { value: "pills", label: "Pills" },
          { value: "underlined", label: "Underlined" },
          { value: "buttons", label: "Buttons" }
        ]
      }
      // Other tab-specific properties
    ]);
  }
  
  // Similar methods for other control types...
}
```

### 4. Property UI Components

```typescript
export class PropertyEditorFactory {
  private static editors: Map<PropertyType, React.ComponentType<PropertyEditorProps>> = new Map();
  
  public static registerEditor(
    type: PropertyType, 
    editor: React.ComponentType<PropertyEditorProps>
  ): void {
    this.editors.set(type, editor);
  }
  
  public static getEditor(
    type: PropertyType
  ): React.ComponentType<PropertyEditorProps> {
    return this.editors.get(type) || this.getDefaultEditor();
  }
  
  private static getDefaultEditor(): React.ComponentType<PropertyEditorProps> {
    return TextPropertyEditor;
  }
}

export interface PropertyEditorProps {
  property: PropertyDefinition;
  value: any;
  onChange: (name: string, value: any) => void;
  control: Control;
}

// Example editor components
export const TextPropertyEditor: React.FC<PropertyEditorProps> = (props) => {
  // Text input implementation
};

export const BooleanPropertyEditor: React.FC<PropertyEditorProps> = (props) => {
  // Checkbox implementation
};

export const SelectPropertyEditor: React.FC<PropertyEditorProps> = (props) => {
  // Dropdown implementation
};
```

## Integration with Parent Controls

### Tab Control Integration

```typescript
export class TabControlWithProperties extends React.Component<TabControlProps> {
  private propertiesManager = new IntegratedPropertiesManager();
  
  render() {
    const { control } = this.props;
    
    return (
      <div className="tab-control">
        <div className="tab-headers">
          {/* Regular tabs */}
          {control.tabs.map((tab, index) => (
            <div key={tab.id} className="tab-header">
              {tab.label}
            </div>
          ))}
          
          {/* Properties tab */}
          <div className="tab-header properties-tab">
            Properties
          </div>
        </div>
        
        <div className="tab-content">
          {/* Regular tab content or Properties panel based on selected tab */}
          {this.renderContent()}
        </div>
      </div>
    );
  }
  
  private renderContent() {
    const { control, selectedTabIndex } = this.props;
    
    // If properties tab is selected
    if (selectedTabIndex === control.tabs.length) {
      return (
        <div className="properties-panel">
          {this.renderProperties()}
        </div>
      );
    }
    
    // Otherwise render regular tab content
    return (
      <div className="tab-content-inner">
        {/* Tab content for selectedTabIndex */}
      </div>
    );
  }
  
  private renderProperties() {
    const { control, onControlChange } = this.props;
    
    return (
      <PropertiesPanel
        control={control}
        onChange={(name, value) => {
          const updatedControl = { ...control, [name]: value };
          onControlChange(updatedControl);
        }}
      />
    );
  }
}
```

### Accordion Control Integration

```typescript
export class AccordionControlWithProperties extends React.Component<AccordionControlProps> {
  render() {
    const { control } = this.props;
    
    return (
      <div className="accordion-control">
        {/* Regular accordion sections */}
        {control.sections.map((section, index) => (
          <div key={section.id} className="accordion-section">
            <div className="accordion-header">{section.label}</div>
            <div className="accordion-content">
              {/* Section content */}
            </div>
          </div>
        ))}
        
        {/* Properties section */}
        <div className="accordion-section properties-section">
          <div className="accordion-header">Properties</div>
          <div className="accordion-content">
            <PropertiesPanel
              control={control}
              onChange={(name, value) => {
                const updatedControl = { ...control, [name]: value };
                this.props.onControlChange(updatedControl);
              }}
            />
          </div>
        </div>
      </div>
    );
  }
}
```

### Column Layout Integration

```typescript
export class ColumnLayoutWithProperties extends React.Component<ColumnLayoutProps> {
  state = {
    propertiesExpanded: false
  };
  
  render() {
    const { control } = this.props;
    const { propertiesExpanded } = this.state;
    
    return (
      <div className="column-layout-control">
        {/* Properties toggle */}
        <div 
          className="properties-toggle"
          onClick={() => this.setState({ propertiesExpanded: !propertiesExpanded })}
        >
          Properties {propertiesExpanded ? '▲' : '▼'}
        </div>
        
        {/* Properties panel (collapsible) */}
        {propertiesExpanded && (
          <div className="properties-panel">
            <PropertiesPanel
              control={control}
              onChange={(name, value) => {
                const updatedControl = { ...control, [name]: value };
                this.props.onControlChange(updatedControl);
              }}
            />
          </div>
        )}
        
        {/* Column layout content */}
        <div className="columns-container">
          {control.columnControls.map((columnControls, colIndex) => (
            <div key={colIndex} className="column">
              {/* Column content */}
            </div>
          ))}
        </div>
      </div>
    );
  }
}
```

## CSS Structure for Property Integration

```css
/* base/property-variables.css */
:root {
  --property-panel-bg: #f5f5f5;
  --property-label-color: #333;
  --property-border-color: #ddd;
  --property-input-bg: #fff;
  --property-group-header-bg: #e9e9e9;
}

/* controls/common/properties-panel.css */
.properties-panel {
  background-color: var(--property-panel-bg);
  border-radius: 4px;
  padding: 12px;
}

.property-group {
  margin-bottom: 16px;
}

.property-group-header {
  background-color: var(--property-group-header-bg);
  padding: 8px 12px;
  font-weight: 600;
  border-radius: 4px;
}

.property-item {
  display: flex;
  margin: 8px 0;
  align-items: center;
}

.property-label {
  flex: 0 0 40%;
  color: var(--property-label-color);
}

.property-editor {
  flex: 1;
}

/* controls/parent/tab-control-properties.css */
.tab-control .properties-tab {
  background-color: var(--property-panel-bg);
  border-bottom: 2px solid #4a90e2;
}

/* controls/parent/accordion-properties.css */
.accordion-control .properties-section > .accordion-header {
  background-color: var(--property-panel-bg);
}

/* controls/parent/column-layout-properties.css */
.column-layout-control .properties-toggle {
  background-color: var(--property-panel-bg);
  cursor: pointer;
  padding: 6px 12px;
  text-align: center;
  border-radius: 4px 4px 0 0;
}

.column-layout-control .properties-panel {
  border-radius: 0 0 4px 4px;
  margin-bottom: 12px;
}
```

## JSON Serialization of Properties

The property values are serialized as part of the control:

```json
{
  "id": "tab1",
  "type": "tab",
  "label": "Personal Information",
  "position": "top",
  "tabStyle": "default",
  "visible": true,
  "enabled": true,
  "width": "100%",
  "requiredIndicator": true,
  "tabs": [
    {
      "id": "tab1-1",
      "label": "Basic Info",
      "controls": [
        {
          "id": "name",
          "type": "textBox",
          "label": "Full Name",
          "required": true
        }
      ]
    }
  ]
}
```

## Testing Strategy for Integrated Properties

### Unit Tests

1. **Property Definition Tests**
   - Test property definitions for all control types
   - Verify default values, validation rules, and options

2. **Property Editor Tests**
   - Test each property editor component
   - Verify proper handling of changes, validation, and rendering

3. **Integration Tests**
   - Test property integration in parent controls
   - Verify property panel shows/hides correctly
   - Verify control updates when properties change

### Example Test Cases

```typescript
// Property Registry Tests
describe('PropertyRegistry', () => {
  it('should return common properties for all controls', () => {
    const registry = PropertyRegistry.getInstance();
    const props = registry.getPropertiesForControlType(ControlType.Tab);
    expect(props.some(p => p.name === 'label')).toBe(true);
    expect(props.some(p => p.name === 'visible')).toBe(true);
    expect(props.some(p => p.name === 'enabled')).toBe(true);
  });

  it('should include specific properties for tab control', () => {
    const registry = PropertyRegistry.getInstance();
    const props = registry.getPropertiesForControlType(ControlType.Tab);
    expect(props.some(p => p.name === 'position')).toBe(true);
    expect(props.some(p => p.name === 'tabStyle')).toBe(true);
  });
});

// Property Editor Tests
describe('PropertyEditors', () => {
  it('should render text editor correctly', () => {
    const property = {
      name: 'label',
      type: PropertyType.String,
      label: 'Label'
    };
    
    const onChange = jest.fn();
    
    render(
      <TextPropertyEditor 
        property={property} 
        value="Test" 
        onChange={onChange} 
        control={mockControl} 
      />
    );
    
    expect(screen.getByDisplayValue('Test')).toBeInTheDocument();
  });
  
  it('should call onChange when value changes', () => {
    const property = {
      name: 'label',
      type: PropertyType.String,
      label: 'Label'
    };
    
    const onChange = jest.fn();
    
    render(
      <TextPropertyEditor 
        property={property} 
        value="Test" 
        onChange={onChange} 
        control={mockControl} 
      />
    );
    
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Updated' } });
    expect(onChange).toHaveBeenCalledWith('label', 'Updated');
  });
});

// Parent Control Integration Tests
describe('TabControlWithProperties', () => {
  it('should render properties tab', () => {
    render(
      <TabControlWithProperties 
        control={mockTabControl} 
        onControlChange={jest.fn()} 
      />
    );
    
    expect(screen.getByText('Properties')).toBeInTheDocument();
  });
  
  it('should show properties panel when properties tab is selected', () => {
    render(
      <TabControlWithProperties 
        control={mockTabControl} 
        selectedTabIndex={mockTabControl.tabs.length}
        onControlChange={jest.fn()} 
      />
    );
    
    expect(screen.getByTestId('properties-panel')).toBeInTheDocument();
    expect(screen.getByText('Label')).toBeInTheDocument();
    expect(screen.getByText('Tab Position')).toBeInTheDocument();
  });
  
  it('should update control when property changes', () => {
    const onControlChange = jest.fn();
    
    render(
      <TabControlWithProperties 
        control={mockTabControl} 
        selectedTabIndex={mockTabControl.tabs.length}
        onControlChange={onControlChange} 
      />
    );
    
    fireEvent.change(screen.getByLabelText('Label'), { target: { value: 'Updated Label' } });
    
    expect(onControlChange).toHaveBeenCalledWith(
      expect.objectContaining({ 
        label: 'Updated Label' 
      })
    );
  });
});
```

## Conclusion

The integrated properties approach provides a contextual and intuitive property editing experience by embedding properties directly within parent controls. This architecture eliminates the need for a separate properties panel and keeps designers focused on the element they're working with. The approach is flexible enough to work with different parent control types while maintaining a consistent property editing experience across the application.
