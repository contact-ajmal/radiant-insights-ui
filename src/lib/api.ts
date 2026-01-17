/**
 * API Client for RadiantAI Backend
 * Handles all communication with FastAPI backend
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Store auth token
let authToken: string | null = localStorage.getItem('auth_token');

export const setAuthToken = (token: string | null) => {
  authToken = token;
  if (token) {
    localStorage.setItem('auth_token', token);
  } else {
    localStorage.removeItem('auth_token');
  }
};

export const getAuthToken = () => authToken;

// Generic API request helper
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(error.detail || `API Error: ${response.status}`);
  }

  return response.json();
}

// Authentication API
export const authAPI = {
  login: async (username: string, password: string) => {
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);

    const response = await fetch(`${API_BASE_URL}/api/auth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Login failed');
    }

    const data = await response.json();
    setAuthToken(data.access_token);
    return data;
  },

  register: async (userData: {
    username: string;
    email: string;
    password: string;
    full_name: string;
    role: string;
  }) => {
    return apiRequest('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  logout: () => {
    setAuthToken(null);
  },

  getCurrentUser: async () => {
    return apiRequest('/api/auth/me');
  },
};

// Patients API
export const patientsAPI = {
  list: async (params?: { skip?: number; limit?: number; search?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.skip) queryParams.append('skip', params.skip.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);

    const query = queryParams.toString();
    return apiRequest(`/api/patients${query ? `?${query}` : ''}`);
  },

  get: async (id: string) => {
    return apiRequest(`/api/patients/${id}`);
  },

  getHistory: async (id: string) => {
    return apiRequest(`/api/patients/${id}/history`);
  },

  create: async (patientData: any) => {
    return apiRequest('/api/patients', {
      method: 'POST',
      body: JSON.stringify(patientData),
    });
  },

  update: async (id: string, patientData: any) => {
    return apiRequest(`/api/patients/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(patientData),
    });
  },

  delete: async (id: string) => {
    return apiRequest(`/api/patients/${id}`, {
      method: 'DELETE',
    });
  },
};

// Studies API
export const studiesAPI = {
  upload: async (patientId: string, files: File[]) => {
    const formData = new FormData();
    formData.append('patient_id', patientId);
    files.forEach((file) => {
      formData.append('files', file);
    });

    const response = await fetch(`${API_BASE_URL}/api/studies/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    return response.json();
  },

  get: async (id: string) => {
    return apiRequest(`/api/studies/${id}`);
  },

  listByPatient: async (patientId: string) => {
    return apiRequest(`/api/studies/patient/${patientId}`);
  },
};

// Analysis API
export const analysisAPI = {
  create: async (data: {
    study_id: string;
    clinical_indication: string;
    analysis_type: string;
    prior_study_id?: string;
  }) => {
    return apiRequest('/api/analysis', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  get: async (id: string) => {
    return apiRequest(`/api/analysis/${id}`);
  },

  listByStudy: async (studyId: string) => {
    return apiRequest(`/api/analysis/study/${studyId}/analyses`);
  },
};

// Reports API
export const reportsAPI = {
  create: async (data: {
    study_id: string;
    analysis_id: string;
    include_ai_disclaimer?: boolean;
  }) => {
    return apiRequest('/api/reports', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  get: async (id: string) => {
    return apiRequest(`/api/reports/${id}`);
  },

  listByStudy: async (studyId: string) => {
    return apiRequest(`/api/reports/study/${studyId}`);
  },

  finalize: async (id: string) => {
    return apiRequest(`/api/reports/${id}/finalize`, {
      method: 'PATCH',
    });
  },

  exportPDF: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/api/export/report/${id}/pdf`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Export failed');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `radiology_report_${id}.pdf`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  },

  exportJSON: async (id: string) => {
    return apiRequest(`/api/export/report/${id}/json`);
  },
};

// Config API
export const configAPI = {
  get: async () => {
    return apiRequest('/api/config');
  },
  update: async (settings: any) => {
    return apiRequest('/api/config', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  },
};

// Health check
export const healthCheck = async () => {
  return apiRequest('/health');
};
