"use client";

export default function PrintButton() {
  const handlePrint = () => {
    if (typeof window !== 'undefined' && (window as any).electronAPI?.isElectron) {
      (window as any).electronAPI.printPDF();
    } else {
      window.print();
    }
  };

  return (
    <button 
      onClick={handlePrint} 
      style={{ backgroundColor: '#2563eb', color: 'white', padding: '0.5rem 1rem', borderRadius: '4px', border: 'none', cursor: 'pointer', fontWeight: '500' }}
    >
      Print PDF
    </button>
  );
}
