import { NextResponse, type NextRequest } from 'next/server'

// Auth is handled client-side in each page via useEffect.
// This proxy only adds cookie passthrough — no server Supabase calls
// that can crash navigation on Vercel edge.
export function proxy(request: NextRequest) {
  return NextResponse.next({ request })
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
