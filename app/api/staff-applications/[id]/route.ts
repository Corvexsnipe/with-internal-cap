import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const applicationId = parseInt(id);
    
    if (isNaN(applicationId)) {
      return NextResponse.json(
        { error: 'Invalid application ID' },
        { status: 400 }
      );
    }

    const connection = await pool.getConnection();
    await connection.query('DELETE FROM staff_applications WHERE id = ?', [applicationId]);
    connection.release();

    return NextResponse.json({ message: 'Application deleted successfully' });
  } catch (error) {
    console.error('Error deleting application:', error);
    return NextResponse.json(
      { error: 'Failed to delete application' },
      { status: 500 }
    );
  }
}
