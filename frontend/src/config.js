// API Configuration
// During local development, this defaults to localhost:5000.
// When deployed, Vite will inject the production backend URL from environment variables.
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
