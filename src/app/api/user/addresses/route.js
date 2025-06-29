
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getAddressesByUserId, addUserAddress } from '@/lib/data';

async function getUserFromSession() {
    const cookieStore = cookies();
    const sessionCookie = cookieStore.get('user_session');
    if (sessionCookie?.value) {
        try {
            return JSON.parse(sessionCookie.value);
        } catch (e) {
            return null;
        }
    }
    return null;
}

// GET all addresses for the logged-in user
export async function GET(request) {
    const user = await getUserFromSession();
    if (!user) {
        return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }

    try {
        const addresses = await getAddressesByUserId(user.id);
        return NextResponse.json(addresses);
    } catch (error) {
        return NextResponse.json({ message: 'Failed to fetch addresses', error: error.message }, { status: 500 });
    }
}

// CREATE a new address for the logged-in user
export async function POST(request) {
    const user = await getUserFromSession();
    if (!user) {
        return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }
    
    const addressData = await request.json();

    if (!addressData.fullName || !addressData.street || !addressData.city || !addressData.zip || !addressData.country) {
        return NextResponse.json({ message: 'Missing required address fields' }, { status: 400 });
    }

    try {
        const newAddress = await addUserAddress(user.id, addressData);
        return NextResponse.json({ message: 'Address added successfully', address: newAddress }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ message: 'Failed to add address', error: error.message }, { status: 500 });
    }
}
