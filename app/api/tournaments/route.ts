import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { db, Tournament } from '@/lib/db';

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
      const tournaments = db.tournaments.getAll();
      return NextResponse.json({ tournaments });
    } else {
      const tournaments = db.tournaments.getByPlayerId(decoded.playerId);
      return NextResponse.json({ tournaments });
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
    const { name, startDate, endDate, location, description, status, playerIds } = body;

    const tournament: Tournament = {
      id: `tournament-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name,
      startDate,
      endDate,
      location,
      description,
      status,
      playerIds: playerIds || [],
    };

    db.tournaments.create(tournament);
    return NextResponse.json({ tournament }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
