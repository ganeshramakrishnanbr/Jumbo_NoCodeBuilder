import React from 'react';
import { Control, TabControl } from '../../../types';
import { Plus, Trash2 } from 'lucide-react';
import { nanoid } from 'nanoid';

interface TabPropertiesProps {
  control: Control;
  onChange: (updates: Partial<Control>) => void;
}

const TabProperties: React.FC<TabPropertiesProps> = ({ control, onChange }) => {
  const tabControl = control as TabControl;

  const handlePositionChange = (position: string) => {
    onChange({ 
      position: position as "top" | "bottom" | "left" | "right"
    });
  };

  const handleAddTab = () => {
    const newTabs = [...(tabControl.tabs || [])];
    newTabs.push({
      id: nanoid(),
      label: `Tab ${newTabs.length + 1}`,
      controls: [],
    });
    
    onChange({ tabs: newTabs });
  };

  const handleRemoveTab = (tabId: string) => {
    if (tabControl.tabs.length <= 1) {
      alert("You must have at least one tab");
      return;
    }
    
    const newTabs = tabControl.tabs.filter((tab: any) => tab.id !== tabId);
    onChange({ tabs: newTabs });
  };

  const handleTabLabelChange = (tabId: string, newLabel: string) => {
    const newTabs = tabControl.tabs.map((tab: any) => 
      tab.id === tabId ? { ...tab, label: newLabel } : tab
    );
    
    onChange({ tabs: newTabs });
  };

  return (
    <div>
      <h3 className="text-sm font-medium text-gray-900 mb-3">Tab Properties</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tab Position
          </label>
          <select
            value={tabControl.position || 'top'}
            onChange={(e) => handlePositionChange(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value="top">Top</option>
            <option value="bottom">Bottom</option>
            <option value="left">Left</option>
            <option value="right">Right</option>
          </select>
        </div>
        
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Tabs
            </label>
            <button
              type="button"
              onClick={handleAddTab}
              className="flex items-center text-sm text-blue-600 hover:text-blue-800"
            >
              <Plus size={16} className="mr-1" />
              Add Tab
            </button>
          </div>
          
          <div className="space-y-2">
            {tabControl.tabs && tabControl.tabs.map((tab: any, index: number) => (
              <div key={tab.id} className="flex items-center border rounded-md p-2 bg-white hover:bg-gray-50 transition-colors">
                <input
                  type="text"
                  value={tab.label}
                  onChange={(e) => handleTabLabelChange(tab.id, e.target.value)}
                  className="flex-1 text-sm border border-gray-300 rounded px-2 py-1 focus:ring-blue-500 focus:border-blue-500"
                  placeholder={`Tab ${index + 1}`}
                />
                
                <button
                  type="button"
                  onClick={() => handleRemoveTab(tab.id)}
                  className="ml-2 text-red-500 hover:text-red-700"
                  disabled={tabControl.tabs.length <= 1}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TabProperties;