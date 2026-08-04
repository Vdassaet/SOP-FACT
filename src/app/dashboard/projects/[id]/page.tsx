"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

type ProjectData = {
  id: string;
  jobType: string;
  address: string;
  status: string;
  assignedTeam: string | null;
  startDate: string | null;
  estimatedEnd: string | null;
  customer: {
    name: string;
    phone: string | null;
    email: string | null;
  };
  estimate: {
    items: Array<{
      id: string;
      name: string;
      description: string;
      quantity: number;
    }>;
  } | null;
};

const STATUS_OPTIONS = [
  { id: "NEW_LEAD", label: "Leads / New" },
  { id: "PLANNING", label: "Planning & Permits" },
  { id: "SCHEDULED", label: "Scheduled" },
  { id: "IN_PROGRESS", label: "In Progress" },
  { id: "COMPLETED", label: "Completed" },
];

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  
  const [project, setProject] = useState<ProjectData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Edit fields
  const [assignedTeam, setAssignedTeam] = useState("");
  const [startDate, setStartDate] = useState("");
  const [estimatedEnd, setEstimatedEnd] = useState("");

  useEffect(() => {
    fetch(`/api/projects/${projectId}`)
      .then(res => res.json())
      .then(data => {
        if (!data.error) {
          setProject(data);
          setAssignedTeam(data.assignedTeam || "");
          setStartDate(data.startDate ? data.startDate.split('T')[0] : "");
          setEstimatedEnd(data.estimatedEnd ? data.estimatedEnd.split('T')[0] : "");
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [projectId]);

  const handleUpdate = async () => {
    setSaving(true);
    try {
      await fetch(`/api/projects/${projectId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assignedTeam,
          startDate,
          estimatedEnd
        })
      });
      alert("Project details updated successfully");
    } catch (err) {
      console.error(err);
      alert("Failed to update project");
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    try {
      await fetch(`/api/projects/${projectId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
      setProject(prev => prev ? { ...prev, status: newStatus } : null);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div style={{ padding: '2rem' }}>Loading Project...</div>;
  if (!project) return <div style={{ padding: '2rem' }}>Project Not Found</div>;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 0' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <Link href="/dashboard/projects" style={{ color: '#6b7280', textDecoration: 'none', fontSize: '0.875rem', display: 'block', marginBottom: '0.5rem' }}>
            &larr; Back to Projects Board
          </Link>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', margin: '0 0 0.5rem 0' }}>{project.customer.name} - {project.jobType}</h1>
          <p style={{ color: '#4b5563', margin: 0, fontSize: '1.125rem' }}>📍 {project.address}</p>
        </div>
        
        {/* Status Switcher */}
        <div style={{ display: 'flex', gap: '0.5rem', background: '#f3f4f6', padding: '0.5rem', borderRadius: '8px' }}>
          {STATUS_OPTIONS.map(status => (
            <button
              key={status.id}
              onClick={() => handleStatusChange(status.id)}
              style={{
                padding: '0.5rem 1rem',
                border: 'none',
                borderRadius: '6px',
                fontWeight: '600',
                cursor: 'pointer',
                background: project.status === status.id ? '#2563eb' : 'transparent',
                color: project.status === status.id ? 'white' : '#4b5563',
              }}
            >
              {status.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
        
        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Customer Details */}
          <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>Customer Details</h2>
            <p style={{ margin: '0 0 0.5rem 0', fontWeight: '500' }}>{project.customer.name}</p>
            <p style={{ margin: '0 0 0.5rem 0', color: '#4b5563' }}>📞 {project.customer.phone || 'N/A'}</p>
            <p style={{ margin: '0 0 0.5rem 0', color: '#4b5563' }}>✉️ {project.customer.email || 'N/A'}</p>
          </div>

          {/* Schedule & Crew */}
          <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Schedule & Crew</h2>
            
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>Assigned Crew / Team</label>
              <input 
                type="text" 
                value={assignedTeam} 
                onChange={(e) => setAssignedTeam(e.target.value)} 
                placeholder="e.g. Crew A, John & Mike" 
                style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '6px' }}
              />
            </div>
            
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>Start Date</label>
              <input 
                type="date" 
                value={startDate} 
                onChange={(e) => setStartDate(e.target.value)} 
                style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '6px' }}
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>Estimated End Date</label>
              <input 
                type="date" 
                value={estimatedEnd} 
                onChange={(e) => setEstimatedEnd(e.target.value)} 
                style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '6px' }}
              />
            </div>

            <button 
              onClick={handleUpdate} 
              disabled={saving}
              style={{ width: '100%', padding: '0.75rem', background: '#10b981', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
            >
              {saving ? 'Saving...' : 'Save Schedule'}
            </button>
          </div>

        </div>

        {/* Right Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Material Checklist */}
          <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>Material Checklist (From Estimate)</h2>
            
            {project.estimate && project.estimate.items && project.estimate.items.length > 0 ? (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #e5e7eb', textAlign: 'left' }}>
                    <th style={{ padding: '0.75rem 0', color: '#6b7280' }}>Load?</th>
                    <th style={{ padding: '0.75rem 0', color: '#6b7280' }}>Item</th>
                    <th style={{ padding: '0.75rem 0', color: '#6b7280' }}>Description</th>
                    <th style={{ padding: '0.75rem 0', textAlign: 'center', color: '#6b7280' }}>Qty</th>
                  </tr>
                </thead>
                <tbody>
                  {project.estimate.items.map(item => (
                    <tr key={item.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                      <td style={{ padding: '1rem 0' }}>
                        <input type="checkbox" style={{ width: '1.25rem', height: '1.25rem' }} />
                      </td>
                      <td style={{ padding: '1rem 0', fontWeight: '500' }}>{item.name}</td>
                      <td style={{ padding: '1rem 0', color: '#6b7280', fontSize: '0.875rem' }}>{item.description}</td>
                      <td style={{ padding: '1rem 0', textAlign: 'center', fontWeight: 'bold' }}>{item.quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280', background: '#f9fafb', borderRadius: '6px' }}>
                No materials found. This project might not be linked to an estimate.
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
