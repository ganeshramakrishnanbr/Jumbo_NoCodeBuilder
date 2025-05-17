import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Control, Questionnaire, ControlType } from '../types';
import { nanoid } from 'nanoid';

interface QuestionnaireContextType {
  questionnaire: Questionnaire;
  activeTabIndex: number;
  selectedControlId: string | null;
  setActiveTabIndex: (index: number) => void;
  setSelectedControlId: (id: string | null) => void;
  addControl: (control: Partial<Control>) => void;
  updateControl: (id: string, updates: Partial<Control>) => void;
  deleteControl: (id: string) => void;
  moveControl: (controlId: string, newParentId: string, index?: number) => void;
  saveQuestionnaire: () => Promise<void>;
  loadQuestionnaire: (id: string) => Promise<void>;
}

const defaultQuestionnaire: Questionnaire = {
  id: nanoid(),
  title: 'New Questionnaire',
  createdAt: new Date(),
  updatedAt: new Date(),
  controls: [],
  styles: {
    global: {
      fontFamily: 'Inter, system-ui, sans-serif',
      primaryColor: '#0047AB',
      secondaryColor: '#4B9CD3',
      borderRadius: '4px',
      spacing: '16px',
    },
  },
};

const QuestionnaireContext = createContext<QuestionnaireContextType | undefined>(undefined);

export const QuestionnaireProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [questionnaire, setQuestionnaire] = useState<Questionnaire>(defaultQuestionnaire);
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [selectedControlId, setSelectedControlId] = useState<string | null>(null);

  const addControl = (controlData: Partial<Control>) => {
    const newControl = {
      id: nanoid(),
      ...controlData,
    } as Control;

    setQuestionnaire((prev) => ({
      ...prev,
      controls: [...prev.controls, newControl],
      updatedAt: new Date(),
    }));

    // Automatically select the new control
    setSelectedControlId(newControl.id);
  };

  const updateControl = (id: string, updates: Partial<Control>) => {
    setQuestionnaire((prev) => {
      const updatedControls = updateControlInArray(prev.controls, id, updates);
      return {
        ...prev,
        controls: updatedControls,
        updatedAt: new Date(),
      };
    });
  };

  const updateControlInArray = (controls: Control[], id: string, updates: Partial<Control>): Control[] => {
    return controls.map((control) => {
      if (control.id === id) {
        return { ...control, ...updates };
      }
      
      if (control.type === ControlType.Tab) {
        const tabControl = control as any;
        if (tabControl.tabs) {
          return {
            ...tabControl,
            tabs: tabControl.tabs.map((tab: any) => ({
              ...tab,
              controls: updateControlInArray(tab.controls, id, updates),
            })),
          };
        }
      }
      
      if (control.type === ControlType.ColumnLayout) {
        const columnControl = control as any;
        if (columnControl.columnControls) {
          return {
            ...columnControl,
            columnControls: columnControl.columnControls.map((column: Control[]) => 
              updateControlInArray(column, id, updates)
            ),
          };
        }
      }
      
      return control;
    });
  };

  const deleteControl = (id: string) => {
    setQuestionnaire((prev) => {
      const updatedControls = deleteControlFromArray(prev.controls, id);
      return {
        ...prev,
        controls: updatedControls,
        updatedAt: new Date(),
      };
    });

    // Clear selection if the deleted control was selected
    if (selectedControlId === id) {
      setSelectedControlId(null);
    }
  };

  const deleteControlFromArray = (controls: Control[], id: string): Control[] => {
    return controls.filter((control) => {
      if (control.id === id) {
        return false;
      }
      
      if (control.type === ControlType.Tab) {
        const tabControl = control as any;
        if (tabControl.tabs) {
          tabControl.tabs = tabControl.tabs.map((tab: any) => ({
            ...tab,
            controls: deleteControlFromArray(tab.controls, id),
          }));
        }
      }
      
      if (control.type === ControlType.ColumnLayout) {
        const columnControl = control as any;
        if (columnControl.columnControls) {
          columnControl.columnControls = columnControl.columnControls.map((column: Control[]) => 
            deleteControlFromArray(column, id)
          );
        }
      }
      
      return true;
    });
  };

  const moveControl = (controlId: string, newParentId: string, index = -1) => {
    console.log("Moving control", controlId, "to", newParentId, "at index", index);
  };

  const saveQuestionnaire = async () => {
    try {
      console.log("Saving questionnaire to database", questionnaire);
      localStorage.setItem('questionnaire', JSON.stringify(questionnaire));
    } catch (error) {
      console.error("Error saving questionnaire:", error);
    }
  };

  const loadQuestionnaire = async (id: string) => {
    try {
      console.log("Loading questionnaire", id);
      const saved = localStorage.getItem('questionnaire');
      if (saved) {
        setQuestionnaire(JSON.parse(saved));
      }
    } catch (error) {
      console.error("Error loading questionnaire:", error);
    }
  };

  return (
    <QuestionnaireContext.Provider
      value={{
        questionnaire,
        activeTabIndex,
        selectedControlId,
        setActiveTabIndex,
        setSelectedControlId,
        addControl,
        updateControl,
        deleteControl,
        moveControl,
        saveQuestionnaire,
        loadQuestionnaire,
      }}
    >
      {children}
    </QuestionnaireContext.Provider>
  );
};

export const useQuestionnaire = () => {
  const context = useContext(QuestionnaireContext);
  if (context === undefined) {
    throw new Error('useQuestionnaire must be used within a QuestionnaireProvider');
  }
  return context;
};