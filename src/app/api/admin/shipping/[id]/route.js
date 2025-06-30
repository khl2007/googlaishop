import { NextResponse } from 'next/server';
import getDatabase from '@/lib/database';
import { getShippingMethodById } from '@/lib/data';

// GET a single shipping method
export async function GET(request, { params }) {
  try {
    const method = await getShippingMethodById(params.id);
    if (!method) {
      return NextResponse.json({ message: 'Shipping method not found' }, { status: 404 });
    }
    return NextResponse.json(method);
  } catch (error) {
    return NextResponse.json({ message: 'Failed to fetch shipping method', error: error.message }, { status: 500 });
  }
}

// UPDATE a shipping method
export async function PUT(request, { params }) {
  const db = getDatabase();
  const { id } = params;
  const { title, logo, cost_type, default_cost, config, enabled } = await request.json();
  
  if (!title || !cost_type) {
    return NextResponse.json({ message: 'Title and Cost Type are required' }, { status: 400 });
  }

  try {
    await new Promise((resolve, reject) => {
      const sql = 'UPDATE shipping_methods SET title = ?, logo = ?, cost_type = ?, default_cost = ?, config = ?, enabled = ? WHERE id = ?';
      db.run(sql, [title, logo, cost_type, default_cost, config, enabled ? 1 : 0, id], function (err) {
        if (err) reject(err);
        if (this.changes === 0) reject(new Error('Shipping method not found'));
        else resolve(this);
      });
    });
    return NextResponse.json({ message: 'Shipping method updated successfully' });
  } catch (error) {
    return NextResponse.json({ message: 'Failed to update shipping method', error: error.message }, { status: 500 });
  }
}

// DELETE a shipping method
export async function DELETE(request, { params }) {
    const db = getDatabase();
    const { id } = params;
    try {
        await new Promise((resolve, reject) => {
            db.run('DELETE FROM shipping_methods WHERE id = ?', [id], function (err) {
                if (err) reject(err);
                if (this.changes === 0) reject(new Error('Shipping method not found'));
                else resolve(this);
            });
        });
        return NextResponse.json({ message: 'Shipping method deleted successfully' });
    } catch (error) {
        return NextResponse.json({ message: 'Failed to delete shipping method', error: error.message }, { status: 500 });
    }
}
