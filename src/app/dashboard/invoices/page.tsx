import prisma from "@/lib/prisma";
import Link from "next/link";
import DeleteButton from "@/components/DeleteButton";

export default async function InvoicesPage() {
  let invoices: any[] = [];
  try {
    invoices = await prisma.invoice.findMany({
      include: { customer: true },
      orderBy: { createdAt: 'desc' }
    });
  } catch(e) {
    console.error(e);
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#111827' }}>Invoices</h1>
        <Link 
          href="/dashboard/invoices/new" 
          style={{ backgroundColor: '#2563eb', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '4px', textDecoration: 'none', fontWeight: '500' }}
        >
          + New Invoice
        </Link>
      </div>

      <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
              <th style={{ padding: '1rem', fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>Invoice #</th>
              <th style={{ padding: '1rem', fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>Customer</th>
              <th style={{ padding: '1rem', fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>Issued</th>
              <th style={{ padding: '1rem', fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>Due Date</th>
              <th style={{ padding: '1rem', fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>Amount</th>
              <th style={{ padding: '1rem', fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>Status</th>
              <th style={{ padding: '1rem', fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {invoices.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>
                  No invoices found.
                </td>
              </tr>
            ) : (
              invoices.map((inv) => (
                <tr key={inv.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '1rem', color: '#111827', fontWeight: '500' }}>{inv.number}</td>
                  <td style={{ padding: '1rem', color: '#6b7280' }}>{inv.customer?.name || '-'}</td>
                  <td style={{ padding: '1rem', color: '#6b7280' }}>{new Date(inv.date).toLocaleDateString()}</td>
                  <td style={{ padding: '1rem', color: '#6b7280' }}>{inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : '-'}</td>
                  <td style={{ padding: '1rem', color: '#111827', fontWeight: '600' }}>${inv.total?.toString()}</td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ 
                      backgroundColor: inv.status === 'PAID' ? '#dcfce7' : (inv.status === 'OVERDUE' ? '#fee2e2' : '#f3f4f6'), 
                      color: inv.status === 'PAID' ? '#166534' : (inv.status === 'OVERDUE' ? '#991b1b' : '#374151'), 
                      padding: '0.25rem 0.75rem', 
                      borderRadius: '9999px', 
                      fontSize: '0.75rem', 
                      fontWeight: '500' 
                    }}>
                      {inv.status}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <Link href={`/dashboard/invoices/${inv.id}`} style={{ color: '#2563eb', textDecoration: 'none', fontSize: '0.875rem' }}>
                      View Details
                    </Link>
                    <DeleteButton id={inv.id} endpoint="invoices" itemName="Invoice" />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
