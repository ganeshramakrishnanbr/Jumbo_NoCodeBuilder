import React from 'react';
import { useDragDrop } from '../../../contexts/DragDropContext';
import { ControlType } from '../../../types';
import {
  Layout, Layers, CheckSquare, Type, 
  ToggleLeft, Hash, ChevronDown, MapPin, CreditCard
} from 'lucide-react';

const ControlPalette: React.FC = () => {
  const { startDrag } = useDragDrop();

  const containerControls = [
    { type: ControlType.Tab, label: 'Tab', icon: <Layers size={18} /> },
    { type: ControlType.Accordion, label: 'Accordion', icon: <Layout size={18} /> },
    { type: ControlType.ColumnLayout, label: 'Column Layout', icon: <Layout size={18} /> },
  ];

  const basicControls = [
    { type: ControlType.TextBox, label: 'Text Box', icon: <Type size={18} /> },
    { type: ControlType.Checkbox, label: 'Checkbox', icon: <CheckSquare size={18} /> },
    { type: ControlType.RadioButton, label: 'Radio Button', icon: <CheckSquare size={18} /> },
    { type: ControlType.ToggleSlider, label: 'Toggle Slider', icon: <ToggleLeft size={18} /> },
    { type: ControlType.Numeric, label: 'Numeric', icon: <Hash size={18} /> },
    { type: ControlType.Dropdown, label: 'Dropdown', icon: <ChevronDown size={18} /> },
  ];

  const specializedControls = [
    { type: ControlType.Address, label: 'Address', icon: <MapPin size={18} /> },
    { type: ControlType.ProtectedNumber, label: 'Protected Number', icon: <CreditCard size={18} /> },
  ];

  const handleDragStart = (controlType: ControlType, label: string) => {
    startDrag({
      id: `new-${controlType}-${Date.now()}`,
      type: 'control',
      controlType,
      isNew: true,
    });
  };

  const renderControlGroup = (title: string, controls: Array<{ type: ControlType; label: string; icon: JSX.Element }>) => (
    <div className="mb-6">
      <h3 className="text-sm font-medium text-gray-700 mb-2">{title}</h3>
      <div className="space-y-1.5">
        {controls.map((control) => (
          <div
            key={control.type}
            draggable
            onDragStart={() => handleDragStart(control.type, control.label)}
            className="flex items-center p-2 border border-gray-200 rounded cursor-move bg-white hover:bg-gray-50 transition-colors"
          >
            <span className="text-gray-500 mr-2">{control.icon}</span>
            <span className="text-sm">{control.label}</span>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div>
      {renderControlGroup('Container Controls', containerControls)}
      {renderControlGroup('Basic Controls', basicControls)}
      {renderControlGroup('Specialized Controls', specializedControls)}
    </div>
  );
};

export default ControlPalette;