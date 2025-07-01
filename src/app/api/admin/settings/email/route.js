import { NextResponse } from 'next/server';
import { getEmailSettings, updateEmailSettings } from '@/lib/data';
import { revalidateTag } from 'next/cache';

// GET email settings
export async function GET() {
  try {
    const settings = await getEmailSettings();
    // Return empty object if no settings, so the form can initialize
    return NextResponse.json(settings || {});
  } catch (error) {
    return NextResponse.json({ message: 'Failed to fetch email settings', error: error.message }, { status: 500 });
  }
}

// UPDATE email settings
export async function PUT(request) {
  const data = await request.json();
  
  try {
    await updateEmailSettings(data);
    // Revalidate a tag if you're caching these settings elsewhere
    // revalidateTag('email-settings'); 
    return NextResponse.json({ message: 'Email settings updated successfully' });
  } catch (error) {
    return NextResponse.json({ message: 'Failed to update email settings', error: error.message }, { status: 500 });
  }
}
