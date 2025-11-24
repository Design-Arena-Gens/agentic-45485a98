import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { db } from '@/lib/db';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const player = db.players.getById(params.id);
    if (!player) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 });
    }

    // Delete associated user account
    db.users.delete(player.userId);

    // Delete player
    db.players.delete(params.id);

    return NextResponse.json({ message: 'Player deleted successfully' });
  } catch (error) {
    console.error('Error deleting player:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const updatedPlayer = db.players.update(params.id, body);

    if (!updatedPlayer) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 });
    }

    return NextResponse.json({ player: updatedPlayer });
  } catch (error) {
    console.error('Error updating player:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
