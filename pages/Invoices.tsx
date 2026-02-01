
import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Trash2, 
  Eye, 
  Upload, 
  X,
  FileText,
  Loader2,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { invoiceService, extractInvoiceData } from '../services/invoiceService';
import { Invoice, InvoiceStatus } from '../types';
import Toast, { ToastType } from '../components/Toast';

const Invoices: React.FC = () => {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [extractionResult, setExtractionResult] = useState<any>(null);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchInvoices();
  }, [user]);

  const fetchInvoices = async () => {
    if (!user) return;
    try {
      const data = await invoiceService.getInvoices(user.id);
      setInvoices(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const result = await extractInvoiceData(file);
      setExtractionResult(result);
    } catch (err) {
      setToast({ message: 'Failed to extract data', type: 'error' });
    } finally {
      setUploading(false);
    }
  };

  const handleSaveInvoice = async () => {
    if (!user || !extractionResult) return;
    
    try {
      const newInvoice = await invoiceService.createInvoice({
        user_id: user.id,
        vendor_name: extractionResult.vendor_name,
        amount: extractionResult.amount,
        invoice_date: extractionResult.invoice_date,
        status: 'pending' as InvoiceStatus,
        image_url: 'https://picsum.photos/seed/invoice/200/300'
      });
      
      setInvoices([newInvoice, ...invoices]);
      setIsModalOpen(false);
      setExtractionResult(null);
      setToast({ message: 'Invoice saved successfully', type: 'success' });
    } catch (err) {
      setToast({ message: 'Failed to save invoice', type: 'error' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this invoice?')) return;
    try {
      await invoiceService.deleteInvoice(id);
      setInvoices(invoices.filter(i => i.id !== id));
      setToast({ message: 'Invoice deleted', type: 'success' });
    } catch (err) {
      setToast({ message: 'Delete failed', type: 'error' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Invoices</h1>
          <p className="text-slate-500">Manage and track your business expenses.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-sm flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Upload Invoice
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search by vendor..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 font-medium hover:bg-slate-50">
          <Filter className="w-4 h-4" />
          Filters
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Vendor</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                [1, 2, 3].map(i => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={5} className="px-6 py-6 h-16 bg-white" />
                  </tr>
                ))
              ) : (
                invoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
                          <FileText className="w-4 h-4 text-indigo-600" />
                        </div>
                        <span className="text-sm font-semibold text-slate-900">{invoice.vendor_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {new Date(invoice.invoice_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-900">
                      ${invoice.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase ${
                        invoice.status === 'approved' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                      }`}>
                        {invoice.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 text-slate-400 hover:text-indigo-600 transition-colors">
                          <Eye className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => handleDelete(invoice.id)}
                          className="p-2 text-slate-400 hover:text-rose-600 transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
              {!loading && invoices.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <div className="max-w-xs mx-auto">
                      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Upload className="w-8 h-8 text-slate-300" />
                      </div>
                      <h3 className="text-lg font-semibold text-slate-900">No invoices yet</h3>
                      <p className="text-slate-500 mt-1">Upload your first invoice to get started with automated tracking.</p>
                      <button 
                        onClick={() => setIsModalOpen(true)}
                        className="mt-6 text-indigo-600 font-semibold hover:text-indigo-700"
                      >
                        Upload now
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upload Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => !uploading && setIsModalOpen(false)} />
          <div className="relative bg-white w-full max-w-lg rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">Upload Invoice</h2>
              <button 
                disabled={uploading}
                onClick={() => setIsModalOpen(false)} 
                className="p-2 text-slate-400 hover:bg-slate-50 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              {!extractionResult ? (
                <div 
                  onClick={() => !uploading && fileInputRef.current?.click()}
                  className={`
                    border-2 border-dashed rounded-xl p-10 text-center transition-all cursor-pointer
                    ${uploading ? 'border-indigo-100 bg-slate-50' : 'border-slate-200 hover:border-indigo-400 hover:bg-indigo-50'}
                  `}
                >
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    onChange={handleFileUpload}
                    accept="image/*"
                  />
                  {uploading ? (
                    <div className="space-y-4">
                      <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto" />
                      <div>
                        <p className="font-semibold text-slate-900">AI is analyzing your invoice...</p>
                        <p className="text-sm text-slate-500 mt-1">Extracting vendor, amount, and date details.</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto">
                        <Upload className="w-8 h-8 text-indigo-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">Click to upload or drag & drop</p>
                        <p className="text-sm text-slate-500 mt-1">Supports JPG, PNG (Max 5MB)</p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl flex gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-emerald-900">Data Extracted Successfully</p>
                      <p className="text-xs text-emerald-700 mt-0.5">Please verify the details before saving.</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Vendor</label>
                      <input 
                        type="text" 
                        value={extractionResult.vendor_name}
                        onChange={(e) => setExtractionResult({...extractionResult, vendor_name: e.target.value})}
                        className="w-full mt-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Date</label>
                        <input 
                          type="date" 
                          value={extractionResult.invoice_date}
                          onChange={(e) => setExtractionResult({...extractionResult, invoice_date: e.target.value})}
                          className="w-full mt-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Amount</label>
                        <div className="relative mt-1">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">$</span>
                          <input 
                            type="number" 
                            step="0.01"
                            value={extractionResult.amount}
                            onChange={(e) => setExtractionResult({...extractionResult, amount: parseFloat(e.target.value)})}
                            className="w-full pl-7 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 bg-slate-50 rounded-b-2xl border-t border-slate-100 flex items-center justify-end gap-3">
              <button 
                disabled={uploading}
                onClick={() => {
                  setExtractionResult(null);
                  setIsModalOpen(false);
                }}
                className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
              >
                Cancel
              </button>
              {extractionResult && (
                <button 
                  onClick={handleSaveInvoice}
                  className="bg-indigo-600 text-white px-6 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-sm"
                >
                  Save Invoice
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}
    </div>
  );
};

export default Invoices;
