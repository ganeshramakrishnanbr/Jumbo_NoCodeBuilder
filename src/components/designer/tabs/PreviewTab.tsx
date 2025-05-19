import React, { useState } from 'react';
import { useQuestionnaire } from '../../../contexts/QuestionnaireContext';
import { Smartphone, Tablet, Monitor, Eye, EyeOff } from 'lucide-react';
import { Control, ControlType, TabControl, ColumnLayoutControl, AccordionControl } from '../../../types';

const PreviewTab: React.FC = () => {
  const { questionnaire } = useQuestionnaire();
  const [viewportSize, setViewportSize] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');
  const [activeTabIndices, setActiveTabIndices] = useState<Record<string, number>>({});
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [showMasked, setShowMasked] = useState<Record<string, boolean>>({});
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  const handleInputChange = (controlId: string, value: any, type?: ControlType) => {
    console.log('[handleInputChange] controlId:', controlId, 'value:', value, 'type:', type);
    setFormValues(prev => ({
      ...prev,
      [controlId]: type === ControlType.ToggleSlider ? Boolean(value) : value
    }));
  };

  const toggleAccordionSection = (accordionId: string, sectionId: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [`${accordionId}_${sectionId}`]: !prev[`${accordionId}_${sectionId}`]
    }));
  };

  const renderLabel = (label: string, required?: boolean) => (
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
  );

  const renderTextBox = (control: Control) => {
    return (
      <div className="mb-4">
        {renderLabel(control.label || '', control.required)}
        <input
          type="text"
          value={formValues[control.id] || ''}
          onChange={(e) => handleInputChange(control.id, e.target.value)}
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          placeholder={control.properties?.placeholder}
          required={control.required}
        />
      </div>
    );
  };

  const renderCheckbox = (control: Control) => {
    const options = control.properties?.options || [];
    const values = formValues[control.id] || [];

    return (
      <div className="mb-4">
        {renderLabel(control.label || '', control.required)}
        <div className="space-y-2">
          {options.map((option: any) => (
            <div key={option.id} className="flex items-center">
              <input
                type="checkbox"
                checked={formValues[`${control.id}_${option.id}`] || false}
                onChange={(e) => handleInputChange(`${control.id}_${option.id}`, e.target.checked)}
                disabled={!control.enabled}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 text-sm text-gray-700">{option.label}</label>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderRadioButton = (control: Control) => {
    const options = control.properties?.options || [];
    return (
      <div className="mb-4">
        {renderLabel(control.label || '', control.required)}
        <div className="space-y-2">
          {options.map((option: any) => (
            <div key={option.id} className="flex items-center">
              <input
                type="radio"
                name={control.id}
                value={option.value}
                checked={formValues[control.id] === option.value}
                onChange={(e) => handleInputChange(control.id, e.target.value)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <label className="ml-2 text-sm text-gray-700">{option.label}</label>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderDropdown = (control: Control) => {
    const options = control.properties?.options || [];
    return (
      <div className="mb-4">
        {renderLabel(control.label || '', control.required)}
        <select
          value={formValues[control.id] || ''}
          onChange={(e) => handleInputChange(control.id, e.target.value)}
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        >
          <option value="">Select an option</option>
          {options.map((option: any) => (
            <option key={option.id} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    );
  };

  const renderAccordionControl = (control: AccordionControl) => {
    if (!control.sections) return null;

    return (
      <div className="space-y-2">
        {control.sections.map((section) => {
          const isExpanded = expandedSections[`${control.id}_${section.id}`];
          return (
            <div key={section.id} className="border rounded-lg overflow-hidden">
              <button
                className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 flex items-center justify-between text-left"
                onClick={() => toggleAccordionSection(control.id, section.id)}
              >
                <span className="font-medium text-gray-900">{section.label}</span>
                <svg
                  className={`w-5 h-5 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {isExpanded && (
                <div className="p-4 bg-white">
                  {section.controls.length > 0 ? (
                    <div className="space-y-4">
                      {section.controls.map((control) => renderControl(control))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4">No controls in this section</p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const renderToggleSlider = (control: Control) => {
    const checked = Boolean(formValues[control.id]);
    return (
      <div className="mb-4 flex items-center">
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => handleInputChange(control.id, e.target.checked, ControlType.ToggleSlider)}
            disabled={control.enabled === false}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:bg-blue-500 transition-colors duration-200">
            <div className={`absolute left-1 top-1 w-4 h-4 rounded-full bg-white shadow-md transition-transform duration-200 ${checked ? 'translate-x-5' : ''}`}></div>
          </div>
        </label>
        <span className="ml-3 text-sm text-gray-700">{control.label || ''}</span>
        {control.required && <span className="text-red-500 ml-2">*</span>}
      </div>
    );
  };

  const renderControl = (control: Control) => {
    if (!control.visible) return null;

    switch (control.type) {
      case ControlType.Tab:
        return renderTabControl(control as TabControl);
      case ControlType.ColumnLayout:
        return renderColumnLayout(control as ColumnLayoutControl);
      case ControlType.Address:
        return renderAddressControl(control);
      case ControlType.TextBox:
        return renderTextBox(control);
      case ControlType.Checkbox:
        return renderCheckbox(control);
      case ControlType.RadioButton:
        return renderRadioButton(control);
      case ControlType.Dropdown:
        return renderDropdown(control);
      case ControlType.Accordion:
        return renderAccordionControl(control as AccordionControl);
      case ControlType.ToggleSlider:
        return renderToggleSlider(control);
      default:
        return (
          <div className="p-4 border rounded-md">
            <p className="font-medium">{control.label || control.type}</p>
            <p className="text-sm text-gray-500">Type: {control.type}</p>
          </div>
        );
    }
  };

  const renderTabControl = (tabControl: TabControl) => {
    const currentTabIndex = activeTabIndices[tabControl.id] || 0;
    const position = tabControl.position || 'top';
    const isVertical = position === 'left' || position === 'right';
    
    const containerClasses = {
      top: 'flex flex-col',
      bottom: 'flex flex-col-reverse',
      left: 'flex',
      right: 'flex flex-row-reverse'
    }[position];

    const tabListClasses = {
      top: 'flex border-b bg-gray-50',
      bottom: 'flex border-t bg-gray-50',
      left: 'flex flex-col border-r bg-gray-50 w-48',
      right: 'flex flex-col border-l bg-gray-50 w-48'
    }[position];

    const tabClasses = (index: number) => {
      const isActive = index === currentTabIndex;
      const baseClasses = 'px-4 py-2 font-medium text-sm transition-colors duration-150';
      const activeClasses = 'text-blue-600 bg-white';
      const inactiveClasses = 'text-gray-500 hover:text-gray-700 hover:bg-gray-100';
      
      const positionClasses = {
        top: isActive ? 'border-b-2 border-blue-500' : '',
        bottom: isActive ? 'border-t-2 border-blue-500' : '',
        left: isActive ? 'border-r-2 border-blue-500' : '',
        right: isActive ? 'border-l-2 border-blue-500' : ''
      }[position];

      return `${baseClasses} ${isActive ? activeClasses : inactiveClasses} ${positionClasses}`;
    };

    return (
      <div className="border rounded-md overflow-hidden">
        <div className={containerClasses}>
          <div className={tabListClasses}>
            {tabControl.tabs.map((tab, index) => (
              <button
                key={tab.id}
                onClick={() => setActiveTabIndices(prev => ({ ...prev, [tabControl.id]: index }))}
                className={tabClasses(index)}
              >
                {tab.label}
              </button>
            ))}
          </div>
          
          <div className="flex-1 p-4 bg-white">
            {tabControl.tabs[currentTabIndex].controls.map((control) => (
              <div key={control.id} className="mb-4">
                {renderControl(control)}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderColumnLayout = (columnLayout: ColumnLayoutControl) => {
    const columnClass = `grid grid-cols-${columnLayout.columns} gap-4`;
    return (
      <div className={columnClass}>
        {columnLayout.columnControls.map((column, index) => (
          <div key={index} className="space-y-4">
            {column.map((control) => renderControl(control))}
          </div>
        ))}
      </div>
    );
  };

  const renderAddressControl = (control: Control) => {
    if (!control.properties?.fields) return null;

    return (
      <div className="space-y-4">
        {control.properties.fields.map((field: any) => (
          <div key={field.id} className="space-y-2">
            {renderLabel(field.label, field.required)}
            {field.type === 'textBox' ? (
              <input
                type="text"
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder={field.label}
                value={formValues[field.id] || ''}
                onChange={(e) => handleInputChange(field.id, e.target.value)}
              />
            ) : (
              <select 
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={formValues[field.id] || ''}
                onChange={(e) => handleInputChange(field.id, e.target.value)}
              >
                <option value="">Select {field.label}</option>
                {field.options?.map((option: any) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            )}
          </div>
        ))}
      </div>
    );
  };

  const getViewportClass = () => {
    switch (viewportSize) {
      case 'mobile':
        return 'max-w-sm mx-auto';
      case 'tablet':
        return 'max-w-2xl mx-auto';
      case 'desktop':
        return 'w-full';
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="bg-white p-4 border-b mb-6 flex items-center justify-between">
        <h2 className="text-lg font-medium">Preview: {questionnaire.title}</h2>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setViewportSize('mobile')}
            className={`p-2 rounded-md ${viewportSize === 'mobile' ? 'bg-blue-100 text-blue-800' : 'text-gray-500 hover:bg-gray-100'}`}
            title="Mobile View"
          >
            <Smartphone size={20} />
          </button>
          <button
            onClick={() => setViewportSize('tablet')}
            className={`p-2 rounded-md ${viewportSize === 'tablet' ? 'bg-blue-100 text-blue-800' : 'text-gray-500 hover:bg-gray-100'}`}
            title="Tablet View"
          >
            <Tablet size={20} />
          </button>
          <button
            onClick={() => setViewportSize('desktop')}
            className={`p-2 rounded-md ${viewportSize === 'desktop' ? 'bg-blue-100 text-blue-800' : 'text-gray-500 hover:bg-gray-100'}`}
            title="Desktop View"
          >
            <Monitor size={20} />
          </button>
        </div>
      </div>

      <div className={`flex-1 overflow-auto ${getViewportClass()}`}>
        <div className="p-4 border rounded-md bg-white">
          <h3 className="text-lg font-medium mb-6">{questionnaire.title}</h3>          
          <div className="space-y-6">            
            {questionnaire.controls.map((control) => (
              <div key={control.id}>
                {renderControl(control)}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreviewTab;