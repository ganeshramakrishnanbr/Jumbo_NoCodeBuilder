export interface Control {
  id: string;
  type: ControlType;
  label?: string;
  required?: boolean;
  visible?: boolean;
  enabled?: boolean;
  styles?: Record<string, string>;
  properties?: Record<string, any>;
  children?: Control[];
  parent?: string;
  conditions?: Condition[];
  jsonId?: string;
  dependencies?: Dependency[];
}

export enum ControlType {
  // Container controls
  Tab = "tab",
  GroupBox = "groupBox",
  Accordion = "accordion",
  ColumnLayout = "columnLayout",
  
  // Basic input controls
  TextBox = "textBox",
  Checkbox = "checkbox",
  RadioButton = "radioButton",
  ToggleSlider = "toggleSlider",
  Numeric = "numeric",
  Dropdown = "dropdown",
  
  // Specialized controls
  Address = "address",
  ProtectedNumber = "protectedNumber",
  NumberOnly = "numberOnly",
  StateSelection = "stateSelection"
}

export interface TabControl extends Control {
  type: ControlType.Tab;
  position?: "top" | "bottom" | "left" | "right";
  tabs: TabItem[];
}

export interface TabItem {
  id: string;
  label: string;
  controls: Control[];
}

export interface AccordionControl extends Control {
  type: ControlType.Accordion;
  sections: AccordionSection[];
  expandedSections?: string[];
}

export interface AccordionSection {
  id: string;
  label: string;
  controls: Control[]; // ColumnLayoutControl is already a Control, no need for union type
}

export interface ColumnLayoutControl extends Control {
  type: ControlType.ColumnLayout;
  columns: number;
  columnRatio?: string;
  columnControls: Control[][];
}

export interface Dependency {
  id: string;
  targetControlId: string;
  property: "visible" | "enabled" | "required";
  condition: DependencyCondition;
}

export interface DependencyCondition {
  type: "equals" | "notEquals" | "contains" | "notContains" | "greaterThan" | "lessThan" | "between" | "checked" | "unchecked" | "filled" | "empty";
  value: string[];
  secondaryValue?: any; // For "between" condition
}

export interface Condition {
  id: string;
  type: string; // Example: 'equals', 'notEquals', etc.
  targetControlId: string;
  property: string; // Example: 'value', 'visibility', etc.
  value: any;
}

export interface Questionnaire {
  id: string;
  title: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  controls: Control[];
  styles?: {
    global?: Record<string, string>;
    customClasses?: Array<{
      name: string;
      styles: Record<string, string>;
    }>;
  };
}