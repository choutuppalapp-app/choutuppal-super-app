'use client'

import { usePathname, useSearchParams } from 'next/navigation'
import Script from 'next/script'
import { useEffect, Suspense } from 'react'

const PIXEL_ID = process.env.NEXT_PUBLIC_FB_PIXEL_ID || 'mock_pixel_id'

function FacebookPixelTracker() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (!PIXEL_ID || PIXEL_ID === 'mock_pixel_id') return

    try {
      const fb = (window as any).fbq
      if (fb) {
        fb('track', 'PageView')
      }
    } catch (err) {
      console.warn('Facebook Pixel PageView tracking failed:', err)
    }
  }, [pathname, searchParams])

  if (!PIXEL_ID || PIXEL_ID === 'mock_pixel_id') {
    return null
  }

  return (
    <>
      <Script
        id="fb-pixel"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${PIXEL_ID}');
            fbq('track', 'PageView');
          `,
        }}
      />
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: 'none' }}
          src={`https://www.facebook.com/tr?id=${PIXEL_ID}&ev=PageView&noscript=1`}
          alt="fb-pixel"
        />
      </noscript>
    </>
  )
}

export default function FacebookPixel() {
  return (
    <Suspense fallback={null}>
      <FacebookPixelTracker />
    </Suspense>
  )
}
