import { Router } from 'express';
import * as FinanceController from '../controllers/finance.controller';
import { protect, restrictTo } from '../middleware/auth.middleware';

const router = Router();

router.use(protect);

// Income
router.get('/income', FinanceController.getIncomeRecords);
router.post('/income', restrictTo('ADMIN'), FinanceController.createIncomeRecord);
router.put('/income/:id', restrictTo('ADMIN'), FinanceController.updateIncomeRecord);
router.delete('/income/:id', restrictTo('ADMIN'), FinanceController.deleteIncomeRecord);
router.get('/income/categories', FinanceController.getIncomeCategories);
router.post('/income/categories', restrictTo('ADMIN'), FinanceController.createIncomeCategory);

// Expenses
router.get('/expenses', FinanceController.getExpenseRecords);
router.post('/expenses', restrictTo('ADMIN'), FinanceController.createExpenseRecord);
router.put('/expenses/:id', restrictTo('ADMIN'), FinanceController.updateExpenseRecord);
router.delete('/expenses/:id', restrictTo('ADMIN'), FinanceController.deleteExpenseRecord);
router.get('/expenses/categories', FinanceController.getExpenseCategories);
router.post('/expenses/categories', restrictTo('ADMIN'), FinanceController.createExpenseCategory);

// Pledges
router.get('/pledges', FinanceController.getPledges);
router.post('/pledges', restrictTo('ADMIN'), FinanceController.createPledge);
router.put('/pledges/:id', restrictTo('ADMIN'), FinanceController.updatePledge);
router.delete('/pledges/:id', restrictTo('ADMIN'), FinanceController.deletePledge);
// Summary
router.get('/summary', FinanceController.getSummary);

export default router;