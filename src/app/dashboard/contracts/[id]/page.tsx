"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

type ContractData = {
  id: string;
  number: string;
  status: string;
  startDate: string | null;
  endDate: string | null;
  warranty: string;
  responsibilities: string;
  paymentConditions: string;
  cancellations: string;
  permits: string;
  createdAt: string;
  customer: {
    name: string;
    company: string | null;
    email: string | null;
    phone: string | null;
    address: string | null;
  };
};

export default function ContractDetailPage() {
  const params = useParams();
  const router = useRouter();
  const contractId = params.id as string;
  
  const [contract, setContract] = useState<ContractData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/contracts/${contractId}`)
      .then(res => res.json())
      .then(data => {
        if (!data.error) {
          setContract(data);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [contractId]);

  if (loading) return <div style={{ padding: '2rem' }}>Loading Contract...</div>;
  if (!contract) return <div style={{ padding: '2rem' }}>Contract Not Found</div>;

  const handlePrint = () => {
    if (typeof window !== 'undefined' && (window as any).electronAPI?.isElectron) {
      (window as any).electronAPI.printPDF();
    } else {
      window.print();
    }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 0' }}>
      {/* Non-printable Header */}
      <div className="print-hide" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <Link href="/dashboard/contracts" style={{ color: '#6b7280', textDecoration: 'none', fontWeight: '500' }}>
          &larr; Back to Contracts
        </Link>
        <button 
          onClick={handlePrint}
          style={{ padding: '0.5rem 1.5rem', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          Print / Save as PDF
        </button>
      </div>

      {/* Printable Document Area */}
      <div style={{ backgroundColor: 'white', padding: '3rem', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
        <img src="/logo-watermark.jpg" alt="" style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '600px', maxWidth: '80%', height: 'auto', opacity: 0.1, zIndex: 0, pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
        
        {/* Document Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #e5e7eb', paddingBottom: '2rem', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: '900', margin: '0 0 0.5rem 0', color: '#111827' }}>NJ FENCE AND RAILING</h1>
            <p style={{ margin: 0, color: '#4b5563' }}>Professional Installation Services</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <h2 style={{ fontSize: '1.5rem', margin: '0 0 0.5rem 0', color: '#374151', textTransform: 'uppercase' }}>Service Contract</h2>
            <p style={{ margin: '0 0 0.25rem 0', fontWeight: 'bold' }}>Contract #: {contract.number}</p>
            <p style={{ margin: 0, color: '#6b7280' }}>Date: {new Date(contract.createdAt).toLocaleDateString()}</p>
          </div>
        </div>

        {/* Customer Info */}
        <div style={{ marginBottom: '2.5rem' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', borderBottom: '1px solid #e5e7eb', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Client Information</h3>
          <div className="grid-responsive" style={{ gap: '1rem' }}>
            <div>
              <p style={{ margin: '0 0 0.25rem 0' }}><strong>Name:</strong> {contract.customer.name}</p>
              {contract.customer.company && <p style={{ margin: '0 0 0.25rem 0' }}><strong>Company:</strong> {contract.customer.company}</p>}
              <p style={{ margin: '0 0 0.25rem 0' }}><strong>Address:</strong> {contract.customer.address || 'N/A'}</p>
            </div>
            <div>
              <p style={{ margin: '0 0 0.25rem 0' }}><strong>Email:</strong> {contract.customer.email || 'N/A'}</p>
              <p style={{ margin: '0 0 0.25rem 0' }}><strong>Phone:</strong> {contract.customer.phone || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Schedule Info */}
        <div style={{ marginBottom: '2.5rem' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', borderBottom: '1px solid #e5e7eb', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Project Schedule</h3>
          <div className="grid-responsive" style={{ gap: '1rem' }}>
            <p style={{ margin: 0 }}><strong>Estimated Start Date:</strong> {contract.startDate ? new Date(contract.startDate).toLocaleDateString() : 'TBD'}</p>
            <p style={{ margin: 0 }}><strong>Estimated End Date:</strong> {contract.endDate ? new Date(contract.endDate).toLocaleDateString() : 'TBD'}</p>
          </div>
        </div>

        {/* Clauses */}
        <div style={{ marginBottom: '3rem' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', borderBottom: '1px solid #e5e7eb', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Terms & Conditions</h3>
          
          <div style={{ marginBottom: '1.25rem' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 'bold', margin: '0 0 0.5rem 0' }}>1. Warranty</h4>
            <p style={{ margin: 0, color: '#374151', lineHeight: '1.5' }}>{contract.warranty || 'None specified.'}</p>
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 'bold', margin: '0 0 0.5rem 0' }}>2. Client Responsibilities</h4>
            <p style={{ margin: 0, color: '#374151', lineHeight: '1.5' }}>{contract.responsibilities || 'None specified.'}</p>
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 'bold', margin: '0 0 0.5rem 0' }}>3. Payment Conditions</h4>
            <p style={{ margin: 0, color: '#374151', lineHeight: '1.5' }}>{contract.paymentConditions || 'None specified.'}</p>
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 'bold', margin: '0 0 0.5rem 0' }}>4. Cancellations</h4>
            <p style={{ margin: 0, color: '#374151', lineHeight: '1.5' }}>{contract.cancellations || 'None specified.'}</p>
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 'bold', margin: '0 0 0.5rem 0' }}>5. Permits</h4>
            <p style={{ margin: 0, color: '#374151', lineHeight: '1.5' }}>{contract.permits || 'None specified.'}</p>
          </div>
        </div>

        {/* Signatures */}
        <div style={{ marginTop: '4rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem' }}>
          <div>
            <div style={{ borderBottom: '1px solid #111827', height: '40px', marginBottom: '0.5rem' }}></div>
            <p style={{ margin: 0, fontWeight: 'bold', textAlign: 'center' }}>NJ Fence and Railing Representative</p>
            <p style={{ margin: '0.25rem 0 0 0', color: '#6b7280', fontSize: '0.875rem', textAlign: 'center' }}>Date</p>
          </div>
          <div>
            <div style={{ borderBottom: '1px solid #111827', height: '40px', marginBottom: '0.5rem' }}></div>
            <p style={{ margin: 0, fontWeight: 'bold', textAlign: 'center' }}>{contract.customer.name} (Client)</p>
            <p style={{ margin: '0.25rem 0 0 0', color: '#6b7280', fontSize: '0.875rem', textAlign: 'center' }}>Date</p>
          </div>
        </div>

        </div>
      </div>

      <style jsx global>{`
        @media print {
          body {
            background-color: white !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          /* Hide Sidebar and Header from dashboard layout */
          aside, header, .print-hide {
            display: none !important;
          }
          /* Ensure main content takes full width and resets scroll */
          main, main > div {
            padding: 0 !important;
            margin: 0 !important;
            overflow: visible !important;
            height: auto !important;
          }
          /* Remove shadows and margins on the document area */
          div[style*="box-shadow"] {
            box-shadow: none !important;
            padding: 0 !important;
          }
        }
      `}</style>
    </div>
  );
}
