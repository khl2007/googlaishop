
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { updateUserAddress, deleteUserAddress, getPrimaryAddressByUserId } from '@/lib/data';

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

// UPDATE an address for the logged-in user
export async function PUT(request, { params }) {
    const user = await getUserFromSession();
    if (!user) {
        return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }

    const { id } = params;
    const addressData = await request.json();
    
    try {
        await updateUserAddress(id, user.id, addressData);
        return NextResponse.json({ message: 'Address updated successfully' });
    } catch (error) {
        return NextResponse.json({ message: error.message || 'Failed to update address' }, { status: 500 });
    }
}

// DELETE an address for the logged-in user
export async function DELETE(request, { params }) {
    const user = await getUserFromSession();
    if (!user) {
        return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }

    const { id } = params;

    try {
        // Prevent deleting the primary address
        const primaryAddress = await getPrimaryAddressByUserId(user.id);
        if (primaryAddress && primaryAddress.id === parseInt(id, 10)) {
            return NextResponse.json({ message: 'Cannot delete your primary address.' }, { status: 400 });
        }

        await deleteUserAddress(id, user.id);
        return NextResponse.json({ message: 'Address deleted successfully' });
    } catch (error) {
        return NextResponse.json({ message: error.message || 'Failed to delete address' }, { status: 500 });
    }
}
