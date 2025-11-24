import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { db, Match } from '@/lib/db';

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
      const matches = db.matches.getAll();
      return NextResponse.json({ matches });
    } else {
      const matches = db.matches.getByPlayerId(decoded.playerId);
      return NextResponse.json({ matches });
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
    const { title, opponent, date, time, location, result, score, playerIds } = body;

    const match: Match = {
      id: `match-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title,
      opponent,
      date,
      time,
      location,
      result,
      score,
      playerIds: playerIds || [],
    };

    db.matches.create(match);
    return NextResponse.json({ match }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
