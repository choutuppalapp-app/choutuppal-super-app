import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
        },
      }
    )

    const { data: { user: sbUser } } = await supabase.auth.getUser()

    if (!sbUser || !sbUser.email) {
      return NextResponse.json({ authenticated: false })
    }

    // Fetch user from DB
    const user = await db.user.findFirst({
      where: { email: sbUser.email },
      select: { walletCoins: true, lastSpinDate: true }
    })

    if (!user) {
      return NextResponse.json({ authenticated: false })
    }

    let timeLeft = 0
    if (user.lastSpinDate) {
      const lastSpinTime = new Date(user.lastSpinDate).getTime()
      const cooldown = 24 * 60 * 60 * 1000 // 24-hour limit
      const nextAvailableTime = lastSpinTime + cooldown
      timeLeft = Math.max(0, nextAvailableTime - Date.now())
    }

    return NextResponse.json({
      authenticated: true,
      walletCoins: user.walletCoins,
      timeLeft,
    })
  } catch (error) {
    console.error('Spin GET Error:', error)
    return NextResponse.json({ error: 'Failed to fetch spin state' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
        },
      }
    )

    const { data: { user: sbUser } } = await supabase.auth.getUser()

    if (!sbUser || !sbUser.email) {
      return NextResponse.json({ error: 'Unauthorized: Please log in to spin' }, { status: 401 })
    }

    // Fetch user from DB
    const user = await db.user.findFirst({
      where: { email: sbUser.email },
    })

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized: User record not found' }, { status: 404 })
    }

    // Check if user has spun in the last 24 hours
    if (user.lastSpinDate) {
      const lastSpinTime = new Date(user.lastSpinDate).getTime()
      const cooldown = 24 * 60 * 60 * 1000
      const nextAvailableTime = lastSpinTime + cooldown
      const timeLeft = nextAvailableTime - Date.now()

      if (timeLeft > 0) {
        return NextResponse.json(
          { error: '24-hour limit active', timeLeft },
          { status: 403 }
        )
      }
    }

    // Pick a random reward index from [0, 1, 2, 3, 4, 5]
    const rewardIndex = Math.floor(Math.random() * 6)

    // Update User lastSpinDate and increment coins if they won a cash prize (index 3)
    const updatedUser = await db.user.update({
      where: { id: user.id },
      data: {
        lastSpinDate: new Date(),
        walletCoins: {
          increment: rewardIndex === 3 ? 50 : 5, // Cash Reward gives 50 coins, others give 5 entry coins
        },
      },
    })

    return NextResponse.json({
      success: true,
      rewardIndex,
      walletCoins: updatedUser.walletCoins,
      lastSpinDate: updatedUser.lastSpinDate,
    })
  } catch (error) {
    console.error('Spin API Error:', error)
    return NextResponse.json({ error: 'Failed to spin the wheel' }, { status: 500 })
  }
}
