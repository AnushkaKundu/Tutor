import { NextApiRequest } from "next";
import { NextResponse } from 'next/server';

export async function GET(req: NextApiRequest) {
  try {
    // const response = await fetch('https://google.com');
	const response = await fetch('https://jsonplaceholder.typicode.com/posts');

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    };

    const data = await response.json();
    return NextResponse.json({ message: "fetched", data: data });
    } catch (error) {
    return new NextResponse(JSON.stringify({ message: "Failed to fetch"}), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}
// import { NextApiRequest } from "next";
// import { NextResponse } from 'next/server';
// export async function GET(req : NextApiRequest) {
//     const response = await fetch('https://jsonplaceholder.typicode.com/posts');
//     const data = await response.json();
//     return NextResponse.json({message : "fetched", data : data});
// };
