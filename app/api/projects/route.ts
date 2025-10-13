// app/api/projects/route.ts
import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const ODK_CENTRAL_URL = 'https://jinodk.jumpingcrab.com';

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  try {
    const response = await axios.get(`${ODK_CENTRAL_URL}/v1/projects`, {
      headers: { Authorization: authHeader },
      params: { $top: 10 }, // Limit to 10 projects
    });
    const projects = response.data.map((project: any) => ({
      id: project.id,
      name: project.name,
      description: project.description || '',
    }));
    return NextResponse.json(projects);
  } catch (error: any) {
    console.error('Error fetching projects:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      code: error.code,
    });
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
  }
}
