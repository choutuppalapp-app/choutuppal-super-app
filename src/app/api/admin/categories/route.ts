export const dynamic = 'force-dynamic';
import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const activeOnly = searchParams.get('active') === 'true'
    
    const where = activeOnly ? { isActive: true } : {}
    const categories = await db.category.findMany({
      where,
      orderBy: { name: 'asc' }
    })
    return NextResponse.json(categories)
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { name, icon } = await request.json()
    if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    
    const category = await db.category.create({
      data: { name, slug, icon }
    })
    return NextResponse.json(category, { status: 201 })
  } catch (error: any) {
    if (error.code === 'P2002') return NextResponse.json({ error: 'Category already exists' }, { status: 400 })
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const { id, name, icon, isActive } = await request.json()
    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    
    const data: any = {}
    if (name) {
      data.name = name
      data.slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    }
    if (icon !== undefined) data.icon = icon
    if (isActive !== undefined) data.isActive = isActive

    const category = await db.category.update({
      where: { id },
      data
    })
    return NextResponse.json(category)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update category' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    
    await db.category.delete({
      where: { id }
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 })
  }
}
