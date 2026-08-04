import prisma from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import EstimateActions from "./EstimateActions";

export default async function EstimateDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  
  const estimate = await prisma.estimate.findUnique({
    where: { id: params.id },
    include: {
      customer: true,
      items: true
    }
  });

  if (!estimate) {
    notFound();
  }

  // Helper to format currency
  const formatCurrency = (val: any) => {
    const num = parseFloat(val);
    return isNaN(num) ? "$0.00" : `$${num.toFixed(2)}`;
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      
      {/* Header Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }} className="hide-on-print">
        <div>
          <Link href="/dashboard/estimates" style={{ color: '#6b7280', textDecoration: 'none', fontSize: '0.875rem' }}>
            &larr; Back to Estimates
          </Link>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#111827', marginTop: '0.5rem' }}>
            Estimate {estimate.number}
          </h1>
          <span style={{ 
              display: 'inline-block',
              marginTop: '0.5rem',
              backgroundColor: estimate.status === 'APPROVED' ? '#dcfce7' : '#fef3c7', 
              color: estimate.status === 'APPROVED' ? '#166534' : '#92400e', 
              padding: '0.25rem 0.75rem', 
              borderRadius: '9999px', 
              fontSize: '0.75rem', 
              fontWeight: 'bold' 
            }}>
              {estimate.status}
          </span>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <EstimateActions estimateId={estimate.id} estimateStatus={estimate.status} />
        </div>
      </div>

      {/* Main Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        
        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Info Card */}
          <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', borderBottom: '1px solid #e5e7eb', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Customer & Project Information</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: 0, fontWeight: 'bold', textTransform: 'uppercase' }}>Customer</p>
                <p style={{ margin: '0.25rem 0 1rem 0' }}>{estimate.customer?.name} {estimate.customer?.company ? `(${estimate.customer.company})` : ''}</p>
                
                <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: 0, fontWeight: 'bold', textTransform: 'uppercase' }}>Phone</p>
                <p style={{ margin: '0.25rem 0 1rem 0' }}>{estimate.customer?.phone || 'N/A'}</p>
              </div>
              <div>
                <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: 0, fontWeight: 'bold', textTransform: 'uppercase' }}>Installation Address</p>
                <p style={{ margin: '0.25rem 0 1rem 0' }}>{estimate.installAddress || estimate.customer?.address || 'N/A'}</p>
                
                <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: 0, fontWeight: 'bold', textTransform: 'uppercase' }}>Project Type</p>
                <p style={{ margin: '0.25rem 0 1rem 0' }}>{estimate.propertyType || '-'} / {estimate.projectType || '-'}</p>
              </div>
            </div>
          </div>

          {/* Measurements Card */}
          <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', borderBottom: '1px solid #e5e7eb', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Project Measurements (Specs)</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', textAlign: 'center' }}>
              <div style={{ background: '#f9fafb', padding: '1rem', borderRadius: '6px' }}>
                <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: 0 }}>Linear Feet</p>
                <p style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: 0 }}>{estimate.linearFeet || 0}</p>
              </div>
              <div style={{ background: '#f9fafb', padding: '1rem', borderRadius: '6px' }}>
                <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: 0 }}>Height (ft)</p>
                <p style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: 0 }}>{estimate.height || 0}</p>
              </div>
              <div style={{ background: '#f9fafb', padding: '1rem', borderRadius: '6px' }}>
                <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: 0 }}>Gates</p>
                <p style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: 0 }}>{estimate.gateCount || 0}</p>
              </div>
              <div style={{ background: '#f9fafb', padding: '1rem', borderRadius: '6px' }}>
                <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: 0 }}>Posts</p>
                <p style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: 0 }}>{(estimate.linePosts||0) + (estimate.cornerPosts||0) + (estimate.terminalPosts||0)}</p>
              </div>
            </div>
          </div>

          {/* Items Card */}
          <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', borderBottom: '1px solid #e5e7eb', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Line Items</h2>
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
                {estimate.items && estimate.items.map((it: any) => (
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
                {(!estimate.items || estimate.items.length === 0) && (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', padding: '1rem', color: '#9ca3af' }}>No items detailed.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

        </div>

        {/* Right Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Financial Summary */}
          <div style={{ backgroundColor: '#111827', color: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Financial Summary</h2>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem', fontWeight: 'bold', color: '#10b981' }}>
              <span>Total Estimate:</span>
              <span>{formatCurrency(estimate.total)}</span>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
