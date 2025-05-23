# Advanced Conditional Logic: Logic Engine Test Cases

This document outlines test cases for the `evaluateDependencies` function in `LogicEngine.ts`. The goal is to ensure that conditional logic correctly determines the `visible`, `required`, and `enabled` states of controls.

## Test Setup Considerations

*   **Questionnaire Stub:** For each test, a minimal `Questionnaire` object will be defined, containing only the necessary dependent control and target control(s).
*   **Form Values:** A `formValues` object will simulate user input for the target controls.
*   **Expected Outcome:** The `calculatedStates` object returned by `evaluateDependencies` will be checked against expected values for the dependent control's properties.

## I. Visibility Tests (`property: "visible"`)

**Default:** Dependent control is initially visible. A rule makes it hidden.

| Test Case ID | Target Control Type | Target Control ID | Target Value(s) | Condition Type        | Condition Value(s) | Dependent Control ID | Expected `visible` |
|--------------|---------------------|-------------------|-----------------|-----------------------|--------------------|----------------------|--------------------|
| VIS-TB-EQ-01 | TextBox             | `targetText1`     | `"hide"`        | `EQUALS`              | `["hide"]`         | `depControl1`        | `false`            |
| VIS-TB-EQ-02 | TextBox             | `targetText1`     | `"show"`        | `EQUALS`              | `["hide"]`         | `depControl1`        | `true`             |
| VIS-CB-CHK-01| Checkbox            | `targetCheck1`    | `true`          | `CHECKED`             | `[]`               | `depControl2`        | `false`            |
| VIS-CB-CHK-02| Checkbox            | `targetCheck1`    | `false`         | `CHECKED`             | `[]`               | `depControl2`        | `true`             |
| VIS-NUM-GT-01| Numeric             | `targetNum1`      | `11`            | `GREATER_THAN`        | `["10"]`           | `depControl3`        | `false`            |
| VIS-NUM-GT-02| Numeric             | `targetNum1`      | `10`            | `GREATER_THAN`        | `["10"]`           | `depControl3`        | `true`             |
| VIS-TXT-FIL-01|TextBox             | `targetText2`     | `"has text"`    | `FILLED`              | `[]`               | `depControl4`        | `false`            |
| VIS-TXT-FIL-02|TextBox             | `targetText2`     | `""`            | `FILLED`              | `[]`               | `depControl4`        | `true`             |

## II. Requirement Tests (`property: "required"`)

**Default:** Dependent control is initially not required. A rule makes it required.

| Test Case ID | Target Control Type | Target Control ID | Target Value(s) | Condition Type        | Condition Value(s) | Dependent Control ID | Expected `required` |
|--------------|---------------------|-------------------|-----------------|-----------------------|--------------------|----------------------|---------------------|
| REQ-TB-EQ-01 | TextBox             | `targetTextR1`    | `"require"`     | `EQUALS`              | `["require"]`      | `depControlR1`       | `true`              |
| REQ-TB-EQ-02 | TextBox             | `targetTextR1`    | `"optional"`    | `EQUALS`              | `["require"]`      | `depControlR1`       | `false`             |
| REQ-CB-CHK-01| Checkbox            | `targetCheckR1`   | `true`          | `CHECKED`             | `[]`               | `depControlR2`       | `true`              |
| REQ-CB-CHK-02| Checkbox            | `targetCheckR1`   | `false`         | `CHECKED`             | `[]`               | `depControlR2`       | `false`             |
| REQ-NUM-LT-01| Numeric             | `targetNumR1`     | `5`             | `LESS_THAN`           | `["10"]`           | `depControlR3`       | `true`              |
| REQ-NUM-LT-02| Numeric             | `targetNumR1`     | `10`            | `LESS_THAN`           | `["10"]`           | `depControlR3`       | `false`             |
| REQ-TXT-EMT-01|TextBox             | `targetTextR2`    | `""`            | `EMPTY`               | `[]`               | `depControlR4`       | `true`              |
| REQ-TXT-EMT-02|TextBox             | `targetTextR2`    | `"not empty"`   | `EMPTY`               | `[]`               | `depControlR4`       | `false`             |

## III. Enablement Tests (`property: "enabled"`)

**Default:** Dependent control is initially enabled. A rule makes it disabled.

| Test Case ID | Target Control Type | Target Control ID | Target Value(s) | Condition Type        | Condition Value(s) | Dependent Control ID | Expected `enabled` |
|--------------|---------------------|-------------------|-----------------|-----------------------|--------------------|----------------------|--------------------|
| EN-TB-EQ-01  | TextBox             | `targetTextE1`    | `"disable"`     | `EQUALS`              | `["disable"]`      | `depControlE1`       | `false`            |
| EN-TB-EQ-02  | TextBox             | `targetTextE1`    | `"enable"`      | `EQUALS`              | `["disable"]`      | `depControlE1`       | `true`             |
| EN-CB-UNCHK-01|Checkbox            | `targetCheckE1`   | `false`         | `UNCHECKED`           | `[]`               | `depControlE2`       | `false`            |
| EN-CB-UNCHK-02|Checkbox            | `targetCheckE1`   | `true`          | `UNCHECKED`           | `[]`               | `depControlE2`       | `true`             |
| EN-NUM-BTW-01| Numeric             | `targetNumE1`     | `15`            | `BETWEEN`             | `["10", "20"]`     | `depControlE3`       | `false`            |
| EN-NUM-BTW-02| Numeric             | `targetNumE1`     | `25`            | `BETWEEN`             | `["10", "20"]`     | `depControlE3`       | `true`             |
| EN-TXT-CON-01| TextBox             | `targetTextE2`    | `"special"`     | `CONTAINS`            | `["special"]`      | `depControlE4`       | `false`            |
| EN-TXT-CON-02| TextBox             | `targetTextE2`    | `"normal"`      | `CONTAINS`            | `["special"]`      | `depControlE4`       | `true`             |

## IV. Type Handling and Edge Cases

| Test Case ID | Description                                      | Target Control | Target Value | Condition      | Condition Value | Dependent Prop | Expected State |
|--------------|--------------------------------------------------|----------------|--------------|----------------|-----------------|----------------|----------------|
| EDGE-NUM-STR | Numeric target, string condition value           | `targetNumX1`  | `50`         | `EQUALS`       | `["50"]`        | `visible`      | `false`        |
| EDGE-STR-NUM | Text target (numeric content), numeric condition | `targetTextX1` | `"100"`      | `GREATER_THAN` | `["50"]`        | `visible`      | `false`        |
| EDGE-CB-STR  | Checkbox target, string "true" condition value   | `targetCbX1`   | `true`       | `EQUALS`       | `["true"]`      | `visible`      | `false`        |
| EDGE-CB-STRF | Checkbox target, string "false" condition value  | `targetCbX2`   | `false`      | `EQUALS`       | `["false"]`     | `visible`      | `false`        |
| EDGE-UNDEF   | Target value is undefined                        | `targetUndef1` | `undefined`  | `EMPTY`        | `[]`            | `required`     | `true`         |
| EDGE-NULL    | Target value is null                             | `targetNull1`  | `null`       | `EMPTY`        | `[]`            | `required`     | `true`         |
| EDGE-CASE-EQ | Case insensitive EQUALS for text                 | `targetCase1`  | `"MixedCase"`| `EQUALS`       | `["mixedcase"]` | `visible`      | `false`        |
| EDGE-CASE-CON| Case insensitive CONTAINS for text               | `targetCase2`  | `"SomeText"` | `CONTAINS`     | `["sometext"]`  | `visible`      | `false`        |

## V. Multiple Dependencies

**Scenario 1: Two rules try to hide the same control. If one is met, it's hidden.**
*   Dep1: `targetA1` value "hide" -> `controlM1` visible=false
*   Dep2: `targetB1` CHECKED -> `controlM1` visible=false
*   Test MDEP-01: `targetA1`="hide", `targetB1`=false. Expected: `controlM1.visible = false`.
*   Test MDEP-02: `targetA1`="show", `targetB1`=true. Expected: `controlM1.visible = false`.
*   Test MDEP-03: `targetA1`="show", `targetB1`=false. Expected: `controlM1.visible = true`.

**Scenario 2: One rule hides, one rule requires.**
*   Dep1: `targetA2` value "hide" -> `controlM2` visible=false
*   Dep2: `targetB2` CHECKED -> `controlM2` required=true
*   Test MDEP-04: `targetA2`="hide", `targetB2`=true. Expected: `controlM2.visible = false`, `controlM2.required = true`.

**Scenario 3: Default visible=false, rule tries to make it hidden (no change).**
*   `controlM3` has `visible: false` in its definition.
*   Dep1: `targetA3` value "hide" -> `controlM3` visible=false
*   Test MDEP-05: `targetA3`="hide". Expected: `controlM3.visible = false`.

**Scenario 4: Default required=true, rule tries to make it required (no change).**
*   `controlM4` has `required: true` in its definition.
*   Dep1: `targetA4` value "require" -> `controlM4` required=true
*   Test MDEP-06: `targetA4`="require". Expected: `controlM4.required = true`.

## VI. Non-Existent Target Control

| Test Case ID | Description                                 | Dependent Control | Dependency Target ID | Expected Behavior                                 |
|--------------|---------------------------------------------|-------------------|----------------------|---------------------------------------------------|
| ERR-NO-TGT-01| Dependency references a non-existent target | `depErr1`         | `nonExistent123`     | Log warning, dependency ignored, control default state remains. |

This list is not exhaustive but covers the main functionality and types of conditions. More specific test cases can be added as new control types or complex interactions are developed.
