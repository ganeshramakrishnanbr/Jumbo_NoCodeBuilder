import { Control, Questionnaire, ControlType, Dependency, DependencyCondition } from '../types'; // Adjust path as needed

export enum DependencyConditionType {
  EQUALS = "equals",
  NOT_EQUALS = "notEquals",
  CONTAINS = "contains",
  NOT_CONTAINS = "notContains",
  GREATER_THAN = "greaterThan",
  LESS_THAN = "lessThan",
  BETWEEN = "between",
  CHECKED = "checked",
  UNCHECKED = "unchecked",
  FILLED = "filled",
  EMPTY = "empty"
}

// Helper to get all controls in a flat list (recursive)
function getAllControls(controls: Control[]): Control[] {
  let all: Control[] = [];
  for (const control of controls) {
    all.push(control);
    if (control.children && control.children.length > 0) {
      all = all.concat(getAllControls(control.children));
    }
    // TODO: Handle other container types like Tabs (TabItem.controls), Accordion (AccordionSection.controls), ColumnLayout (columnControls)
  }
  return all;
}

// Helper to find a specific control by ID
function findControlById(questionnaire: Questionnaire, controlId: string): Control | undefined {
  // This needs to search through all controls, including nested ones.
  // For now, a simple flat search on questionnaire.controls.
  // A more robust version would use getAllControls and then find.
  const flatControls = getAllControls(questionnaire.controls);
  return flatControls.find(c => c.id === controlId);
}

export function getControlValue(controlId: string, formValues: Record<string, any>, questionnaire: Questionnaire): any {
  const control = findControlById(questionnaire, controlId);
  if (!control) {
    console.warn(`getControlValue: Control with ID ${controlId} not found.`);
    return undefined;
  }

  const rawValue = formValues[controlId];

  switch (control.type) {
    case ControlType.Checkbox:
    case ControlType.ToggleSlider:
      return !!rawValue;
    case ControlType.Numeric:
      return rawValue === undefined || rawValue === null || rawValue === '' ? undefined : parseFloat(String(rawValue));
    case ControlType.TextBox: // And other text-based inputs
    case ControlType.Dropdown: // Assuming single select for now
      return String(rawValue ?? ''); // Ensure it's a string, default to empty
    // Add more cases as needed for other control types
    default:
      return rawValue;
  }
}

export function evaluateDependencies(
  questionnaire: Questionnaire,
  formValues: Record<string, any>
): Record<string, { visible?: boolean; required?: boolean; enabled?: boolean }> {
  const allControls = getAllControls(questionnaire.controls); // Get a flat list of all controls
  const finalCalculatedStates: Record<string, { visible?: boolean; required?: boolean; enabled?: boolean }> = {};

  for (const control of allControls) {
    // Initialize with default/current states from the control definition
    let isVisible = control.visible !== false; // Default to true if not explicitly false
    let isRequired = !!control.required;       // Default to false if not explicitly true
    let isEnabled = control.enabled !== false; // Default to true if not explicitly false

    if (control.dependencies && control.dependencies.length > 0) {
      for (const dep of control.dependencies) {
        const targetControl = findControlById(questionnaire, dep.targetControlId);
        if (!targetControl) {
          console.warn(`Dependency for ${control.id} references non-existent target ${dep.targetControlId}`);
          continue;
        }
        const targetValue = getControlValue(dep.targetControlId, formValues, questionnaire);
        let conditionMet = false; // Renamed from conditionIsTrue for clarity

        const conditionValues = dep.condition.value; // string[]

        // --- Condition Evaluation Logic ---
        switch (dep.condition.type) {
          case DependencyConditionType.EQUALS:
            if (targetControl.type === ControlType.Checkbox || targetControl.type === ControlType.ToggleSlider) {
              // Compare boolean targetValue as string "true" or "false" with string conditionValue
              conditionMet = (!!targetValue).toString().toLowerCase() === (conditionValues[0] ?? '').toLowerCase();
            } else {
              conditionMet = String(targetValue ?? '').toLowerCase() === (conditionValues[0] ?? '').toLowerCase();
            }
            break;
          case DependencyConditionType.NOT_EQUALS:
             if (targetControl.type === ControlType.Checkbox || targetControl.type === ControlType.ToggleSlider) {
              conditionMet = (!!targetValue).toString().toLowerCase() !== (conditionValues[0] ?? '').toLowerCase();
            } else {
              conditionMet = String(targetValue ?? '').toLowerCase() !== (conditionValues[0] ?? '').toLowerCase();
            }
            break;
          case DependencyConditionType.CHECKED:
            conditionMet = !!targetValue; // Target is truthy (true for checkbox/toggle)
            break;
          case DependencyConditionType.UNCHECKED:
            conditionMet = !targetValue; // Target is falsy (false for checkbox/toggle)
            break;
          case DependencyConditionType.FILLED:
            conditionMet = targetValue !== undefined && targetValue !== null && String(targetValue).trim() !== "";
            break;
          case DependencyConditionType.EMPTY:
            conditionMet = targetValue === undefined || targetValue === null || String(targetValue).trim() === "";
            break;
          case DependencyConditionType.CONTAINS:
            conditionMet = String(targetValue ?? '').toLowerCase().includes((conditionValues[0] ?? '').toLowerCase());
            break;
          case DependencyConditionType.NOT_CONTAINS:
            conditionMet = !String(targetValue ?? '').toLowerCase().includes((conditionValues[0] ?? '').toLowerCase());
            break;
          case DependencyConditionType.GREATER_THAN:
            {
              const numTarget = parseFloat(String(targetValue));
              const numCondition = parseFloat(conditionValues[0]);
              if (!isNaN(numTarget) && !isNaN(numCondition)) {
                conditionMet = numTarget > numCondition;
              }
            }
            break;
          case DependencyConditionType.LESS_THAN:
             {
              const numTarget = parseFloat(String(targetValue));
              const numCondition = parseFloat(conditionValues[0]);
              if (!isNaN(numTarget) && !isNaN(numCondition)) {
                conditionMet = numTarget < numCondition;
              }
            }
            break;
          case DependencyConditionType.BETWEEN:
            {
              const numTarget = parseFloat(String(targetValue));
              const numMin = parseFloat(conditionValues[0]);
              const numMax = parseFloat(conditionValues[1]);
              if (!isNaN(numTarget) && !isNaN(numMin) && !isNaN(numMax)) {
                conditionMet = numTarget >= numMin && numTarget <= numMax;
              }
            }
            break;
        }
        // --- End Condition Evaluation Logic ---

        if (conditionMet) {
          // Apply the dependency effect based on the defined precedence
          if (dep.property === "visible") {
            // Action: "hide" (effect is to set visibility to false)
            // If the actionValue is explicitly 'false' or not set (implies 'false' for hide)
            if (dep.actionValue === undefined || dep.actionValue === false || String(dep.actionValue).toLowerCase() === "false") {
                 isVisible = false;
            } else if (dep.actionValue === true || String(dep.actionValue).toLowerCase() === "true"){
                 isVisible = true; // Though typical "hide" actions intend to hide. This allows "show" too.
            }
          } else if (dep.property === "enabled") {
            // Action: "disable" (effect is to set enabled to false)
             if (dep.actionValue === undefined || dep.actionValue === false || String(dep.actionValue).toLowerCase() === "false") {
                 isEnabled = false;
            } else if (dep.actionValue === true || String(dep.actionValue).toLowerCase() === "true"){
                isEnabled = true;
            }
          } else if (dep.property === "required") {
            // Action: "require" (effect is to set required to true)
            if (dep.actionValue === undefined || dep.actionValue === true || String(dep.actionValue).toLowerCase() === "true") {
                isRequired = true;
            } else if (dep.actionValue === false || String(dep.actionValue).toLowerCase() === "false") {
                isRequired = false;
            }
          }
          // Add more property handlers like 'value', 'validationMessage' as needed
        }
      }
    }
    finalCalculatedStates[control.id] = { visible: isVisible, required: isRequired, enabled: isEnabled };
  }
  return finalCalculatedStates;
}

// Ensure all types used (Control, Questionnaire, ControlType, Dependency, DependencyCondition) are imported from src/types
// The path '../types' might need adjustment based on actual file location.
