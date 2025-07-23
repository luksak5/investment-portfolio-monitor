
import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { UserPlus, Search, Mail, Phone, Users, DollarSign, Edit, Trash2 } from 'lucide-react';

const AdminAdvisors = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  // Sample advisors data
  const advisors = [
    {
      id: 1,
      name: 'Jane Smith',
      email: 'jane.smith@company.com',
      phone: '+1 (555) 123-4567',
      clientCount: 24,
      aum: 850000,
      performance: '+12.3%',
      status: 'active',
      joinDate: '2022-01-15'
    },
    {
      id: 2,
      name: 'Robert Johnson',
      email: 'robert.johnson@company.com',
      phone: '+1 (555) 234-5678',
      clientCount: 18,
      aum: 620000,
      performance: '+9.8%',
      status: 'active',
      joinDate: '2021-09-22'
    },
    {
      id: 3,
      name: 'Sarah Davis',
      email: 'sarah.davis@company.com',
      phone: '+1 (555) 345-6789',
      clientCount: 31,
      aum: 1200000,
      performance: '+15.1%',
      status: 'active',
      joinDate: '2020-06-10'
    },
    {
      id: 4,
      name: 'Michael Brown',
      email: 'michael.brown@company.com',
      phone: '+1 (555) 456-7890',
      clientCount: 15,
      aum: 480000,
      performance: '+8.4%',
      status: 'inactive',
      joinDate: '2023-03-08'
    }
  ];

  const filteredAdvisors = advisors.filter(advisor =>
    advisor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    advisor.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalStats = {
    totalAdvisors: advisors.length,
    activeAdvisors: advisors.filter(a => a.status === 'active').length,
    totalClients: advisors.reduce((sum, a) => sum + a.clientCount, 0),
    totalAUM: advisors.reduce((sum, a) => sum + a.aum, 0)
  };

  return (
    <DashboardLayout userRole="admin" userName="Admin User">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Advisor Management</h1>
            <p className="text-muted-foreground">
              Manage and monitor financial advisors in your organization
            </p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="w-4 h-4 mr-2" />
                Add Advisor
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Advisor</DialogTitle>
                <DialogDescription>
                  Create a new advisor account and assign initial settings
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">Name</Label>
                  <Input id="name" className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="email" className="text-right">Email</Label>
                  <Input id="email" type="email" className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="phone" className="text-right">Phone</Label>
                  <Input id="phone" className="col-span-3" />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={() => setIsAddDialogOpen(false)}>
                  Create Advisor
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Advisors</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalStats.totalAdvisors}</div>
              <p className="text-xs text-muted-foreground">
                {totalStats.activeAdvisors} active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
              <Users className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalStats.totalClients}</div>
              <p className="text-xs text-muted-foreground">
                Across all advisors
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total AUM</CardTitle>
              <DollarSign className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${(totalStats.totalAUM / 1000000).toFixed(1)}M
              </div>
              <p className="text-xs text-muted-foreground">
                Assets under management
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Performance</CardTitle>
              <DollarSign className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+11.4%</div>
              <p className="text-xs text-muted-foreground">
                YTD average return
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <Card>
          <CardHeader>
            <CardTitle>All Advisors</CardTitle>
            <CardDescription>
              View and manage all financial advisors
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search advisors by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Advisor</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Clients</TableHead>
                  <TableHead>AUM</TableHead>
                  <TableHead>Performance</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAdvisors.map((advisor) => (
                  <TableRow key={advisor.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{advisor.name}</div>
                        <div className="text-sm text-muted-foreground">
                          Joined {new Date(advisor.joinDate).toLocaleDateString()}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center text-sm">
                          <Mail className="w-3 h-3 mr-1" />
                          {advisor.email}
                        </div>
                        <div className="flex items-center text-sm">
                          <Phone className="w-3 h-3 mr-1" />
                          {advisor.phone}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{advisor.clientCount}</div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">
                        ${(advisor.aum / 1000).toFixed(0)}K
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-green-600">
                        {advisor.performance}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={advisor.status === 'active' ? 'default' : 'secondary'}
                      >
                        {advisor.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdminAdvisors;
