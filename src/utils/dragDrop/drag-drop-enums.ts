/**
 * Enums for the drag and drop functionality
 */

/**
 * Positions for drop indicators to show where an element will be dropped
 */
export enum DropIndicatorPosition {
  Inside = "inside",
  Top = "top",
  Bottom = "bottom",
  Right = "right",
  Left = "left",
  None = "none"
}

/**
 * Types of elements that can be dragged
 */
export enum ElementType {
  Control = "control",
  Container = "container",
  Tab = "tab",
  Accordion = "accordion",
  ColumnLayout = "columnLayout",
  EmptyCanvas = "empty-canvas"
}
