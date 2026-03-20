import apiClient from '../lib/axios';

// Income
export async function getIncomeRecords(filters?: any) {
  const response = await apiClient.get('/finance/income', { params: filters });
  return response.data.data;
}

export async function createIncomeRecord(data: any) {
  const response = await apiClient.post('/finance/income', data);
  return response.data.data;
}

export async function updateIncomeRecord(id: string, data: any) {
  const response = await apiClient.put(`/finance/income/${id}`, data);
  return response.data.data;
}

export async function deleteIncomeRecord(id: string) {
  const response = await apiClient.delete(`/finance/income/${id}`);
  return response.data;
}

export async function getIncomeCategories() {
  const response = await apiClient.get('/finance/income/categories');
  return response.data.data;
}

// Expenses
export async function getExpenseRecords(filters?: any) {
  const response = await apiClient.get('/finance/expenses', { params: filters });
  return response.data.data;
}

export async function createExpenseRecord(data: any) {
  const response = await apiClient.post('/finance/expenses', data);
  return response.data.data;
}

export async function updateExpenseRecord(id: string, data: any) {
  const response = await apiClient.put(`/finance/expenses/${id}`, data);
  return response.data.data;
}

export async function deleteExpenseRecord(id: string) {
  const response = await apiClient.delete(`/finance/expenses/${id}`);
  return response.data;
}

export async function getExpenseCategories() {
  const response = await apiClient.get('/finance/expenses/categories');
  return response.data.data;
}

// Summary
export async function getSummary(startDate?: string, endDate?: string) {
  const response = await apiClient.get('/finance/summary', { params: { startDate, endDate } });
  return response.data.data;
}