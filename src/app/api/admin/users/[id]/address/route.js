
import { NextResponse } from 'next/server';
import { getPrimaryAddressByUserId, upsertPrimaryAddress } from '@/lib/data';

// GET the primary address for a user
export async function GET(request, { params }) {
  const { id } = params;
  try {
    const address = await getPrimaryAddressByUserId(id);
    // Return the address found, or null if not found.
    // The form can handle a null value gracefully.
    return NextResponse.json(address);
  } catch (error) {
    return NextResponse.json({ message: 'Failed to fetch address', error: error.message }, { status: 500 });
  }
}

// CREATE or UPDATE the primary address for a user
export async function POST(request, { params }) {
  const { id } = params;
  const addressData = await request.json();
  
  if (!addressData.fullName || !addressData.street || !addressData.city || !addressData.zip || !addressData.country) {
    return NextResponse.json({ message: 'Missing required address fields' }, { status: 400 });
  }

  try {
    await upsertPrimaryAddress(id, addressData);
    return NextResponse.json({ message: 'Address saved successfully' });
  } catch (error) {
    return NextResponse.json({ message: 'Failed to save address', error: error.message }, { status: 500 });
  }
}
