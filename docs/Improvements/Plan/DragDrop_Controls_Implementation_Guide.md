# Control Implementation Guide for Enhanced Drag and Drop System

This document provides guidelines for implementing new controls within the enhanced drag and drop architecture, covering both parent and child controls.

## Control Registration Process

### Parent Control Registration

To add a new parent control type to the system:

1. **Define Control Type**

   Add the new control type to the ControlType enum:

   ```typescript
   export enum ControlType {
     // Existing types...
     MyNewParentControl = "myNewParentControl"
   }
   ```

2. **Create Control Interface**

   Define the control interface extending the base Control interface:

   ```typescript
   export interface MyNewParentControl extends Control {
     type: ControlType.MyNewParentControl;
     // Additional properties specific to this control
     specialProperty?: string;
     layout?: 'vertical' | 'horizontal';
     // Child collection (required for parent controls)
     children: Control[];
   }
   ```

3. **Create Drag Drop Strategy**

   Implement a drag-drop strategy for the new control:

   ```typescript
   // src/utils/dragDrop/strategies/MyNewParentControlDragDropStrategy.ts
   export class MyNewParentControlDragDropStrategy implements DragDropStrategy {
     canAcceptChild(childType: ControlType): boolean {
       // Define which child control types can be accepted
       return [
         ControlType.TextBox, 
         ControlType.Checkbox,
         // other acceptable child types...
       ].includes(childType);
     }
     
     getValidDropPositions(childType: ControlType): DropIndicatorPosition[] {
       // Define valid positions for dropping children
       return [
         DropIndicatorPosition.Inside,
         DropIndicatorPosition.Top,
         DropIndicatorPosition.Bottom
       ];
     }
     
     // Other required implementations...
   }
   ```

4. **Register Strategy with Registry**

   Add the strategy to the registry:

   ```typescript
   // In registerDefaultStrategies method
   this.registerStrategy(
     ControlType.MyNewParentControl, 
     new MyNewParentControlDragDropStrategy()
   );
   ```

5. **Create Composite Drop Target Implementation**

   ```typescript
   // src/utils/dragDrop/compositeDrop/MyNewParentCompositeDropTarget.ts
   export class MyNewParentCompositeDropTarget implements CompositeDropTarget {
     // Implementation for regions and drop handling
   }
   ```

6. **Add Factory Support**

   Update the factory to support the new control:

   ```typescript
   // In CompositeDropTargetFactory
   public static create(element: HTMLElement, controlType: ControlType): CompositeDropTarget | null {
     switch (controlType) {
       // Existing cases...
       case ControlType.MyNewParentControl:
         return new MyNewParentCompositeDropTarget(element);
       // ...
     }
   }
   ```

7. **Create Preview Renderer**

   Add preview rendering support:

   ```typescript
   // In DragPreviewManager.getPreviewContent
   private getPreviewContent(control: Control): string {
     switch (control.type) {
       // Existing cases...
       case ControlType.MyNewParentControl:
         return '<div class="preview-my-parent-control">...</div>';
       // ...
     }
   }
   ```

8. **Add Property Definitions**

   Define the properties for the new control:

   ```typescript
   // In PropertyDefinitions
   export const MyNewParentControlProperties: PropertyDefinition[] = [
     {
       name: "label",
       type: "string",
       defaultValue: "New Control",
       category: "Basic"
     },
     {
       name: "layout",
       type: "select",
       options: ["vertical", "horizontal"],
       defaultValue: "vertical",
       category: "Layout"
     },
     // Other properties...
   ];
   ```

9. **Register Control with Serializer**

   Add serialization support:

   ```typescript
   // In ControlSerializer.registerSerializers
   this.registerControlSerializer(
     ControlType.MyNewParentControl,
     {
       serialize: (control: MyNewParentControl) => {
         // Custom serialization logic
         return { ...control };
       },
       deserialize: (data: any): MyNewParentControl => {
         // Custom deserialization logic
         return {
           id: data.id || generateId(),
           type: ControlType.MyNewParentControl,
           label: data.label || "New Control",
           // Other properties...
           children: this.deserializeChildren(data.children || [])
         };
       }
     }
   );
   ```

10. **Create CSS Files**

    Create control-specific CSS files:

    ```css
    /* src/styles/controls/parent/my-new-parent-control.css */
    .my-new-parent-control {
      display: flex;
      flex-direction: column;
      border: 1px solid var(--control-border-color);
      /* Other styles... */
    }

    .my-new-parent-control-header {
      /* Header styles... */
    }

    .my-new-parent-control-content {
      /* Content area styles... */
    }

    /* Drag states */
    .my-new-parent-control.drop-target-active {
      /* Active drop target styles... */
    }
    ```

### Child Control Registration

To add a new child control:

1. **Define Control Type**

   Add to the ControlType enum:

   ```typescript
   export enum ControlType {
     // Existing types...
     MyNewChildControl = "myNewChildControl"
   }
   ```

2. **Create Control Interface**

   Define the child control interface:

   ```typescript
   export interface MyNewChildControl extends Control {
     type: ControlType.MyNewChildControl;
     // Child-specific properties
     defaultValue?: string;
     validation?: ValidationRule[];
   }
   ```

3. **Update Parent Strategies**

   Update parent control strategies to accept the new child:

   ```typescript
   // For each parent that should accept this child
   canAcceptChild(childType: ControlType): boolean {
     return [
       // Existing accepted types...
       ControlType.MyNewChildControl
     ].includes(childType);
   }
   ```

4. **Create Preview Renderer**

   Add preview rendering:

   ```typescript
   // In DragPreviewManager.getPreviewContent
   case ControlType.MyNewChildControl:
     return '<div class="preview-my-child-control">...</div>';
   ```

5. **Add Property Definitions**

   Define the properties:

   ```typescript
   export const MyNewChildControlProperties: PropertyDefinition[] = [
     {
       name: "label",
       type: "string",
       defaultValue: "New Control",
       category: "Basic"
     },
     // Child-specific properties...
   ];
   ```

6. **Register Control with Serializer**

   Add serialization support:

   ```typescript
   this.registerControlSerializer(
     ControlType.MyNewChildControl,
     {
       serialize: (control: MyNewChildControl) => ({ ...control }),
       deserialize: (data: any): MyNewChildControl => ({
         id: data.id || generateId(),
         type: ControlType.MyNewChildControl,
         label: data.label || "New Child Control",
         // Other properties...
       })
     }
   );
   ```

7. **Create CSS Files**

   Create control-specific CSS:

   ```css
   /* src/styles/controls/child/my-new-child-control.css */
   .my-new-child-control {
     /* Base styles... */
   }

   .my-new-child-control-label {
     /* Label styles... */
   }

   /* States */
   .my-new-child-control:hover {
     /* Hover state... */
   }

   .my-new-child-control.dragging {
     /* Dragging state... */
   }
   ```

8. **Add to Control Palette**

   Add the control to the design palette:

   ```typescript
   // In ControlPalette component
   const childControls = [
     // Existing controls...
     {
       id: 'new-my-child',
       type: ControlType.MyNewChildControl,
       label: 'My New Control',
       icon: 'path/to/icon.svg'
     }
   ];
   ```

## Dependency Handling

For controls with dependencies:

1. **Define Dependencies**

   ```typescript
   const myControl: MyNewChildControl = {
     id: 'control1',
     type: ControlType.MyNewChildControl,
     label: 'Dependent Control',
     // Define dependencies
     dependencies: [
       {
         id: 'dep1',
         targetControlId: 'control2',
         property: 'visible',
         condition: {
           type: 'equals',
           value: ['true']
         }
       }
     ]
   };
   ```

2. **Register with Dependency Tracker**

   Ensure your control's dependencies are registered with the dependency tracker when it's added to the form:

   ```typescript
   // When adding the control
   dependencyTracker.current.buildDependencyMaps(updatedControls);
   ```

## Preview Rendering

For proper preview rendering:

1. **Create Component Renderer**

   Create a component for rendering the control in preview mode:

   ```tsx
   // src/components/preview/MyNewControlPreview.tsx
   export const MyNewControlPreview: React.FC<{ control: MyNewControl }> = ({ control }) => {
     return (
       <div className="my-new-control-preview">
         <div className="preview-label">{control.label}</div>
         {/* Render control-specific UI */}
       </div>
     );
   };
   ```

2. **Register with Preview System**

   Add to the preview component registry:

   ```typescript
   // In PreviewComponentRegistry
   registerPreviewComponent() {
     this.components.set(ControlType.MyNewChildControl, MyNewControlPreview);
     // Or for parent controls
     this.components.set(ControlType.MyNewParentControl, MyNewParentControlPreview);
   }
   ```

## JSON Generation

For proper JSON generation:

1. **Create Schema Definition**

   Define the JSON schema for validation:

   ```typescript
   // In ControlSchemas
   export const MyNewControlSchema = {
     type: 'object',
     properties: {
       id: { type: 'string' },
       type: { type: 'string', enum: [ControlType.MyNewChildControl] },
       label: { type: 'string' },
       // Other properties...
     },
     required: ['id', 'type']
   };
   ```

2. **Implement Custom Transformations**

   Add any custom transformation logic:

   ```typescript
   // In ControlSerializer
   private transformMyNewControlForExport(control: MyNewChildControl): any {
     // Apply any special transformations for external systems
     return {
       ...control,
       // Transform properties as needed
       transformedProp: someTransformation(control.someProp)
     };
   }
   ```

## Testing New Controls

For each new control, create the following tests:

1. **Drag and Drop Tests**

   ```typescript
   // Test parent accepting the child
   test('MyNewParentControl accepts MyNewChildControl', () => {
     const strategy = new MyNewParentControlDragDropStrategy();
     expect(strategy.canAcceptChild(ControlType.MyNewChildControl)).toBe(true);
   });

   // Test drop positions
   test('MyNewParentControl provides correct drop positions', () => {
     const strategy = new MyNewParentControlDragDropStrategy();
     const positions = strategy.getValidDropPositions(ControlType.MyNewChildControl);
     expect(positions).toContain(DropIndicatorPosition.Inside);
   });
   ```

2. **Serialization Tests**

   ```typescript
   test('MyNewControl serializes and deserializes correctly', () => {
     const control: MyNewControl = {
       id: 'test',
       type: ControlType.MyNewChildControl,
       label: 'Test Control'
     };
     
     const serialized = serializer.serialize([control]);
     const deserialized = serializer.deserialize(serialized);
     
     expect(deserialized[0]).toMatchObject(control);
   });
   ```

3. **Preview Rendering Tests**

   ```typescript
   test('MyNewControl preview renders correctly', () => {
     const control: MyNewControl = {
       id: 'test',
       type: ControlType.MyNewChildControl,
       label: 'Test Control'
     };
     
     render(<MyNewControlPreview control={control} />);
     expect(screen.getByText('Test Control')).toBeInTheDocument();
   });
   ```

## CSS Organization

Follow this structure for CSS:

```
src/
  styles/
    controls/
      parent/
        my-new-parent-control.css
      child/
        my-new-child-control.css
    drag-drop/
      indicators.css      # Drop indicators
      preview.css         # Preview styling
      ghost.css           # Ghost elements
    themes/
      default/
        control-theme.css # Theme variables
```

Import CSS files in the proper order:

```typescript
// In main style file
import './styles/base/variables.css';
import './styles/base/reset.css';
import './styles/themes/default/control-theme.css';
import './styles/drag-drop/indicators.css';
import './styles/drag-drop/preview.css';
import './styles/drag-drop/ghost.css';
// Parent controls
import './styles/controls/parent/my-new-parent-control.css';
// Child controls
import './styles/controls/child/my-new-child-control.css';
```

## Conclusion

Following these guidelines will ensure that new controls integrate seamlessly with the enhanced drag and drop architecture. This structured approach maintains consistency across the system and ensures all controls benefit from the architectural improvements.
