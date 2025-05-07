/**
 * API client configuration
 * Base configuration for API requests
 */

// Base API URL - would be environment variable in production
const API_BASE_URL = 'https://api.example.com';

// Default request timeout in milliseconds
const DEFAULT_TIMEOUT = 10000;

/**
 * Basic API client for making HTTP requests
 */
export const apiClient = {
  /**
   * Make a GET request
   * @param endpoint - API endpoint to call
   * @param params - Optional query parameters
   * @returns Promise with response data
   */
  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    let url = `${API_BASE_URL}${endpoint}`;
    
    // Add query parameters if provided
    if (params) {
      const queryString = new URLSearchParams(
        Object.entries(params).reduce((acc, [key, value]) => {
          if (value !== undefined && value !== null) {
            acc[key] = String(value);
          }
          return acc;
        }, {} as Record<string, string>)
      ).toString();
      
      url = `${url}${queryString ? `?${queryString}` : ''}`;
    }
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }
      
      return await response.json() as T;
    } catch (error) {
      // In a real app, you might want to log errors or handle them differently
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error(`Request timed out after ${DEFAULT_TIMEOUT}ms`);
        }
        throw error;
      }
      throw new Error('Unknown error occurred');
    }
  },
  
  /**
   * Make a POST request
   * @param endpoint - API endpoint to call
   * @param data - Request body data
   * @returns Promise with response data
   */
  async post<T>(endpoint: string, data: any): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }
      
      return await response.json() as T;
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error(`Request timed out after ${DEFAULT_TIMEOUT}ms`);
        }
        throw error;
      }
      throw new Error('Unknown error occurred');
    }
  }
};