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

type RailingItem = {
  id: string;
  location: string;
  linearFeet: number;
  pricePerFoot: number;
  style: string;
  color: string;
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
  const [railingImage, setRailingImage] = useState<string>("");

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

  // Railings Data (Multi-section / Multi-house support)
  const [railingsList, setRailingsList] = useState<RailingItem[]>([
    { id: "1", location: "", linearFeet: 0, pricePerFoot: 0, style: "", color: "" }
  ]);

  // Selected Catalog Items
  const [selectedFence, setSelectedFence] = useState<string | null>(null);
  const [selectedRailing, setSelectedRailing] = useState<string | null>(null);
  
  // Custom Line Items (Additional)
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [dataLoaded, setDataLoaded] = useState(false);

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

    // --- RAILINGS LOGIC (Multi-section / Multi-house) ---
    railingsList.forEach((r) => {
      if (r.linearFeet > 0 && r.pricePerFoot > 0) {
        let baseName = selectedRailing || "Aluminum Railing";
        let rName = baseName;
        if (r.location && r.location.trim()) {
          rName += ` - ${r.location.trim()}`;
        }
        if (r.color && r.color.trim()) {
          rName += ` [${r.color.trim()}]`;
        }

        let rDesc = "";
        if (r.style && r.style.trim()) {
          rDesc = `Style: ${r.style.trim()}`;
        }

        items.push({
          name: rName,
          description: rDesc || "Included",
          quantity: r.linearFeet,
          unitPrice: r.pricePerFoot
        });
      }
    });

    return items;
  }, [selectedFence, selectedRailing, measurements, railingsList]);

  const allItems = [...autoCalculatedItems, ...lineItems];
  
  // Total is simply the sum of all items (fence + railings + custom items)
  // The user inputs prices that ALREADY include their margin and labor.
  const sellingPrice = allItems.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);

  // Fake print for PDF
  const handleGeneratePDF = () => {
    if (typeof window !== 'undefined' && (window as any).electronAPI?.isElectron) {
      (window as any).electronAPI.printPDF();
    } else {
      window.print();
    }
  };

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
            let parsedNotes = data.description || "";
            let parsedImage = "";
            let parsed: any = {};
            try {
              if (data.description && (data.description.startsWith("{") || data.description.startsWith("["))) {
                parsed = JSON.parse(data.description);
                if (parsed && typeof parsed === "object") {
                  parsedNotes = parsed.notes || "";
                  parsedImage = parsed.railingImage || "";
                  if (Array.isArray(parsed.railingsList) && parsed.railingsList.length > 0) {
                    setRailingsList(parsed.railingsList);
                  }
                }
              } else if (data.description && data.description.startsWith("data:image")) {
                parsedImage = data.description;
                parsedNotes = "";
              }
            } catch {
              parsedNotes = data.description || "";
            }

            if (parsedImage) {
              setRailingImage(parsedImage);
            }

            // Restore catalog selections and detect from items if legacy
            let detectedFence = parsed.selectedFence || null;
            let detectedRailing = parsed.selectedRailing || null;
            let detectedPricePerFoot = typeof parsed.pricePerLinearFoot === "number" ? parsed.pricePerLinearFoot : 0;

            if (data.items && Array.isArray(data.items)) {
              if (!detectedFence) {
                const fItem = data.items.find((it: any) =>
                  ["vinyl fence", "aluminum fence", "wood fence", "chain link"].some(f => (it.name || "").toLowerCase().includes(f))
                );
                if (fItem) {
                  const n = fItem.name.toLowerCase();
                  if (n.includes("vinyl")) detectedFence = "Vinyl Fence";
                  else if (n.includes("aluminum")) detectedFence = "Aluminum Fence";
                  else if (n.includes("wood")) detectedFence = "Wood Fence";
                  else if (n.includes("chain link")) detectedFence = "Chain Link";
                  if (!detectedPricePerFoot && fItem.unitPrice > 0) {
                    detectedPricePerFoot = fItem.unitPrice;
                  }
                }
              }
              if (!detectedRailing) {
                const rItem = data.items.find((it: any) =>
                  ["aluminum railing", "metal railing", "pvc railing", "custom railing"].some(r => (it.name || "").toLowerCase().includes(r))
                );
                if (rItem) {
                  const n = rItem.name.toLowerCase();
                  if (n.includes("aluminum")) detectedRailing = "Aluminum Railing";
                  else if (n.includes("metal")) detectedRailing = "Metal Railing";
                  else if (n.includes("pvc")) detectedRailing = "PVC Railing";
                  else if (n.includes("custom")) detectedRailing = "Custom Railing";
                }
              }
            }

            if (detectedFence) setSelectedFence(detectedFence);
            if (detectedRailing) setSelectedRailing(detectedRailing);

            setFormData({
              customerId: data.customerId || "",
              propertyType: data.propertyType || "Residential",
              projectType: data.projectType || "New Installation",
              priority: data.priority || "Normal",
              estimatedInstallDate: data.estimatedInstallDate ? data.estimatedInstallDate.split('T')[0] : "",
              expirationDate: data.expirationDate ? data.expirationDate.split('T')[0] : "",
              installAddress: data.installAddress || "",
              notes: parsedNotes,
            });

            setMeasurements({
              linearFeet: data.linearFeet || 0,
              pricePerLinearFoot: detectedPricePerFoot,
              height: data.height || 6,
              gateCount: data.gateCount || 0,
              gateWidth: data.gateWidth || 4,
              linePosts: data.linePosts || 0,
              cornerPosts: data.cornerPosts || 0,
              terminalPosts: data.terminalPosts || 0
            });
            
            // Map custom line items WITHOUT duplicating auto-calculated items
            let loadedCustomItems: LineItem[] = [];
            if (Array.isArray(parsed.customLineItems)) {
              loadedCustomItems = parsed.customLineItems;
            } else if (data.items && Array.isArray(data.items)) {
              const hasRailings = Array.isArray(parsed.railingsList) && parsed.railingsList.length > 0;
              const hasFence = Boolean(detectedFence || (data.linearFeet && data.linearFeet > 0));

              loadedCustomItems = data.items.filter((it: any) => {
                const nameLower = (it.name || "").toLowerCase();
                // Filter out railing items generated automatically
                if (hasRailings) {
                  if (nameLower.includes("railing")) return false;
                  if (parsed.railingsList.some((r: any) => r.location && it.name.includes(r.location))) return false;
                }
                // Filter out fence items generated automatically
                if (hasFence) {
                  if (["vinyl fence", "aluminum fence", "wood fence", "chain link"].some(f => nameLower.includes(f))) return false;
                  if (nameLower.endsWith("posts")) return false;
                  if (nameLower.includes("gate") && (it.description === "Included" || it.description === "Gates")) return false;
                }
                return true;
              }).map((it: any) => ({
                id: it.id,
                name: it.name,
                description: it.description || "",
                quantity: it.quantity,
                unitPrice: it.unitPrice,
              }));
            }

            setLineItems(loadedCustomItems);
            setDataLoaded(true);
          }
        })
        .catch(e => console.error(e));
    }
  }, [estimateId]);

  // Auto-print if opened with ?print=true
  useEffect(() => {
    if (dataLoaded && typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get("print") === "true") {
        const timer = setTimeout(() => {
          handleGeneratePDF();
        }, 500);
        return () => clearTimeout(timer);
      }
    }
  }, [dataLoaded]);

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

  const handleRailingChange = (id: string, field: keyof RailingItem, val: string) => {
    setRailingsList(prev => prev.map(item => {
      if (item.id === id) {
        const isNum = field === 'linearFeet' || field === 'pricePerFoot';
        return { ...item, [field]: isNum ? parseFloat(val) || 0 : val };
      }
      return item;
    }));
  };

  const addRailingSection = () => {
    setRailingsList(prev => [
      ...prev,
      {
        id: Math.random().toString(36).substring(2, 9),
        location: "",
        linearFeet: 0,
        pricePerFoot: prev[prev.length - 1]?.pricePerFoot || 0,
        style: prev[prev.length - 1]?.style || "",
        color: prev[prev.length - 1]?.color || ""
      }
    ]);
  };

  const removeRailingSection = (id: string) => {
    if (railingsList.length === 1) {
      setRailingsList([{ id: "1", location: "", linearFeet: 0, pricePerFoot: 0, style: "", color: "" }]);
      return;
    }
    setRailingsList(prev => prev.filter(item => item.id !== id));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Optimize to max 1000px dimension and convert to JPEG for crisp printing with minimal payload
        const maxDim = 1000;
        let width = img.width;
        let height = img.height;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL("image/jpeg", 0.85);
          setRailingImage(compressed);
        } else {
          setRailingImage(event.target?.result as string);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
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
      const descriptionPayload = JSON.stringify({
        notes: formData.notes || "",
        railingImage: railingImage,
        railingsList: railingsList,
        selectedFence: selectedFence,
        selectedRailing: selectedRailing,
        pricePerLinearFoot: measurements.pricePerLinearFoot,
        customLineItems: lineItems
      });

      const payload = {
        ...formData,
        description: descriptionPayload,
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

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
      
      {/* LEFT COLUMN - FORM */}
      <div style={{ flex: '1', display: 'flex', flexDirection: 'column', gap: '2rem' }} className="hide-on-print">
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
            <div><label style={labelStyle}>Linear Feet</label><input type="number" step="any" value={measurements.linearFeet || ""} onChange={(e) => handleMeasurementChange('linearFeet', e.target.value)} style={inputStyle} /></div>
            <div><label style={labelStyle}>Price per Linear Foot ($)</label><input type="number" step="any" value={measurements.pricePerLinearFoot || ""} onChange={(e) => handleMeasurementChange('pricePerLinearFoot', e.target.value)} style={{...inputStyle, borderColor: '#3b82f6', backgroundColor: '#eff6ff'}} /></div>
            <div><label style={labelStyle}>Height (ft)</label><input type="number" step="any" value={measurements.height || ""} onChange={(e) => handleMeasurementChange('height', e.target.value)} style={inputStyle} /></div>
            <div><label style={labelStyle}>Gate Count</label><input type="number" step="any" value={measurements.gateCount || ""} onChange={(e) => handleMeasurementChange('gateCount', e.target.value)} style={inputStyle} /></div>
            
            <div><label style={labelStyle}>Gate Width (ft)</label><input type="number" step="any" value={measurements.gateWidth || ""} onChange={(e) => handleMeasurementChange('gateWidth', e.target.value)} style={inputStyle} /></div>
            <div><label style={labelStyle}>Line Posts</label><input type="number" step="any" value={measurements.linePosts || ""} onChange={(e) => handleMeasurementChange('linePosts', e.target.value)} style={inputStyle} /></div>
            <div><label style={labelStyle}>Corner Posts</label><input type="number" step="any" value={measurements.cornerPosts || ""} onChange={(e) => handleMeasurementChange('cornerPosts', e.target.value)} style={inputStyle} /></div>
            <div><label style={labelStyle}>Terminal Posts</label><input type="number" step="any" value={measurements.terminalPosts || ""} onChange={(e) => handleMeasurementChange('terminalPosts', e.target.value)} style={inputStyle} /></div>
          </div>
        </section>

        {/* 5. Railings Estimate (Multi-section / Multi-house support) */}
        <section style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid #e5e7eb', paddingBottom: '0.75rem' }}>
            <div>
              <h2 style={{ ...sectionTitle, borderBottom: 'none', paddingBottom: 0, marginBottom: '0.25rem' }}>
                Railings Estimate
              </h2>
              <p style={{ margin: 0, fontSize: '0.8125rem', color: '#6b7280' }}>
                Add multiple railing lines for different houses, locations, or sections.
              </p>
            </div>
            <button
              type="button"
              onClick={addRailingSection}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                color: '#2563eb',
                backgroundColor: '#eff6ff',
                border: '1px solid #bfdbfe',
                borderRadius: '6px',
                padding: '0.5rem 1rem',
                fontSize: '0.875rem',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              + Add Railing / House
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {railingsList.map((item, idx) => (
              <div 
                key={item.id} 
                style={{ 
                  backgroundColor: '#f9fafb', 
                  border: '1px solid #e5e7eb', 
                  borderRadius: '8px', 
                  padding: '1rem',
                  position: 'relative'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontSize: '0.8125rem', fontWeight: '700', color: '#1f2937', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Railing #{idx + 1} {item.location ? `— ${item.location}` : ''}
                    </span>
                    {item.linearFeet > 0 && item.pricePerFoot > 0 && (
                      <span style={{ fontSize: '0.8125rem', fontWeight: 'bold', color: '#059669', backgroundColor: '#d1fae5', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                        ${(item.linearFeet * item.pricePerFoot).toFixed(2)}
                      </span>
                    )}
                  </div>
                  {railingsList.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeRailingSection(item.id)}
                      style={{ color: '#dc2626', background: 'none', border: 'none', fontSize: '0.8125rem', cursor: 'pointer', fontWeight: '500' }}
                    >
                      ✕ Remove
                    </button>
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem' }}>
                  <div>
                    <label style={labelStyle}>House / Location</label>
                    <input 
                      type="text" 
                      value={item.location} 
                      onChange={(e) => handleRailingChange(item.id, 'location', e.target.value)} 
                      style={inputStyle} 
                      placeholder="e.g. House 1, Front Porch" 
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Linear Feet</label>
                    <input 
                      type="number" 
                      step="any" 
                      value={item.linearFeet || ""} 
                      onChange={(e) => handleRailingChange(item.id, 'linearFeet', e.target.value)} 
                      style={inputStyle} 
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Price per Foot ($)</label>
                    <input 
                      type="number" 
                      step="any" 
                      value={item.pricePerFoot || ""} 
                      onChange={(e) => handleRailingChange(item.id, 'pricePerFoot', e.target.value)} 
                      style={{...inputStyle, borderColor: '#3b82f6', backgroundColor: '#ffffff'}} 
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Style</label>
                    <input 
                      type="text" 
                      value={item.style} 
                      onChange={(e) => handleRailingChange(item.id, 'style', e.target.value)} 
                      style={inputStyle} 
                      placeholder="e.g. Glass, Horizontal" 
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Color</label>
                    <input 
                      type="text" 
                      value={item.color} 
                      onChange={(e) => handleRailingChange(item.id, 'color', e.target.value)} 
                      style={inputStyle} 
                      placeholder="e.g. Matte Black" 
                    />
                  </div>
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={addRailingSection}
              style={{
                alignSelf: 'flex-start',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: '#2563eb',
                backgroundColor: 'white',
                border: '1px dashed #93c5fd',
                borderRadius: '6px',
                padding: '0.625rem 1rem',
                fontSize: '0.875rem',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              + Add Another Railing / House
            </button>
          </div>
        </section>

        {/* 5b. Foto del Estilo de Barandilla */}
        <section style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ ...sectionTitle, borderBottom: 'none', paddingBottom: 0, marginBottom: 0 }}>
              Railing Style Image (PDF Reference)
            </h2>
            {railingImage && (
              <button 
                type="button" 
                onClick={() => setRailingImage("")}
                style={{ color: '#dc2626', background: 'none', border: 'none', fontSize: '0.875rem', cursor: 'pointer', fontWeight: '500' }}
              >
                ✕ Remove Image
              </button>
            )}
          </div>

          {!railingImage ? (
            <div style={{
              border: '2px dashed #d1d5db',
              borderRadius: '8px',
              padding: '1.25rem',
              textAlign: 'center',
              backgroundColor: '#f9fafb'
            }}>
              <input 
                type="file" 
                id="railing-image-upload" 
                accept="image/*" 
                style={{ display: 'none' }} 
                onChange={handleImageUpload} 
              />
              <label 
                htmlFor="railing-image-upload" 
                style={{ 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  gap: '0.5rem', 
                  backgroundColor: '#2563eb', 
                  color: 'white', 
                  padding: '0.625rem 1.25rem', 
                  borderRadius: '6px', 
                  fontWeight: '600', 
                  fontSize: '0.875rem', 
                  cursor: 'pointer',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                }}
              >
                📷 Add Style Image
              </label>
              <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.75rem', color: '#6b7280' }}>
                Upload an image of the railing style. It will appear at the end of the proposal PDF in a clean, professional size.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', backgroundColor: '#f9fafb', padding: '1rem', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={railingImage} 
                alt="Railing style preview" 
                style={{ height: '80px', width: 'auto', maxWidth: '120px', objectFit: 'contain', borderRadius: '4px', border: '1px solid #d1d5db', backgroundColor: 'white' }} 
              />
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontWeight: '600', fontSize: '0.875rem', color: '#111827' }}>
                  {railingsList.find(r => r.style)?.style ? `Style: ${railingsList.find(r => r.style)?.style}` : "Railing style selected"}
                </p>
                <p style={{ margin: '0.25rem 0 0.5rem 0', fontSize: '0.75rem', color: '#4b5563' }}>
                  ✓ Included at the end of the proposal PDF.
                </p>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <input 
                    type="file" 
                    id="railing-image-change" 
                    accept="image/*" 
                    style={{ display: 'none' }} 
                    onChange={handleImageUpload} 
                  />
                  <label 
                    htmlFor="railing-image-change" 
                    style={{ fontSize: '0.8125rem', color: '#2563eb', cursor: 'pointer', fontWeight: '500', textDecoration: 'underline' }}
                  >
                    Change Image
                  </label>
                  <button 
                    type="button" 
                    onClick={() => setRailingImage("")}
                    style={{ fontSize: '0.8125rem', color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '500' }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Adicionales (Custom Items) */}
        <section style={cardStyle}>
          <h2 style={sectionTitle}>Additional Items</h2>
          {lineItems.map((item, i) => (
            <div key={i} style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
              <input type="text" value={item.name} onChange={(e) => updateLineItem(i, 'name', e.target.value)} placeholder="Item" style={{...inputStyle, flex: 2}} />
              <input type="number" step="any" value={item.quantity} onChange={(e) => updateLineItem(i, 'quantity', e.target.value)} placeholder="Qty (FT)" style={{...inputStyle, width: '80px'}} />
              <input type="number" step="any" value={item.unitPrice} onChange={(e) => updateLineItem(i, 'unitPrice', e.target.value)} placeholder="Price" style={{...inputStyle, width: '100px'}} />
              <button type="button" onClick={() => removeLineItem(i)} style={{ color: 'red', background: 'none', border: 'none', cursor: 'pointer' }}>✖</button>
            </div>
          ))}
          <button type="button" onClick={addLineItem} style={{ color: '#2563eb', fontWeight: '500', background: 'none', border: 'none', cursor: 'pointer' }}>+ Add Custom Item</button>
        </section>
      </div>

      {/* RIGHT COLUMN - STICKY SUMMARY */}
      <div style={{ width: '400px', position: 'sticky', top: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }} className="hide-on-print">
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

          {railingImage ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.625rem 0.75rem', background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '6px', fontSize: '0.8125rem', color: '#065f46' }}>
              <span>📷 Style image attached</span>
              <button type="button" onClick={() => setRailingImage("")} style={{ marginLeft: 'auto', color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
            </div>
          ) : (
            <div>
              <input 
                type="file" 
                id="summary-railing-upload" 
                accept="image/*" 
                style={{ display: 'none' }} 
                onChange={handleImageUpload} 
              />
              <label 
                htmlFor="summary-railing-upload" 
                style={{ ...btnStyle, display: 'block', background: 'white', border: '1px dashed #9ca3af', color: '#374151', fontSize: '0.875rem', padding: '0.75rem', cursor: 'pointer' }}
              >
                + Add Style Image to PDF
              </label>
            </div>
          )}
        </div>
      </div>

      {/* PRINT STYLES */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          html, body {
            color-scheme: light !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .hide-on-print { display: none !important; }
        }
      `}} />

      {/* HIDDEN PRINT TEMPLATE */}
      <div id="printable-pdf" className="print-only-block" style={{ background: 'white', padding: '2rem', color: 'black', position: 'absolute', left: 0, top: 0, width: '100%' }}>
        <img src="/logo-watermark.jpg" alt="" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '600px', maxWidth: '80%', height: 'auto', opacity: 0.1, zIndex: 0, pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
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
            {allItems.map((i, idx) => (
              <tr key={idx}>
                <td style={{ padding: '0.75rem', borderBottom: '1px solid #e5e7eb' }}>{i.name} {i.description && <span style={{color: 'gray', fontSize: '0.875rem'}}>({i.description})</span>}</td>
                <td style={{ padding: '0.75rem', textAlign: 'center', borderBottom: '1px solid #e5e7eb' }}>{i.quantity}</td>
                <td style={{ padding: '0.75rem', textAlign: 'right', borderBottom: '1px solid #e5e7eb' }}>${(i.quantity * i.unitPrice).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '2rem' }}>
          <div style={{ width: '300px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', fontWeight: 'bold', fontSize: '1.25rem', borderTop: '2px solid black' }}>
              <span>TOTAL ESTIMATE:</span>
              <span>${sellingPrice.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div style={{ border: '1px solid #d1d5db', padding: '1rem', borderRadius: '4px', marginBottom: railingImage ? '1.25rem' : '2rem', fontSize: '0.875rem' }}>
          <strong>Terms & Conditions:</strong>
          <p style={{ margin: '0.5rem 0 0 0' }}>This proposal is valid for 30 days.</p>
        </div>

        {/* Selected Railing Style Reference Image & Section Breakdown */}
        {(railingImage || railingsList.some(r => r.linearFeet > 0)) && (
          <div style={{ 
            border: '1px solid #e5e7eb', 
            borderRadius: '6px', 
            padding: '1rem', 
            backgroundColor: '#ffffff',
            pageBreakInside: 'avoid'
          }}>
            {railingImage && (
              <div style={{ marginBottom: railingsList.some(r => r.linearFeet > 0) ? '0.75rem' : '0' }}>
                <span style={{ 
                  fontSize: '0.75rem', 
                  fontWeight: 'bold', 
                  textTransform: 'uppercase', 
                  letterSpacing: '0.05em', 
                  color: '#4b5563',
                  display: 'block',
                  marginBottom: '0.35rem'
                }}>
                  Railing Style Reference
                </span>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={railingImage} 
                  alt="Railing Style Reference" 
                  style={{ 
                    maxHeight: '120px', 
                    maxWidth: '190px', 
                    objectFit: 'contain', 
                    borderRadius: '4px', 
                    border: '1px solid #d1d5db',
                    padding: '2px',
                    backgroundColor: 'white'
                  }} 
                />
              </div>
            )}

            {railingsList.some(r => r.linearFeet > 0) && (
              <div style={{ 
                borderTop: railingImage ? '1px solid #e5e7eb' : 'none', 
                paddingTop: railingImage ? '0.75rem' : '0',
                fontSize: '0.8125rem',
                color: '#111827'
              }}>
                <p style={{ margin: '0 0 0.4rem 0', fontWeight: 'bold', fontSize: '0.875rem' }}>
                  Railing: {selectedRailing || 'Aluminum Railing'}
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
        )}

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
