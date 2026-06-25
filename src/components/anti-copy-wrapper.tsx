'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export function AntiCopyWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    // Disable security scripts for Admin routes to prevent interfering with session cookies/fetch
    if (pathname && (pathname.startsWith('/admin') || pathname.startsWith('/dashboard'))) {
      return;
    }

    // Block Right-Click
    const handleContextMenu = (e: MouseEvent) => {
      if (process.env.NODE_ENV !== 'development') {
        e.preventDefault();
      }
    };

    // Block PrintScreen and DevTools shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      if (process.env.NODE_ENV !== 'development') {
        // Block PrintScreen
        if (e.key === 'PrintScreen') {
          e.preventDefault();
          navigator.clipboard.writeText(''); // Clear clipboard as an extra measure
        }
        
        // Block F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U, Ctrl+C (if not in input)
        if (
          e.key === 'F12' ||
          (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j' || e.key === 'C' || e.key === 'c')) ||
          (e.ctrlKey && (e.key === 'U' || e.key === 'u')) ||
          (e.metaKey && e.altKey && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j')) ||
          (e.metaKey && e.shiftKey && (e.key === 'C' || e.key === 'c'))
        ) {
          e.preventDefault();
        }

        // Block Ctrl+C (Copy) outside of input elements
        if ((e.ctrlKey || e.metaKey) && (e.key === 'C' || e.key === 'c')) {
          const target = e.target as HTMLElement;
          if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
            e.preventDefault();
            navigator.clipboard.writeText(''); // Clear clipboard
          }
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (process.env.NODE_ENV !== 'development' && e.key === 'PrintScreen') {
        navigator.clipboard.writeText('');
      }
    };

    // Handle Print Screen when focus is lost (sometimes PrtScn steals focus)
    const handleVisibilityChange = () => {
      if (document.hidden && process.env.NODE_ENV !== 'development') {
        navigator.clipboard.writeText('').catch(() => {});
      }
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [pathname]);

  return <>{children}</>;
}
