import { ReactNode } from 'react'

export const revalidate = 60;

export default function CityLayout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
