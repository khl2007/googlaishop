import { NextResponse } from 'next/server';
import { getCitiesByCountry, addCity } from '@/lib/data';

// GET cities for a country
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const country = searchParams.get('country');

  if (!country) {
    return NextResponse.json({ message: 'Country parameter is required' }, { status: 400 });
  }

  try {
    const cities = await getCitiesByCountry(country);
    return NextResponse.json(cities);
  } catch (error) {
    return NextResponse.json({ message: 'Failed to fetch cities', error: error.message }, { status: 500 });
  }
}

// CREATE a new city
export async function POST(request) {
  const { name, country_name } = await request.json();

  if (!name || !country_name) {
    return NextResponse.json({ message: 'Name and country_name are required' }, { status: 400 });
  }

  try {
    const newCity = await addCity(name, country_name);
    return NextResponse.json({ message: 'City created successfully', city: newCity }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: 'Failed to create city', error: error.message }, { status: 500 });
  }
}
