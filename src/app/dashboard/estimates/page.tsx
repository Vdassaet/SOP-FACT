import prisma from "@/lib/prisma";
import Link from "next/link";
import DeleteButton from "@/components/DeleteButton";

export default async function EstimatesPage() {
  let estimates: any[] = [];
  try {
    estimates = await prisma.estimate.findMany({
      include: { customer: true },
      orderBy: { createdAt: 'desc' }
    });
  } catch(e) {
    console.error(e);
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#111827' }}>Estimates</h1>
        <Link 
          href="/dashboard/estimates/new" 
          style={{ backgroundColor: '#2563eb', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '4px', textDecoration: 'none', fontWeight: '500' }}
        >
          + New Estimate
        </Link>
      </div>

      <div className="table-responsive" style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
              <th style={{ padding: '1rem', fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>Estimate #</th>
              <th style={{ padding: '1rem', fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>Customer</th>
              <th style={{ padding: '1rem', fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>Date</th>
              <th style={{ padding: '1rem', fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>Total</th>
              <th style={{ padding: '1rem', fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>Status</th>
              <th style={{ padding: '1rem', fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {estimates.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>
                  No estimates or DB not connected.
                </td>
              </tr>
            ) : (
              estimates.map((est) => (
                <tr key={est.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '1rem', color: '#111827', fontWeight: '500' }}>{est.number}</td>
                  <td style={{ padding: '1rem', color: '#6b7280' }}>{est.customer?.name || '-'}</td>
                  <td style={{ padding: '1rem', color: '#6b7280' }}>{new Date(est.createdAt).toLocaleDateString()}</td>
                  <td style={{ padding: '1rem', color: '#111827', fontWeight: '600' }}>${est.total?.toString()}</td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ 
                      backgroundColor: est.status === 'APPROVED' ? '#dcfce7' : '#fef3c7', 
                      color: est.status === 'APPROVED' ? '#166534' : '#92400e', 
                      padding: '0.25rem 0.75rem', 
                      borderRadius: '9999px', 
                      fontSize: '0.75rem', 
                      fontWeight: '500' 
                    }}>
                      {est.status}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <Link href={`/dashboard/estimates/${est.id}`} style={{ color: '#2563eb', textDecoration: 'none', fontSize: '0.875rem' }}>
                      View
                    </Link>
                    <DeleteButton id={est.id} endpoint="estimates" itemName="Estimate" />
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
