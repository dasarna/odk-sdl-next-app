// app/api/projects/[projectId]/datasets/route.ts
import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const ODK_CENTRAL_URL = 'https://jinodk.jumpingcrab.com';

interface RouteParams {
  params: Promise<{ projectId: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  const { projectId } = await params;
  const authHeader = req.headers.get('authorization');
  try {
    const response = await axios.get(`${ODK_CENTRAL_URL}/v1/projects/${projectId}/forms`, {
      headers: { Authorization: authHeader },
      params: { $top: 10 }, // Limit to 10 forms
    });

    const datasets = response.data.map((form: any) => ({
      xmlFormId: form.xmlFormId,
      name: form.name || form.xmlFormId,
      state: form.state || 'open', // Default to 'open' if undefined
      total:0,
      edited:0,
      rejected:0,
      approved:0,
    }));

    for (var i=0;i<datasets.length;i++) {
      const response = await axios.get(`${ODK_CENTRAL_URL}/v1/projects/${projectId}/forms/${datasets[i].xmlFormId}/submissions`, {
        headers: { Authorization: authHeader },
        //params: {$select: 'instanceId,reviewState'}, // Limit to 10 forms
      });
      const submissions = response.data.map((entity: any) => ({
        id: entity.instanceId,
        reviewState: entity.reviewState,
      }));
      //.filter((p: any) => p && !isNaN(p.lat) && !isNaN(p.lon));
      datasets[i].total = submissions.length;
      datasets[i].edited = submissions.filter((s: any) => s.reviewState === 'edited').length;
      datasets[i].rejected = submissions.filter((s: any) => s.reviewState === 'rejected').length;
      datasets[i].approved = submissions.filter((s: any) => s.reviewState === 'approved').length;
    }

    return NextResponse.json(datasets);
  } catch (error: any) {
    console.error('Error fetching datasets:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      code: error.code,
    });
    return NextResponse.json({ error: 'Failed to fetch datasets' }, { status: 500 });
  }
}