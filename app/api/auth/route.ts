import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const ODK_CENTRAL_URL = 'https://jinodk.jumpingcrab.com';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    const response = await axios.post(`${ODK_CENTRAL_URL}/v1/sessions`, { email, password });
    return NextResponse.json(response.data, { status: response.status });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.response?.data?.message || error.message },
      { status: error.response?.status || 500 }
    );
  }
}
