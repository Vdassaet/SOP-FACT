import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";

export default async function SettingsPage() {
  const session = await getServerSession();
  
  if (!session?.user?.email) {
    return <div>No autenticado</div>;
  }

  let dbUser = null;
  try {
    dbUser = await prisma.user.findUnique({
      where: { email: session.user.email }
    });
  } catch(e) {
    console.error(e);
  }

  // Use the session user if DB is not connected (demo mode)
  const displayUser = dbUser || session.user;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#111827', marginBottom: '2rem' }}>Profile Settings</h1>
      
      <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', marginBottom: '2rem' }}>
          <div style={{ width: '100px', height: '100px', borderRadius: '50%', backgroundColor: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
            {(displayUser as any).photoUrl || (displayUser as any).image ? (
              <img src={(displayUser as any).photoUrl || (displayUser as any).image} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span style={{ fontSize: '2rem', color: '#9ca3af' }}>{displayUser.name?.charAt(0) || 'U'}</span>
            )}
          </div>
          <div>
            <button style={{ backgroundColor: '#f3f4f6', border: '1px solid #d1d5db', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer', fontWeight: '500' }}>
              Change Photo
            </button>
          </div>
        </div>

        <form style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>Full Name</label>
              <input 
                type="text" 
                defaultValue={displayUser.name || ""}
                style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '4px' }}
              />
            </div>
            
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>Email</label>
              <input 
                type="email" 
                defaultValue={displayUser.email || ""}
                disabled
                style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '4px', backgroundColor: '#f9fafb', color: '#6b7280' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>Role / Permissions</label>
              <input 
                type="text" 
                defaultValue={(displayUser as any).role || "EMPLOYEE"}
                disabled
                style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '4px', backgroundColor: '#f9fafb', color: '#6b7280' }}
              />
            </div>
          </div>

          <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '1.5rem', marginTop: '1rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#111827', marginBottom: '1rem' }}>Security</h3>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>New Password</label>
              <input 
                type="password" 
                placeholder="••••••••"
                style={{ width: '100%', maxWidth: '300px', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '4px' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
            <button 
              type="button" 
              style={{ padding: '0.75rem 1.5rem', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '500' }}
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
