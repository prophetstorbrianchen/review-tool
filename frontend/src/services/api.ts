import type { LearningItem, DueItemsResponse, ReviewStats, CreateLearningItemData, ReviewHistory } from '../types';

const API_BASE_URL = 'http://localhost:8000/api/v1';

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'An error occurred' }));
    throw new Error(error.message || `HTTP ${response.status}: ${response.statusText}`);
  }
  return response.json();
}

// Learning Items API
export const api = {
  // Create new learning item
  createItem: async (data: CreateLearningItemData): Promise<LearningItem> => {
    const response = await fetch(`${API_BASE_URL}/learning-items/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse<LearningItem>(response);
  },

  // Get all learning items
  getItems: async (subject?: string): Promise<{ items: LearningItem[]; total: number }> => {
    const url = new URL(`${API_BASE_URL}/learning-items/`);
    if (subject) url.searchParams.append('subject', subject);

    const response = await fetch(url.toString());
    return handleResponse<{ items: LearningItem[]; total: number }>(response);
  },

  // Get single item
  getItem: async (id: string): Promise<LearningItem> => {
    const response = await fetch(`${API_BASE_URL}/learning-items/${id}`);
    return handleResponse<LearningItem>(response);
  },

  // Update item
  updateItem: async (id: string, data: Partial<CreateLearningItemData>): Promise<LearningItem> => {
    const response = await fetch(`${API_BASE_URL}/learning-items/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse<LearningItem>(response);
  },

  // Delete item
  deleteItem: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/learning-items/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) {
      throw new Error('Failed to delete item');
    }
  },

  // Get all subjects
  getSubjects: async (): Promise<string[]> => {
    const response = await fetch(`${API_BASE_URL}/learning-items/subjects`);
    return handleResponse<string[]>(response);
  },

  // Get items due for review
  getDueItems: async (subject?: string): Promise<DueItemsResponse> => {
    const url = new URL(`${API_BASE_URL}/reviews/due`);
    if (subject) url.searchParams.append('subject', subject);

    const response = await fetch(url.toString());
    return handleResponse<DueItemsResponse>(response);
  },

  // Mark item as reviewed
  markAsReviewed: async (id: string): Promise<ReviewHistory> => {
    const response = await fetch(`${API_BASE_URL}/reviews/${id}`, {
      method: 'POST'
    });
    return handleResponse<ReviewHistory>(response);
  },

  // Manual review (doesn't affect schedule)
  manualReview: async (id: string): Promise<ReviewHistory> => {
    const response = await fetch(`${API_BASE_URL}/reviews/${id}/manual`, {
      method: 'POST'
    });
    return handleResponse<ReviewHistory>(response);
  },

  // Get review history
  getReviewHistory: async (id: string): Promise<ReviewHistory[]> => {
    const response = await fetch(`${API_BASE_URL}/reviews/history/${id}`);
    return handleResponse<ReviewHistory[]>(response);
  },

  // Get review statistics
  getStats: async (): Promise<ReviewStats> => {
    const response = await fetch(`${API_BASE_URL}/reviews/stats`);
    return handleResponse<ReviewStats>(response);
  }
};
