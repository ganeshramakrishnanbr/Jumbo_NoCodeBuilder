// filepath: src/utils/dragDrop/strategy/ControlDragDropRegistry.ts
import { ControlType } from '../../../types';
import { DragDropStrategy } from './DragDropStrategy';
import { DefaultDragDropStrategy } from './DefaultDragDropStrategy';

/**
 * Registry for drag-drop strategies.
 * This singleton class manages all available drag-drop strategies and provides
 * a mechanism to retrieve the appropriate strategy for a given control type.
 */
export class ControlDragDropRegistry {
  private static instance: ControlDragDropRegistry;
  private strategies: Map<string, DragDropStrategy> = new Map();
  private defaultStrategy: DragDropStrategy;
  private controlTypeMapping: Map<ControlType, string[]> = new Map();

  /**
   * Private constructor to enforce singleton pattern
   */
  private constructor() {
    // Initialize with a default strategy
    this.defaultStrategy = new DefaultDragDropStrategy();
    this.registerStrategy(this.defaultStrategy);
  }

  /**
   * Get the singleton instance of the registry
   */
  public static getInstance(): ControlDragDropRegistry {
    if (!ControlDragDropRegistry.instance) {
      ControlDragDropRegistry.instance = new ControlDragDropRegistry();
    }
    return ControlDragDropRegistry.instance;
  }

  /**
   * Register a new strategy
   * @param strategy The strategy to register
   */
  public registerStrategy(strategy: DragDropStrategy): void {
    const id = strategy.getId();
    
    // Register the strategy by its unique ID
    this.strategies.set(id, strategy);
    
    // Map control types to this strategy
    const applicableTypes = strategy.getApplicableControlTypes();
    applicableTypes.forEach(controlType => {
      if (!this.controlTypeMapping.has(controlType)) {
        this.controlTypeMapping.set(controlType, []);
      }
      
      const strategies = this.controlTypeMapping.get(controlType)!;
      if (!strategies.includes(id)) {
        strategies.push(id);
      }
    });
  }
  /**
   * Set the default strategy to use when no specific strategy is found
   * @param strategy The default strategy
   */
  public setDefaultStrategy(strategy: DragDropStrategy): void {
    this.defaultStrategy = strategy;
    this.registerStrategy(strategy);
  }
  /**
   * Get a strategy for a specific control type
   * @param controlType The control type
   * @returns The appropriate strategy for the control type
   */
  public getStrategyForControlType(controlType: ControlType): DragDropStrategy {
    const strategyIds = this.controlTypeMapping.get(controlType);
    
    if (strategyIds && strategyIds.length > 0) {
      // Return the first registered strategy for this control type
      const strategy = this.strategies.get(strategyIds[0]);
      if (strategy) {
        return strategy;
      }
    }
    
    // Always fall back to the default strategy
    return this.defaultStrategy;
  }

  /**
   * Get the most appropriate strategy for a drag-drop operation between two control types
   * @param sourceType The type of the source (dragged) control
   * @param targetType The type of the target control
   * @returns The most appropriate strategy
   */
  public getBestStrategyForInteraction(
    sourceType: ControlType, 
    targetType: ControlType
  ): DragDropStrategy {
    // Try to find a strategy that explicitly handles this interaction
    for (const strategy of this.strategies.values()) {
      if (strategy.appliesTo(sourceType, targetType)) {
        return strategy;
      }
    }
      // Try to get a strategy based on the target type first
    const targetStrategy = this.getStrategyForControlType(targetType);
    if (targetStrategy !== this.defaultStrategy) {
      return targetStrategy;
    }
    
    // If no target-specific strategy, try source type
    const sourceStrategy = this.getStrategyForControlType(sourceType);
    if (sourceStrategy !== this.defaultStrategy) {
      return sourceStrategy;
    }
    
    // Fall back to default strategy (which is always available)
    return this.defaultStrategy;
  }

  /**
   * Get all registered strategies
   * @returns Array of all registered strategies
   */
  public getAllStrategies(): DragDropStrategy[] {
    return Array.from(this.strategies.values());
  }
  /**
   * Clear all registered strategies (mainly for testing)
   */
  public clear(): void {
    this.strategies.clear();
    this.controlTypeMapping.clear();
    // Reset to a new default strategy instead of null
    this.defaultStrategy = new DefaultDragDropStrategy();
    this.registerStrategy(this.defaultStrategy);
  }
}
