import { api } from './api';

/**
 * Service for managing Transactions against Spring Boot REST APIs
 */
export const transactionService = {
  /**
   * Fetch all transactions
   * @returns {Promise<Array>} List of transaction objects
   */
  async getAll() {
    return api.get('/transactions');
  },

  /**
   * Fetch transaction by ID
   * @param {number|string} id 
   * @returns {Promise<Object>}
   */
  async getById(id) {
    return api.get(`/transactions/${id}`);
  },

  /**
   * Create a new transaction
   * @param {Object} data - { title, amount, type, category, date }
   * @returns {Promise<Object>}
   */
  async create(data) {
    const payload = {
      title: data.title?.trim(),
      amount: parseFloat(data.amount),
      type: data.type, // 'INCOME' or 'EXPENSE'
      category: data.category?.trim(),
      date: data.date, // 'YYYY-MM-DD'
    };
    return api.post('/transactions', payload);
  },

  /**
   * Update an existing transaction
   * @param {number|string} id 
   * @param {Object} data 
   * @returns {Promise<Object>}
   */
  async update(id, data) {
    const payload = {
      title: data.title?.trim(),
      amount: parseFloat(data.amount),
      type: data.type,
      category: data.category?.trim(),
      date: data.date,
    };
    return api.put(`/transactions/${id}`, payload);
  },

  /**
   * Delete a transaction by ID
   * @param {number|string} id 
   * @returns {Promise<void>}
   */
  async delete(id) {
    return api.delete(`/transactions/${id}`);
  },

  /**
   * Filter transactions by Type (INCOME | EXPENSE)
   * @param {string} type 
   * @returns {Promise<Array>}
   */
  async getByType(type) {
    return api.get(`/transactions/type/${type}`);
  },

  /**
   * Filter transactions by Category
   * @param {string} category 
   * @returns {Promise<Array>}
   */
  async getByCategory(category) {
    return api.get(`/transactions/category/${encodeURIComponent(category)}`);
  },

  /**
   * Fetch financial summary (totalIncome, totalExpenses, balance)
   * @returns {Promise<Object>} { totalIncome, totalExpenses, balance }
   */
  async getSummary() {
    return api.get('/transactions/summary');
  },

  /**
   * Ping backend to check health and connectivity
   */
  async checkHealth() {
    const start = performance.now();
    try {
      await api.get('/transactions/summary');
      const latency = Math.round(performance.now() - start);
      return { ok: true, latency };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  },
};

export default transactionService;
