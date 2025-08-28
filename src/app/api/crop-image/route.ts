import { NextResponse } from 'next/server';

const ONE_DAY_SECONDS = 60 * 60 * 24;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query') || '';
  const width = parseInt(searchParams.get('w') || '400', 10);
  const height = parseInt(searchParams.get('h') || '300', 10);

  const pexelsKey = process.env.PEXELS_API_KEY;
  if (!pexelsKey || !query) {
    return NextResponse.json({
      url: `https://source.unsplash.com/featured/${width}x${height}/?${encodeURIComponent(query || 'agriculture')}`,
      provider: 'unsplash-source-fallback',
    }, {
      headers: {
        'Cache-Control': `public, s-maxage=${ONE_DAY_SECONDS}`,
      }
    });
  }

  try {
    const resp = await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&orientation=landscape&per_page=1`, {
      headers: { Authorization: pexelsKey },
      next: { revalidate: ONE_DAY_SECONDS },
    });
    if (!resp.ok) throw new Error(`Pexels error ${resp.status}`);
    const data = await resp.json();
    const photo = data?.photos?.[0];
    const src = photo?.src?.medium || photo?.src?.landscape || photo?.src?.original;
    if (!src) throw new Error('No photo found');
    return NextResponse.json({ url: src, provider: 'pexels' }, {
      headers: {
        'Cache-Control': `public, s-maxage=${ONE_DAY_SECONDS}`,
      }
    });
  } catch (e) {
    return NextResponse.json({
      url: `https://source.unsplash.com/featured/${width}x${height}/?${encodeURIComponent(query)}`,
      provider: 'unsplash-source-fallback',
    }, {
      headers: {
        'Cache-Control': `public, s-maxage=${ONE_DAY_SECONDS}`,
      }
    });
  }
}


