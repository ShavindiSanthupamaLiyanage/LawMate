// Common types used across the application

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role?: string;
}

export interface ApiError {
  message: string;
  statusCode: number;
  errors?: Record<string, string[]>;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}
