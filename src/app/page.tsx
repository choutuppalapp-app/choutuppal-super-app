export const revalidate = 60;
import { redirect } from 'next/navigation'

/**
 * Root Page — Redirects to the default city (Choutuppal).
 *
 * The main home feed, listings, and all views live at /city/[cityName].
 * This root page simply redirects to the default city so the user
 * sees the full CityPage with HomeView, bottom nav, etc.
 */
export default function RootPage() {
  redirect('/city/choutuppal')
}
