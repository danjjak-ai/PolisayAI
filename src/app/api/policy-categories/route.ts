export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/local_db';

export async function GET() {
  const db = getDb();
  try {
    const categories = db.prepare('SELECT * FROM policy_categories ORDER BY id ASC').all();
    return NextResponse.json(categories);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const { category_name, keywords } = await request.json();

  if (!category_name || !keywords) {
    return NextResponse.json({ error: 'Missing category_name or keywords' }, { status: 400 });
  }

  const db = getDb();
  try {
    const insert = db.prepare('INSERT INTO policy_categories (category_name, keywords) VALUES (?, ?)');
    const result = insert.run(category_name, keywords);
    
    return NextResponse.json({
      message: 'Category created successfully',
      id: result.lastInsertRowid,
      category_name,
      keywords
    });
  } catch (error: any) {
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return NextResponse.json({ error: 'Category already exists' }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const url = new URL(request.url);
  const id = url.searchParams.get('id');

  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  const db = getDb();
  try {
    db.prepare('DELETE FROM policy_categories WHERE id = ?').run(id);
    return NextResponse.json({ message: 'Category deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
