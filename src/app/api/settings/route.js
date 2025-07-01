import { NextResponse } from 'next/server';
import { getSettings } from '@/lib/data';

// GET public settings
export async function GET() {
  try {
    const settings = await getSettings();
    const publicSettings = {
        websiteTitle: settings?.websiteTitle || 'Zain Inspired E-Shop',
        country: settings?.country || 'USA',
        checkoutRequiresVerification: !!settings?.checkoutRequiresVerification,
    };
    return NextResponse.json(publicSettings);
  } catch (error) {
    console.error('Failed to fetch public settings:', error);
    return NextResponse.json({ message: 'Failed to fetch settings', error: error.message }, { status: 500 });
  }
}
