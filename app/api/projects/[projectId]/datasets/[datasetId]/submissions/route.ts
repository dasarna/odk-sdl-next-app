import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const ODK_CENTRAL_URL = 'https://jinodk.jumpingcrab.com';

interface RouteParams {
  params: Promise<{
    projectId: string;
    datasetId: string;
  }>;
}

interface FormField {
  path: string;
  name: string;
  type: string;
  binary: any;
  selectMultiple: any;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  console.log('GET route hit for:', { params });
  const { projectId, datasetId } = await params;

  try {
    console.log('Fetching form fields + ALL submissions:', { projectId, datasetId });
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ message: 'Missing Authorization header' }, { status: 401 });
    }

    // FIXED: Step 1 - Get FORM FIELDS (CORRECT URL)
    const fieldsResponse = await axios.get(
      `${ODK_CENTRAL_URL}/v1/projects/${projectId}/forms/${datasetId}/fields`, // ✅ CORRECT
      {
        headers: { Authorization: authHeader },
        params: { $select: '*' }
      }
    );

    const fields: FormField[] = fieldsResponse.data || [];
    console.log('Form fields fetched:', fields.length);

    // Find FIRST geopoint field
    const geoPointField = fields.find(field => field.type === 'geopoint');
    const geoPointPath = geoPointField?.path || null;
    const geoPointsAvailable = !!geoPointField;
    //const geoPointPath2 = geoPointPath ? geoPointPath.replace(/\//g, ".") : '';

    console.log('Detected geopoint:', {
      path: geoPointPath, 
      available: geoPointsAvailable,
      fieldName: geoPointField?.name 
    });

    // FIXED: Step 2 - Get ALL submissions (CORRECT ODATA FILTER)
    const submissionsResponse = await axios.get(
      `${ODK_CENTRAL_URL}/v1/projects/${projectId}/forms/${datasetId}.svc/Submissions`,
      {
        headers: { Authorization: authHeader },
        params: { 
          $select: '*', 
          // ✅ FIXED: Correct OData syntax for "NOT rejected"
          $filter: "__system/reviewState ne 'rejected'"
        },
      }
    );

    const allSubmissions = submissionsResponse.data.value || [];
    console.log('ALL submissions fetched:', allSubmissions.length);

    // Dynamic geoPoint extraction (unchanged)
    const entities = allSubmissions
      .map((entity: any) => {
        let lat: number | undefined;
        let lon: number | undefined;

        if (geoPointPath) {
          const pathParts = geoPointPath.replace('/','').split('/');
          let geoValue = entity;
          for (const part of pathParts) {
            geoValue = geoValue?.[part];
          }
          lat = geoValue?.coordinates?.[1];
          lon = geoValue?.coordinates?.[0];
        }

        return {
          id: entity.__id,
          fullData: entity,
          lat,
          lon,
        };
      })
      .filter((p: any) => p.lat !== undefined && !isNaN(p.lat) && !isNaN(p.lon));

    return NextResponse.json({
      submissions: allSubmissions,
      entities,
      geoPointsAvailable,
      totalSubmissions: allSubmissions.length,
      geoPointPath: geoPointPath
    }, { status: 200 });

  } catch (error: any) {
    console.error('Error fetching submissions/fields:', {
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
