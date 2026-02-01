
import { supabase } from '../lib/supabase';
import { Invoice, InvoiceStatus } from '../types';

/**
 * Simulates an AI extraction call.
 * TODO: Replace with Gemini Flash API for real extraction
 */
export async function extractInvoiceData(file: File): Promise<{
  vendor_name: string;
  amount: number;
  invoice_date: string;
}> {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Mocked successful extraction
      const vendors = ['Amazon', 'Google Cloud', 'WeWork', 'Stripe', 'Figma'];
      const randomVendor = vendors[Math.floor(Math.random() * vendors.length)];
      const randomAmount = parseFloat((Math.random() * 500 + 50).toFixed(2));
      const today = new Date().toISOString().split('T')[0];

      resolve({
        vendor_name: randomVendor,
        amount: randomAmount,
        invoice_date: today,
      });
    }, 2000);
  });
}

export const invoiceService = {
  async getInvoices(userId: string) {
    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Invoice[];
  },

  async createInvoice(invoice: Omit<Invoice, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('invoices')
      .insert([invoice])
      .select();

    if (error) throw error;
    return data?.[0] as Invoice;
  },

  async deleteInvoice(id: string) {
    const { error } = await supabase
      .from('invoices')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};
