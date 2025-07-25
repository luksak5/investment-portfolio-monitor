
import React from 'react';
import { LayoutDashboard, Users, FileText, BarChart3, Settings, Upload, UserCheck } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";

interface AppSidebarProps {
  userRole: 'admin' | 'advisor' | 'client';
}

export const AppSidebar = ({ userRole }: AppSidebarProps) => {
  const location = useLocation();
  const { state } = useSidebar();
  
  const getMenuItems = () => {
    switch (userRole) {
      case 'admin':
        return [
          { title: 'Dashboard', url: '/admin', icon: LayoutDashboard },
          { title: 'Clients', url: '/admin/clients', icon: Users },
          { title: 'Advisors', url: '/admin/advisors', icon: UserCheck },
          { title: 'Transactions', url: '/admin/transactions', icon: FileText },
          { title: 'Reports', url: '/admin/reports', icon: BarChart3 },
          { title: 'Settings', url: '/admin/settings', icon: Settings },
        ];
      case 'advisor':
        return [
          { title: 'Dashboard', url: '/advisor', icon: LayoutDashboard },
          { title: 'My Clients', url: '/advisor/clients', icon: Users },
          { title: 'Portfolios', url: '/advisor/portfolios', icon: BarChart3 },
          { title: 'Reports', url: '/advisor/reports', icon: FileText },
          { title: 'Settings', url: '/advisor/settings', icon: Settings },
        ];
      case 'client':
        return [
          { title: 'Dashboard', url: '/client', icon: LayoutDashboard },
          { title: 'Portfolio', url: '/client/portfolio', icon: BarChart3 },
          { title: 'Transactions', url: '/client/transactions', icon: FileText },
          { title: 'Settings', url: '/client/settings', icon: Settings },
        ];
      default:
        return [];
    }
  };

  const menuItems = getMenuItems();
  
  const getRoleLabel = () => {
    switch (userRole) {
      case 'admin': return 'Admin Panel';
      case 'advisor': return 'Advisor Portal';
      case 'client': return 'Client Portal';
      default: return 'Portal';
    }
  };

  return (
    <Sidebar className="border-r bg-white w-64 fixed h-full">
      <SidebarHeader className="p-4 border-b bg-white hover:bg-white active:bg-white">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-md">
            <LayoutDashboard className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent whitespace-nowrap">
              Portfolio Monitor
            </h2>
            <p className="text-sm font-semibold text-primary/80 whitespace-nowrap">{getRoleLabel()}</p>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-sm font-medium text-muted-foreground px-4">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent className="flex flex-col gap-1 p-2">
            {menuItems.map((item) => (
              <NavLink 
                key={item.title}
                to={item.url}
                end={item.title === 'Dashboard'} // Add this line to make Dashboard link exact
                className={({ isActive }) => {
                  const baseClasses = "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 hover:scale-105 hover:shadow-md bg-white";
                  const activeClasses = "text-primary font-semibold border-l-2 border-primary";
                  const inactiveClasses = "hover:bg-gray-50/80 text-gray-700";
                  return `${baseClasses} ${isActive ? activeClasses : inactiveClasses}`;
                }}
              >
                {({ isActive }) => (
                  <>
                    <item.icon className={`w-5 h-5 ${isActive ? 'text-primary' : 'text-gray-600'}`} />
                    <span className="font-medium">
                      {item.title}
                    </span>
                  </>
                )}
              </NavLink>
            ))}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};
