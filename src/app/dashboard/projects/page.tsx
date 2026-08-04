"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import DeleteButton from "@/components/DeleteButton";

type Project = {
  id: string;
  jobType: string;
  address: string;
  status: string;
  customer: {
    name: string;
    company: string | null;
  };
  assignedTeam: string | null;
  startDate: string | null;
};

const COLUMNS = [
  { id: "NEW_LEAD", label: "Leads / New" },
  { id: "PLANNING", label: "Planning & Permits" },
  { id: "SCHEDULED", label: "Scheduled" },
  { id: "IN_PROGRESS", label: "In Progress" },
  { id: "COMPLETED", label: "Completed" },
];

export default function ProjectsKanbanPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/projects")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setProjects(data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleDragStart = (e: React.DragEvent, projectId: string) => {
    e.dataTransfer.setData("projectId", projectId);
  };

  const handleDrop = async (e: React.DragEvent, status: string) => {
    e.preventDefault();
    const projectId = e.dataTransfer.getData("projectId");
    if (!projectId) return;

    // Optimistic UI update
    setProjects(prev => prev.map(p => p.id === projectId ? { ...p, status } : p));

    // Server update
    try {
      await fetch(`/api/projects/${projectId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  if (loading) return <div style={{ padding: '2rem' }}>Loading Projects...</div>;

  return (
    <div style={{ padding: '2rem', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>Projects Board</h1>
      </div>

      <div style={{ display: 'flex', gap: '1rem', flex: 1, overflowX: 'auto', paddingBottom: '1rem' }}>
        {COLUMNS.map(col => {
          const colProjects = projects.filter(p => p.status === col.id);
          
          return (
            <div 
              key={col.id} 
              onDrop={(e) => handleDrop(e, col.id)}
              onDragOver={handleDragOver}
              style={{
                flex: '0 0 300px',
                background: '#f3f4f6',
                borderRadius: '8px',
                padding: '1rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                border: '1px solid #e5e7eb'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontWeight: 'bold', color: '#374151', textTransform: 'uppercase', fontSize: '0.875rem' }}>
                  {col.label}
                </h3>
                <span style={{ background: '#e5e7eb', padding: '0.1rem 0.5rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                  {colProjects.length}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', minHeight: '100px' }}>
                {colProjects.map(p => (
                  <div
                    key={p.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, p.id)}
                    onClick={() => router.push(`/dashboard/projects/${p.id}`)}
                    style={{
                      background: 'white',
                      padding: '1rem',
                      borderRadius: '6px',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                      border: '1px solid #d1d5db',
                      cursor: 'grab',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.5rem'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ fontWeight: '600', color: '#111827' }}>{p.customer?.name}</div>
                      <DeleteButton id={p.id} endpoint="projects" itemName="Project" onSuccess={() => setProjects(prev => prev.filter(proj => proj.id !== p.id))} />
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#4b5563' }}>{p.address}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                      <span style={{ fontSize: '0.75rem', background: '#dbeafe', color: '#1d4ed8', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
                        {p.jobType}
                      </span>
                      {p.assignedTeam && (
                        <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                          👷 {p.assignedTeam}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
