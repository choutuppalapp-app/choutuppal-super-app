export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET all users with their subscription info, agent details, and earnings
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get('search') || ''
    const role = searchParams.get('role') || 'all'

    const where: Record<string, unknown> = {}
    if (search) {
      where.OR = [
        { fullName: { contains: search } },
        { phone: { contains: search } },
        { email: { contains: search } },
      ]
    }
    if (role !== 'all') {
      where.role = role
    }

    const users = await db.user.findMany({
      where,
      select: {
        id: true,
        fullName: true,
        phone: true,
        email: true,
        role: true,
        subscriptionTier: true,
        coinsBalance: true,
        createdAt: true,
        city: { select: { name: true } },
        managedCity: { select: { id: true, name: true } },
        // Agent-specific fields
        agentCityId: true,
        isAgentApproved: true,
        upiId: true,
        bankDetails: true,
        totalEarnings: true,
        pendingPayout: true,
        agentCity: { select: { id: true, name: true } },
        location: { select: { id: true, state: true, district: true, city: true } },
        _count: { select: { listings: true, leads: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    })

    return NextResponse.json(users, { headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0' } })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
  }
}

// PATCH — Ban user, make admin, add coins, assign/revoke city admin, manage agent
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, action, value } = body

    if (!userId || !action) {
      return NextResponse.json({ error: 'userId and action required' }, { status: 400 })
    }

    switch (action) {
      case 'ban': {
        await db.user.update({ where: { id: userId }, data: { role: 'banned' } })
        return NextResponse.json({ success: true, message: 'User banned' })
      }
      case 'unban': {
        await db.user.update({ where: { id: userId }, data: { role: 'user' } })
        return NextResponse.json({ success: true, message: 'User unbanned' })
      }
      case 'makeAdmin': {
        await db.user.update({ where: { id: userId }, data: { role: 'admin' } })
        return NextResponse.json({ success: true, message: 'User promoted to admin' })
      }
      case 'removeAdmin': {
        await db.user.update({ where: { id: userId }, data: { role: 'user' } })
        return NextResponse.json({ success: true, message: 'Admin role removed' })
      }
      case 'changeRole': {
        const { newRole } = body
        if (!newRole) {
          console.error('[BACKEND] newRole is missing in changeRole body:', body);
          return NextResponse.json({ error: 'newRole is required for changeRole' }, { status: 400 })
        }
        
        try {
          await db.user.update({
            where: { id: userId },
            data: { role: newRole },
          })
          console.log(`[BACKEND] Successfully updated user ${userId} to role ${newRole}`);
        } catch (dbErr) {
          console.error(`[BACKEND] Prisma error updating user ${userId} to ${newRole}:`, dbErr);
          return NextResponse.json({ error: 'Database update failed' }, { status: 500 })
        }
        
        return NextResponse.json({ success: true, message: `Role updated to ${newRole}` })
      }
      case 'addCoins': {
        const amount = parseInt(value) || 0
        if (amount === 0) return NextResponse.json({ error: 'Amount must be > 0' }, { status: 400 })
        await db.user.update({
          where: { id: userId },
          data: { coinsBalance: { increment: amount } },
        })
        await db.coinTransaction.create({
          data: { userId, amount, reason: `Admin granted ${amount} coins` },
        })
        return NextResponse.json({ success: true, message: `Added ${amount} coins` })
      }
      case 'assignCityAdmin': {
        const { cityId } = body
        if (!cityId) {
          return NextResponse.json({ error: 'cityId is required for assignCityAdmin' }, { status: 400 })
        }

        const user = await db.user.findUnique({ where: { id: userId } })
        if (!user) {
          return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        const city = await db.city.findUnique({ where: { id: cityId } })
        if (!city) {
          return NextResponse.json({ error: 'City not found' }, { status: 404 })
        }

        await db.user.update({
          where: { id: userId },
          data: {
            role: 'city_admin',
            managedCityId: cityId,
          },
        })

        return NextResponse.json({
          success: true,
          message: `User assigned as city admin for ${city.name}`,
        })
      }
      case 'revokeCityAdmin': {
        const user = await db.user.findUnique({ where: { id: userId } })
        if (!user) {
          return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        if (user.role !== 'city_admin') {
          return NextResponse.json(
            { error: 'User is not a city admin' },
            { status: 400 }
          )
        }

        await db.user.update({
          where: { id: userId },
          data: {
            role: 'user',
            managedCityId: null,
          },
        })

        return NextResponse.json({
          success: true,
          message: 'City admin role revoked',
        })
      }
      case 'approveAgent': {
        const { agentCityId } = body
        if (!agentCityId) {
          return NextResponse.json({ error: 'agentCityId is required for approveAgent' }, { status: 400 })
        }

        const city = await db.city.findUnique({ where: { id: agentCityId } })
        if (!city) {
          return NextResponse.json({ error: 'City not found' }, { status: 404 })
        }

        await db.user.update({
          where: { id: userId },
          data: {
            role: 'agent',
            agentCityId,
            isAgentApproved: true,
          },
        })

        return NextResponse.json({
          success: true,
          message: `User approved as agent for ${city.name}`,
        })
      }
      case 'revokeAgent': {
        const user = await db.user.findUnique({ where: { id: userId } })
        if (!user) {
          return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        if (user.role !== 'agent') {
          return NextResponse.json(
            { error: 'User is not an agent' },
            { status: 400 }
          )
        }

        await db.user.update({
          where: { id: userId },
          data: {
            role: 'user',
            agentCityId: null,
            isAgentApproved: false,
          },
        })

        return NextResponse.json({
          success: true,
          message: 'Agent role revoked',
        })
      }
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
  }
}
