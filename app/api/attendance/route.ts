import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { db, Attendance } from '@/lib/db';

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
      const attendance = db.attendance.getAll();
      return NextResponse.json({ attendance });
    } else {
      const attendance = db.attendance.getByPlayerId(decoded.playerId);
      return NextResponse.json({ attendance });
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
    const { playerId, date, status, notes } = body;

    const attendance: Attendance = {
      id: `attendance-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      playerId,
      date,
      status,
      notes,
    };

    db.attendance.create(attendance);
    return NextResponse.json({ attendance }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
