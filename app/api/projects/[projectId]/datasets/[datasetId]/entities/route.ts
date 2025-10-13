import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const ODK_CENTRAL_URL = 'https://jinodk.jumpingcrab.com';

interface RouteParams {
  params: Promise <{
    projectId: string;
    datasetId: string;
  }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  console.log('GET route hit for:', { params });
  const { projectId, datasetId } = await params;

  try {
    console.log('Fetching from ODK Central:', { projectId, datasetId });
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ message: 'Missing Authorization header' }, { status: 401 });
    }
    const response = await axios.get(
      `${ODK_CENTRAL_URL}/v1/projects/${projectId}/forms/${datasetId}.svc/Submissions`,
      {
        headers: { Authorization: authHeader },
        params: { $select: '__id,__system/reviewState,G6/Q9_5', $top: 10 },
      }
    );
    console.log('ODK Response:', response.data);

    const entities = response.data.value
      .map((entity: any) => ({
        id: entity.__id,
        lat: entity.G6.Q9_5.coordinates[1],
        lon: entity.G6.Q9_5.coordinates[0],
      }))
      .filter((p: any) => p && !isNaN(p.lat) && !isNaN(p.lon));
    console.log(`Entity: ${entities[0].id}`)
    return NextResponse.json(entities, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching dataset entities:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });
    return NextResponse.json(
      { message: error.response?.data?.message || error.message },
      { status: error.response?.status || 500 }
    );
  }
}

export async function OPTIONS() {
  console.log('OPTIONS route hit');
  return new NextResponse(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Authorization, Content-Type',
    },
  });
}
