// src/app/api/export/pdf/route.ts
import { exportResumeAsPdf } from '@/app/actions/resumeActions';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { markdownContent } = await request.json();
    if (!markdownContent || typeof markdownContent !== 'string') {
      return NextResponse.json({ error: 'Invalid markdownContent provided' }, { status: 400 });
    }

    const result = await exportResumeAsPdf(markdownContent);

    if (result.success && result.fileBuffer && result.contentType && result.fileName) {
      const buffer = Buffer.from(result.fileBuffer, 'base64');
      return new NextResponse(buffer, {
        status: 200,
        headers: {
          'Content-Type': result.contentType,
          'Content-Disposition': `attachment; filename="${result.fileName}"`,
        },
      });
    } else {
      return NextResponse.json({ error: result.error || 'Failed to generate PDF' }, { status: 500 });
    }
  } catch (error) {
    console.error('API PDF Export Error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
