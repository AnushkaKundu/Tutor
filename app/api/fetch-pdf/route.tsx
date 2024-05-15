import {NextRequest,  NextResponse } from 'next/server';

const baseUrl = 'https://firebasestorage.googleapis.com/v0/b/success-1af87.appspot.com/o';

export async function POST(req: NextRequest) {
  // const staticUrl = 'https://firebasestorage.googleapis.com/v0/b/success-1af87.appspot.com/o/uploads%2FMxj1jPA1sSNJcozS2oOsmDao3K83%2FModule%202_Technical%20Analysis.pdf?alt=media&token=f977addb-0569-4035-9f9c-fc9d3d5a2e5e';
  const searchParams = req.nextUrl.searchParams
  const uid = searchParams.get('uid')
  const fileName = searchParams.get('fileName')
  const token = searchParams.get('token');
  const middle = encodeURIComponent(`uploads/${uid}/${fileName}`);
  const dynamicUrl = `${baseUrl}/${middle}?alt=media&token=${token}`
  
  try {
    const response = await fetch(dynamicUrl);

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    };

    const stream  = response.body;
    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'application/pdf',
      }
    });

    } catch (error) {
    return new NextResponse(JSON.stringify({ message: "Failed to fetch"}), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}