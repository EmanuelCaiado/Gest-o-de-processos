import React from 'react';

export function BrandLogo({ className = '' }: { className?: string }) {
  return <img src="/rx-logo.png" alt="RX Estúdio" className={`object-contain shrink-0 ${className}`} />;
}
