
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowUpRight, Users } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import AccountManagement from '@/components/admin/AccountManagement';

const dummyMovers = {
  'Very Aggressive': [
    { clientName: 'Ava Carter', accountId: 'ACC101', xirr: 22.5 },
    { clientName: 'Liam Patel', accountId: 'ACC102', xirr: 20.1 },
    { clientName: 'Noah Kim', accountId: 'ACC103', xirr: 18.7 },
    { clientName: 'Sophia Lee', accountId: 'ACC104', xirr: 17.9 },
    { clientName: 'Mia Singh', accountId: 'ACC105', xirr: 16.2 },
    { clientName: 'Lucas Wang', accountId: 'ACC106', xirr: 15.8 },
    { clientName: 'Ella Brown', accountId: 'ACC107', xirr: 15.1 },
  ],
  'Aggressive': [
    { clientName: 'Olivia Smith', accountId: 'ACC201', xirr: 14.3 },
    { clientName: 'Benjamin Jones', accountId: 'ACC202', xirr: 13.9 },
    { clientName: 'Charlotte Garcia', accountId: 'ACC203', xirr: 13.2 },
    { clientName: 'Henry Martinez', accountId: 'ACC204', xirr: 12.7 },
    { clientName: 'Amelia Rodriguez', accountId: 'ACC205', xirr: 12.1 },
    { clientName: 'Jack Wilson', accountId: 'ACC206', xirr: 11.8 },
  ],
  'Moderate': [
    { clientName: 'William Anderson', accountId: 'ACC301', xirr: 10.2 },
    { clientName: 'Emily Thomas', accountId: 'ACC302', xirr: 9.8 },
    { clientName: 'James White', accountId: 'ACC303', xirr: 9.5 },
    { clientName: 'Isabella Harris', accountId: 'ACC304', xirr: 9.1 },
    { clientName: 'Alexander Clark', accountId: 'ACC305', xirr: 8.7 },
  ],
  'Conservative': [
    { clientName: 'Lucas Lewis', accountId: 'ACC401', xirr: 7.5 },
    { clientName: 'Mason Young', accountId: 'ACC402', xirr: 7.2 },
    { clientName: 'Harper King', accountId: 'ACC403', xirr: 6.9 },
    { clientName: 'Evelyn Scott', accountId: 'ACC404', xirr: 6.5 },
    { clientName: 'Ella Green', accountId: 'ACC405', xirr: 6.2 },
  ],
};

const riskProfiles = [
  'Very Aggressive',
  'Aggressive',
  'Moderate',
  'Conservative',
];

function fetchTopMovers(riskProfile: string, limit: number) {
  const movers = dummyMovers[riskProfile] || [];
  return Promise.resolve(movers.slice(0, limit));
}

const TopClientMovers = () => {
  const [selectedRisk, setSelectedRisk] = useState('Very Aggressive');
  const [topClients, setTopClients] = useState([]);
  const [showAll, setShowAll] = useState(false);

  React.useEffect(() => {
    fetchTopMovers(selectedRisk, showAll ? 1000 : 5).then(setTopClients);
  }, [selectedRisk, showAll]);

  const movers = dummyMovers[selectedRisk] || [];
  const hasMore = movers.length > 5 && !showAll;

  return (
    <Card className="mb-6 border bg-background text-foreground">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          <Users className="h-6 w-6 text-primary" />
          <CardTitle className="text-3xl font-bold text-foreground">Top Client Movers</CardTitle>
        </div>
        <div className="flex gap-2">
          {riskProfiles.map((profile) => (
            <button
              key={profile}
              className={`px-4 py-1 rounded-md font-semibold border transition-colors text-sm
                ${selectedRisk === profile
                  ? 'bg-primary text-primary-foreground border-primary shadow'
                  : 'bg-background text-primary border-border hover:bg-muted'}`}
              onClick={() => { setSelectedRisk(profile); setShowAll(false); }}
            >
              {profile}
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <div className="divide-y divide-border">
          {topClients.map((client, idx) => (
            <div key={client.accountId} className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <span className="text-lg font-bold text-foreground">{idx + 1}.</span>
                <span className="font-semibold text-lg text-foreground">{client.clientName}</span>
                <span className="font-mono text-sm bg-muted px-2 py-1 rounded text-primary border border-border">{client.accountId}</span>
              </div>
              <div className="flex items-center gap-2">
                <ArrowUpRight className="w-5 h-5 text-green-600" />
                <span className="text-2xl font-bold text-green-700">{client.xirr}%</span>
                <span className="text-xs text-muted-foreground">XIRR</span>
              </div>
            </div>
          ))}
        </div>
        {hasMore && (
          <div className="flex justify-center mt-4">
            <Button variant="outline" className="border-primary text-primary font-semibold" onClick={() => setShowAll(true)}>
              View All
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const AdminClients = () => {
  return (
    <DashboardLayout userRole="admin" userName="Admin User">
      <div className="space-y-6">
        <TopClientMovers />
        <AccountManagement 
          isClientView={true}
          title="Client Management"
          description="Manage client accounts and their information"
        />
      </div>
    </DashboardLayout>
  );
};

export default AdminClients;
