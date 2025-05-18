import React, { useState } from 'react';
import { useQuestionnaire } from '../../../contexts/QuestionnaireContext';
import { Smartphone, Tablet, Monitor, Eye, EyeOff } from 'lucide-react';
import { Control, ControlType, TabControl, ColumnLayoutControl, AccordionControl } from '../../../types';

const PreviewTab: React.FC = () => {
  const { questionnaire } = useQuestionnaire();
  const [viewportSize, setViewportSize] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');
  const [activeTabIndices, setActiveTabIndices] = useState<Record<string, number>>({});
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [showMasked, setShowMasked] = useState<Record<string, boolean>>({});

  const handleInputChange = (controlId: string, value: string) => {
    setFormValues(prev => ({
      ...prev,
      [controlId]: value
    }));
  };

  const toggleMask = (controlId: string) => {
    setShowMasked(prev => ({
      ...prev,
      [controlId]: !prev[controlId]
    }));
  };

  const toggleAccordionSection = (accordionId: string, sectionId: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [`${accordionId}_${sectionId}`]: !prev[`${accordionId}_${sectionId}`]
    }));
  };

  const renderLabel = (label: string, required: boolean = false) => (
    <label className="block text-sm font-medium text-gray-700">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
  );

  const renderTextBox = (control: Control) => (
    <div className="space-y-2">
      {renderLabel(control.label || 'Text Input', control.required)}
      <input
        type="text"
        value={formValues[control.id] || ''}
        onChange={(e) => handleInputChange(control.id, e.target.value)}
        placeholder={control.properties?.placeholder}
        disabled={!control.enabled}
        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100"
      />
    </div>
  );

  const renderCheckbox = (control: Control) => (
    <div className="space-y-2">
      {renderLabel(control.label || 'Checkbox', control.required)}
      <div className="space-y-2">
        {(control.properties?.options || []).map((option: any) => (
          <div key={option.id} className="flex items-center">
            <input
              type="checkbox"
              checked={formValues[`${control.id}_${option.id}`] === 'true'}
              onChange={(e) => handleInputChange(`${control.id}_${option.id}`, String(e.target.checked))}
              disabled={!control.enabled}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-700">
              {option.label}
            </label>
          </div>
        ))}
      </div>
    </div>
  );

  const renderRadioButton = (control: Control) => (
    <div className="space-y-2">
      {renderLabel(control.label || 'Radio Button', control.required)}
      <div className="space-y-2">
        {(control.properties?.options || []).map((option: any) => (
          <div key={option.id} className="flex items-center">
            <input
              type="radio"
              name={control.id}
              value={option.value}
              checked={formValues[control.id] === option.value}
              onChange={(e) => handleInputChange(control.id, e.target.value)}
              disabled={!control.enabled}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
            />
            <label className="ml-2 block text-sm text-gray-700">
              {option.label}
            </label>
          </div>
        ))}
      </div>
    </div>
  );

  const renderDropdown = (control: Control) => (
    <div className="space-y-2">
      {renderLabel(control.label || 'Dropdown', control.required)}
      <select
        value={formValues[control.id] || ''}
        onChange={(e) => handleInputChange(control.id, e.target.value)}
        disabled={!control.enabled}
        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100"
      >
        <option value="">Select an option</option>
        {(control.properties?.options || []).map((option: any) => (
          <option key={option.id} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );

  const renderNumeric = (control: Control) => (
    <div className="space-y-2">
      {renderLabel(control.label || 'Numeric Input', control.required)}
      <input
        type="number"
        value={formValues[control.id] || ''}
        onChange={(e) => handleInputChange(control.id, e.target.value)}
        min={control.properties?.min}
        max={control.properties?.max}
        step={control.properties?.step}
        disabled={!control.enabled}
        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100"
      />
    </div>
  );

  const renderToggleSlider = (control: Control) => (
    <div className="space-y-2">
      {renderLabel(control.label || 'Toggle Slider', control.required)}
      <input
        type="range"
        value={formValues[control.id] || control.properties?.min || 0}
        onChange={(e) => handleInputChange(control.id, e.target.value)}
        min={control.properties?.min}
        max={control.properties?.max}
        step={control.properties?.step}
        disabled={!control.enabled}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
      />
      <div className="flex justify-between text-xs text-gray-500">
        <span>{control.properties?.min || 0}</span>
        <span>{control.properties?.max || 100}</span>
      </div>
    </div>
  );

  const renderProtectedNumber = (control: Control) => {
    const value = formValues[control.id] || '';
    const isShowingMasked = showMasked[control.id];
    const maskChar = control.properties?.maskChar || '*';
    const showLastDigits = control.properties?.showLastDigits || 0;

    const getMaskedValue = () => {
      if (!value) return '';
      if (!isShowingMasked) return value;
      const visiblePart = value.slice(-showLastDigits);
      const maskedPart = maskChar.repeat(value.length - showLastDigits);
      return maskedPart + visiblePart;
    };

    return (
      <div className="space-y-2">
        {renderLabel(control.label || 'Protected Number', control.required)}
        <div className="relative">
          <input
            type="text"
            value={getMaskedValue()}
            onChange={(e) => handleInputChange(control.id, e.target.value.replace(/\D/g, ''))}
            disabled={!control.enabled}
            className="block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100"
          />
          <button
            type="button"
            onClick={() => toggleMask(control.id)}
            className="absolute inset-y-0 right-0 px-3 flex items-center"
          >
            {isShowingMasked ? <Eye size={16} /> : <EyeOff size={16} />}
          </button>
        </div>
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
                value={formValues[field.id] || ''}
                onChange={(e) => handleInputChange(field.id, e.target.value)}
                disabled={!control.enabled}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100"
              />
            ) : (
              <select
                value={formValues[field.id] || ''}
                onChange={(e) => handleInputChange(field.id, e.target.value)}
                disabled={!control.enabled}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100"
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

  const renderAccordionControl = (control: AccordionControl) => {
    if (!control.sections) return null;

    return (
      <div className="space-y-2 border rounded-lg overflow-hidden">
        {control.sections.map((section) => {
          const isExpanded = expandedSections[`${control.id}_${section.id}`];
          return (
            <div key={section.id} className="border-b last:border-b-0">
              <button
                onClick={() => toggleAccordionSection(control.id, section.id)}
                className="w-full flex items-center justify-between p-4 text-left bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <span className="font-medium">{section.label}</span>
                <span className="transform transition-transform">
                  {isExpanded ? '−' : '+'}
                </span>
              </button>
              {isExpanded && (
                <div className="p-4 bg-white space-y-4">
                  {section.controls.map((control) => renderControl(control))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const renderTabControl = (control: TabControl) => {
    const currentTabIndex = activeTabIndices[control.id] || 0;
    const position = control.position || 'top';
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

    return (
      <div className="border rounded-lg overflow-hidden">
        <div className={containerClasses}>
          <div className={tabListClasses}>
            {control.tabs.map((tab, index) => (
              <button
                key={tab.id}
                onClick={() => setActiveTabIndices({ ...activeTabIndices, [control.id]: index })}
                className={`
                  px-4 py-2 text-sm font-medium transition-colors
                  ${index === currentTabIndex
                    ? 'text-blue-600 bg-white border-blue-500'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }
                  ${position === 'top' && index === currentTabIndex ? 'border-b-2' : ''}
                  ${position === 'bottom' && index === currentTabIndex ? 'border-t-2' : ''}
                  ${position === 'left' && index === currentTabIndex ? 'border-r-2' : ''}
                  ${position === 'right' && index === currentTabIndex ? 'border-l-2' : ''}
                `}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="flex-1 p-4 bg-white">
            {control.tabs[currentTabIndex].controls.map((control) => (
              <div key={control.id} className="mb-4">
                {renderControl(control)}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderColumnLayout = (control: ColumnLayoutControl) => {
    const columns = control.columns || 2;
    const columnClass = `grid grid-cols-${columns} gap-4`;
    
    return (
      <div className={columnClass}>
        {control.columnControls?.map((column, index) => (
          <div key={index} className="space-y-4">
            {column.map((control) => renderControl(control))}
          </div>
        ))}
      </div>
    );
  };

  const renderControl = (control: Control) => {
    if (!control.visible) return null;

    switch (control.type) {
      case ControlType.Tab:
        return renderTabControl(control as TabControl);
      case ControlType.Accordion:
        return renderAccordionControl(control as AccordionControl);
      case ControlType.ColumnLayout:
        return renderColumnLayout(control as ColumnLayoutControl);
      case ControlType.TextBox:
        return renderTextBox(control);
      case ControlType.Checkbox:
        return renderCheckbox(control);
      case ControlType.RadioButton:
        return renderRadioButton(control);
      case ControlType.Dropdown:
        return renderDropdown(control);
      case ControlType.Numeric:
        return renderNumeric(control);
      case ControlType.ToggleSlider:
        return renderToggleSlider(control);
      case ControlType.ProtectedNumber:
        return renderProtectedNumber(control);
      case ControlType.Address:
        return renderAddressControl(control);
      default:
        return (
          <div className="p-4 border rounded-md">
            <p className="font-medium">{control.label || control.type}</p>
            <p className="text-sm text-gray-500">Type: {control.type}</p>
          </div>
        );
    }
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
            {questionnaire.controls.map((control) => renderControl(control))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreviewTab;