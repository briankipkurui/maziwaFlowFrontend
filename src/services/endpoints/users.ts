export const USERS_ENDPOINTS = {
  USERS: (page = 1, limit = 10) => `/users?page=${page}&limit=${limit}`,
  CREATE: '/users',
  UPDATE: (id: number) => `/users/${id}`,
  USER_BY_ID: (id: number) => `/users/${id}`,
  CURRENT_USER: '/users/me',
};
