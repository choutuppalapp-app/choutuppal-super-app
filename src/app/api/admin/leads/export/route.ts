import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const leads = await db.lead.findMany({
      include: {
        listing: {
          select: { id: true, name: true, category: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    // Generate CSV
    const headers = ['Lead ID', 'Customer Name', 'Customer Phone', 'Requirement', 'Listing Name', 'Listing Category', 'Source', 'Status', 'Date']
    const rows = leads.map(lead => [
      lead.id,
      lead.customerName || 'Anonymous',
      lead.customerPhone,
      (lead.requirementText || '-').replace(/,/g, ';'),
      lead.listing.name,
      lead.listing.category,
      lead.source,
      lead.status,
      new Date(lead.createdAt).toLocaleDateString('en-IN'),
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n')

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename=choutuppal-leads.csv',
      },
    })
  } catch (error) {
    console.error('Error exporting leads:', error)
    return NextResponse.json({ error: 'Failed to export leads' }, { status: 500 })
  }
}
