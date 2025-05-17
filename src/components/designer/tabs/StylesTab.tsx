import React from 'react';
import { useQuestionnaire } from '../../../contexts/QuestionnaireContext';
import { Control } from '../../../types';
import { ChromePicker } from 'react-color';

const StylesTab: React.FC = () => {
  const { questionnaire, updateControl } = useQuestionnaire();

  const updateGlobalStyles = (updates: Record<string, string>) => {
    const newStyles = {
      ...questionnaire.styles,
      global: {
        ...(questionnaire.styles?.global || {}),
        ...updates,
      },
    };
    
    // Update questionnaire styles
    // This would need to be implemented in the QuestionnaireContext
  };

  return (
    <div className="h-full flex flex-col">
      <div className="bg-white p-4 border-b mb-6">
        <h2 className="text-lg font-medium">Styles</h2>
      </div>

      <div className="flex-1 overflow-auto p-4">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-medium mb-4">Global Styles</h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Font Family
                </label>
                <select
                  value={questionnaire.styles?.global?.fontFamily || 'Inter, system-ui, sans-serif'}
                  onChange={(e) => updateGlobalStyles({ fontFamily: e.target.value })}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="Inter, system-ui, sans-serif">Inter</option>
                  <option value="Roboto, sans-serif">Roboto</option>
                  <option value="Open Sans, sans-serif">Open Sans</option>
                  <option value="Lato, sans-serif">Lato</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Primary Color
                </label>
                <div className="flex items-center space-x-4">
                  <div
                    className="w-10 h-10 rounded-md border shadow-sm cursor-pointer"
                    style={{ backgroundColor: questionnaire.styles?.global?.primaryColor || '#0047AB' }}
                  />
                  <input
                    type="text"
                    value={questionnaire.styles?.global?.primaryColor || '#0047AB'}
                    onChange={(e) => updateGlobalStyles({ primaryColor: e.target.value })}
                    className="block w-32 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Secondary Color
                </label>
                <div className="flex items-center space-x-4">
                  <div
                    className="w-10 h-10 rounded-md border shadow-sm cursor-pointer"
                    style={{ backgroundColor: questionnaire.styles?.global?.secondaryColor || '#4B9CD3' }}
                  />
                  <input
                    type="text"
                    value={questionnaire.styles?.global?.secondaryColor || '#4B9CD3'}
                    onChange={(e) => updateGlobalStyles({ secondaryColor: e.target.value })}
                    className="block w-32 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Border Radius
                </label>
                <select
                  value={questionnaire.styles?.global?.borderRadius || '4px'}
                  onChange={(e) => updateGlobalStyles({ borderRadius: e.target.value })}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="0">None</option>
                  <option value="2px">Small (2px)</option>
                  <option value="4px">Medium (4px)</option>
                  <option value="8px">Large (8px)</option>
                  <option value="16px">Extra Large (16px)</option>
                  <option value="9999px">Full</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Spacing
                </label>
                <select
                  value={questionnaire.styles?.global?.spacing || '16px'}
                  onChange={(e) => updateGlobalStyles({ spacing: e.target.value })}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="8px">Compact (8px)</option>
                  <option value="16px">Normal (16px)</option>
                  <option value="24px">Relaxed (24px)</option>
                  <option value="32px">Spacious (32px)</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StylesTab;