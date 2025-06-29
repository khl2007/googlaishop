import { NextResponse } from 'next/server';
import getDatabase from '@/lib/database';

export async function GET() {
  const db = getDatabase();

  return new Promise((resolve, reject) => {
    // We don't want to expose the 'admin' role in the registration dropdown
    db.all("SELECT id, name FROM roles WHERE name != 'admin'", (err, rows) => {
      if (err) {
        console.error(err);
        return reject(NextResponse.json({ error: 'Error fetching roles' }, { status: 500 }));
      }
      return resolve(NextResponse.json(rows));
    });
  });
}
