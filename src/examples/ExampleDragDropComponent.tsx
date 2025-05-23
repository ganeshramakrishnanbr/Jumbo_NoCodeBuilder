import React, { useRef } from 'react';
import { Control, ControlType } from '../../types';
import { 
  useDragDrop, 
  DropIndicatorPosition,
  updateDropIndicators,
  calculateTargetIndex
} from '../../utils/dragDrop';
import { useEnhancedDragDrop } from '../../contexts/EnhancedDragDropContext';

interface ExampleDragDropComponentProps {
  controls: Control[];
  onReorderControl: (controlId: string, newIndex: number) => void;
  onDropControl: (controlType: ControlType, targetIndex: number) => void;
}

/**
 * Example component demonstrating the enhanced drag and drop system
 */
export const ExampleDragDropComponent: React.FC<ExampleDragDropComponentProps> = ({
  controls,
  onReorderControl,
  onDropControl
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { isDragging, draggedItemData } = useEnhancedDragDrop();
  
  // Use our custom hook to create drag and drop functionality
  const { 
    makeElementDraggable,
    makeElementDropTarget
  } = useDragDrop({
    containerRef,
    onDragStart: (data) => {
      console.log('Drag started', data);
    },
    onDragOver: (element, position) => {
      if (!element) return;
      
      // Clear all indicators first
      document.querySelectorAll('.drop-indicator-top, .drop-indicator-bottom')
        .forEach(el => {
          ['drop-indicator-top', 'drop-indicator-bottom'].forEach(cls => 
            (el as HTMLElement).classList.remove(cls)
          );
        });
      
      // Add indicator to the current element
      updateDropIndicators(element, position.position);
    },
    onDrop: (data, position) => {
      if (data.isNew) {
        // Handle new control drop
        onDropControl(
          data.controlType,
          position.index
        );
      } else {
        // Handle reordering
        onReorderControl(
          data.id,
          position.index
        );
      }
    },
    onDragEnd: () => {
      // Clear all indicators
      document.querySelectorAll('.drop-indicator-top, .drop-indicator-bottom')
        .forEach(el => {
          ['drop-indicator-top', 'drop-indicator-bottom'].forEach(cls => 
            (el as HTMLElement).classList.remove(cls)
          );
        });
    }
  });
  
  return (
    <div 
      ref={containerRef}
      className={`example-drag-container ${isDragging ? 'drag-active' : ''}`}
    >
      <h2>Drag and Drop Example</h2>
      
      {/* Control palette - source of new controls */}
      <div className="control-palette">
        <div
          {...makeElementDraggable({
            id: 'new-textbox',
            controlType: ControlType.TextBox,
            isNew: true,
            label: 'Text Box'
          })}
          className="palette-item"
        >
          Text Box
        </div>
        <div
          {...makeElementDraggable({
            id: 'new-checkbox',
            controlType: ControlType.Checkbox,
            isNew: true,
            label: 'Checkbox'
          })}
          className="palette-item"
        >
          Checkbox
        </div>
        <div
          {...makeElementDraggable({
            id: 'new-tab',
            controlType: ControlType.Tab,
            isNew: true,
            label: 'Tab Control'
          })}
          className="palette-item"
        >
          Tab Control
        </div>
      </div>
      
      {/* Canvas - where controls are placed */}
      <div className="example-canvas">
        {controls.length === 0 ? (
          // Empty canvas state
          <div
            {...makeElementDropTarget({
              id: 'empty-canvas',
              controlType: ControlType.TextBox, // Doesn't matter for empty canvas
              index: 0
            })}
            className="empty-canvas-message"
          >
            Drag controls here
          </div>
        ) : (
          // Render existing controls
          controls.map((control, index) => (
            <div
              key={control.id}
              className="example-control"
              {...makeElementDropTarget({
                id: control.id,
                controlType: control.type,
                index
              })}
              {...makeElementDraggable({
                id: control.id,
                controlType: control.type,
                index,
                label: control.label || control.type
              })}
            >
              <div className="control-header">
                <span className="control-type">{control.type}</span>
                {control.label && <span className="control-label">{control.label}</span>}
              </div>
              
              {/* For container controls, render their children recursively */}
              {(control.type === ControlType.Tab || 
                control.type === ControlType.Accordion || 
                control.type === ControlType.ColumnLayout) && 
                control.children && control.children.length > 0 && (
                <div className="container-children">
                  {control.children.map((child, childIndex) => (
                    <div
                      key={child.id}
                      className="child-control"
                      {...makeElementDropTarget({
                        id: child.id,
                        controlType: child.type,
                        index: childIndex
                      })}
                      {...makeElementDraggable({
                        id: child.id,
                        controlType: child.type,
                        parentId: control.id,
                        index: childIndex,
                        label: child.label || child.type
                      })}
                    >
                      {child.label || child.type}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
