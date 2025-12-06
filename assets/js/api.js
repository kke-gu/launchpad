// API 통신 유틸리티
const API_BASE_URL = '/api';

// 공통 API 호출 함수
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  };

  if (config.body && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body);
  }

  try {
    const response = await fetch(url, config);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'API request failed');
    }
    
    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

// 견적서 API
export const quotesAPI = {
  getAll: (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.createdBy) params.append('created_by', filters.createdBy);
    if (filters.status) params.append('status', filters.status);
    const query = params.toString() ? `?${params.toString()}` : '';
    return apiRequest(`/quotes${query}`);
  },
  
  get: (id) => apiRequest(`/quotes/${id}`),
  
  create: (quote) => apiRequest('/quotes', {
    method: 'POST',
    body: quote
  }),
  
  update: (id, quote) => apiRequest(`/quotes/${id}`, {
    method: 'PUT',
    body: quote
  }),
  
  delete: (id) => apiRequest(`/quotes/${id}`, {
    method: 'DELETE'
  })
};

// 상품 API
export const productsAPI = {
  getAll: () => apiRequest('/products'),
  get: (id) => apiRequest(`/products/${id}`),
  create: (product) => apiRequest('/products', {
    method: 'POST',
    body: product
  }),
  update: (id, product) => apiRequest(`/products/${id}`, {
    method: 'PUT',
    body: product
  }),
  delete: (id) => apiRequest(`/products/${id}`, {
    method: 'DELETE'
  })
};

// 자료 API
export const resourcesAPI = {
  getAll: (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.category) params.append('category', filters.category);
    const query = params.toString() ? `?${params.toString()}` : '';
    return apiRequest(`/resources${query}`);
  },
  get: (id) => apiRequest(`/resources/${id}`),
  create: (resource) => apiRequest('/resources', {
    method: 'POST',
    body: resource
  }),
  update: (id, resource) => apiRequest(`/resources/${id}`, {
    method: 'PUT',
    body: resource
  }),
  delete: (id) => apiRequest(`/resources/${id}`, {
    method: 'DELETE'
  })
};

