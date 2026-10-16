'use client';

import React from 'react';
import { TactileSerialProvider } from '@/lib/serial/use-tactile-serial';

export default function HardwareLayout({ children }: { children: React.ReactNode }) {
  return <TactileSerialProvider>{children}</TactileSerialProvider>;
}
