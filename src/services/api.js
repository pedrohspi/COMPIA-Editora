import axios from 'axios'


const api = axios.create({
  baseURL: 'http://localhost:3001',
  headers: { 'Content-Type': 'application/json' }
})

// Products
export const getProducts = () => api.get('/products')
export const getProductById = (id) => api.get(`/products/${id}`)
export const createProduct = (data) => api.post('/products', data)
export const updateProduct = (id, data) => api.put(`/products/${id}`, data)
export const patchProduct = (id, data) => api.patch(`/products/${id}`, data)
export const deleteProduct = (id) => api.delete(`/products/${id}`)
export const getOrdersByUser = (userId) => {
  return api.get(`/orders?userId=${userId}`)
}

// Orders
export const getOrders = () => api.get('/orders?_sort=date&_order=desc')
export const createOrder = (data) => api.post('/orders', data)
export const patchOrder = (id, data) => api.patch(`/orders/${id}`, data)

// Users
export const getUsers = () => api.get('/users')
export const patchUser = (id, data) => api.patch(`/users/${id}`, data)
export const deleteUser = (id) => api.delete(`/users/${id}`)

// Logs
export const getLogs = () => api.get('/logs?_sort=timestamp&_order=desc')

export default api
