"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function EstimateActions({ estimateId, estimateStatus }: { estimateId: string, estimateStatus: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleConvert = async () => {
    if (!confirm("Are you sure you want to convert this estimate into a project?")) return;
    
    setLoading(true);
    try {
      const res = await fetch(`/api/estimates/${estimateId}/convert`, {
        method: 'POST'
      });
      const data = await res.json();
      
      if (res.ok) {
        alert("Estimate converted to Project successfully!");
        router.push(`/dashboard/projects`);
        router.refresh();
      } else {
        alert(data.error || "Failed to convert to project");
      }
    } catch (e) {
      console.error(e);
      alert("Connection error");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    router.push(`/dashboard/estimates/${estimateId}/edit`);
  };

  return (
    <div style={{ display: 'flex', gap: '1rem' }}>
      <button 
        type="button"
        onClick={handleEdit}
        style={{ padding: '0.75rem 1.5rem', borderRadius: '6px', background: '#f3f4f6', border: '1px solid #d1d5db', cursor: 'pointer', fontWeight: '500' }}
      >
        Edit Estimate
      </button>

      {estimateStatus !== "PROJECT" && estimateStatus !== "APPROVED" && (
        <button 
          type="button"
          onClick={handleConvert}
          disabled={loading}
          style={{ padding: '0.75rem 1.5rem', borderRadius: '6px', background: '#2563eb', color: 'white', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: '500', opacity: loading ? 0.7 : 1 }}
        >
          {loading ? "Converting..." : "Convert to Project"}
        </button>
      )}
    </div>
  );
}
