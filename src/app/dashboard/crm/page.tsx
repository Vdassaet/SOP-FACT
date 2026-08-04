import prisma from "@/lib/prisma";
import Link from "next/link";
import DeleteButton from "@/components/DeleteButton";

export default async function CRMPage() {
  let customers: any[] = [];
  try {
    customers = await prisma.customer.findMany({
      orderBy: { createdAt: 'desc' }
    });
  } catch (e) {
    console.error("DB Not connected", e);
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#111827' }}>Customer Directory</h1>
        <Link 
          href="/dashboard/crm/new" 
          style={{ backgroundColor: '#2563eb', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '4px', textDecoration: 'none', fontWeight: '500' }}
        >
          + New Customer
        </Link>
      </div>

      <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
              <th style={{ padding: '1rem', fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>Name</th>
              <th style={{ padding: '1rem', fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>Company</th>
              <th style={{ padding: '1rem', fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>Email</th>
              <th style={{ padding: '1rem', fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>Phone</th>
              <th style={{ padding: '1rem', fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {customers.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>
                  No customers registered or database not connected.
                </td>
              </tr>
            ) : (
              customers.map((c) => (
                <tr key={c.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '1rem', color: '#111827' }}>{c.name}</td>
                  <td style={{ padding: '1rem', color: '#6b7280' }}>{c.company || '-'}</td>
                  <td style={{ padding: '1rem', color: '#6b7280' }}>{c.email}</td>
                  <td style={{ padding: '1rem', color: '#6b7280' }}>{c.phone}</td>
                  <td style={{ padding: '1rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <Link href={`/dashboard/crm/${c.id}`} style={{ color: '#2563eb', textDecoration: 'none', fontSize: '0.875rem' }}>
                      View Profile
                    </Link>
                    <DeleteButton id={c.id} endpoint="customers" itemName="Customer" />
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
