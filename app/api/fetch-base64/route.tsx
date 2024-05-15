import {NextRequest,  NextResponse } from 'next/server';
const baseUrl = 'https://firebasestorage.googleapis.com/v0/b/success-1af87.appspot.com/o';

export async function POST(req: NextRequest) {
  const staticUrl = "https://firebasestorage.googleapis.com/v0/b/success-1af87.appspot.com/o/uploads%2FMxj1jPA1sSNJcozS2oOsmDao3K83%2Fthumbnails%2FJHi5sj8OaFqtsmjW8lRfm2Jj9pMkVK7iLNMmKoHy7gNC.png?alt=media&token=bd6bc99d-9b52-42d2-8773-8efd6d100d00"
  const searchParams = req.nextUrl.searchParams
  const uid = searchParams.get('uid')
  const fileName = searchParams.get('fileName')
  const token = searchParams.get('token');
  console.log("uid", uid);
  console.log("fileName", fileName);
  console.log("token", token)
  console.log("searchParams", searchParams);
  const middle = encodeURIComponent(`uploads/${uid}/thumbnails/${fileName}`.slice(0, -4) + ".png");
  const dynamicUrl = `${baseUrl}/${middle}?alt=media&token=${token}`
  console.log("dynamicUrl", dynamicUrl);
  
  try {
    const response = await fetch(dynamicUrl);

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