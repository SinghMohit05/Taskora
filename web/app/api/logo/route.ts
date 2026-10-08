import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  const possiblePaths = [
    path.join(process.cwd(), 'public', 'taskora-logo.png'),
    path.join(process.cwd(), '..', 'Taskora Logo.png'),
  ];

  for (const filePath of possiblePaths) {
    if (fs.existsSync(filePath)) {
      const buffer = fs.readFileSync(filePath);
      return new NextResponse(buffer, {
        headers: {
          'Content-Type': 'image/png',
          'Content-Length': buffer.length.toString(),
          'Cache-Control': 'public, max-age=86400, stale-while-revalidate=43200',
        },
      });
    }
  }

  return new NextResponse('Logo not found', { status: 404 });
}
