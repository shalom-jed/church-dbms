import { useState, useEffect } from 'react';
import * as financeService from '../services/finance.service';
import toast from 'react-hot-toast';
import { TrendingUp, TrendingDown, Wallet, Plus, DollarSign, CreditCard } from 'lucide-react';
import { exportFinanceToPDF, exportFinanceToExcel } from '../utils/exportUtils';
import { Download, FileText, Table } from 'lucide-react';

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
    <div className="space-y-6">
      {/* Header */}
      {/* Header */}
<div className="flex justify-between items-center">
  <div>
    <h1 className="text-3xl font-bold text-secondary-900">Finance</h1>
    <p className="text-secondary-500 mt-1">Track income and expenses</p>
  </div>
  <div className="flex items-center space-x-3">
    <div className="relative group">
      <button className="btn-secondary flex items-center space-x-2">
        <Download className="w-4 h-4" />
        <span>Export</span>
      </button>
      <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-hard border border-gray-200 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
        <button
          onClick={() => {
            const records = activeTab === 'income' ? incomeRecords : expenseRecords;
            const total = records.reduce((sum, r) => sum + r.amount, 0);
            exportFinanceToPDF(records, activeTab, total);
          }}
          className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-2 text-sm"
        >
          <FileText className="w-4 h-4 text-red-500" />
          <span>Export to PDF</span>
        </button>
        <button
          onClick={() => {
            const records = activeTab === 'income' ? incomeRecords : expenseRecords;
            exportFinanceToExcel(records, activeTab);
          }}
          className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-2 text-sm"
        >
          <Table className="w-4 h-4 text-green-500" />
          <span>Export to Excel</span>
        </button>
      </div>
    </div>
    <button onClick={() => setShowForm(true)} className="btn-primary flex items-center space-x-2">
      <Plus className="w-5 h-5" />
      <span>Add Record</span>
    </button>
  </div>
</div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="stat-card from-green-500 to-green-600">
            <div className="flex justify-between items-start mb-4">
              <TrendingUp className="w-8 h-8" />
              <DollarSign className="w-6 h-6" />
            </div>
            <p className="text-sm opacity-90 mb-1">Total Income</p>
            <p className="text-3xl font-bold">LKR {summary.totalIncome.toLocaleString()}</p>
          </div>

          <div className="stat-card from-red-500 to-red-600">
            <div className="flex justify-between items-start mb-4">
              <TrendingDown className="w-8 h-8" />
              <CreditCard className="w-6 h-6" />
            </div>
            <p className="text-sm opacity-90 mb-1">Total Expenses</p>
            <p className="text-3xl font-bold">LKR {summary.totalExpenses.toLocaleString()}</p>
          </div>

          <div className={`stat-card ${summary.balance >= 0 ? 'from-blue-500 to-blue-600' : 'from-orange-500 to-orange-600'}`}>
            <div className="flex justify-between items-start mb-4">
              <Wallet className="w-8 h-8" />
              {summary.balance >= 0 ? <TrendingUp className="w-6 h-6" /> : <TrendingDown className="w-6 h-6" />}
            </div>
            <p className="text-sm opacity-90 mb-1">Balance</p>
            <p className="text-3xl font-bold">LKR {summary.balance.toLocaleString()}</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="card">
        <div className="flex space-x-4 border-b pb-4 mb-6">
          <button
            onClick={() => setActiveTab('income')}
            className={`pb-2 px-4 border-b-2 transition-all font-semibold ${
              activeTab === 'income'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-secondary-500 hover:text-secondary-700'
            }`}
          >
            Income Records
          </button>
          <button
            onClick={() => setActiveTab('expense')}
            className={`pb-2 px-4 border-b-2 transition-all font-semibold ${
              activeTab === 'expense'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-secondary-500 hover:text-secondary-700'
            }`}
          >
            Expense Records
          </button>
        </div>

        {/* Records Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-bold text-secondary-600 uppercase">Date</th>
                <th className="text-left py-3 px-4 text-sm font-bold text-secondary-600 uppercase">Category</th>
                <th className="text-left py-3 px-4 text-sm font-bold text-secondary-600 uppercase">Amount</th>
                <th className="text-left py-3 px-4 text-sm font-bold text-secondary-600 uppercase">Method</th>
                <th className="text-left py-3 px-4 text-sm font-bold text-secondary-600 uppercase">Description</th>
              </tr>
            </thead>
            <tbody>
              {(activeTab === 'income' ? incomeRecords : expenseRecords).map((record) => (
                <tr key={record.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4 text-sm text-secondary-900">
                    {new Date(record.date).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium bg-primary-100 text-primary-700">
                      {record.category.categoryName}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm font-bold text-secondary-900">
                    LKR {record.amount.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-sm text-secondary-600">{record.paymentMethod}</td>
                  <td className="py-3 px-4 text-sm text-secondary-600">
                    {record.description || record.notes || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {(activeTab === 'income' ? incomeRecords : expenseRecords).length === 0 && (
            <div className="text-center py-12">
              <Wallet className="w-16 h-16 mx-auto text-secondary-300 mb-4" />
              <p className="text-secondary-500">No records found</p>
            </div>
          )}
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-in">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-hard animate-scale-up">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-secondary-900">
                  Add {activeTab === 'income' ? 'Income' : 'Expense'}
                </h2>
                <button
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                  className="text-secondary-400 hover:text-secondary-600 text-2xl"
                >
                  ×
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