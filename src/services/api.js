// API Client using fetch API
const BASE_URL = '/api/v1'

function getLocale() {
  return localStorage.getItem('locale') || 'tm'
}

function getAuthToken() {
  return localStorage.getItem('auth_token') || ''
}

export async function apiRequest(endpoint, options = {}) {
  const url = endpoint.startsWith('http') ? endpoint : `${BASE_URL}${endpoint}`
  const headers = {
    'Accept': 'application/json',
    'X-Locale': getLocale(),
    ...(options.headers || {})
  }

  const token = getAuthToken()
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  if (options.body && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json'
    options.body = JSON.stringify(options.body)
  }

  const response = await fetch(url, {
    ...options,
    headers
  })

  const contentType = response.headers.get('content-type') || ''
  const isJson = contentType.includes('application/json')
  const data = isJson ? await response.json() : await response.text()

  if (!response.ok) {
    const error = new Error(data?.message || `HTTP error ${response.status}`)
    error.status = response.status
    error.data = data
    throw error
  }

  return data
}

export default {
  // Articles
  getArticles(params = {}) {
    const query = new URLSearchParams(params).toString()
    return apiRequest(`/articles${query ? '?' + query : ''}`)
  },
  getPopularArticles() {
    return apiRequest('/articles/popular')
  },
  getTrendingArticles() {
    return apiRequest('/articles/trending')
  },
  getFeaturedArticles() {
    return apiRequest('/articles/featured')
  },
  getArticle(slug) {
    return apiRequest(`/articles/${slug}`)
  },
  getArticleComments(slug) {
    return apiRequest(`/articles/${slug}/comments`)
  },
  addComment(slug, commentData) {
    return apiRequest(`/articles/${slug}/comments`, {
      method: 'POST',
      body: commentData
    })
  },

  // Categories
  getCategories() {
    return apiRequest('/categories')
  },
  getCategoryArticles(slug, page = 1) {
    return apiRequest(`/categories/${slug}/articles?page=${page}`)
  },
  getCategoryPopular(slug) {
    return apiRequest(`/categories/${slug}/popular`)
  },

  // Banners
  getBanners() {
    return apiRequest('/banners')
  },

  // Auth - Name & OTP
  sendOtp(data) {
    return apiRequest('/auth/send-otp', {
      method: 'POST',
      body: data
    })
  },
  verifyOtp(data) {
    return apiRequest('/auth/verify-otp', {
      method: 'POST',
      body: data
    })
  },
  login(credentials) {
    return apiRequest('/auth/login', {
      method: 'POST',
      body: credentials
    })
  },
  register(userData) {
    return apiRequest('/auth/register', {
      method: 'POST',
      body: userData
    })
  },
  getMe() {
    return apiRequest('/auth/me')
  },
  logout() {
    return apiRequest('/auth/logout', { method: 'POST' })
  }
}
