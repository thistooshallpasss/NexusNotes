'use client';

import React, { useState, useEffect } from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Lock, Loader2 } from 'lucide-react';
import axios, { API_URL } from '@/lib/apiClient';


export default function AuthGate({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('nexus_passcode');
    if (saved) {
      setIsAuthenticated(true);
    }
    
    // Check if redirect was due to session expiration
    const expired = localStorage.getItem('session_expired');
    if (expired) {
      setErrorMsg('Session expired or unauthorized. Please re-enter passcode.');
      localStorage.removeItem('session_expired');
    }

    setLoading(false);
  }, []);

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passcode.trim()) return;
    
    setVerifying(true);
    setErrorMsg('');
    
    try {
      // Validate the passcode against the backend /verify endpoint
      await axios.post(`${API_URL}/auth/verify`, {}, {
        headers: {
          'Authorization': `Bearer ${passcode.trim()}`
        }
      });
      
      localStorage.setItem('nexus_passcode', passcode.trim());
      setIsAuthenticated(true);
    } catch (err: any) {
      console.error('Passcode verification failed:', err);
      setErrorMsg(
        err.response?.data?.error || 
        'Invalid passcode. Please try again.'
      );
    } finally {
      setVerifying(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="animate-pulse flex space-x-2">
          <div className="w-3 h-3 bg-zinc-400 dark:bg-zinc-600 rounded-full animate-bounce"></div>
          <div className="w-3 h-3 bg-zinc-400 dark:bg-zinc-600 rounded-full animate-bounce [animation-delay:0.2s]"></div>
          <div className="w-3 h-3 bg-zinc-400 dark:bg-zinc-600 rounded-full animate-bounce [animation-delay:0.4s]"></div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-50 flex h-screen w-screen items-center justify-center bg-zinc-100/70 dark:bg-zinc-950/70 backdrop-blur-xl">
        <div className="w-full max-w-md p-8 bg-white/80 dark:bg-zinc-900/80 border border-zinc-200/50 dark:border-zinc-800/50 shadow-2xl rounded-2xl text-center">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-600 flex items-center justify-center text-white mb-6 shadow-lg shadow-indigo-500/20">
            <Lock size={28} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Unlock NexusNotes</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2 mb-6">
            Enter your personal administrative passcode to access your workspace.
          </p>
          
          <form onSubmit={handleUnlock} className="space-y-4">
            <Input 
              type="password"
              placeholder="Passcode"
              className="text-center font-mono py-6 rounded-xl text-lg bg-zinc-50/50 dark:bg-zinc-800/30 border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-100"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              disabled={verifying}
              autoFocus
            />
            {errorMsg && (
              <p className="text-xs font-semibold text-red-600 dark:text-red-400 bg-red-50/50 dark:bg-red-950/15 py-2.5 px-4 rounded-xl border border-red-200/40 dark:border-red-900/40 text-left">
                {errorMsg}
              </p>
            )}
            <Button 
              type="submit" 
              className="w-full py-6 rounded-xl font-medium bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-md shadow-indigo-500/10 cursor-pointer flex items-center justify-center gap-2"
              disabled={verifying || !passcode.trim()}
            >
              {verifying ? (
                <>
                  <Loader2 size={18} className="animate-spin" /> Verifying...
                </>
              ) : (
                'Unlock Workspace'
              )}
            </Button>
          </form>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
