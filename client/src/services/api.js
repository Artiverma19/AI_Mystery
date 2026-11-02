const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

class ApiError extends Error {
  constructor(code, message, status) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
  }
}

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  try {
    const res = await fetch(url, { ...options, headers });
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const code = data?.error?.code || 'REQUEST_FAILED';
      const message = data?.error?.message || `Request failed with status ${res.status}`;
      throw new ApiError(code, message, res.status);
    }

    return data;
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw new ApiError('NETWORK_ERROR', err.message || 'Network connection failed', 0);
  }
}

export async function createCase({ premise, difficulty }) {
  return request('/cases', {
    method: 'POST',
    body: JSON.stringify({ premise, difficulty })
  });
}

export async function getCase(id) {
  return request(`/cases/${id}`);
}

export async function discoverEvidence(id, evidenceId) {
  return request(`/cases/${id}/evidence/${evidenceId}/discover`, {
    method: 'POST',
    body: JSON.stringify({})
  });
}

export async function requestHint(id) {
  return request(`/cases/${id}/hints`, {
    method: 'POST',
    body: JSON.stringify({})
  });
}

export async function accuseSuspect(id, suspectId) {
  return request(`/cases/${id}/accuse`, {
    method: 'POST',
    body: JSON.stringify({ suspectId })
  });
}

export async function getCaseResult(id) {
  return request(`/cases/${id}/result`);
}

export async function checkHealth() {
  return request('/health');
}

