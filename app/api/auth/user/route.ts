import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const ODK_CENTRAL_URL = 'https://jinodk.jumpingcrab.com';

export async function GET(req: NextRequest) {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Fetch user details from ODK Central
    const response = await axios.get(`${ODK_CENTRAL_URL}/v1/users/current`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    // Assuming ODK Central returns { displayName: string, email: string, ... }
    const { displayName, email } = response.data;
    return NextResponse.json({ username: displayName || email || 'Guest' }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.response?.data?.message || 'Failed to fetch user' },
      { status: error.response?.status || 500 }
    );
  }
}
