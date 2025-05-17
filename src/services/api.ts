import { Questionnaire } from '../types';

// Update API URL to use the correct protocol and port
const API_URL = 'http://localhost:5173/api';

export const api = {
  async fetchQuestionnaires() {
    try {
      // Initialize local storage with empty array if it doesn't exist
      if (!localStorage.getItem('questionnaires')) {
        localStorage.setItem('questionnaires', JSON.stringify([]));
      }

      console.log('Fetching questionnaires from API');
      const response = await fetch(`${API_URL}/questionnaires`);
      
      if (!response.ok) {
        // Try to read error message if available
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      // Only check content type and parse JSON for successful responses
      const contentType = response.headers.get('content-type');
      if (!contentType?.includes('application/json')) {
        console.warn('Unexpected content type:', contentType);
        return []; // Return empty array for non-JSON responses
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching questionnaires:', error);
      // Fallback to local storage
      const savedItems = localStorage.getItem('questionnaires');
      return savedItems ? JSON.parse(savedItems) : [];
    }
  },

  async fetchQuestionnaire(id: string) {
    try {
      console.log(`Fetching questionnaire ${id} from API`);
      const response = await fetch(`${API_URL}/questionnaires/${id}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType?.includes('application/json')) {
        console.warn('Unexpected content type:', contentType);
        return null;
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching questionnaire:', error);
      const savedItem = localStorage.getItem(`questionnaire_${id}`);
      return savedItem ? JSON.parse(savedItem) : null;
    }
  },

  async saveQuestionnaire(questionnaire: Questionnaire) {
    try {
      console.log('Saving questionnaire to API', questionnaire);
      const response = await fetch(`${API_URL}/questionnaires/${questionnaire.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(questionnaire),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }
      
      const contentType = response.headers.get('content-type');
      if (!contentType?.includes('application/json')) {
        console.warn('Unexpected content type:', contentType);
        return questionnaire; // Return original data if response isn't JSON
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error saving questionnaire:', error);
      localStorage.setItem(`questionnaire_${questionnaire.id}`, JSON.stringify(questionnaire));
      
      const savedItems = localStorage.getItem('questionnaires');
      const questionnaires = savedItems ? JSON.parse(savedItems) : [];
      const exists = questionnaires.some((q: Questionnaire) => q.id === questionnaire.id);
      if (!exists) {
        questionnaires.push({
          id: questionnaire.id,
          title: questionnaire.title,
          createdAt: questionnaire.createdAt,
          updatedAt: questionnaire.updatedAt,
        });
        localStorage.setItem('questionnaires', JSON.stringify(questionnaires));
      }
      return questionnaire;
    }
  },

  async createQuestionnaire(questionnaire: Questionnaire) {
    try {
      console.log('Creating questionnaire in API', questionnaire);
      const response = await fetch(`${API_URL}/questionnaires`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(questionnaire),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }
      
      const contentType = response.headers.get('content-type');
      if (!contentType?.includes('application/json')) {
        console.warn('Unexpected content type:', contentType);
        return questionnaire; // Return original data if response isn't JSON
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error creating questionnaire:', error);
      localStorage.setItem(`questionnaire_${questionnaire.id}`, JSON.stringify(questionnaire));
      
      const savedItems = localStorage.getItem('questionnaires');
      const questionnaires = savedItems ? JSON.parse(savedItems) : [];
      questionnaires.push({
        id: questionnaire.id,
        title: questionnaire.title,
        createdAt: questionnaire.createdAt,
        updatedAt: questionnaire.updatedAt,
      });
      localStorage.setItem('questionnaires', JSON.stringify(questionnaires));
      return questionnaire;
    }
  },

  async deleteQuestionnaire(id: string) {
    try {
      console.log(`Deleting questionnaire ${id} from API`);
      const response = await fetch(`${API_URL}/questionnaires/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }
      
      const contentType = response.headers.get('content-type');
      if (!contentType?.includes('application/json')) {
        console.warn('Unexpected content type:', contentType);
        return { success: true }; // Return success if response isn't JSON
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error deleting questionnaire:', error);
      localStorage.removeItem(`questionnaire_${id}`);
      
      const savedItems = localStorage.getItem('questionnaires');
      if (savedItems) {
        const questionnaires = JSON.parse(savedItems);
        const updatedQuestionnaires = questionnaires.filter((q: Questionnaire) => q.id !== id);
        localStorage.setItem('questionnaires', JSON.stringify(updatedQuestionnaires));
      }
      return { success: true };
    }
  },
};