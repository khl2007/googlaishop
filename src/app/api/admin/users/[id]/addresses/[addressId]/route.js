import { NextResponse } from 'next/server';
import { updateUserAddress, deleteUserAddress, getPrimaryAddressByUserId } from '@/lib/data';

// UPDATE an address for a specific user (admin)
export async function PUT(request, { params }) {
    // Note: Add admin authentication check in a real app
    const { id: userId, addressId } = params;
    const addressData = await request.json();
    
    try {
        await updateUserAddress(addressId, userId, addressData);
        return NextResponse.json({ message: 'Address updated successfully' });
    } catch (error) {
        return NextResponse.json({ message: error.message || 'Failed to update address' }, { status: 500 });
    }
}

// DELETE an address for a specific user (admin)
export async function DELETE(request, { params }) {
    // Note: Add admin authentication check in a real app
    const { id: userId, addressId } = params;

    try {
        const primaryAddress = await getPrimaryAddressByUserId(userId);
        if (primaryAddress && primaryAddress.id === parseInt(addressId, 10)) {
            return NextResponse.json({ message: 'Cannot delete a primary address.' }, { status: 400 });
        }

        await deleteUserAddress(addressId, userId);
        return NextResponse.json({ message: 'Address deleted successfully' });
    } catch (error) {
        return NextResponse.json({ message: error.message || 'Failed to delete address' }, { status: 500 });
    }
}
