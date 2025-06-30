
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import getDatabase from '@/lib/database';

async function getUserFromSession() {
    const cookieStore = await cookies();
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

export async function PUT(request, { params }) {
    const user = await getUserFromSession();
    if (!user) {
        return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }

    const { id: addressId } = params;
    const db = getDatabase();

    try {
        await new Promise((resolve, reject) => db.run('BEGIN TRANSACTION', err => err ? reject(err) : resolve()));

        // Unset the current primary address for the user
        await new Promise((resolve, reject) => {
            const sql = `UPDATE addresses SET isPrimary = 0 WHERE user_id = ? AND isPrimary = 1`;
            db.run(sql, [user.id], function(err) {
                if (err) return reject(err);
                resolve(this);
            });
        });

        // Set the new primary address
        await new Promise((resolve, reject) => {
            const sql = `UPDATE addresses SET isPrimary = 1 WHERE id = ? AND user_id = ?`;
            db.run(sql, [addressId, user.id], function(err) {
                if (err) return reject(err);
                if (this.changes === 0) return reject(new Error("Address not found or permission denied."));
                resolve(this);
            });
        });

        await new Promise((resolve, reject) => db.run('COMMIT', err => err ? reject(err) : resolve()));
        
        return NextResponse.json({ message: 'Primary address updated successfully' });

    } catch (error) {
        await new Promise((resolve) => db.run('ROLLBACK', () => resolve()));
        return NextResponse.json({ message: error.message || 'Failed to update primary address' }, { status: 500 });
    }
}
