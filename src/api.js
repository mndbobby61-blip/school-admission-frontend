import { API_URL } from './config.js';

export class ApiError extends Error {
  constructor(status, code, message) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

async function request(path, { method = 'GET', studentId, body } = {}) {
  const headers = {};
  if (body) headers['Content-Type'] = 'application/json';
  if (studentId) headers['X-Student-Id'] = studentId;

  let res;
  try {
    res = await fetch(`${API_URL}${path}`, { method, headers, body: body ? JSON.stringify(body) : undefined });
  } catch {
    throw new ApiError(0, 'NETWORK', 'Network error');
  }
  if (res.status === 204) return null;

  let data = null;
  try { data = await res.json(); } catch { /* empty body */ }
  if (!res.ok) throw new ApiError(res.status, data?.code ?? 'UNKNOWN', data?.message ?? res.statusText);
  return data;
}

export const api = {
  listClasses: () => request('/classes'),
  getClass: (id) => request(`/classes/${id}`),
  createClass: (name, totalSeats) => request('/classes', { method: 'POST', body: { name, totalSeats } }),
  createHold: (classId, studentId) => request(`/classes/${classId}/holds`, { method: 'POST', studentId }),
  getHold: (holdId) => request(`/holds/${holdId}`),
  confirmHold: (holdId, studentId) => request(`/holds/${holdId}/confirm`, { method: 'POST', studentId }),
  cancelHold: (holdId, studentId) => request(`/holds/${holdId}`, { method: 'DELETE', studentId }),
  myHolds: (studentId) => request('/me/holds', { studentId }),
};