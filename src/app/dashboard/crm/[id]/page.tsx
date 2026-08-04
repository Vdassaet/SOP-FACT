import prisma from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function CustomerProfilePage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  let customer;
  try {
    customer = await prisma.customer.findUnique({
      where: { id: params.id },
      include: {
        estimates: true,
        contracts: true,
        projects: true,
        invoices: true
      }
    });
  } catch (e) {
    console.error(e);
  }

  if (!customer) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem' }}>
        <h2 style={{ fontSize: '1.5rem', color: '#374151', marginBottom: '1rem' }}>Customer not found or Database not connected</h2>
        <Link href="/dashboard/crm" style={{ color: '#2563eb' }}>Back to directory</Link>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#111827' }}>{customer.name}</h1>
          {customer.company && <p style={{ color: '#6b7280', fontSize: '1.125rem' }}>{customer.company}</p>}
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Link href={`/dashboard/crm/${customer.id}/edit`} style={{ backgroundColor: 'white', color: '#374151', border: '1px solid #d1d5db', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer', fontWeight: '500', textDecoration: 'none' }}>
            Edit Profile
          </Link>
          <Link href={`/dashboard/estimates/new?customerId=${customer.id}`} style={{ backgroundColor: '#2563eb', color: 'white', padding: '0.5rem 1rem', borderRadius: '4px', textDecoration: 'none', fontWeight: '500' }}>
            + New Estimate
          </Link>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
        {/* Info lateral */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#111827', marginBottom: '1rem' }}>Contact Information</h2>
            
            <div style={{ marginBottom: '1rem' }}>
              <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>Email</p>
              <p style={{ color: '#111827' }}>{customer.email}</p>
            </div>
            
            <div style={{ marginBottom: '1rem' }}>
              <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>Phone</p>
              <p style={{ color: '#111827' }}>{customer.phone || 'Not registered'}</p>
            </div>
            
            <div>
              <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>Address</p>
              <p style={{ color: '#111827' }}>{customer.address || 'Not registered'}</p>
            </div>
          </div>
        </div>

        {/* Historial / Tablas */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Cotizaciones */}
          <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#111827', marginBottom: '1rem' }}>Recent Estimates</h2>
            {customer.estimates.length === 0 ? (
              <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>No estimates for this customer.</p>
            ) : (
              <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <th style={{ padding: '0.5rem 0', color: '#6b7280', fontSize: '0.875rem' }}>#</th>
                    <th style={{ padding: '0.5rem 0', color: '#6b7280', fontSize: '0.875rem' }}>Date</th>
                    <th style={{ padding: '0.5rem 0', color: '#6b7280', fontSize: '0.875rem' }}>Total</th>
                    <th style={{ padding: '0.5rem 0', color: '#6b7280', fontSize: '0.875rem' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {customer.estimates.map(est => (
                    <tr key={est.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                      <td style={{ padding: '0.75rem 0' }}>{est.number}</td>
                      <td style={{ padding: '0.75rem 0' }}>{new Date(est.createdAt).toLocaleDateString()}</td>
                      <td style={{ padding: '0.75rem 0' }}>${est.total?.toString()}</td>
                      <td style={{ padding: '0.75rem 0' }}>
                        <span style={{ backgroundColor: '#dbeafe', color: '#1e40af', padding: '0.25rem 0.5rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: '500' }}>
                          {est.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Proyectos */}
          <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#111827', marginBottom: '1rem' }}>Projects / Jobs</h2>
            {customer.projects.length === 0 ? (
              <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>No active projects for this customer.</p>
            ) : (
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {customer.projects.map(proj => (
                  <li key={proj.id} style={{ padding: '1rem 0', borderBottom: '1px solid #f3f4f6' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: '500' }}>{proj.address}</span>
                      <span style={{ fontSize: '0.875rem', color: '#2563eb' }}>{proj.status}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
          
        </div>
      </div>
    </div>
  );
}
