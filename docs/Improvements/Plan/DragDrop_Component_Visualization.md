# Component Breakdown for Enhanced Drag and Drop System

This document provides a detailed breakdown of the UI components and their interactions in the enhanced drag and drop system, with a specific focus on parent-child controls and preview functionality.

## Control Hierarchy Visualization

```
┌─────────────────────────────────────────────────────────┐
│ Survey Canvas                                           │
│                                                         │
│  ┌─────────────────────────────────────────────────┐    │
│  │ Tab Control (Parent)                            │    │
│  │  ┌─────────┐┌─────────┐┌─────────┐              │    │
│  │  │ Tab 1   ││ Tab 2   ││ Tab 3   │              │    │
│  │  └─────────┘└─────────┘└─────────┘              │    │
│  │                                                 │    │
│  │  ┌─────────────────────────────────────────┐    │    │
│  │  │ Tab Content                             │    │    │
│  │  │                                         │    │    │
│  │  │  ┌─────────────────────────────────┐    │    │    │
│  │  │  │ GroupBox (Child)                │    │    │    │
│  │  │  │                                 │    │    │    │
│  │  │  │  ┌────────────┐ ┌────────────┐  │    │    │    │
│  │  │  │  │ TextBox    │ │ Checkbox   │  │    │    │    │
│  │  │  │  └────────────┘ └────────────┘  │    │    │    │
│  │  │  └─────────────────────────────────┘    │    │    │
│  │  │                                         │    │    │
│  │  │  ┌─────────────────────────────────┐    │    │    │
│  │  │  │ Column Layout (Child)           │    │    │    │
│  │  │  │  ┌───────────┐  ┌───────────┐   │    │    │    │
│  │  │  │  │ Column 1  │  │ Column 2  │   │    │    │    │
│  │  │  │  │ ┌───────┐ │  │ ┌───────┐ │   │    │    │    │
│  │  │  │  │ │Text   │ │  │ │Numeric│ │   │    │    │    │
│  │  │  │  │ └───────┘ │  │ └───────┘ │   │    │    │    │
│  │  │  │  └───────────┘  └───────────┘   │    │    │    │
│  │  │  └─────────────────────────────────┘    │    │    │
│  │  └─────────────────────────────────────────┘    │    │
│  └─────────────────────────────────────────────────┘    │
│                                                         │
│  ┌─────────────────────────────────────────────────┐    │
│  │ Accordion Control (Parent)                      │    │
│  │  ┌─────────────────────────────────────────┐    │    │
│  │  │ Section 1                         [▼]   │    │    │
│  │  └─────────────────────────────────────────┘    │    │
│  │  ┌─────────────────────────────────────────┐    │    │
│  │  │ Section 2                         [▲]   │    │    │
│  │  │                                         │    │    │
│  │  │  ┌─────────────────────────────────┐    │    │    │
│  │  │  │ TextBox (Child)                 │    │    │    │
│  │  │  └─────────────────────────────────┘    │    │    │
│  │  │                                         │    │    │
│  │  └─────────────────────────────────────────┘    │    │
│  └─────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
```

## Drop Target Regions for Parent Controls

### Tab Control Regions

```
┌─────────────────────────────────────────────────────┐
│ Tab Control                                         │
│                                                     │
│  ┌─────────┐┌─────────┐┌─────────┐┌───────────────┐ │
│  │ Tab 1   ││ Tab 2   ││ Tab 3   ││ + (Tab Area)  │ │
│  └─────────┘└─────────┘└─────────┘└───────────────┘ │
│  ▲         ▲         ▲         ▲                    │
│  Region 1  Region 2  Region 3  Region 4            │
│                                                     │
│  ┌─────────────────────────────────────────────┐    │
│  │ Tab Content (Region 5)                      │    │
│  │                                             │    │
│  │                                             │    │
│  └─────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────┘
```

- **Region 1-4**: Accept tab headers or can reorder existing tabs
- **Region 5**: Content area accepts controls that can be placed in a tab

### Accordion Control Regions

```
┌─────────────────────────────────────────────────────┐
│ Accordion Control                                   │
│                                                     │
│  ┌─────────────────────────────────────────────┐    │
│  │ Section 1 Header (Region 1)           [▼]   │    │
│  └─────────────────────────────────────────────┘    │
│                                                     │
│  ┌─────────────────────────────────────────────┐    │
│  │ Section 2 Header (Region 2)           [▲]   │    │
│  └─────────────────────────────────────────────┘    │
│                                                     │
│  ┌─────────────────────────────────────────────┐    │
│  │ Section 2 Content (Region 3)                │    │
│  │                                             │    │
│  │                                             │    │
│  └─────────────────────────────────────────────┘    │
│                                                     │
│  ┌─────────────────────────────────────────────┐    │
│  │ New Section Area (Region 4)                 │    │
│  └─────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────┘
```

- **Region 1-2**: Accept section headers or can reorder existing sections
- **Region 3**: Content area accepts controls that can be placed in a section
- **Region 4**: Area to add a new section

### Column Layout Regions

```
┌─────────────────────────────────────────────────────┐
│ Column Layout                                       │
│                                                     │
│  ┌─────────────────────┐  ┌─────────────────────┐   │
│  │ Column 1 (Region 1) │  │ Column 2 (Region 2) │   │
│  │                     │  │                     │   │
│  │                     │  │                     │   │
│  │                     │  │                     │   │
│  │                     │  │                     │   │
│  └─────────────────────┘  └─────────────────────┘   │
│                                                     │
└─────────────────────────────────────────────────────┘
```

- **Region 1-2**: Each column is a separate drop region
- **Between Columns**: Special drop regions for adding new columns

## Preview Rendering for Different Control Types

### Drag Preview Types

1. **Ghost Preview**
   - Semi-transparent representation of the control
   - Shows basic structure without details
   - Lightest weight, best for performance

2. **Outline Preview**
   - Shows only the outline/boundaries of the control
   - Indicates size and shape
   - Good middle ground

3. **Solid Preview**
   - More detailed representation
   - Shows key UI elements of the control
   - More resource intensive but most informative

### Example Preview Renderings

#### TextBox Preview
```
┌──────────────────────────────┐
│ TextBox                      │
│ ┌────────────────────────┐   │
│ │                        │   │
│ └────────────────────────┘   │
└──────────────────────────────┘
```

#### Tab Control Preview
```
┌──────────────────────────────┐
│ Tab Control                  │
│ ┌─────┐┌─────┐┌─────┐        │
│ │Tab 1││Tab 2││Tab 3│        │
│ └─────┘└─────┘└─────┘        │
│ ┌──────────────────────────┐ │
│ │                          │ │
│ │      Content Area        │ │
│ │                          │ │
│ └──────────────────────────┘ │
└──────────────────────────────┘
```

#### Column Layout Preview
```
┌──────────────────────────────┐
│ Column Layout                │
│ ┌────────────┐┌────────────┐ │
│ │            ││            │ │
│ │  Column 1  ││  Column 2  │ │
│ │            ││            │ │
│ └────────────┘└────────────┘ │
└──────────────────────────────┘
```

## Dependency Visualization

When dragging controls with dependencies, the system will visualize connections between dependent controls:

```
┌────────────────────┐            ┌────────────────────┐
│ TextBox A          │            │ Checkbox B         │
│ ┌──────────────┐   │            │ ┌──────────────┐   │
│ │              │   │            │ │     [✓]      │   │
│ └──────────────┘   │------------│ └──────────────┘   │
└────────────────────┘            └────────────────────┘
      Source Control                Dependent Control
```

Different dependency types will be visualized differently:

- **Visibility Dependency**: Dashed line
- **Value Dependency**: Solid line
- **Validation Dependency**: Dotted line

## Drop Indicators

Visual indicators will show where elements will be placed:

```
Before Drop Target:
┌────────────────────┐
│ Control A          │
└────────────────────┘
█████████████████████  <-- Top indicator (horizontal bar)
┌────────────────────┐
│ Control B          │
└────────────────────┘

Inside Drop Target:
┌────────────────────┐
│ Container Control  │
│                    │
│  ╔════════════════╗│  <-- Inside indicator (border)
│  ║                ║│
│  ╚════════════════╝│
└────────────────────┘

After Drop Target:
┌────────────────────┐
│ Control A          │
└────────────────────┘
█████████████████████  <-- Bottom indicator (horizontal bar)

Column Layout Indicators:
┌───────────┐│┌───────────┐
│           │││           │
│ Column 1  │││ Column 2  │
│           │││           │
└───────────┘│└───────────┘
             ▼
            Vertical indicator (between columns)
```

## Parent-Child Control Relationship Flow

1. **Initial State**
   - Parent controls can contain child controls
   - Child controls can have different constraints based on parent type

2. **Drag Operation**
   - When dragging a parent control, a simplified preview shows its structure
   - When dragging a child control:
     - If it has dependencies, they are visualized
     - Valid drop targets are highlighted

3. **Drop Operation Validation**
   - Parent control validates if it can accept the child
   - Child control validates if it can be dropped in the specific region
   - Dependency validation checks if moving would break dependencies

4. **Post-Drop Updates**
   - Parent control updates its internal structure
   - Child control updates its parent reference
   - UI refreshes to show the new hierarchy

## Preview Controls with Dependencies

When dragging a control with dependencies, the system will:

1. Highlight all controls involved in the dependency chain
2. Show preview in the target location
3. Indicate whether dependencies will remain valid after move
4. Provide visual feedback for invalid moves

### Dependency States During Drag

```
┌──────────────────┐
│ Valid Dependency │
│                  │
│     ┌─────┐      │
│     │  ✓  │      │
│     └─────┘      │
└──────────────────┘

┌──────────────────┐
│ Broken Dependency│
│                  │
│     ┌─────┐      │
│     │  ✗  │      │
│     └─────┘      │
└──────────────────┘

┌──────────────────┐
│ Warning          │
│                  │
│     ┌─────┐      │
│     │  ⚠  │      │
│     └─────┘      │
└──────────────────┘
```

## Screenshot of Expected UI

![Drag and Drop UI](../images/drag_drop_enhanced_ui_concept.png)

## Component Communication Flow

```
┌────────────────┐      ┌────────────────┐      ┌────────────────┐
│ DragSource     │─────▶│ DragDrop       │◀─────│ DropTarget     │
│ Component      │      │ Context        │      │ Component      │
└────────────────┘      └───────┬────────┘      └────────────────┘
                                │
                                ▼
                        ┌────────────────┐
                        │ Strategy       │
                        │ Registry       │
                        └───────┬────────┘
                                │
             ┌──────────────────┼──────────────────┐
             ▼                  ▼                  ▼
     ┌────────────────┐ ┌────────────────┐ ┌────────────────┐
     │ Preview        │ │ Dependency     │ │ Composite      │
     │ Manager        │ │ Tracker        │ │ DropTarget     │
     └────────────────┘ └────────────────┘ └────────────────┘
```

This visualization demonstrates how the enhanced drag and drop system will handle parent-child control relationships and their associated preview controls with dependencies. The modular architecture allows for consistent behavior across different control types while providing rich visual feedback during drag operations.
