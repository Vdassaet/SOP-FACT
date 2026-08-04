import prisma from "@/lib/prisma";
import Link from "next/link";
import DeleteButton from "@/components/DeleteButton";

export default async function ContractsPage() {
  let contracts: any[] = [];
  try {
    contracts = await prisma.contract.findMany({
      include: { customer: true, project: true },
      orderBy: { createdAt: 'desc' }
    });
  } catch(e) {
    console.error(e);
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#111827' }}>Contracts & Digital Signatures</h1>
        <Link 
          href="/dashboard/contracts/new" 
          style={{ backgroundColor: '#2563eb', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '4px', textDecoration: 'none', fontWeight: '500' }}
        >
          + Create Contract
        </Link>
      </div>

      <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
              <th style={{ padding: '1rem', fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>Contract ID</th>
              <th style={{ padding: '1rem', fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>Customer</th>
              <th style={{ padding: '1rem', fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>Linked Project</th>
              <th style={{ padding: '1rem', fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>Start Date</th>
              <th style={{ padding: '1rem', fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>Signature Status</th>
              <th style={{ padding: '1rem', fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {contracts.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>
                  No contracts found.
                </td>
              </tr>
            ) : (
              contracts.map((contract) => (
                <tr key={contract.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '1rem', color: '#111827', fontWeight: '500' }}>{contract.number}</td>
                  <td style={{ padding: '1rem', color: '#6b7280' }}>{contract.customer?.name || '-'}</td>
                  <td style={{ padding: '1rem', color: '#2563eb' }}>{contract.project?.address || '-'}</td>
                  <td style={{ padding: '1rem', color: '#6b7280' }}>{contract.startDate ? new Date(contract.startDate).toLocaleDateString() : 'TBD'}</td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ 
                      backgroundColor: contract.status === 'SIGNED' ? '#dcfce7' : '#f3f4f6', 
                      color: contract.status === 'SIGNED' ? '#166534' : '#374151', 
                      padding: '0.25rem 0.75rem', 
                      borderRadius: '9999px', 
                      fontSize: '0.75rem', 
                      fontWeight: '500' 
                    }}>
                      {contract.status}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <Link href={`/dashboard/contracts/${contract.id}`} style={{ color: '#2563eb', textDecoration: 'none', fontSize: '0.875rem' }}>
                      View PDF
                    </Link>
                    <DeleteButton id={contract.id} endpoint="contracts" itemName="Contract" />
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
