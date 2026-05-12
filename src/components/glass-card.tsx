'use client'

import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface GlassCardProps {
  children: ReactNode
  variant?: 'default' | 'gold' | 'premium'
  className?: string
  onClick?: () => void
}

export function GlassCard({ children, variant = 'default', className, onClick }: GlassCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'bg-white/40 backdrop-blur-2xl rounded-2xl md:rounded-2xl p-4 md:p-6 transition-all',
        'shadow-sm md:shadow-2xl',
        variant === 'default' && 'border border-white/30 md:border-white/30',
        variant === 'gold' && 'border border-[#D4AF37]/30 md:border-[#D4AF37]/40 shadow-[0_0_12px_rgba(212,175,55,0.06)] md:shadow-[0_0_20px_rgba(212,175,55,0.1)]',
        variant === 'premium' && 'border-2 border-transparent bg-clip-padding bg-white/40',
        onClick && 'cursor-pointer hover:bg-white/50 active:scale-[0.98] transition-transform',
        className
      )}
      style={
        variant === 'premium'
          ? {
              backgroundImage:
                'linear-gradient(white, white), linear-gradient(135deg, #D4AF37, #4169E1, #D4AF37)',
              backgroundOrigin: 'border-box',
              backgroundClip: 'padding-box, border-box',
            }
          : undefined
      }
    >
      {children}
    </div>
  )
}
