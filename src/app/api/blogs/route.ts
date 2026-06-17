export const revalidate = 60;
import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/blogs — List blogs with filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const cityId = searchParams.get('cityId')
    const slug = searchParams.get('slug')
    const all = searchParams.get('all')

    // Fetch single blog by slug
    if (slug) {
      const blog = await db.blog.findUnique({
        where: { slug },
        include: {
          author: {
            select: {
              id: true,
              fullName: true,
              avatarUrl: true,
            },
          },
          city: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      })

      if (!blog) {
        return NextResponse.json(
          { error: 'Blog not found' },
          { status: 404 }
        )
      }

      // If not admin view, only return published blogs
      if (!all || all !== 'true') {
        if (!blog.isPublished) {
          return NextResponse.json(
            { error: 'Blog not found' },
            { status: 404 }
          )
        }
      }

      return NextResponse.json(blog)
    }

    // Build where clause for listing
    const where: Record<string, unknown> = {}

    // Filter by published status unless admin view
    if (!all || all !== 'true') {
      where.isPublished = true
    }

    // City filter: include city-specific + global (cityId = null) blogs
    if (cityId) {
      where.OR = [
        { cityId },
        { cityId: null },
      ]
    }

    const blogs = await db.blog.findMany({
      where,
      include: {
        author: {
          select: {
            id: true,
            fullName: true,
            avatarUrl: true,
          },
        },
        city: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(blogs)
  } catch (error) {
    console.error('Error fetching blogs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch blogs' },
      { status: 500 }
    )
  }
}

// POST /api/blogs — Create a new blog
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { title, slug, coverImageUrl, content, authorId, cityId, isPublished } = body

    if (!title || !slug) {
      return NextResponse.json(
        { error: 'title and slug are required' },
        { status: 400 }
      )
    }

    // Check for slug uniqueness
    const existingBlog = await db.blog.findUnique({ where: { slug } })
    if (existingBlog) {
      return NextResponse.json(
        { error: 'A blog with this slug already exists' },
        { status: 409 }
      )
    }

    // Verify author exists
    if (authorId) {
      const author = await db.user.findUnique({ where: { id: authorId } })
      if (!author) {
        return NextResponse.json(
          { error: 'Author not found' },
          { status: 404 }
        )
      }
    }

    // Verify city exists if provided
    if (cityId) {
      const city = await db.city.findUnique({ where: { id: cityId } })
      if (!city) {
        return NextResponse.json(
          { error: 'City not found' },
          { status: 404 }
        )
      }
    }

    const blog = await db.blog.create({
      data: {
        title,
        slug,
        coverImageUrl: coverImageUrl || null,
        content: content || null,
        authorId: authorId || null,
        cityId: cityId || null,
        isPublished: isPublished ?? false,
      },
      include: {
        author: {
          select: {
            id: true,
            fullName: true,
            avatarUrl: true,
          },
        },
        city: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    })

    return NextResponse.json(blog, { status: 201 })
  } catch (error) {
    console.error('Error creating blog:', error)
    return NextResponse.json(
      { error: 'Failed to create blog' },
      { status: 500 }
    )
  }
}
