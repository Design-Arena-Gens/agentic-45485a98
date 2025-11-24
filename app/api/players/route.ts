import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { db, Player } from '@/lib/db';
import { hashPassword } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const players = db.players.getAll();
    return NextResponse.json({ players });
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
    const { name, email, phone, position, jerseyNumber, dateOfBirth, username, password } = body;

    // Create user account for player
    const userId = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const playerId = `player-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const hashedPassword = await hashPassword(password);

    const user = db.users.create({
      id: userId,
      username,
      password: hashedPassword,
      role: 'player',
      createdAt: new Date().toISOString(),
      playerId,
    });

    const player: Player = {
      id: playerId,
      name,
      email,
      phone,
      position,
      jerseyNumber,
      dateOfBirth,
      joinedDate: new Date().toISOString(),
      status: 'active',
      userId,
    };

    db.players.create(player);

    return NextResponse.json({ player, user: { username, userId } }, { status: 201 });
  } catch (error) {
    console.error('Error creating player:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
