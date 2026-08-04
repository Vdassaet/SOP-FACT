import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  let customersCount = 0;
  let quotesCount = 0;
  let invoicesCount = 0;
  let totalRevenue = 0;
  let customerTotals: { id: string; name: string; company: string | null; totalPaid: number }[] = [];

  try {
    customersCount = await prisma.customer.count();
    quotesCount = await prisma.estimate.count();
    invoicesCount = await prisma.invoice.count();
    
    const paymentsAggr = await prisma.payment.aggregate({
      _sum: { amount: true }
    });
    totalRevenue = paymentsAggr._sum.amount || 0;

    const customersWithPayments = await prisma.customer.findMany({
      include: { payments: true }
    });
    
    customerTotals = customersWithPayments.map(c => ({
      id: c.id,
      name: c.name,
      company: c.company,
      totalPaid: c.payments.reduce((acc, p) => acc + p.amount, 0)
    })).filter(c => c.totalPaid > 0).sort((a, b) => b.totalPaid - a.totalPaid);
  } catch (e) {
    console.error("DB not connected yet", e);
  }

  // Helper to format currency
  const formatCurrency = (val: number) => `$${val.toFixed(2)}`;

  return (
    <div>
      <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#111827', marginBottom: '2rem' }}>General Dashboard</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Card 1 */}
        <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h2 style={{ fontSize: '0.875rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Payments Received</h2>
          <p style={{ fontSize: '2.25rem', fontWeight: 'bold', color: '#10b981', marginTop: '0.5rem' }}>{formatCurrency(totalRevenue)}</p>
        </div>

        {/* Card 2 */}
        <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h2 style={{ fontSize: '0.875rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Active Customers</h2>
          <p style={{ fontSize: '2.25rem', fontWeight: 'bold', color: '#111827', marginTop: '0.5rem' }}>{customersCount}</p>
        </div>

        {/* Card 3 */}
        <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h2 style={{ fontSize: '0.875rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Open Estimates</h2>
          <p style={{ fontSize: '2.25rem', fontWeight: 'bold', color: '#111827', marginTop: '0.5rem' }}>{quotesCount}</p>
        </div>

        {/* Card 4 */}
        <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h2 style={{ fontSize: '0.875rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Created Invoices</h2>
          <p style={{ fontSize: '2.25rem', fontWeight: 'bold', color: '#111827', marginTop: '0.5rem' }}>{invoicesCount}</p>
        </div>
      </div>

      <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#111827', marginBottom: '1.5rem' }}>Total Payments by Customer</h2>
        
        {customerTotals.length === 0 ? (
          <p style={{ color: '#6b7280', textAlign: 'center', padding: '2rem 0' }}>No payments registered yet.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                <th style={{ padding: '0.75rem', fontSize: '0.875rem', color: '#374151' }}>Customer</th>
                <th style={{ padding: '0.75rem', fontSize: '0.875rem', color: '#374151' }}>Company</th>
                <th style={{ padding: '0.75rem', fontSize: '0.875rem', color: '#374151', textAlign: 'right' }}>Total Paid</th>
              </tr>
            </thead>
            <tbody>
              {customerTotals.map((c) => (
                <tr key={c.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '0.75rem', color: '#111827', fontWeight: '500' }}>{c.name}</td>
                  <td style={{ padding: '0.75rem', color: '#6b7280' }}>{c.company || '-'}</td>
                  <td style={{ padding: '0.75rem', color: '#10b981', fontWeight: 'bold', textAlign: 'right' }}>
                    {formatCurrency(c.totalPaid)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
