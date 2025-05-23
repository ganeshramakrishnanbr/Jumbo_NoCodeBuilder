# Advanced Conditional Logic: Logic Engine Implementation Plan

This document outlines the implementation plan for the `LogicEngine.ts` module, which is responsible for evaluating conditional dependencies within a questionnaire. An initial scaffold of this file has already been created at `src/utils/LogicEngine.ts`.

## Core Components and Functionality

The `LogicEngine.ts` module will primarily consist of:

1.  **`DependencyConditionType` Enum:** (Already defined in the scaffold)
    *   This enum lists all supported condition types (e.g., `EQUALS`, `CHECKED`, `FILLED`).
    *   Location: `src/utils/LogicEngine.ts`.

2.  **`getAllControls(controls: Control[]): Control[]` Helper Function:** (Initial version in scaffold)
    *   **Purpose:** To flatten the questionnaire's control structure, providing a simple array of all controls, regardless of how they are nested within container controls (like Tabs, Accordions, GroupBoxes, ColumnLayouts).
    *   **Enhancement Plan:** The current scaffold only handles `control.children`. This needs to be expanded to recursively traverse:
        *   `TabControl.tabs[n].controls`
        *   `AccordionControl.sections[n].controls`
        *   `ColumnLayoutControl.columnControls[n]` (which is an array of `Control[]`)
        *   Any other container types that might hold nested controls.
    *   This function is crucial for `findControlById` and for iterating all controls in `evaluateDependencies`.

3.  **`findControlById(questionnaire: Questionnaire, controlId: string): Control | undefined` Helper Function:** (Initial version in scaffold)
    *   **Purpose:** To efficiently retrieve a specific control definition from the questionnaire using its ID.
    *   **Implementation:** It will use the enhanced `getAllControls` function to get a flat list and then find the control by ID.

4.  **`getControlValue(controlId: string, formValues: Record<string, any>, questionnaire: Questionnaire): any` Helper Function:** (Initial version in scaffold)
    *   **Purpose:** To extract the actual runtime value of a `targetControlId` from the `formValues` object, interpreting it correctly based on the control's type.
    *   **Implementation Details:**
        *   Uses `findControlById` to get the control's definition.
        *   Retrieves the raw value from `formValues[controlId]`.
        *   **Type-Specific Handling (examples):**
            *   `ControlType.Checkbox`, `ControlType.ToggleSlider`: Returns `!!rawValue` (boolean).
            *   `ControlType.Numeric`: Returns `parseFloat(String(rawValue))` or `undefined` if not a valid number.
            *   `ControlType.TextBox`, `ControlType.Dropdown` (single-select): Returns `String(rawValue ?? '')`.
            *   Other `ControlType`s (e.g., `Address`, `StateSelection`) will need specific handling added as their conditional logic usage becomes clearer.
    *   This function is critical for providing the correct `targetValue` to the condition evaluation logic.

5.  **`evaluateDependencies(questionnaire: Questionnaire, formValues: Record<string, any>): Record<string, { visible?: boolean; required?: boolean; enabled?: boolean }>` Main Function:** (Initial version in scaffold)
    *   **Purpose:** This is the core function. It takes the full questionnaire definition and the current form values. It returns an object mapping each control ID to its calculated `visible`, `required`, and `enabled` states.
    *   **Step-by-Step Logic:**
        1.  Initialize an empty `finalCalculatedStates` object.
        2.  Get a flat list of all controls using the enhanced `getAllControls(questionnaire.controls)`.
        3.  For each `control` in `allControls`:
            a.  Determine its **default state** based on its properties in the questionnaire JSON:
                *   `isVisible = control.visible !== false;` (defaults to true)
                *   `isEnabled = control.enabled !== false;` (defaults to true)
                *   `isRequired = !!control.required;` (defaults to false)
            b.  If `control.dependencies` array exists and is not empty:
                i.  For each `dependency` in `control.dependencies`:
                    1.  Retrieve the `targetControl` definition using `findControlById(questionnaire, dependency.targetControlId)`. If not found, log a warning and skip this dependency.
                    2.  Get the `targetValue` using `getControlValue(dependency.targetControlId, formValues, questionnaire)`.
                    3.  Initialize `conditionIsTrue = false`.
                    4.  Evaluate `dependency.condition` against `targetValue` using a `switch` statement on `dependency.condition.type`.
                        *   This logic needs to precisely match the rules defined in `01_Data_Model.md` (e.g., case-insensitive string comparisons for `EQUALS` on text, correct parsing for `GREATER_THAN`, ignoring `dependency.condition.value` for `CHECKED` or `FILLED`).
                    5.  If `conditionIsTrue`:
                        *   If `dependency.property` is `"visible"`, set `isVisible = false`. (Any met "hide" rule wins).
                        *   If `dependency.property` is `"enabled"`, set `isEnabled = false`. (Any met "disable" rule wins).
                        *   If `dependency.property` is `"required"`, set `isRequired = true`. (Any met "require" rule wins).
            c.  Store the final `{ visible: isVisible, required: isRequired, enabled: isEnabled }` in `finalCalculatedStates[control.id]`.
        4.  Return `finalCalculatedStates`.

## Rule Precedence and Evaluation Strategy

*   **Visibility:** A control is visible if its definition (`control.visible`) is not `false` AND no dependency rule actively hides it.
*   **Enablement:** A control is enabled if its definition (`control.enabled`) is not `false` AND no dependency rule actively disables it.
*   **Requirement:** A control is required if its definition (`control.required`) is `true` OR any dependency rule actively makes it required.

This implies that "hiding" and "disabling" rules generally take precedence, while "requiring" rules are additive to the base state.

## Future Considerations (Out of Scope for Initial Implementation)

*   **Complex Rule Interactions:** For scenarios where multiple rules might conflict in more complex ways (e.g., one rule says hide, another says show), the current precedence is simple. More advanced scenarios might require a priority system for rules.
*   **Performance:** For extremely large questionnaires with many dependencies, performance of `getAllControls` and the main loop in `evaluateDependencies` will be monitored. Memoization or more targeted updates could be considered if needed.
*   **New Action Types:** This plan focuses on `visible`, `enabled`, `required`. Future work will address actions like "set value" or "jump to section," which will require extensions to this engine or new related modules.

This implementation plan leverages the existing scaffold in `src/utils/LogicEngine.ts` and details the necessary enhancements and specific logic to fulfill the requirements of Phase 1 conditional logic.
