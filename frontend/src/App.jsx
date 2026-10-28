import React, { useState } from 'react';
import { useTransactions } from './hooks/useTransactions';
import Header from './components/common/Header';
import Sidebar from './components/common/Sidebar';
import MobileNav from './components/common/MobileNav';
import Toast from './components/common/Toast';
import ConfirmModal from './components/common/ConfirmModal';
import { SummaryCardsSkeleton } from './components/common/Skeleton';

// Dashboard Views
import HeroBanner from './components/dashboard/HeroBanner';
import SummaryCards from './components/dashboard/SummaryCards';
import SpendingChart from './components/dashboard/SpendingChart';
import CategoryDonutChart from './components/dashboard/CategoryDonutChart';
import RecentTransactions from './components/dashboard/RecentTransactions';
import BudgetTeaserCard from './components/dashboard/BudgetTeaserCard';

// Pages
import TransactionTable from './components/transactions/TransactionTable';
import TransactionModal from './components/transactions/TransactionModal';
import AnalyticsDeepDive from './components/analytics/AnalyticsDeepDive';
import BudgetsView from './components/budgets/BudgetsView';
import SettingsView from './components/settings/SettingsView';

import { formatAmountWithSign } from './utils/currency';
import './App.css';

export function App() {
  const {
    transactions,
    summary,
    loading,
    error,
    isBackendHealthy,
    isDemoMode,
    setDemoMode,
    currency,
    setCurrency,
    refresh,
    addTransaction,
    updateTransaction,
    deleteTransaction,
  } = useTransactions();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalInitialData, setModalInitialData] = useState(null);

  // Delete confirmation modal state
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Toast notification state
  const [toast, setToast] = useState(null);

  const showToast = (type, message, title = '') => {
    setToast({ type, message, title });
  };

  const handleOpenAddModal = () => {
    setModalInitialData(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (transaction) => {
    setModalInitialData(transaction);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setModalInitialData(null);
  };

  // Submit handler for both Create and Update
  const handleModalSubmit = async (formData, id) => {
    if (id) {
      await updateTransaction(id, formData);
      showToast('success', `"${formData.title}" updated in your database.`, 'Transaction Updated');
    } else {
      await addTransaction(formData);
      showToast('success', `"${formData.title}" saved to your Spring Boot ledger.`, 'Transaction Recorded');
    }
  };

  // Delete initiation
  const handleRequestDelete = (transaction) => {
    setDeleteTarget(transaction);
  };

  // Delete confirmation execution
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteTransaction(deleteTarget.id);
      showToast('success', `"${deleteTarget.title}" was removed from MySQL.`, 'Transaction Deleted');
      setDeleteTarget(null);
    } catch (err) {
      showToast('error', err.message || 'Failed to delete transaction.', 'Delete Error');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="app-container">
      {/* Desktop Fixed Left Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        transactionCount={transactions.length}
      />

      {/* Main Content Area */}
      <div className="app-main">
        {/* Sticky Top Header */}
        <Header
          onOpenAddModal={handleOpenAddModal}
          isBackendHealthy={isBackendHealthy}
          activeTab={activeTab}
        />

        <main className="app-content">

          {/* Tab 1: Dashboard */}
          {activeTab === 'dashboard' && (
            <div className="tab-dashboard animate-fade-in">
              <HeroBanner
                onOpenAddModal={handleOpenAddModal}
                totalTransactions={transactions.length}
                balance={summary.balance}
                currency={currency}
              />

              {loading ? (
                <SummaryCardsSkeleton />
              ) : (
                <SummaryCards
                  summary={summary}
                  currency={currency}
                />
              )}

              {/* 2-Column Analytics Charts Row */}
              <div className="dashboard-charts-grid">
                <SpendingChart
                  transactions={transactions}
                  currency={currency}
                />
                <CategoryDonutChart
                  transactions={transactions}
                  currency={currency}
                />
              </div>

              {/* 2-Column Activity & Budgets Row */}
              <div className="dashboard-bottom-grid">
                <RecentTransactions
                  transactions={transactions}
                  currency={currency}
                  onViewAll={() => setActiveTab('transactions')}
                  onEdit={handleOpenEditModal}
                  onDelete={handleRequestDelete}
                />
                <BudgetTeaserCard
                  onNavigateBudgets={() => setActiveTab('budgets')}
                />
              </div>
            </div>
          )}

          {/* Tab 2: Transactions Page */}
          {activeTab === 'transactions' && (
            <div className="tab-transactions animate-fade-in">
              <div className="page-header-simple">
                <h2 className="page-heading font-serif">Transactions Ledger</h2>
                <p className="page-subheading">
                  Browse, search, filter, edit, and delete your verified database records.
                </p>
              </div>

              <TransactionTable
                transactions={transactions}
                currency={currency}
                onOpenAddModal={handleOpenAddModal}
                onEdit={handleOpenEditModal}
                onDelete={handleRequestDelete}
              />
            </div>
          )}

          {/* Tab 3: Analytics Page */}
          {activeTab === 'analytics' && (
            <div className="tab-analytics animate-fade-in">
              <AnalyticsDeepDive
                transactions={transactions}
                summary={summary}
                currency={currency}
              />
            </div>
          )}

          {/* Tab 4: Budgets Page */}
          {activeTab === 'budgets' && (
            <div className="tab-budgets animate-fade-in">
              <BudgetsView
                summary={summary}
                transactions={transactions}
                currency={currency}
              />
            </div>
          )}

          {/* Tab 5: Settings Page */}
          {activeTab === 'settings' && (
            <div className="tab-settings animate-fade-in">
              <SettingsView
                currency={currency}
                onCurrencyChange={setCurrency}
                isBackendHealthy={isBackendHealthy}
                isDemoMode={isDemoMode}
                setDemoMode={setDemoMode}
                onRefresh={refresh}
              />
            </div>
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenAddModal={handleOpenAddModal}
      />

      {/* Add / Edit Transaction Modal */}
      <TransactionModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleModalSubmit}
        initialData={modalInitialData}
        currency={currency}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        title="Delete Transaction"
        message="Are you sure you want to delete this transaction from your Spring Boot database? This cannot be undone."
        transactionTitle={deleteTarget?.title}
        amountText={
          deleteTarget
            ? formatAmountWithSign(deleteTarget.amount, deleteTarget.type, currency)
            : ''
        }
        isDeleting={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* Toast Alert Notification */}
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}

export default App;
