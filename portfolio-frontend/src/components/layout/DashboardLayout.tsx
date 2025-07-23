
import React from 'react';
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { DashboardHeader } from "@/components/layout/DashboardHeader";

interface DashboardLayoutProps {
  children: React.ReactNode;
  userRole: 'admin' | 'advisor' | 'client';
  userName?: string;
}

export const DashboardLayout = ({ children, userRole, userName }: DashboardLayoutProps) => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        <AppSidebar userRole={userRole} />
        <div className="flex-1 flex flex-col">
          <DashboardHeader userRole={userRole} userName={userName} />
          <main className="flex-1 p-6">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};
