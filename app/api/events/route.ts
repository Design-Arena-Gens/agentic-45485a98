import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { db, Event } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (decoded.role === 'admin') {
      const events = db.events.getAll();
      return NextResponse.json({ events });
    } else {
      const events = db.events.getByPlayerId(decoded.playerId);
      return NextResponse.json({ events });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { title, description, date, time, location, type, playerIds } = body;

    const event: Event = {
      id: `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title,
      description,
      date,
      time,
      location,
      type,
      playerIds: playerIds || [],
    };

    db.events.create(event);
    return NextResponse.json({ event }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
