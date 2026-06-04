'use client'

import { motion } from 'framer-motion'
import { Home, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <motion.div
        initial={false}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="text-center max-w-md"
      >
        <div className="text-8xl font-bold bg-gradient-to-r from-[#D4AF37] to-[#4169E1] bg-clip-text text-transparent mb-4">
          404
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Page Not Found</h1>
        <p className="text-gray-500 mb-6">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="flex gap-3 justify-center">
          <Button
            onClick={() => window.history.back()}
            variant="outline"
            className="border-gray-200"
          >
            <ArrowLeft className="size-4 mr-2" />
            Go Back
          </Button>
          <Button
            onClick={() => window.location.href = '/'}
            className="bg-gradient-to-r from-[#D4AF37] to-[#B8962E] text-white font-semibold"
          >
            <Home className="size-4 mr-2" />
            Home
          </Button>
        </div>
      </motion.div>
    </div>
  )
}
