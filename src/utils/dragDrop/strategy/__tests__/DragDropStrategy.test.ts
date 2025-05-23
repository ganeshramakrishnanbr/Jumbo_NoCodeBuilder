// filepath: src/utils/dragDrop/strategy/__tests__/DragDropStrategy.test.ts
import { ControlDragDropRegistry } from '../ControlDragDropRegistry';
import { DefaultDragDropStrategy } from '../DefaultDragDropStrategy';
import { TabDragDropStrategy } from '../TabDragDropStrategy';
import { DragDropCore } from '../../DragDropCore';
import { ControlType } from '../../../../types';
import { DropIndicatorPosition } from '../../drag-drop-enums';

// Mock DragDropCore for testing
class TestDragDropCore extends DragDropCore {
  protected onDragStart(event: DragEvent): void {}
  protected onDragOver(event: DragEvent): void {}
  protected onDragEnd(event: DragEvent): void {}
  
  // Expose protected methods for testing
  public testCreateGhostElement(element: HTMLElement, label: string, type: string): HTMLElement {
    return this.createGhostElement(element, label, type);
  }
  
  public testUpdateGhostPosition(clientX: number, clientY: number): void {
    this.updateGhostPosition(clientX, clientY);
  }
}

describe('DragDrop Strategy Pattern', () => {
  let registry: ControlDragDropRegistry;
  
  beforeEach(() => {
    // Reset registry before each test
    registry = ControlDragDropRegistry.getInstance();
    registry.clear();
  });
  
  test('registry should be a singleton', () => {
    const instance1 = ControlDragDropRegistry.getInstance();
    const instance2 = ControlDragDropRegistry.getInstance();
    expect(instance1).toBe(instance2);
  });
  
  test('registry should initialize with default strategy', () => {
    const registry = ControlDragDropRegistry.getInstance();
    const strategy = registry.getStrategyForControlType(ControlType.TextBox);
    expect(strategy).toBeInstanceOf(DefaultDragDropStrategy);
  });
  
  test('registry should allow setting strategy for specific control type', () => {
    const tabStrategy = new TabDragDropStrategy();
    registry.registerStrategy(tabStrategy);
    
    const strategy = registry.getStrategyForControlType(ControlType.Tab);
    expect(strategy).toBeInstanceOf(TabDragDropStrategy);
  });
  
  test('getBestStrategyForInteraction should find the most appropriate strategy', () => {
    const tabStrategy = new TabDragDropStrategy();
    registry.registerStrategy(tabStrategy);
    
    const strategy = registry.getBestStrategyForInteraction(
      ControlType.TextBox,
      ControlType.Tab
    );
    
    expect(strategy).toBeInstanceOf(TabDragDropStrategy);
  });
  
  test('DragDropCore should integrate with strategy pattern', () => {
    const core = new TestDragDropCore();
    const tabStrategy = new TabDragDropStrategy();
    
    core.setStrategy(tabStrategy);
    
    expect(core.getStrategy()).toBe(tabStrategy);
  });
  
  test('Strategy validateDrop method should work correctly', () => {
    const tabStrategy = new TabDragDropStrategy();
    
    // Test with a valid control type for inside position
    const validDrop = tabStrategy.validateDrop(
      { id: '1', controlType: ControlType.TextBox },
      document.createElement('div'),
      DropIndicatorPosition.Inside
    );
    
    // Test with an invalid control type for inside position
    const invalidDrop = tabStrategy.validateDrop(
      { id: '1', controlType: ControlType.Tab }, // Tabs shouldn't be nested inside tabs
      document.createElement('div'),
      DropIndicatorPosition.Inside
    );
    
    expect(validDrop).toBe(true);
    expect(invalidDrop).toBe(false);
  });
});
