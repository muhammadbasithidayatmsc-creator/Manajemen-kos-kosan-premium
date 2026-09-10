import React, { useState } from 'react';
import { KosProvider, useKos } from './context/KosContext';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { ToastContainer } from './components/ToastContainer';
import { ConfirmationModal } from './components/ConfirmationModal';
import { ProfileModal } from './components/ProfileModal';
import { LoginView } from './components/LoginView';

// Views
import { DashboardView } from './components/views/DashboardView';
import { PropertiesView } from './components/views/PropertiesView';
import { RoomsView } from './components/views/RoomsView';
import { TenantsView } from './components/views/TenantsView';
import { BillsView } from './components/views/BillsView';
import { PaymentsView } from './components/views/PaymentsView';
import { ExpensesView } from './components/views/ExpensesView';
import { ReportsView } from './components/views/ReportsView';
import { SettingsView } from './components/views/SettingsView';
import { InvoiceView } from './components/views/InvoiceView';
import { Tenant } from './types';

const MainLayout: React.FC = () => {
  const {
    activeMenu,
    setActiveMenu,
    viewingInvoice,
    closeInvoice,
    isAuthenticated,
  } = useKos();

  // If user is logged out, show the Premium Login Portal!
  if (!isAuthenticated) {
    return (
      <>
        <LoginView />
        <ToastContainer />
      </>
    );
  }

  // Mobile menu drawer state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // State to pass target tenant to BillsView when "Buat Tagihan" is clicked in TenantsView
  const [targetTenantForBill, setTargetTenantForBill] = useState<Tenant | null>(null);

  // Quick action modal triggers
  const [autoOpenBillModal, setAutoOpenBillModal] = useState(false);
  const [autoOpenPaymentModal, setAutoOpenPaymentModal] = useState(false);
  const [autoOpenTenantModal, setAutoOpenTenantModal] = useState(false);
  const [autoOpenExpenseModal, setAutoOpenExpenseModal] = useState(false);
  const [autoOpenRoomModal, setAutoOpenRoomModal] = useState(false);
  const [autoOpenPropertyModal, setAutoOpenPropertyModal] = useState(false);

  const handleQuickCreateBillForTenant = (tenant: Tenant) => {
    setTargetTenantForBill(tenant);
    setActiveMenu('bills');
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'add-bill':
        setActiveMenu('bills');
        setAutoOpenBillModal(true);
        break;
      case 'add-payment':
        setActiveMenu('payments');
        setAutoOpenPaymentModal(true);
        break;
      case 'add-tenant':
        setActiveMenu('tenants');
        setAutoOpenTenantModal(true);
        break;
      case 'add-expense':
        setActiveMenu('expenses');
        setAutoOpenExpenseModal(true);
        break;
      case 'add-room':
        setActiveMenu('rooms');
        setAutoOpenRoomModal(true);
        break;
      case 'add-property':
        setActiveMenu('properties');
        setAutoOpenPropertyModal(true);
        break;
      default:
        break;
    }
  };

  const renderActiveView = () => {
    switch (activeMenu) {
      case 'dashboard':
        return (
          <DashboardView
            onOpenNewBill={() => {
              setActiveMenu('bills');
              setAutoOpenBillModal(true);
            }}
            onOpenNewPayment={() => {
              setActiveMenu('payments');
              setAutoOpenPaymentModal(true);
            }}
            onOpenNewExpense={() => {
              setActiveMenu('expenses');
              setAutoOpenExpenseModal(true);
            }}
          />
        );
      case 'properties':
        return (
          <PropertiesView
            autoOpenAddModal={autoOpenPropertyModal}
            onClearAutoOpenModal={() => setAutoOpenPropertyModal(false)}
          />
        );
      case 'rooms':
        return (
          <RoomsView
            autoOpenAddModal={autoOpenRoomModal}
            onClearAutoOpenModal={() => setAutoOpenRoomModal(false)}
            onAssignTenantToRoom={() => {
              setActiveMenu('tenants');
              setAutoOpenTenantModal(true);
            }}
          />
        );
      case 'tenants':
        return (
          <TenantsView
            autoOpenAddModal={autoOpenTenantModal}
            onClearAutoOpenModal={() => setAutoOpenTenantModal(false)}
            onQuickCreateBillForTenant={handleQuickCreateBillForTenant}
          />
        );
      case 'bills':
        return (
          <BillsView
            initialTenantForBill={targetTenantForBill}
            onClearInitialTenant={() => setTargetTenantForBill(null)}
            autoOpenAddModal={autoOpenBillModal}
            onClearAutoOpenModal={() => setAutoOpenBillModal(false)}
          />
        );
      case 'payments':
        return (
          <PaymentsView
            autoOpenAddModal={autoOpenPaymentModal}
            onClearAutoOpenModal={() => setAutoOpenPaymentModal(false)}
          />
        );
      case 'expenses':
        return (
          <ExpensesView
            autoOpenAddModal={autoOpenExpenseModal}
            onClearAutoOpenModal={() => setAutoOpenExpenseModal(false)}
          />
        );
      case 'reports':
        return <ReportsView />;
      case 'settings':
        return <SettingsView />;
      default:
        return (
          <DashboardView
            onQuickAction={handleQuickAction}
            onOpenNewBill={() => {
              setActiveMenu('bills');
              setAutoOpenBillModal(true);
            }}
            onOpenNewPayment={() => {
              setActiveMenu('payments');
              setAutoOpenPaymentModal(true);
            }}
            onOpenNewExpense={() => {
              setActiveMenu('expenses');
              setAutoOpenExpenseModal(true);
            }}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col antialiased selection:bg-indigo-500 selection:text-white">
      <div className="flex flex-1 w-full">
        {/* Sidebar */}
        <Sidebar mobileOpen={mobileMenuOpen} setMobileOpen={setMobileMenuOpen} />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 lg:pl-64 transition-all duration-200">
          {/* Top Navbar */}
          <Navbar
            onOpenMobileMenu={() => setMobileMenuOpen(true)}
            onQuickAction={handleQuickAction}
          />

          {/* View Content */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            {renderActiveView()}
          </main>
        </div>
      </div>

      {/* Global Invoice Preview Modal (supports window.print()) */}
      {viewingInvoice && (
        <InvoiceView bill={viewingInvoice} onClose={closeInvoice} />
      )}

      {/* Global Delete/Action Confirmation Dialog */}
      <ConfirmationModal />

      {/* Profile & Change Password Modal */}
      <ProfileModal />

      {/* Global Toast Notifications */}
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <KosProvider>
      <MainLayout />
    </KosProvider>
  );
}
