import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import TransactionModal from '../transactions/TransactionModal';

export default function AppLayout({ refreshTrigger, triggerRefresh }) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [addTransactionOpen, setAddTransactionOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#090d16] flex">
      {/* Sidebar Navigation */}
      <Sidebar
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ease-in-out ${
          sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'
        }`}
      >
        <Navbar
          onOpenAddTransaction={() => setAddTransactionOpen(true)}
          onToggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          sidebarCollapsed={sidebarCollapsed}
          onToggleSidebarCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          onRefreshData={triggerRefresh}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto animate-fade-in">
          <Outlet context={{ refreshTrigger, triggerRefresh, onOpenAddTransaction: () => setAddTransactionOpen(true) }} />
        </main>
      </div>

      {/* Global Quick Add Transaction Modal */}
      <TransactionModal
        isOpen={addTransactionOpen}
        onClose={() => setAddTransactionOpen(false)}
        onSuccess={() => {
          if (triggerRefresh) triggerRefresh();
        }}
      />
    </div>
  );
}
