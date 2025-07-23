
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
    <Sidebar className="border-r">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <LayoutDashboard className="w-4 h-4 text-white" />
          </div>
          {state === 'expanded' && (
            <div>
              <h2 className="font-semibold text-lg">Portfolio Monitor</h2>
              <p className="text-sm text-muted-foreground">{getRoleLabel()}</p>
            </div>
          )}
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url}
                      className={({ isActive }) => 
                        `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                          isActive 
                            ? 'bg-primary text-primary-foreground' 
                            : 'hover:bg-accent hover:text-accent-foreground'
                        }`
                      }
                    >
                      <item.icon className="w-4 h-4" />
                      {state === 'expanded' && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};
