import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { FileText, Download, ExternalLink, Plus, Search } from 'lucide-react';

export default function Materials() {
  const [materials, setMaterials] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const role = localStorage.getItem('role');

  useEffect(() => {
    async function fetchMaterials() {
      // Attempt to fetch from Supabase, fallback to mock data if table doesn't exist
      const { data, error } = await supabase
        .from('materials')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        setMaterials(data);
      } else {
        // Fallback Mock Data
        setMaterials([
          { id: 1, title: 'React Fundamentals', description: 'Core concepts of React hooks and components.', type: 'pdf', created_at: new Date().toISOString() },
          { id: 2, title: 'Tailwind CSS Cheatsheet', description: 'Quick reference for utility classes.', type: 'link', created_at: new Date(Date.now() - 86400000).toISOString() },
          { id: 3, title: 'Supabase Auth Guide', description: 'Setting up authentication with React.', type: 'document', created_at: new Date(Date.now() - 172800000).toISOString() },
        ]);
      }
      setLoading(false);
    }
    fetchMaterials();
  }, []);

  const filteredMaterials = materials.filter(m => 
    m.title.toLowerCase().includes(search.toLowerCase()) || 
    m.description.toLowerCase().includes(search.toLowerCase())
  );

  const getIcon = (type) => {
    switch(type) {
      case 'pdf': return <FileText className="text-danger-fg" size={24} />;
      case 'link': return <ExternalLink className="text-accent-glow" size={24} />;
      default: return <FileText className="text-success-fg" size={24} />;
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-text-secondary">Loading materials...</div>;
  }

  return (
    <div className="animate-fade-in space-y-8">
      <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
        <div>
          <h1 className="text-3xl font-bold text-text-primary mb-2">Learning Materials</h1>
          <p className="text-text-secondary font-medium">
            {role === 'mentor' ? 'Manage and share resources with your students.' : 'Access resources shared by your mentor.'}
          </p>
        </div>

        {role === 'mentor' && (
          <button className="btn-primary whitespace-nowrap px-6 flex items-center gap-2">
            <Plus size={18} />
            <span>Upload Material</span>
          </button>
        )}
      </div>

      <div className="card p-0 overflow-hidden border-none shadow-2xl">
        <div className="p-6 border-b border-border-subtle bg-surface/40 backdrop-blur-md flex flex-col sm:flex-row gap-5 items-center justify-between">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" size={18} />
            <input 
              type="text" 
              placeholder="Search materials..." 
              className="input pl-11 bg-surface-inset border-border-subtle focus:bg-surface transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="px-4 py-2 bg-surface-raised rounded-xl border border-border-subtle text-sm font-bold text-text-primary">
            {filteredMaterials.length} Resources
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6 bg-surface-inset/30">
          {filteredMaterials.length === 0 ? (
            <div className="col-span-full p-12 text-center">
              <div className="text-text-tertiary mb-2"><Search size={48} className="mx-auto opacity-20" /></div>
              <div className="text-text-secondary font-medium text-lg">No materials found.</div>
            </div>
          ) : (
            filteredMaterials.map((material, i) => (
              <div key={material.id} className="card bg-surface hover:bg-surface-raised transition-all group flex flex-col h-full animate-fade-in" style={{ animationDelay: `${i * 50}ms` }}>
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-surface-inset flex items-center justify-center border border-border-subtle group-hover:scale-110 transition-transform">
                    {getIcon(material.type)}
                  </div>
                  <span className="text-xs font-semibold text-text-tertiary bg-surface-inset px-2 py-1 rounded-md">
                    {new Date(material.created_at).toLocaleDateString()}
                  </span>
                </div>
                
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-text-primary mb-2 group-hover:text-accent-glow transition-colors line-clamp-1">{material.title}</h3>
                  <p className="text-sm text-text-secondary line-clamp-2">{material.description}</p>
                </div>

                <div className="mt-6 pt-4 border-t border-border-subtle flex justify-between items-center">
                  <span className="text-xs font-bold uppercase tracking-wider text-text-tertiary">{material.type}</span>
                  <button className="flex items-center gap-2 text-sm font-bold text-text-primary hover:text-accent-glow transition-colors bg-surface-inset px-4 py-2 rounded-lg">
                    {material.type === 'link' ? <><ExternalLink size={16} /> Open</> : <><Download size={16} /> Download</>}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
