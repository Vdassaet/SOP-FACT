import prisma from "@/lib/prisma";
import Link from "next/link";
import DeleteButton from "@/components/DeleteButton";

export default async function PaymentsPage() {
  let payments: any[] = [];
  try {
    payments = await prisma.payment.findMany({
      include: { invoice: { include: { customer: true } } },
      orderBy: { date: 'desc' }
    });
  } catch(e) {
    console.error(e);
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#111827' }}>Received Payments</h1>
        <button 
          style={{ backgroundColor: '#2563eb', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '4px', border: 'none', fontWeight: '500', cursor: 'pointer' }}
        >
          + Log Manual Payment
        </button>
      </div>

      <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
              <th style={{ padding: '1rem', fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>Date</th>
              <th style={{ padding: '1rem', fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>Customer</th>
              <th style={{ padding: '1rem', fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>Related Invoice</th>
              <th style={{ padding: '1rem', fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>Method</th>
              <th style={{ padding: '1rem', fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>Amount</th>
              <th style={{ padding: '1rem', fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>Reference</th>
              <th style={{ padding: '1rem', fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {payments.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>
                  No payments registered or DB not connected.
                </td>
              </tr>
            ) : (
              payments.map((pay) => (
                <tr key={pay.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '1rem', color: '#6b7280' }}>{new Date(pay.date).toLocaleDateString()}</td>
                  <td style={{ padding: '1rem', color: '#111827', fontWeight: '500' }}>{pay.invoice?.customer?.name || '-'}</td>
                  <td style={{ padding: '1rem', color: '#2563eb' }}>
                    <Link href={`/dashboard/invoices/${pay.invoiceId}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                      {pay.invoice?.number}
                    </Link>
                  </td>
                  <td style={{ padding: '1rem', color: '#6b7280' }}>{pay.method}</td>
                  <td style={{ padding: '1rem', color: '#166534', fontWeight: '600' }}>+${pay.amount?.toString()}</td>
                  <td style={{ padding: '1rem', color: '#6b7280', fontSize: '0.875rem' }}>{pay.reference || '-'}</td>
                  <td style={{ padding: '1rem' }}>
                    <DeleteButton id={pay.id} endpoint="payments" itemName="Payment" />
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
