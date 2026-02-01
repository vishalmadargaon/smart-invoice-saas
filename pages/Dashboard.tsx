
import React, { useEffect, useState } from 'react';
import { 
  BarChart as ReBarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { 
  DollarSign, 
  FileCheck, 
  Clock, 
  TrendingUp,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { invoiceService } from '../services/invoiceService';
import { Invoice, MonthlySpending } from '../types';
import StatsCard from '../components/StatsCard';
import { Link } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    
    const fetchInvoices = async () => {
      try {
        const data = await invoiceService.getInvoices(user.id);
        setInvoices(data);
      } catch (err) {
        console.error('Failed to fetch invoices', err);
      } finally {
        setLoading(false);
      }
    };

    fetchInvoices();
  }, [user]);

  const totalSpending = invoices.reduce((sum, inv) => sum + inv.amount, 0);
  const pendingCount = invoices.filter(inv => inv.status === 'pending').length;
  const processedCount = invoices.length;

  const monthlyData: MonthlySpending[] = [
    { month: 'Jan', amount: 4500 },
    { month: 'Feb', amount: 3200 },
    { month: 'Mar', amount: 5100 },
    { month: 'Apr', amount: 4200 },
    { month: 'May', amount: totalSpending || 1500 },
  ];

  if (loading) {
    return (
      <div className="animate-pulse space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <div key={i} className="h-32 bg-white rounded-xl border border-slate-200" />)}
        </div>
        <div className="h-96 bg-white rounded-xl border border-slate-200" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Financial Overview</h1>
          <p className="text-slate-500">Welcome back, here's what's happening today.</p>
        </div>
        <div className="text-sm font-medium text-slate-500 bg-white px-4 py-2 rounded-lg border border-slate-200">
          Last 30 Days: <span className="text-indigo-600 font-bold">${totalSpending.toLocaleString()}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard 
          title="Total Spending" 
          value={`$${totalSpending.toLocaleString()}`} 
          icon={DollarSign} 
          trend={{ value: '12%', isUp: true }}
        />
        <StatsCard 
          title="Invoices Processed" 
          value={processedCount} 
          icon={FileCheck} 
          colorClass="text-emerald-600 bg-emerald-50"
        />
        <StatsCard 
          title="Pending Approval" 
          value={pendingCount} 
          icon={Clock} 
          colorClass="text-amber-600 bg-amber-50"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-500" />
              Spending Trends
            </h3>
            <select className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500">
              <option>Year 2024</option>
              <option>Year 2023</option>
            </select>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ReBarChart data={monthlyData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 12 }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 12 }} 
                />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
                  {monthlyData.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === monthlyData.length - 1 ? '#4f46e5' : '#e2e8f0'} />
                  ))}
                </Bar>
              </ReBarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-slate-900">Recent Activity</h3>
            <Link to="/invoices" className="text-indigo-600 hover:text-indigo-700 text-sm font-medium flex items-center gap-1 group">
              View all
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
          <div className="space-y-4">
            {invoices.slice(0, 5).map((invoice) => (
              <div key={invoice.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-xs">
                    {invoice.vendor_name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{invoice.vendor_name}</p>
                    <p className="text-xs text-slate-500">{new Date(invoice.invoice_date).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-900">${invoice.amount.toLocaleString()}</p>
                  <p className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full inline-block mt-1 ${
                    invoice.status === 'approved' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                  }`}>
                    {invoice.status}
                  </p>
                </div>
              </div>
            ))}
            {invoices.length === 0 && (
              <div className="text-center py-10">
                <p className="text-slate-400 text-sm">No activity yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
