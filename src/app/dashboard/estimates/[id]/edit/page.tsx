"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";

// --- Types ---
type LineItem = {
  id?: string;
  name: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total?: number;
};

// --- Main Component ---
export default function EditEstimatePage() {
  const router = useRouter();
  const params = useParams();
  const estimateId = params.id as string;
  
  // States
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isPdfGenerating, setIsPdfGenerating] = useState(false);

  // Form Data
  const [formData, setFormData] = useState({
    customerId: "",
    propertyType: "Residential",
    projectType: "New Installation",
    priority: "Normal",
    estimatedInstallDate: "",
    expirationDate: "",
    installAddress: "",
    notes: "",
  });

  // Material & Labor Data
  const [measurements, setMeasurements] = useState({
    linearFeet: 0,
    pricePerLinearFoot: 0,
    height: 6,
    gateCount: 0,
    gateWidth: 4,
    linePosts: 0,
    cornerPosts: 0,
    terminalPosts: 0
  });

  const [labor, setLabor] = useState({
    crewSize: 0,
    estimatedHours: 0,
    hourlyRate: 0,
    machineryCost: 0,
    permitCost: 0,
    transportCost: 0,
    disposalCost: 0,
    overheadPercent: 0
  });

  // Railings Data
  const [railings, setRailings] = useState({
    linearFeet: 0,
    pricePerFoot: 0,
    style: "",
    color: ""
  });

  // Selected Catalog Items
  const [selectedFence, setSelectedFence] = useState<string | null>(null);
  const [selectedRailing, setSelectedRailing] = useState<string | null>(null);
  
  // Custom Line Items (Additional)
  const [lineItems, setLineItems] = useState<LineItem[]>([]);

  // Derived Values (Profitability Calculator)
  const autoCalculatedItems = useMemo(() => {
    const items: LineItem[] = [];

    // --- FENCE LOGIC ---
    if (selectedFence && measurements.linearFeet > 0) {
      if (measurements.pricePerLinearFoot > 0) {
        items.push({ 
          name: `${selectedFence} (${measurements.height}ft)`, 
          description: "Price per linear foot (Includes posts and gates)", 
          quantity: measurements.linearFeet, 
          unitPrice: measurements.pricePerLinearFoot 
        });
        
        const totalPosts = measurements.linePosts + measurements.cornerPosts + measurements.terminalPosts;
        if (totalPosts > 0) {
          items.push({ name: `${selectedFence} Posts`, description: "Included", quantity: totalPosts, unitPrice: 0 });
        }

        if (measurements.gateCount > 0) {
          items.push({ name: `${selectedFence} Gate (${measurements.gateWidth}ft)`, description: "Included", quantity: measurements.gateCount, unitPrice: 0 });
        }
      } else {
        // Old logic (Panel/Post breakdown) if price per linear foot is 0
        let pricePerPanel = 0;
        let pricePerPost = 0;
        let pricePerGate = 0;

        if (selectedFence === "Vinyl Fence") { pricePerPanel = 120; pricePerPost = 35; pricePerGate = 250; }
        else if (selectedFence === "Aluminum Fence") { pricePerPanel = 150; pricePerPost = 45; pricePerGate = 350; }
        else if (selectedFence === "Wood Fence") { pricePerPanel = 80; pricePerPost = 25; pricePerGate = 150; }

        const panelCount = Math.ceil(measurements.linearFeet / 8); // Assuming 8ft panels
        const totalPosts = measurements.linePosts + measurements.cornerPosts + measurements.terminalPosts;

        items.push({ name: `${selectedFence} Panel (${measurements.height}ft)`, description: "Panels", quantity: panelCount, unitPrice: pricePerPanel });
        if (totalPosts > 0) items.push({ name: `${selectedFence} Posts`, description: "Posts", quantity: totalPosts, unitPrice: pricePerPost });
        if (measurements.gateCount > 0) items.push({ name: `${selectedFence} Gate`, description: "Gates", quantity: measurements.gateCount, unitPrice: pricePerGate });
      }
    }

    // --- RAILINGS LOGIC ---
    if (selectedRailing && railings.linearFeet > 0 && railings.pricePerFoot > 0) {
      let rName = selectedRailing;
      if (railings.color) rName += ` (${railings.color})`;
      
      let rDesc = "Included";
      if (railings.style) rDesc = `Style: ${railings.style}`;

      items.push({
        name: rName,
        description: rDesc,
        quantity: railings.linearFeet,
        unitPrice: railings.pricePerFoot
      });
    }

    return items;
  }, [selectedFence, selectedRailing, measurements, railings]);

  const allItems = [...autoCalculatedItems, ...lineItems];
  
  // Total is simply the sum of all items (fence + railings + custom items)
  // The user inputs prices that ALREADY include their margin and labor.
  const sellingPrice = allItems.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);

  // Fetch Customers & Estimate
  useEffect(() => {
    fetch("/api/customers")
      .then(res => res.json())
      .then(data => { if(Array.isArray(data)) setCustomers(data); })
      .catch(e => console.error(e));

    if (estimateId) {
      fetch(`/api/estimates/${estimateId}`)
        .then(res => res.json())
        .then(data => {
          if (data && !data.error) {
            setFormData({
              customerId: data.customerId || "",
              propertyType: data.propertyType || "Residential",
              projectType: data.projectType || "New Installation",
              priority: data.priority || "Normal",
              estimatedInstallDate: data.estimatedInstallDate ? data.estimatedInstallDate.split('T')[0] : "",
              expirationDate: data.expirationDate ? data.expirationDate.split('T')[0] : "",
              installAddress: data.installAddress || "",
              notes: data.description || "",
            });
            setMeasurements({
              linearFeet: data.linearFeet || 0,
              pricePerLinearFoot: 0, // Reset to 0 so we don't double count if we load items
              height: data.height || 6,
              gateCount: data.gateCount || 0,
              gateWidth: data.gateWidth || 4,
              linePosts: data.linePosts || 0,
              cornerPosts: data.cornerPosts || 0,
              terminalPosts: data.terminalPosts || 0
            });
            
            // Map existing DB items to lineItems so user can edit them manually
            if (data.items && Array.isArray(data.items)) {
              setLineItems(data.items.map((it: any) => ({
                id: it.id,
                name: it.name,
                description: it.description || "",
                quantity: it.quantity,
                unitPrice: it.unitPrice,
              })));
            }
          }
        })
        .catch(e => console.error(e));
    }
  }, [estimateId]);

  // Handlers
  const handleMeasurementChange = (field: string, val: string) => {
    const value = parseFloat(val) || 0;
    setMeasurements(prev => {
      const next = { ...prev, [field]: value };
      if (field === 'linearFeet') {
        next.linePosts = Math.ceil(value / 8) - 1; // Basic estimation
        if (next.linePosts < 0) next.linePosts = 0;
      }
      return next;
    });
  };

  const handleLaborChange = (field: string, val: string) => {
    setLabor(prev => ({ ...prev, [field]: parseFloat(val) || 0 }));
  };

  const handleRailingsChange = (field: string, val: string) => {
    setRailings(prev => {
      const isNum = field === 'linearFeet' || field === 'pricePerFoot';
      return { ...prev, [field]: isNum ? parseFloat(val) || 0 : val };
    });
  };

  const addLineItem = () => setLineItems([...lineItems, { name: "", description: "", quantity: 1, unitPrice: 0 }]);
  const updateLineItem = (i: number, field: keyof LineItem, val: any) => {
    const updated = [...lineItems];
    (updated[i] as any)[field] = val;
    setLineItems(updated);
  };
  const removeLineItem = (i: number) => setLineItems(lineItems.filter((_, idx) => idx !== i));

  const handleSubmit = async (e: React.FormEvent, status: string = "DRAFT") => {
    e.preventDefault();
    if (!formData.customerId) { alert("Please select a customer"); return; }
    setLoading(true);

    try {
      const payload = {
        ...formData,
        ...measurements,
        ...labor,
        margin: 0, // No longer tracked as a separate % here since it's baked into unit prices
        subtotal: sellingPrice,
        totalAmount: sellingPrice, // final selling price
        status,
        items: allItems
      };

      const res = await fetch(`/api/estimates/${estimateId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        router.push("/dashboard/estimates");
        router.refresh();
      } else {
        alert("Error saving estimate");
      }
    } catch (e) {
      console.error(e);
      alert("Connection error");
    } finally {
      setLoading(false);
    }
  };

  // Fake print for PDF
  const handleGeneratePDF = () => {
    setIsPdfGenerating(true);
    setTimeout(() => {
      if (typeof window !== 'undefined' && navigator.userAgent.includes('Electron')) {
        window.postMessage({ type: 'electron-print' }, '*');
      } else {
        window.print();
      }
      setIsPdfGenerating(false);
    }, 500);
  };

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
      
      {/* LEFT COLUMN - FORM */}
      <div style={{ flex: '1', display: 'flex', flexDirection: 'column', gap: '2rem' }} className={isPdfGenerating ? 'hide-on-print' : ''}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#111827' }}>Edit Estimate</h1>
        </div>
        
        {/* 1. Cliente */}
        <section style={cardStyle}>
          <h2 style={sectionTitle}>Customer Information</h2>
          <div className="grid-responsive" style={{ gap: '1rem' }}>
            <div>
              <label style={labelStyle}>Select Customer *</label>
              <select required value={formData.customerId} onChange={(e) => setFormData({...formData, customerId: e.target.value})} style={inputStyle}>
                <option value="">-- Select --</option>
                {customers.map(c => <option key={c.id} value={c.id}>{c.name} {c.company ? `(${c.company})` : ''}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Installation Address</label>
              <input type="text" value={formData.installAddress} onChange={(e) => setFormData({...formData, installAddress: e.target.value})} style={inputStyle} placeholder="If different from billing" />
            </div>
          </div>
        </section>

        {/* 2. Detalles del Proyecto */}
        <section style={cardStyle}>
          <h2 style={sectionTitle}>Project Details</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
            <div>
              <label style={labelStyle}>Property Type</label>
              <select value={formData.propertyType} onChange={(e) => setFormData({...formData, propertyType: e.target.value})} style={inputStyle}>
                <option>Residential</option>
                <option>Commercial</option>
                <option>Industrial</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Project Type</label>
              <select value={formData.projectType} onChange={(e) => setFormData({...formData, projectType: e.target.value})} style={inputStyle}>
                <option>New Installation</option>
                <option>Replacement</option>
                <option>Repair</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Priority</label>
              <select value={formData.priority} onChange={(e) => setFormData({...formData, priority: e.target.value})} style={inputStyle}>
                <option>Low</option>
                <option>Normal</option>
                <option>High</option>
                <option>Urgent</option>
              </select>
            </div>
          </div>
        </section>

        {/* 3. Catálogo Visual (Simplificado) */}
        <section style={cardStyle}>
          <h2 style={sectionTitle}>Quick Material Catalog</h2>
          
          <div style={{ marginBottom: '0.5rem', fontWeight: 'bold', color: '#4b5563', fontSize: '0.875rem' }}>FENCES</div>
          <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '1rem', borderBottom: '1px solid #e5e7eb', marginBottom: '1rem' }}>
            {["Vinyl Fence", "Aluminum Fence", "Wood Fence", "Chain Link"].map(fence => (
              <div 
                key={fence} 
                onClick={() => setSelectedFence(selectedFence === fence ? null : fence)}
                style={{ 
                  padding: '1rem', minWidth: '130px', textAlign: 'center', cursor: 'pointer', borderRadius: '8px',
                  border: selectedFence === fence ? '2px solid #2563eb' : '1px solid #e5e7eb',
                  backgroundColor: selectedFence === fence ? '#eff6ff' : '#f9fafb',
                  fontWeight: selectedFence === fence ? 'bold' : 'normal',
                  fontSize: '0.875rem'
                }}
              >
                {fence}
              </div>
            ))}
          </div>

          <div style={{ marginBottom: '0.5rem', fontWeight: 'bold', color: '#4b5563', fontSize: '0.875rem' }}>RAILINGS</div>
          <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
            {["Aluminum Railing", "Metal Railing", "PVC Railing", "Custom Railing"].map(r => (
              <div 
                key={r} 
                onClick={() => setSelectedRailing(selectedRailing === r ? null : r)}
                style={{ 
                  padding: '1rem', minWidth: '130px', textAlign: 'center', cursor: 'pointer', borderRadius: '8px',
                  border: selectedRailing === r ? '2px solid #2563eb' : '1px solid #e5e7eb',
                  backgroundColor: selectedRailing === r ? '#eff6ff' : '#f9fafb',
                  fontWeight: selectedRailing === r ? 'bold' : 'normal',
                  fontSize: '0.875rem'
                }}
              >
                {r}
              </div>
            ))}
          </div>
        </section>

        {/* 4. Mediciones */}
        <section style={cardStyle}>
          <h2 style={sectionTitle}>Project Measurements</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
            <div><label style={labelStyle}>Linear Feet</label><input type="number" value={measurements.linearFeet || ""} onChange={(e) => handleMeasurementChange('linearFeet', e.target.value)} style={inputStyle} /></div>
            <div><label style={labelStyle}>Price per Linear Foot ($)</label><input type="number" value={measurements.pricePerLinearFoot || ""} onChange={(e) => handleMeasurementChange('pricePerLinearFoot', e.target.value)} style={{...inputStyle, borderColor: '#3b82f6', backgroundColor: '#eff6ff'}} /></div>
            <div><label style={labelStyle}>Height (ft)</label><input type="number" value={measurements.height || ""} onChange={(e) => handleMeasurementChange('height', e.target.value)} style={inputStyle} /></div>
            <div><label style={labelStyle}>Gate Count</label><input type="number" value={measurements.gateCount || ""} onChange={(e) => handleMeasurementChange('gateCount', e.target.value)} style={inputStyle} /></div>
            
            <div><label style={labelStyle}>Gate Width (ft)</label><input type="number" value={measurements.gateWidth || ""} onChange={(e) => handleMeasurementChange('gateWidth', e.target.value)} style={inputStyle} /></div>
            <div><label style={labelStyle}>Line Posts</label><input type="number" value={measurements.linePosts || ""} onChange={(e) => handleMeasurementChange('linePosts', e.target.value)} style={inputStyle} /></div>
            <div><label style={labelStyle}>Corner Posts</label><input type="number" value={measurements.cornerPosts || ""} onChange={(e) => handleMeasurementChange('cornerPosts', e.target.value)} style={inputStyle} /></div>
            <div><label style={labelStyle}>Terminal Posts</label><input type="number" value={measurements.terminalPosts || ""} onChange={(e) => handleMeasurementChange('terminalPosts', e.target.value)} style={inputStyle} /></div>
          </div>
        </section>

        {/* 5. Estimado de Railings (Reemplazó a Mano de Obra) */}
        <section style={cardStyle}>
          <h2 style={sectionTitle}>Railings Estimate</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
            <div>
              <label style={labelStyle}>Linear Feet</label>
              <input type="number" value={railings.linearFeet || ""} onChange={(e) => handleRailingsChange('linearFeet', e.target.value)} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Price per Foot ($)</label>
              <input type="number" value={railings.pricePerFoot || ""} onChange={(e) => handleRailingsChange('pricePerFoot', e.target.value)} style={{...inputStyle, borderColor: '#3b82f6', backgroundColor: '#eff6ff'}} />
            </div>
            <div>
              <label style={labelStyle}>Style</label>
              <input type="text" value={railings.style} onChange={(e) => handleRailingsChange('style', e.target.value)} style={inputStyle} placeholder="e.g. Glass, Picket" />
            </div>
            <div>
              <label style={labelStyle}>Color</label>
              <input type="text" value={railings.color} onChange={(e) => handleRailingsChange('color', e.target.value)} style={inputStyle} placeholder="e.g. Matte Black" />
            </div>
          </div>
        </section>

        {/* Adicionales (Custom Items) */}
        <section style={cardStyle}>
          <h2 style={sectionTitle}>Additional Items</h2>
          {lineItems.map((item, i) => (
            <div key={i} style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
              <input type="text" value={item.name} onChange={(e) => updateLineItem(i, 'name', e.target.value)} placeholder="Item" style={{...inputStyle, flex: 2}} />
              <input type="number" value={item.quantity} onChange={(e) => updateLineItem(i, 'quantity', e.target.value)} placeholder="Qty" style={{...inputStyle, width: '80px'}} />
              <input type="number" value={item.unitPrice} onChange={(e) => updateLineItem(i, 'unitPrice', e.target.value)} placeholder="Price" style={{...inputStyle, width: '100px'}} />
              <button type="button" onClick={() => removeLineItem(i)} style={{ color: 'red', background: 'none', border: 'none', cursor: 'pointer' }}>✖</button>
            </div>
          ))}
          <button type="button" onClick={addLineItem} style={{ color: '#2563eb', fontWeight: '500', background: 'none', border: 'none', cursor: 'pointer' }}>+ Add Custom Item</button>
        </section>
      </div>

      {/* RIGHT COLUMN - STICKY SUMMARY */}
      <div style={{ width: '400px', position: 'sticky', top: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ ...cardStyle, background: '#111827', color: 'white' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.5rem', color: 'white' }}>Billing Summary</h2>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', fontSize: '1.25rem', fontWeight: 'bold', color: '#10b981' }}>
            <span>Total Estimate:</span>
            <span>${sellingPrice.toFixed(2)}</span>
          </div>

          <div style={{ fontSize: '0.875rem', color: '#9ca3af', borderTop: '1px solid #374151', paddingTop: '1rem' }}>
            * Price includes materials, installation, labor, and margins based on the entered price per foot.
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <button onClick={(e) => handleSubmit(e, "SENT")} style={{ ...btnStyle, background: '#2563eb', color: 'white' }}>
            {loading ? 'Updating...' : 'Update & Approve'}
          </button>
          <button onClick={(e) => handleSubmit(e, "DRAFT")} style={{ ...btnStyle, background: 'white', border: '1px solid #d1d5db', color: '#374151' }}>
            Update as Draft
          </button>
          <button onClick={handleGeneratePDF} style={{ ...btnStyle, background: '#f3f4f6', color: '#374151' }}>
            🖨️ Generate Corporate PDF
          </button>
        </div>
      </div>

      {/* PRINT STYLES */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * { visibility: hidden; }
          #printable-pdf, #printable-pdf * { visibility: visible; }
          #printable-pdf { position: absolute; left: 0; top: 0; width: 100%; padding: 20px; }
          .hide-on-print { display: none !important; }
        }
      `}} />

      {/* HIDDEN PRINT TEMPLATE */}
      <div id="printable-pdf" style={{ display: isPdfGenerating ? 'block' : 'none', background: 'white', padding: '2rem', color: 'black' }}>
        <div style={{ borderBottom: '4px solid #111827', paddingBottom: '1rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: '900', margin: 0 }}>NJ FENCE & RAILING</h1>
            <p style={{ margin: 0, color: '#4b5563' }}>Professional Fencing Solutions</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0, color: '#2563eb' }}>PROPOSAL</h2>
            <p style={{ margin: 0 }}>Date: {new Date().toLocaleDateString()}</p>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '4rem', marginBottom: '2rem' }}>
          <div className="grid-responsive" style={{ gap: '2rem', marginBottom: '2rem', fontSize: '0.875rem' }}>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 'bold', borderBottom: '1px solid #e5e7eb', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Prepared For:</h3>
              {(() => {
                const c = customers.find(c => c.id === formData.customerId);
                return <p style={{ margin: 0 }}>Customer: {c ? `${c.name} ${c.company ? `(${c.company})` : ''}` : 'N/A'}</p>;
              })()}
              <p style={{ margin: 0 }}>Project Location: {formData.installAddress || 'N/A'}</p>
            </div>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 'bold', borderBottom: '1px solid #e5e7eb', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Project Specs:</h3>
              <p style={{ margin: 0 }}>Type: {formData.projectType}</p>
              
              {selectedFence && measurements.linearFeet > 0 && (
                <div style={{ marginTop: '0.5rem' }}>
                  <p style={{ margin: 0, fontWeight: 'bold' }}>Fence: {selectedFence}</p>
                  <p style={{ margin: 0 }}>Length: {measurements.linearFeet} ft | Height: {measurements.height} ft</p>
                  {measurements.gateCount > 0 && <p style={{ margin: 0 }}>Gates: {measurements.gateCount} ({measurements.gateWidth}ft wide)</p>}
                </div>
              )}

              {selectedRailing && railings.linearFeet > 0 && (
                <div style={{ marginTop: '0.5rem' }}>
                  <p style={{ margin: 0, fontWeight: 'bold' }}>Railing: {selectedRailing}</p>
                  <p style={{ margin: 0 }}>Length: {railings.linearFeet} ft</p>
                  {(railings.style || railings.color) && (
                    <p style={{ margin: 0 }}>Details: {railings.style} {railings.color ? `(${railings.color})` : ''}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '2rem' }}>
          <thead>
            <tr style={{ background: '#f3f4f6' }}>
              <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #d1d5db' }}>Description</th>
              <th style={{ padding: '0.75rem', textAlign: 'center', borderBottom: '2px solid #d1d5db' }}>Qty</th>
              <th style={{ padding: '0.75rem', textAlign: 'right', borderBottom: '2px solid #d1d5db' }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {allItems.map((i, idx) => (
              <tr key={idx}>
                <td style={{ padding: '0.75rem', borderBottom: '1px solid #e5e7eb' }}>{i.name} {i.description && <span style={{color: 'gray', fontSize: '0.875rem'}}>({i.description})</span>}</td>
                <td style={{ padding: '0.75rem', textAlign: 'center', borderBottom: '1px solid #e5e7eb' }}>{i.quantity}</td>
                <td style={{ padding: '0.75rem', textAlign: 'right', borderBottom: '1px solid #e5e7eb' }}>${(i.quantity * i.unitPrice).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '4rem' }}>
          <div style={{ width: '300px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', fontWeight: 'bold', fontSize: '1.25rem', borderTop: '2px solid black' }}>
              <span>TOTAL ESTIMATE:</span>
              <span>${sellingPrice.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div style={{ border: '1px solid #d1d5db', padding: '1rem', borderRadius: '4px', marginBottom: '2rem', fontSize: '0.875rem' }}>
          <strong>Terms & Conditions:</strong>
          <p style={{ margin: '0.5rem 0 0 0' }}>This proposal is valid for 30 days. 50% deposit required to schedule installation. Final payment due upon completion. Dig Safe will be notified before any excavation. We are not responsible for private underground utilities (sprinklers, invisible fences, etc) unless explicitly marked by the owner.</p>
        </div>

        <div style={{ display: 'flex', gap: '4rem' }}>
          <div style={{ flex: 1, borderTop: '1px solid black', paddingTop: '0.5rem' }}>
            <strong>Authorized Signature (NJ Fence)</strong>
          </div>
          <div style={{ flex: 1, borderTop: '1px solid black', paddingTop: '0.5rem' }}>
            <strong>Customer Acceptance Signature</strong><br/>
            <span style={{ fontSize: '0.75rem', color: 'gray' }}>Date: _______________</span>
          </div>
        </div>
      </div>

    </div>
  );
}

// --- Styles ---
const cardStyle = {
  backgroundColor: 'white',
  padding: '2rem',
  borderRadius: '8px',
  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  border: '1px solid #e5e7eb'
};

const sectionTitle = {
  fontSize: '1.25rem',
  fontWeight: '600',
  marginBottom: '1.5rem',
  color: '#111827',
  borderBottom: '1px solid #e5e7eb',
  paddingBottom: '0.75rem'
};

const labelStyle = {
  display: 'block',
  fontSize: '0.875rem',
  fontWeight: '500',
  color: '#374151',
  marginBottom: '0.5rem'
};

const inputStyle = {
  width: '100%',
  padding: '0.75rem',
  border: '1px solid #d1d5db',
  borderRadius: '6px',
  backgroundColor: 'white',
  fontSize: '0.875rem'
};

const btnStyle = {
  width: '100%',
  padding: '1rem',
  borderRadius: '6px',
  fontWeight: '600',
  cursor: 'pointer',
  textAlign: 'center' as const,
  border: 'none',
  fontSize: '1rem'
};
