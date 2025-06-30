import { NextResponse } from 'next/server';
import { getPaymentMethods, updatePaymentMethods } from '@/lib/data';

// GET all payment methods
export async function GET() {
  try {
    const methods = await getPaymentMethods();
    return NextResponse.json(methods);
  } catch (error) {
    return NextResponse.json({ message: 'Failed to fetch payment methods', error: error.message }, { status: 500 });
  }
}

// UPDATE payment methods
export async function PUT(request) {
  try {
    const methods = await request.json();
    await updatePaymentMethods(methods);
    return NextResponse.json({ message: 'Payment methods updated successfully' });
  } catch (error) {
    return NextResponse.json({ message: 'Failed to update payment methods', error: error.message }, { status: 500 });
  }
}
