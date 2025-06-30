import { NextResponse } from 'next/server';
import getDatabase from '@/lib/database';
import { getShippingMethods } from '@/lib/data';

// GET all shipping methods
export async function GET() {
  try {
    const methods = await getShippingMethods();
    return NextResponse.json(methods);
  } catch (error) {
    return NextResponse.json({ message: 'Failed to fetch shipping methods', error: error.message }, { status: 500 });
  }
}

// CREATE a new shipping method
export async function POST(request) {
  const db = getDatabase();
  const { title, logo, cost_type, default_cost, config, enabled } = await request.json();

  if (!title || !cost_type) {
    return NextResponse.json({ message: 'Title and Cost Type are required' }, { status: 400 });
  }

  try {
    const result = await new Promise((resolve, reject) => {
      const sql = 'INSERT INTO shipping_methods (title, logo, cost_type, default_cost, config, enabled) VALUES (?, ?, ?, ?, ?, ?)';
      db.run(sql, [title, logo, cost_type, default_cost, config, enabled ? 1 : 0], function (err) {
        if (err) reject(err);
        else resolve({ id: this.lastID });
      });
    });
    return NextResponse.json({ message: 'Shipping method created successfully', id: result.id }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: 'Failed to create shipping method', error: error.message }, { status: 500 });
  }
}
