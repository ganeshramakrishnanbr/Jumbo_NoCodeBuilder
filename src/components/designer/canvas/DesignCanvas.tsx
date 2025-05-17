import React, { useRef } from 'react';
import { useQuestionnaire } from '../../../contexts/QuestionnaireContext';
import { useDragDrop } from '../../../contexts/DragDropContext';
import { Control, ControlType } from '../../../types';
import CanvasControl from './CanvasControl';
import { nanoid } from 'nanoid';

const DesignCanvas: React.FC = () => {
  const { questionnaire, addControl } = useQuestionnaire();
  const { draggedItem, canDropIn, endDrag } = useDragDrop();
  const canvasRef = useRef<HTMLDivElement>(null);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    if (draggedItem && canDropIn('canvas')) {
      e.preventDefault();
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();

    if (draggedItem && canDropIn('canvas')) {
      if (draggedItem.isNew) {
        const label = `New ${draggedItem.controlType}`;
        
        let controlData: Partial<Control> = {
          type: draggedItem.controlType,
          label,
          required: false,
          visible: true,
          enabled: true,
        };

        // For ColumnLayout, set default columns
        if (draggedItem.controlType === ControlType.ColumnLayout) {
          controlData = {
            ...controlData,
            columns: 2,
            columnControls: [[], []],
            columnRatio: 'equal',
            responsiveBehavior: 'stack'
          };
        }

        // Add default fields for Address control
        if (draggedItem.controlType === ControlType.Address) {
          controlData = {
            ...controlData,
            label: 'Address',
            properties: {
              fields: [
                {
                  id: nanoid(),
                  type: 'textBox',
                  label: 'Address Line 1',
                  required: true,
                  validation: {
                    minLength: 5,
                    maxLength: 100,
                  }
                },
                {
                  id: nanoid(),
                  type: 'textBox',
                  label: 'Address Line 2',
                  required: false,
                  validation: {
                    maxLength: 100,
                  }
                },
                {
                  id: nanoid(),
                  type: 'textBox',
                  label: 'City',
                  required: true,
                  validation: {
                    minLength: 2,
                    maxLength: 50,
                  }
                },
                {
                  id: nanoid(),
                  type: 'dropdown',
                  label: 'State',
                  required: true,
                  options: [
                    { value: 'AL', label: 'Alabama' },
                    { value: 'AK', label: 'Alaska' },
                    // Add all US states here
                  ]
                },
                {
                  id: nanoid(),
                  type: 'textBox',
                  label: 'ZIP Code',
                  required: true,
                  validation: {
                    pattern: '^\\d{5}(-\\d{4})?$',
                    message: 'Please enter a valid ZIP code (e.g., 12345 or 12345-6789)'
                  }
                },
                {
                  id: nanoid(),
                  type: 'dropdown',
                  label: 'Country',
                  required: true,
                  defaultValue: 'US',
                  options: [
                    { value: 'US', label: 'United States' },
                    { value: 'CA', label: 'Canada' },
                    // Add more countries as needed
                  ]
                }
              ]
            }
          };
        }
        
        addControl(controlData);
      }
      
      endDrag();
    }
  };

  // Group controls by type
  const groupControls = () => {
    const groups: {
      columnLayouts: Control[];
      otherControls: Control[];
    } = {
      columnLayouts: [],
      otherControls: [],
    };

    questionnaire.controls.forEach(control => {
      if (control.type === ControlType.ColumnLayout) {
        groups.columnLayouts.push(control);
      } else {
        groups.otherControls.push(control);
      }
    });

    return groups;
  };

  const { columnLayouts, otherControls } = groupControls();

  return (
    <div 
      ref={canvasRef}
      className={`
        h-full border-2 rounded-lg p-4 overflow-auto
        ${draggedItem && canDropIn('canvas') ? 'border-blue-400 bg-blue-50' : 'border-dashed border-gray-300'}
      `}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {questionnaire.controls.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-gray-400">
          <p className="text-lg mb-2">Drag controls here to start designing</p>
          <p className="text-sm">Drag controls from the palette on the left to add them to your questionnaire</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Render column layouts in a flex container */}
          {columnLayouts.length > 0 && (
            <div className="flex flex-wrap gap-4">
              {columnLayouts.map((control) => (
                <div 
                  key={control.id} 
                  className="flex-1"
                  style={{ minWidth: '300px' }}
                >
                  <CanvasControl control={control} />
                </div>
              ))}
            </div>
          )}

          {/* Render other controls vertically */}
          {otherControls.map((control) => (
            <CanvasControl key={control.id} control={control} />
          ))}
        </div>
      )}
    </div>
  );
};

export default DesignCanvas;