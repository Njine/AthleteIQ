import { NextRequest, NextResponse } from 'next/server';
import { jwtDecode } from 'jwt-decode';
import { GOOGLE_CLIENT_ID, JWT_SECRET } from '@/lib/constants';
import crypto from 'crypto';


export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { jwt } = body;
    const err = NextResponse.json(
      { error: 'Something went wrong' },
      { status: 403 });
    
    if (!jwt) {
      return NextResponse.json(
        { error: 'JWT is required' },
        { status: 400 }
      );
    }
    // salt: sub, iss, email, aud == application = azp,  iss == goog,   
    const decoded = jwtDecode(jwt);
    if (decoded.iss != 'https://accounts.google.com') return err
    if (decoded.aud != GOOGLE_CLIENT_ID) return err
    
    const s = Buffer.from(decoded.sub + decoded.aud + decoded.email, 'utf-8'); // Unique per OAuth provider
    const i = Buffer.from(decoded.email + decoded.sub + decoded.iss, 'utf-8'); // Unique per user

    // Derive 32-byte salt using HKDF
    const salt = Buffer.from(crypto.hkdfSync('sha256', JWT_SECRET, s, i, 32)).toString('hex');
    return NextResponse.json({ salt });
  } catch (error) {
    console.error('Salt generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate salt' },
      { status: 500 }
    );
  }
}