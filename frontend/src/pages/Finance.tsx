import { useState, useEffect } from 'react';
import * as financeService from '../services/finance.service';
import toast from 'react-hot-toast';

export default function Finance() {
  const [summary, setSummary] = useState<any>(null);
  const [incomeRecords, setIncomeRecords] = useState<any[]>([]);
  const [expenseRecords, setExpenseRecords] = useState<any[]>([]);
  const [categories, setCategories] = useState<any>({ income: [], expense: [] });
  const [activeTab, setActiveTab] = useState<'income' | 'expense'>('income');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    categoryId: '',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    paymentMethod: 'CASH',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [summaryData, incomeData, expenseData, incomeCats, expenseCats] =
        await Promise.all([
          financeService.getSummary(),
          financeService.getIncomeRecords(),
          financeService.getExpenseRecords(),
          financeService.getIncomeCategories(),
          financeService.getExpenseCategories(),
        ]);

      setSummary(summaryData);
      setIncomeRecords(incomeData);
      setExpenseRecords(expenseData);
      setCategories({ income: incomeCats, expense: expenseCats });
    } catch (error) {
      toast.error('Failed to load finance data');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const data = {
        ...formData,
        amount: parseFloat(formData.amount),
      };

      if (activeTab === 'income') {
        await financeService.createIncomeRecord(data);
        toast.success('Income recorded successfully');
      } else {
        await financeService.createExpenseRecord(data);
        toast.success('Expense recorded successfully');
      }

      setShowForm(false);
      resetForm();
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to save record');
    }
  };

  const resetForm = () => {
    setFormData({
      categoryId: '',
      amount: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      paymentMethod: 'CASH',
    });
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Finance</h1>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="card">
            <h3 className="text-sm text-gray-600 mb-2">Total Income</h3>
            <p className="text-3xl font-bold text-green-600">
              LKR {summary.totalIncome.toLocaleString()}
            </p>
          </div>

          <div className="card">
            <h3 className="text-sm text-gray-600 mb-2">Total Expenses</h3>
            <p className="text-3xl font-bold text-red-600">
              LKR {summary.totalExpenses.toLocaleString()}
            </p>
          </div>

          <div className="card">
            <h3 className="text-sm text-gray-600 mb-2">Balance</h3>
            <p
              className={`text-3xl font-bold ${
                summary.balance >= 0 ? 'text-blue-600' : 'text-red-600'
              }`}
            >
              LKR {summary.balance.toLocaleString()}
            </p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="card mb-6">
        <div className="flex space-x-4 border-b pb-4 mb-4">
          <button
            onClick={() => setActiveTab('income')}
            className={`pb-2 border-b-2 transition-colors ${
              activeTab === 'income'
                ? 'border-primary-600 text-primary-600 font-semibold'
                : 'border-transparent text-gray-500'
            }`}
          >
            Income
          </button>
          <button
            onClick={() => setActiveTab('expense')}
            className={`pb-2 border-b-2 transition-colors ${
              activeTab === 'expense'
                ? 'border-primary-600 text-primary-600 font-semibold'
                : 'border-transparent text-gray-500'
            }`}
          >
            Expenses
          </button>
        </div>

        <button onClick={() => setShowForm(true)} className="btn-primary">
          + Add {activeTab === 'income' ? 'Income' : 'Expense'}
        </button>
      </div>

      {/* Records */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Payment Method
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Description
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {(activeTab === 'income' ? incomeRecords : expenseRecords).map((record) => (
                <tr key={record.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(record.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {record.category.categoryName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                    LKR {record.amount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {record.paymentMethod}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {record.description || record.notes || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {(activeTab === 'income' ? incomeRecords : expenseRecords).length === 0 && (
            <div className="text-center py-12 text-gray-500">No records found</div>
          )}
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">
                  Add {activeTab === 'income' ? 'Income' : 'Expense'}
                </h2>
                <button
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="label">Category *</label>
                  <select
                    className="input"
                    value={formData.categoryId}
                    onChange={(e) =>
                      setFormData({ ...formData, categoryId: e.target.value })
                    }
                    required
                  >
                    <option value="">Select a category</option>
                    {(activeTab === 'income'
                      ? categories.income
                      : categories.expense
                    ).map((cat: any) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.categoryName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="label">Amount (LKR) *</label>
                  <input
                    type="number"
                    step="0.01"
                    className="input"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="label">Date *</label>
                  <input
                    type="date"
                    className="input"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="label">Payment Method *</label>
                  <select
                    className="input"
                    value={formData.paymentMethod}
                    onChange={(e) =>
                      setFormData({ ...formData, paymentMethod: e.target.value })
                    }
                    required
                  >
                    <option value="CASH">Cash</option>
                    <option value="TRANSFER">Bank Transfer</option>
                    <option value="CHEQUE">Cheque</option>
                    <option value="CARD">Card</option>
                    <option value="MOBILE_MONEY">Mobile Money</option>
                  </select>
                </div>

                <div>
                  <label className="label">Description</label>
                  <textarea
                    className="input"
                    rows={3}
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      resetForm();
                    }}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    Save Record
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}