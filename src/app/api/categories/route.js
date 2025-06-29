import { NextResponse } from 'next/server';
import { getDatabase } from '../../../../lib/database';

export async function GET() {
  const db = getDatabase();

  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM categories', (err, rows) => {
      if (err) {
        db.close();
        console.error(err);
        return reject(NextResponse.json({ error: 'Error fetching categories' }, { status: 500 }));
      }

      db.close();
      return resolve(NextResponse.json(rows));
    });
  });
}