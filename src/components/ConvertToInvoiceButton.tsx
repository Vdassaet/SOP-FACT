"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ConvertToInvoiceButton({ estimateId }: { estimateId: string }) {
  const [isConverting, setIsConverting] = useState(false);
  const router = useRouter();

  const handleConvert = async () => {
    if (!confirm("Are you sure you want to convert this estimate to an invoice?")) {
      return;
    }
    
    setIsConverting(true);
    try {
      const res = await fetch(`/api/estimates/${estimateId}/convert-to-invoice`, {
        method: "POST",
      });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Failed to convert to invoice");
      }
      
      if (data.success && data.invoice) {
        router.push(`/dashboard/invoices/${data.invoice.id}/edit`);
        router.refresh();
      }
    } catch (error: any) {
      alert(error.message);
      setIsConverting(false);
    }
  };

  return (
    <button 
      onClick={handleConvert}
      disabled={isConverting}
      style={{ 
        backgroundColor: '#10b981', 
        color: 'white', 
        border: 'none', 
        padding: '0.25rem 0.5rem', 
        borderRadius: '4px', 
        cursor: isConverting ? 'not-allowed' : 'pointer', 
        fontSize: '0.75rem', 
        fontWeight: '500',
        opacity: isConverting ? 0.7 : 1
      }}
    >
      {isConverting ? 'Converting...' : 'Convert to Invoice'}
    </button>
  );
}
