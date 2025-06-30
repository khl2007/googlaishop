
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import getDatabase from '@/lib/database';
import bcrypt from 'bcrypt';
import type { User } from '@/lib/types';

async function getUserFromSession(): Promise<User | null> {
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

// UPDATE a user's profile
export async function PUT(request: Request) {
    const user = await getUserFromSession();
    if (!user) {
        return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }

    const { fullName, username, phoneNumber, country, city, password } = await request.json();
    const db = getDatabase();

    if (!fullName || !username || !phoneNumber || !country || !city) {
        return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    try {
        let sql: string;
        let params: any[];

        if (password) {
            // If password is provided, hash it and update
            const hashedPassword = await bcrypt.hash(password, 10);
            sql = 'UPDATE users SET fullName = ?, username = ?, phoneNumber = ?, country = ?, city = ?, password = ? WHERE id = ?';
            params = [fullName, username, phoneNumber, country, city, hashedPassword, user.id];
        } else {
            // If no password, update other fields
            sql = 'UPDATE users SET fullName = ?, username = ?, phoneNumber = ?, country = ?, city = ? WHERE id = ?';
            params = [fullName, username, phoneNumber, country, city, user.id];
        }

        await new Promise<void>((resolve, reject) => {
            db.run(sql, params, function (this: any, err: Error | null) {
                if (err) return reject(err);
                if (this.changes === 0) return reject(new Error('User not found or no changes made'));
                resolve();
            });
        });

        // After successful update, we need to update the session cookie
        const updatedUser = {
            ...user,
            fullName,
            username,
        };
        const response = NextResponse.json({ message: 'Profile updated successfully' });
        response.cookies.set('user_session', JSON.stringify(updatedUser), {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            path: '/',
            maxAge: 60 * 60 * 24 * 7, // 1 week
        });
        
        return response;

    } catch (error: any) {
        return NextResponse.json({ message: 'Failed to update profile', error: error.message }, { status: 500 });
    }
}
