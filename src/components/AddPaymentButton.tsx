"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AddPaymentButton({ invoiceId, balanceDue }: { invoiceId: string, balanceDue: number }) {
  const [isOpen, setIsOpen] = useState(false);
  const [amount, setAmount] = useState(balanceDue);
  const [method, setMethod] = useState("Transfer");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handlePayment = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invoiceId, amount, method })
      });
      if (res.ok) {
        setIsOpen(false);
        router.refresh();
      } else {
        alert("Error saving payment");
      }
    } catch (error) {
      alert("Error saving payment");
    } finally {
      setLoading(false);
    }
  };

  if (balanceDue <= 0) return null;

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        style={{ padding: '0.75rem 1.5rem', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '500' }}
      >
        Record Payment
      </button>

      {isOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '8px', width: '400px', maxWidth: '90%' }}>
            <h3 style={{ marginTop: 0, fontSize: '1.25rem', fontWeight: 'bold' }}>Record Payment</h3>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Amount ($)</label>
              <input type="number" step="0.01" max={balanceDue} value={amount} onChange={e => setAmount(parseFloat(e.target.value) || 0)} style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '4px' }} />
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Method</label>
              <select value={method} onChange={e => setMethod(e.target.value)} style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '4px' }}>
                <option value="Cash">Cash</option>
                <option value="Check">Check</option>
                <option value="Transfer">Transfer</option>
                <option value="Credit Card">Credit Card</option>
              </select>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              <button onClick={() => setIsOpen(false)} style={{ padding: '0.5rem 1rem', background: 'none', border: '1px solid #d1d5db', borderRadius: '4px', cursor: 'pointer' }}>Cancel</button>
              <button onClick={handlePayment} disabled={loading} style={{ padding: '0.5rem 1rem', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                {loading ? 'Saving...' : 'Save Payment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
