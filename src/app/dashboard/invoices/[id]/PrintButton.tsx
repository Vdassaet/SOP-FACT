"use client";

export default function PrintButton() {
  return (
    <button 
      onClick={() => window.print()} 
      style={{ backgroundColor: '#2563eb', color: 'white', padding: '0.5rem 1rem', borderRadius: '4px', border: 'none', cursor: 'pointer', fontWeight: '500' }}
    >
      Print PDF
    </button>
  );
}
