import { api } from './api';

/**
 * Service for Student Survival Mode Allowance Cycles & Analytics
 * Interfaces with Spring Boot REST API (/api/allowances)
 */
export const allowanceService = {
  /**
   * Fetch active survival metrics dashboard
   * @returns {Promise<Object>} Full SurvivalDashboardResponse
   */
  async getActiveSurvival() {
    return api.get('/allowances/active/survival');
  },

  /**
   * Fetch active allowance plan
   * @returns {Promise<Object>} AllowanceResponse
   */
  async getActiveCycle() {
    return api.get('/allowances/active');
  },

  /**
   * Create a new allowance cycle
   * @param {Object} data - { name, allowanceAmount, startDate, endDate, openingBalance, emergencyReserve, fixedExpenses, notes }
   * @returns {Promise<Object>} AllowanceResponse
   */
  async createCycle(data) {
    const payload = {
      name: data.name?.trim() || null,
      allowanceAmount: parseFloat(data.allowanceAmount),
      startDate: data.startDate,
      endDate: data.endDate,
      openingBalance: data.openingBalance ? parseFloat(data.openingBalance) : 0,
      emergencyReserve: data.emergencyReserve ? parseFloat(data.emergencyReserve) : 0,
      fixedExpenses: data.fixedExpenses ? parseFloat(data.fixedExpenses) : 0,
      notes: data.notes?.trim() || null,
    };
    return api.post('/allowances', payload);
  },

  /**
   * Update an existing allowance cycle
   * @param {number|string} id 
   * @param {Object} data 
   * @returns {Promise<Object>}
   */
  async updateCycle(id, data) {
    const payload = {
      name: data.name?.trim() || null,
      allowanceAmount: parseFloat(data.allowanceAmount),
      startDate: data.startDate,
      endDate: data.endDate,
      openingBalance: data.openingBalance ? parseFloat(data.openingBalance) : 0,
      emergencyReserve: data.emergencyReserve ? parseFloat(data.emergencyReserve) : 0,
      fixedExpenses: data.fixedExpenses ? parseFloat(data.fixedExpenses) : 0,
      notes: data.notes?.trim() || null,
    };
    return api.put(`/allowances/${id}`, payload);
  },

  /**
   * Add a top-up event (pocket money, freelance, extra money)
   * @param {number|string|null} cycleId 
   * @param {Object} data - { amount, date, description }
   * @returns {Promise<Object>} AllowanceEventResponse
   */
  async addTopUp(cycleId, data) {
    const payload = {
      amount: parseFloat(data.amount),
      date: data.date,
      description: data.description?.trim() || 'Allowance Top-up',
    };
    if (cycleId && !isNaN(Number(cycleId)) && Number(cycleId) > 0) {
      return api.post(`/allowances/${cycleId}/events`, payload);
    }
    // Fallback to active cycle endpoint
    return api.post('/allowances/events', payload);
  },

  /**
   * Fetch allowance history
   * @returns {Promise<Array>} List of past AllowanceResponse
   */
  async getHistory() {
    return api.get('/allowances/history');
  },

  /**
   * Fetch survival metrics for a specific cycle by ID (for history reviews)
   * @param {number|string} id 
   * @returns {Promise<Object>} SurvivalDashboardResponse
   */
  async getSurvivalById(id) {
    return api.get(`/allowances/${id}/survival`);
  },

  /**
   * Fetch weekly report for cycle
   * @param {number|string} id 
   * @returns {Promise<Object>} WeeklyReportDto
   */
  async getWeeklyReport(id) {
    return api.get(`/allowances/${id}/weekly-report`);
  },
};

export default allowanceService;

