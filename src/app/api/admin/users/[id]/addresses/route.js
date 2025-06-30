import { NextResponse } from 'next/server';
import { getAddressesByUserId, addUserAddress } from '@/lib/data';

// GET all addresses for a specific user (admin)
export async function GET(request, { params }) {
    const { id } = params;
    // Note: Add admin authentication check in a real app
    try {
        const addresses = await getAddressesByUserId(id);
        return NextResponse.json(addresses);
    } catch (error) {
        return NextResponse.json({ message: 'Failed to fetch addresses', error: error.message }, { status: 500 });
    }
}

// CREATE a new address for a specific user (admin)
export async function POST(request, { params }) {
    const { id } = params;
    // Note: Add admin authentication check in a real app
    const addressData = await request.json();

    if (!addressData.fullName || !addressData.street || !addressData.city || !addressData.zip || !addressData.country) {
        return NextResponse.json({ message: 'Missing required address fields' }, { status: 400 });
    }

    try {
        const newAddress = await addUserAddress(id, addressData);
        return NextResponse.json({ message: 'Address added successfully', address: newAddress }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ message: 'Failed to add address', error: error.message }, { status: 500 });
    }
}
