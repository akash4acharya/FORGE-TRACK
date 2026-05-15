import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { FileText, Download, ExternalLink, Plus, Search, BookOpen } from 'lucide-react';

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
        setMaterials([]);
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
      case 'pdf': return <FileText className="text-red-400" size={24} />;
      case 'link': return <ExternalLink className="text-amethyst" size={24} />;
      default: return <FileText className="text-emerald-400" size={24} />;
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-gray-500">Loading materials...</div>;
  }

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
        <div>
          <h1 className="text-xl font-bold text-white mb-1">Learning Materials</h1>
          <p className="text-gray-400 font-medium text-sm">
            {role === 'mentor' ? 'Manage and share resources with your students.' : 'Access resources shared by your mentor.'}
          </p>
        </div>

        {role === 'mentor' && (
          <button className="bg-[#a855f7] hover:bg-[#c084fc] text-white font-medium px-4 py-2 rounded-md transition-colors flex items-center gap-2 text-sm shadow-sm">
            <Plus size={16} />
            <span>Upload Material</span>
          </button>
        )}
      </div>

      <div className="bg-[#151517] border border-zinc-800 rounded-xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-zinc-800 flex flex-col sm:flex-row gap-5 items-center justify-between">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
            <input 
              type="text" 
              placeholder="Search materials..." 
              className="w-full bg-[#0a0a0b] border border-zinc-800 focus:border-amethyst rounded-md py-2 pl-10 pr-4 text-sm text-white placeholder-gray-500 transition-colors outline-none"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="bg-[#0a0a0b] border border-zinc-800 text-zinc-300 rounded-full px-4 py-1 text-sm font-medium">
            {filteredMaterials.length} Resources
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
          {materials.length === 0 ? (
             <div className="col-span-full p-16 text-center flex flex-col items-center justify-center">
              <div className="w-20 h-20 bg-zinc-800/50 rounded-full flex items-center justify-center mb-6">
                <BookOpen size={40} className="text-zinc-600" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">No Materials Found</h2>
              <p className="text-zinc-500 max-w-md mx-auto mb-8">There are no learning materials uploaded yet. Mentors can upload PDFs and links to share with students.</p>
              {role === 'mentor' && (
                <button className="bg-gradient-to-r from-[#a855f7] to-[#c084fc] hover:opacity-90 text-white font-semibold py-3 px-8 rounded-full transition-all shadow-lg shadow-amethyst/20">
                  Upload Material
                </button>
              )}
            </div>
          ) : filteredMaterials.length === 0 ? (
             <div className="col-span-full p-12 text-center">
              <div className="text-gray-600 mb-2 flex justify-center"><Search size={32} /></div>
              <div className="text-gray-400 font-medium text-sm">No materials match your search.</div>
            </div>
          ) : (
            filteredMaterials.map((material, i) => (
              <div key={material.id} className="bg-[#0a0a0b] border border-zinc-800 rounded-xl p-6 hover:border-[#a855f7]/50 transition-colors duration-200 group flex flex-col h-full animate-fade-in" style={{ animationDelay: `${i * 50}ms` }}>
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-zinc-800/50 flex items-center justify-center border border-zinc-800 group-hover:scale-110 transition-transform shadow-sm">
                    {getIcon(material.type)}
                  </div>
                  <span className="text-xs font-semibold text-zinc-500 bg-zinc-900 px-2 py-1 rounded-md">
                    {new Date(material.created_at).toLocaleDateString()}
                  </span>
                </div>
                
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-amethyst transition-colors line-clamp-1">{material.title}</h3>
                  <p className="text-sm text-zinc-400 line-clamp-2">{material.description}</p>
                </div>

                <div className="mt-6 pt-4 border-t border-zinc-800/60 flex justify-between items-center">
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">{material.type}</span>
                  <button className="flex items-center gap-2 text-sm font-medium text-white hover:text-[#a855f7] transition-colors bg-zinc-800/50 px-4 py-2 rounded-lg">
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
