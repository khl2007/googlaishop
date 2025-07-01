import { NextResponse } from 'next/server';
import getDatabase from '@/lib/database';
import { getSettings } from '@/lib/data';
import { revalidateTag } from 'next/cache';

// GET settings
export async function GET() {
  try {
    const settings = await getSettings();
    if (!settings) {
        return NextResponse.json({ message: 'Settings not found' }, { status: 404 });
    }
    return NextResponse.json(settings);
  } catch (error) {
    return NextResponse.json({ message: 'Failed to fetch settings', error: error.message }, { status: 500 });
  }
}

// UPDATE settings
export async function PUT(request) {
  const { websiteTitle, websiteLogo, timeZone, country, checkoutRequiresVerification } = await request.json();
  const db = getDatabase();

  if (!websiteTitle || !timeZone || !country) {
    return NextResponse.json({ message: 'Website Title, Time Zone, and Country are required' }, { status: 400 });
  }

  try {
    const sql = `
        UPDATE settings 
        SET websiteTitle = ?, websiteLogo = ?, timeZone = ?, country = ?, checkoutRequiresVerification = ?
        WHERE id = 1
    `;
    await new Promise((resolve, reject) => {
      db.run(sql, [websiteTitle, websiteLogo, timeZone, country, checkoutRequiresVerification ? 1 : 0], function (err) {
        if (err) reject(err);
        if (this.changes === 0) reject(new Error('No settings found to update.'));
        resolve(this);
      });
    });
    
    revalidateTag('settings');

    return NextResponse.json({ message: 'Settings updated successfully' });
  } catch (error) {
    return NextResponse.json({ message: 'Failed to update settings', error: error.message }, { status: 500 });
  }
}
