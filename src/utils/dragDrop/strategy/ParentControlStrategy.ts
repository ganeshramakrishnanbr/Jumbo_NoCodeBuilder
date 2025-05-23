// filepath: src/utils/dragDrop/strategy/ParentControlStrategy.ts
import { DragDropStrategy } from './DragDropStrategy';

/**
 * Extended interface for strategies handling parent controls.
 * Parent controls have specialized behavior for managing their children.
 */
export interface ParentControlStrategy extends DragDropStrategy {
  /**
   * Determines whether this parent control can accept the given child at the specified position.
   * This is different from canAcceptChild because it considers the position as well.
   * 
   * @param childId The ID of the potential child control
   * @param position The position where the child would be placed
   * @param regionId Optional region ID for composite drop targets
   * @returns Boolean indicating if the child can be accepted at the given position
   */
  canAcceptChildAtPosition(childId: string, position: string, regionId?: string): boolean;
  
  /**
   * Handles rearrangement of children within this parent control.
   * 
   * @param childId The ID of the child being moved
   * @param targetPosition The target position for the child
   * @param targetIndex The target index for the child
   * @returns Boolean indicating if the rearrangement was successful
   */
  handleChildRearrangement(childId: string, targetPosition: string, targetIndex: number): boolean;
  
  /**
   * Gets regions of this parent control that can accept drops.
   * This is useful for composite drop targets.
   * 
   * @returns Array of region identifiers
   */
  getDropRegions(): string[];
}
