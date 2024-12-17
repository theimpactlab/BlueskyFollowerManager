import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export const runtime = 'edge'

export async function GET() {
  const cookieStore = cookies()
  const session = cookieStore.get('session')
  if (session && session.value === 'authenticated') {
    return NextResponse.json({ isLoggedIn: true })
  }
  return NextResponse.json({ isLoggedIn: false })
}

