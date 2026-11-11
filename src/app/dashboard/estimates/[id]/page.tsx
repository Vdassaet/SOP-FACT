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

  let railingImage = "";
  let imagesList: Array<{ id?: string; url: string; label?: string }> = [];
  let railingsList: any[] = [];
  let selectedFence: string | null = null;
  let selectedRailing: string | null = null;
  try {
    if (estimate.description && (estimate.description.startsWith("{") || estimate.description.startsWith("["))) {
      const parsed = JSON.parse(estimate.description);
      railingImage = parsed.railingImage || "";
      if (Array.isArray(parsed.images) && parsed.images.length > 0) {
        imagesList = parsed.images;
      }
      if (Array.isArray(parsed.railingsList)) {
        railingsList = parsed.railingsList;
      }
      selectedFence = parsed.selectedFence || null;
      selectedRailing = parsed.selectedRailing || null;
    } else if (estimate.description && estimate.description.startsWith("data:image")) {
      railingImage = estimate.description;
    }
  } catch {}

  if (imagesList.length === 0 && railingImage) {
    imagesList = [{ id: "1", url: railingImage, label: "Railing Style Reference" }];
  }

  if (!selectedFence && estimate.items) {
    const fItem = estimate.items.find((it: any) =>
      ["vinyl fence", "aluminum fence", "wood fence", "chain link"].some(f => (it.name || "").toLowerCase().includes(f))
    );
    if (fItem) {
      const n = fItem.name.toLowerCase();
      if (n.includes("vinyl")) selectedFence = "Vinyl Fence";
      else if (n.includes("aluminum")) selectedFence = "Aluminum Fence";
      else if (n.includes("wood")) selectedFence = "Wood Fence";
      else if (n.includes("chain link")) selectedFence = "Chain Link";
    }
  }

  if (!selectedRailing && estimate.items) {
    const rItem = estimate.items.find((it: any) =>
      ["aluminum railing", "metal railing", "pvc railing", "custom railing"].some(r => (it.name || "").toLowerCase().includes(r))
    );
    if (rItem) {
      const n = rItem.name.toLowerCase();
      if (n.includes("aluminum")) selectedRailing = "Aluminum Railing";
      else if (n.includes("metal")) selectedRailing = "Metal Railing";
      else if (n.includes("pvc")) selectedRailing = "PVC Railing";
      else if (n.includes("custom")) selectedRailing = "Custom Railing";
    }
  }

  return (
    <div className="print-block" style={{ maxWidth: '1000px', margin: '0 auto' }}>

      {/* Header Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }} className="hide-on-print">
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

      {/* Main Grid (Screen View) */}
      <div className="grid-responsive-2-1 hide-on-print" style={{ gap: '2rem' }}>
        
        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Info Card */}
          <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', borderBottom: '1px solid #e5e7eb', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Customer & Project Information</h2>
            <div className="grid-responsive" style={{ gap: '1rem' }}>
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
            <div className="grid-cols-4-responsive" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', textAlign: 'center' }}>
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

          {/* Project Reference Images Card if present */}
          {imagesList && imagesList.length > 0 && (
            <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', borderBottom: '1px solid #e5e7eb', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
                Project Reference Images ({imagesList.length})
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
                {imagesList.map((img, idx) => (
                  <div key={img.id || idx} style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '0.75rem', backgroundColor: '#f9fafb', textAlign: 'center' }}>
                    <p style={{ margin: '0 0 0.5rem 0', fontWeight: '600', fontSize: '0.875rem', color: '#111827' }}>
                      {img.label || `Reference Image ${idx + 1}`}
                    </p>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={img.url} 
                      alt={img.label || `Reference Image ${idx + 1}`} 
                      style={{ height: '140px', width: '100%', objectFit: 'contain', borderRadius: '6px', border: '1px solid #d1d5db', backgroundColor: 'white', padding: '4px' }} 
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Right Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Financial Summary */}
          <div style={{ backgroundColor: '#f9fafb', color: '#111827', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.5rem', color: '#111827' }}>Financial Summary</h2>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem', fontWeight: 'bold', color: '#111827' }}>
              <span>Total Estimate:</span>
              <span>{formatCurrency(estimate.total)}</span>
            </div>
          </div>

        </div>
      </div>

      {/* CORPORATE PROPOSAL PDF TEMPLATE (Used when printing from phone or computer) */}
      <div id="printable-pdf" className="print-only-block" style={{ background: 'white', padding: '2rem', color: 'black', position: 'relative', width: '100%' }}>
        
        {/* Fixed Centered Watermark Logo for Print (Centers perfectly on each printed page) */}
        <div 
          className="print-watermark-wrapper"
          style={{ 
            position: 'fixed', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            width: '100%', 
            height: '100%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            pointerEvents: 'none', 
            zIndex: 0 
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src="/logo-watermark.jpg" 
            alt="" 
            loading="eager"
            decoding="sync"
            style={{ 
              width: '550px', 
              maxWidth: '80%', 
              height: 'auto', 
              opacity: 0.08, 
              pointerEvents: 'none' 
            }} 
          />
        </div>

        {/* PROPOSAL CONTENT */}
        <div className="print-proposal-page" style={{ position: 'relative', zIndex: 1, width: '100%' }}>
          <div>
            <div style={{ borderBottom: '4px solid #111827', paddingBottom: '1rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h1 style={{ fontSize: '2rem', fontWeight: '900', margin: 0 }}>NJ FENCE & RAILING</h1>
                <p style={{ margin: 0, color: '#4b5563' }}>Professional Fencing Solutions</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0, color: '#2563eb' }}>PROPOSAL</h2>
                <p style={{ margin: 0 }}>Date: {new Date(estimate.date || estimate.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
            
            <div className="print-two-col" style={{ display: 'flex', justifyContent: 'space-between', gap: '2rem', marginBottom: '2rem', fontSize: '0.875rem', width: '100%' }}>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 'bold', borderBottom: '1px solid #e5e7eb', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Prepared For:</h3>
                <p style={{ margin: 0 }}>Customer: {estimate.customer ? `${estimate.customer.name} ${estimate.customer.company ? `(${estimate.customer.company})` : ''}` : 'N/A'}</p>
                <p style={{ margin: 0 }}>Project Location: {estimate.installAddress || estimate.customer?.address || 'N/A'}</p>
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 'bold', borderBottom: '1px solid #e5e7eb', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Project Specs:</h3>
                <p style={{ margin: 0 }}>Type: {estimate.projectType || 'New Installation'}</p>
                
                {selectedFence && (estimate.linearFeet || 0) > 0 && (
                  <div style={{ marginTop: '0.5rem' }}>
                    <p style={{ margin: 0, fontWeight: 'bold' }}>Fence: {selectedFence}</p>
                    <p style={{ margin: 0 }}>Length: {estimate.linearFeet} ft | Height: {estimate.height || 6} ft</p>
                    {(estimate.gateCount || 0) > 0 && <p style={{ margin: 0 }}>Gates: {estimate.gateCount} ({estimate.gateWidth || 4}ft wide)</p>}
                  </div>
                )}

                {railingsList.some(r => r.linearFeet > 0) && (
                  <div style={{ marginTop: '0.5rem' }}>
                    <p style={{ margin: 0, fontWeight: 'bold' }}>Railing: {selectedRailing || 'Custom Railing'}</p>
                    <p style={{ margin: 0 }}>
                      Total Length: {railingsList.reduce((acc, r) => acc + (r.linearFeet || 0), 0)} ft ({railingsList.filter(r => r.linearFeet > 0).length} {railingsList.filter(r => r.linearFeet > 0).length === 1 ? 'section' : 'sections'} — see breakdown below)
                    </p>
                  </div>
                )}
              </div>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '2rem' }}>
              <thead>
                <tr style={{ background: '#f3f4f6' }}>
                  <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #d1d5db' }}>Description</th>
                  <th style={{ padding: '0.75rem', textAlign: 'center', borderBottom: '2px solid #d1d5db' }}>Qty (FT)</th>
                  <th style={{ padding: '0.75rem', textAlign: 'right', borderBottom: '2px solid #d1d5db' }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {estimate.items && estimate.items.map((i: any, idx: number) => (
                  <tr key={i.id || idx}>
                    <td style={{ padding: '0.75rem', borderBottom: '1px solid #e5e7eb' }}>{i.name} {i.description && <span style={{color: 'gray', fontSize: '0.875rem'}}>({i.description})</span>}</td>
                    <td style={{ padding: '0.75rem', textAlign: 'center', borderBottom: '1px solid #e5e7eb' }}>{i.quantity}</td>
                    <td style={{ padding: '0.75rem', textAlign: 'right', borderBottom: '1px solid #e5e7eb' }}>{formatCurrency(i.total ?? (i.quantity * i.unitPrice))}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '2rem' }}>
              <div style={{ width: '300px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', fontWeight: 'bold', fontSize: '1.25rem', borderTop: '2px solid black' }}>
                  <span>TOTAL ESTIMATE:</span>
                  <span>{formatCurrency(estimate.total)}</span>
                </div>
              </div>
            </div>

            <div style={{ border: '1px solid #d1d5db', padding: '1rem', borderRadius: '4px', marginBottom: railingImage ? '1.25rem' : '2rem', fontSize: '0.875rem', lineHeight: '1.5', pageBreakInside: 'avoid' }}>
              <strong>Terms & Conditions:</strong>
              <p style={{ margin: '0.5rem 0 0.35rem 0' }}>
                1. <strong>Estimate Validity:</strong> This proposal is valid for 30 days from the date of issuance.
              </p>
              <p style={{ margin: 0 }}>
                2. <strong>Deposit Requirement:</strong> A 50% deposit is required to approve the project and begin work.
              </p>
            </div>

            {/* Railing Section Breakdown */}
            {railingsList.some(r => r.linearFeet > 0) && (
              <div style={{ 
                border: '1px solid #e5e7eb', 
                borderRadius: '6px', 
                padding: '1rem', 
                backgroundColor: 'transparent',
                marginBottom: '1.5rem',
                fontSize: '0.8125rem',
                color: '#111827',
                pageBreakInside: 'avoid'
              }}>
                <p style={{ margin: '0 0 0.5rem 0', fontWeight: 'bold', fontSize: '0.875rem' }}>
                  Railing Specifications: {selectedRailing || 'Aluminum Railing'}
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  {railingsList.filter(r => r.linearFeet > 0).map((r, idx, arr) => (
                    <p key={r.id || idx} style={{ margin: 0, lineHeight: 1.4 }}>
                      <strong>{r.location ? `${r.location}: ` : (arr.length > 1 ? `Section ${idx + 1}: ` : '')}</strong>
                      {r.linearFeet} ft {r.style ? `| ${r.style}` : ''} {r.color ? `(${r.color})` : ''}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* STANDALONE FULL-PAGE REFERENCE IMAGES (Centered on their own page, no watermark) */}
        {imagesList && imagesList.length > 0 && imagesList.map((img, idx) => (
          <div 
            key={img.id || idx}
            className="print-style-page"
            style={{ 
              display: 'block',
              pageBreakBefore: 'always', 
              breakBefore: 'page',
              pageBreakInside: 'avoid',
              breakInside: 'avoid',
              textAlign: 'center',
              padding: '1in 1rem 0.5in 1rem',
              position: 'relative',
              zIndex: 2,
              backgroundColor: 'white',
              width: '100%'
            }}
          >
            <h2 style={{ 
              fontSize: '1.25rem', 
              fontWeight: 'bold', 
              textTransform: 'uppercase', 
              letterSpacing: '0.08em', 
              color: '#1f2937',
              marginBottom: '1.5rem'
            }}>
              {img.label || `Reference Image ${idx + 1}`}
            </h2>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={img.url} 
              alt={img.label || `Reference Image ${idx + 1}`} 
              loading="eager"
              decoding="sync"
              style={{ 
                display: 'block',
                margin: '0 auto',
                maxHeight: '6.2in', 
                maxWidth: '85%', 
                width: 'auto',
                objectFit: 'contain', 
                borderRadius: '8px', 
                border: '1px solid #d1d5db',
                padding: '8px',
                backgroundColor: 'white',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }} 
            />
            {idx === 0 && selectedRailing && (
              <p style={{ marginTop: '1.25rem', fontSize: '0.9375rem', fontWeight: '600', color: '#4b5563' }}>
                {selectedRailing}
              </p>
            )}
          </div>
        ))}

      </div>

    </div>
  );
}
