import prisma from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import PrintButton from "./PrintButton";
import AddPaymentButton from "@/components/AddPaymentButton";

export default async function InvoiceDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  
  const invoice = await prisma.invoice.findUnique({
    where: { id: params.id },
    include: {
      customer: true,
      items: true,
      payments: true
    }
  });

  if (!invoice) {
    notFound();
  }

  // Helper to format currency
  const formatCurrency = (val: any) => {
    const num = parseFloat(val);
    return isNaN(num) ? "$0.00" : `$${num.toFixed(2)}`;
  };

  const amountPaid = invoice.payments.reduce((acc, payment) => acc + payment.amount, 0);
  const balanceDue = Math.max(0, invoice.total - amountPaid);

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      
      {/* Print Header (Logo) */}
      <div className="print-only" style={{ justifyContent: 'center', marginBottom: '2rem' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.svg" alt="NJ Fence Logo" style={{ height: '80px', objectFit: 'contain' }} />
      </div>

      {/* Header Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }} className="hide-on-print">
        <div>
          <Link href="/dashboard/invoices" style={{ color: '#6b7280', textDecoration: 'none', fontSize: '0.875rem' }}>
            &larr; Back to Invoices
          </Link>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#111827', marginTop: '0.5rem' }}>
            Invoice {invoice.number}
          </h1>
          <span style={{ 
              display: 'inline-block',
              marginTop: '0.5rem',
              backgroundColor: invoice.status === 'PAID' ? '#dcfce7' : (invoice.status === 'PARTIAL' ? '#fef3c7' : '#fee2e2'), 
              color: invoice.status === 'PAID' ? '#166534' : (invoice.status === 'PARTIAL' ? '#92400e' : '#991b1b'), 
              padding: '0.25rem 0.75rem', 
              borderRadius: '9999px', 
              fontSize: '0.75rem', 
              fontWeight: 'bold' 
            }}>
              {invoice.status}
          </span>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <AddPaymentButton invoiceId={invoice.id} balanceDue={balanceDue} />
          <PrintButton />
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid-responsive-2-1 print-block" style={{ gap: '2rem' }}>
        
        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Info Card */}
          <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', borderBottom: '1px solid #e5e7eb', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Customer Information</h2>
            <div className="grid-responsive" style={{ gap: '1rem' }}>
              <div>
                <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: 0, fontWeight: 'bold', textTransform: 'uppercase' }}>Customer</p>
                <p style={{ margin: '0.25rem 0 1rem 0' }}>{invoice.customer?.name} {invoice.customer?.company ? `(${invoice.customer.company})` : ''}</p>
                
                <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: 0, fontWeight: 'bold', textTransform: 'uppercase' }}>Phone</p>
                <p style={{ margin: '0.25rem 0 1rem 0' }}>{invoice.customer?.phone || 'N/A'}</p>
              </div>
              <div>
                <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: 0, fontWeight: 'bold', textTransform: 'uppercase' }}>Date Issued</p>
                <p style={{ margin: '0.25rem 0 1rem 0' }}>{new Date(invoice.date).toLocaleDateString()}</p>
                
                <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: 0, fontWeight: 'bold', textTransform: 'uppercase' }}>Due Date</p>
                <p style={{ margin: '0.25rem 0 1rem 0' }}>{invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Items Card */}
          <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', borderBottom: '1px solid #e5e7eb', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Line Items</h2>
            <div className="table-responsive">
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: '0.5rem', borderBottom: '2px solid #e5e7eb', color: '#374151', fontSize: '0.875rem' }}>Item / Description</th>
                  <th style={{ textAlign: 'center', padding: '0.5rem', borderBottom: '2px solid #e5e7eb', color: '#374151', fontSize: '0.875rem' }}>Qty</th>
                  <th style={{ textAlign: 'right', padding: '0.5rem', borderBottom: '2px solid #e5e7eb', color: '#374151', fontSize: '0.875rem' }}>Unit Price</th>
                  <th style={{ textAlign: 'right', padding: '0.5rem', borderBottom: '2px solid #e5e7eb', color: '#374151', fontSize: '0.875rem' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items && invoice.items.map((it: any) => (
                  <tr key={it.id}>
                    <td style={{ padding: '0.75rem 0.5rem', borderBottom: '1px solid #f3f4f6' }}>
                      <strong>{it.name}</strong><br/>
                      <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>{it.description}</span>
                    </td>
                    <td style={{ textAlign: 'center', padding: '0.75rem 0.5rem', borderBottom: '1px solid #f3f4f6' }}>{it.quantity}</td>
                    <td style={{ textAlign: 'right', padding: '0.75rem 0.5rem', borderBottom: '1px solid #f3f4f6' }}>{formatCurrency(it.unitPrice)}</td>
                    <td style={{ textAlign: 'right', padding: '0.75rem 0.5rem', borderBottom: '1px solid #f3f4f6', fontWeight: 'bold' }}>{formatCurrency(it.total)}</td>
                  </tr>
                ))}
                {(!invoice.items || invoice.items.length === 0) && (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', padding: '1rem', color: '#9ca3af' }}>No items detailed.</td>
                  </tr>
                )}
              </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Right Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Financial Summary */}
          <div style={{ backgroundColor: '#f9fafb', color: '#111827', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.5rem', color: '#111827' }}>Financial Summary</h2>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ color: '#4b5563' }}>Subtotal:</span>
              <span style={{ fontWeight: '500' }}>{formatCurrency(invoice.subtotal)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <span style={{ color: '#4b5563' }}>Tax:</span>
              <span style={{ fontWeight: '500' }}>{formatCurrency(invoice.tax)}</span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem', fontWeight: 'bold', color: '#111827', borderTop: '2px solid #e5e7eb', paddingTop: '1rem', marginBottom: '1rem' }}>
              <span>Total:</span>
              <span>{formatCurrency(invoice.total)}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ color: '#4b5563' }}>Deposit / Paid:</span>
              <span style={{ color: '#166534', fontWeight: '500' }}>-{formatCurrency(amountPaid)}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem', fontWeight: 'bold', color: '#111827', borderTop: '2px solid #e5e7eb', paddingTop: '1rem' }}>
              <span>Balance Due:</span>
              <span>{formatCurrency(balanceDue)}</span>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
