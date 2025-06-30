import { NextResponse } from 'next/server';
import { getEnabledPaymentMethods } from '@/lib/data';

// GET all enabled payment methods
export async function GET() {
  try {
    const methods = await getEnabledPaymentMethods();
    return NextResponse.json(methods);
  } catch (error) {
    return NextResponse.json({ message: 'Failed to fetch payment methods', error: error.message }, { status: 500 });
  }
}
