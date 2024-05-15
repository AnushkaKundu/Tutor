import {NextRequest,  NextResponse } from 'next/server';

const baseUrl = 'https://firebasestorage.googleapis.com/v0/b/success-1af87.appspot.com/o';

export async function POST(req: NextRequest) {
  const staticUrl = "https://firebasestorage.googleapis.com/v0/b/success-1af87.appspot.com/o/uploads%2FMxj1jPA1sSNJcozS2oOsmDao3K83%2Fthumbnails%2FModule%202_Technical%20Analysis?alt=media&token=9fb2e8e2-6a93-4ace-a900-e684f36834c0"
  // const searchParams = req.nextUrl.searchParams
  // const uid = searchParams.get('uid')
  // const fileName = searchParams.get('fileName')
  // const token = searchParams.get('token');
  // const middle = encodeURIComponent(`uploads/thumbnails/${uid}/${fileName}`.slice(0, -4) + ".png");
  // const dynamicUrl = `${baseUrl}/${middle}?alt=media&token=${token}`
  
  try {
    const response = await fetch(staticUrl);

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    };

    const stream  = response.body;
    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'image/png;base64',
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