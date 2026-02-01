
export type UserProfile = {
  id: string;
  email: string;
  full_name: string;
};

export type InvoiceStatus = 'pending' | 'approved';

export type Invoice = {
  id: string;
  user_id: string;
  vendor_name: string;
  amount: number;
  invoice_date: string;
  status: InvoiceStatus;
  image_url?: string;
  created_at: string;
};

export type DashboardStats = {
  totalSpending: number;
  processedCount: number;
  pendingCount: number;
  recentActivity: Invoice[];
};

export type MonthlySpending = {
  month: string;
  amount: number;
};
