export const dynamic = 'force-dynamic';
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

    // Sanitize CSV cells to prevent CSV injection
    const sanitize = (str: string) => str.replace(/^[=+@\-]/, ' $&')

    // Generate CSV
    const headers = ['Lead ID', 'Customer Name', 'Customer Phone', 'Requirement', 'Listing Name', 'Listing Category', 'Source', 'Status', 'Date']
    const rows = leads.map(lead => [
      lead.id,
      lead.customerName ? sanitize(lead.customerName) : 'Anonymous',
      sanitize(lead.customerPhone),
      sanitize((lead.requirementText || '-').replace(/,/g, ';')),
      sanitize(lead.listing.name),
      sanitize(lead.listing.category),
      sanitize(lead.source),
      sanitize(lead.status),
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
