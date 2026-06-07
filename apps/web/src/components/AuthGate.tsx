'use client';

import React from 'react';

export default function AuthGate({ children }: { children: React.ReactNode }) {
  // Passcode gate globally disabled as requested by the user
  return <>{children}</>;
}
