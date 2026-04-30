import React from 'react';

export default function DevTokens() {
  return (
    <div className="p-8 app-main">
      <h1 className="text-h1 mb-8">Design Tokens Test</h1>
      
      <div className="max-w-md mx-auto card">
        <h2 className="text-h3 mb-4">Sample Card</h2>
        
        <div className="mb-6">
          <label className="block text-label text-fg-secondary mb-2">Email Address</label>
          <input type="email" className="input" placeholder="nischay@theboringpeople.in" />
        </div>
        
        <div className="flex gap-4 mb-6">
          <button className="btn-primary">Primary Action</button>
          <button className="btn-secondary">Secondary</button>
        </div>
        
        <div className="flex gap-4">
          <span className="pill pill-success">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
            Present
          </span>
          <span className="pill pill-danger">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            Absent
          </span>
        </div>
      </div>
    </div>
  );
}
