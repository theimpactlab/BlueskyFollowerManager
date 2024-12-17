import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'edge'

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!)

export async function POST(request: Request) {
  const { handle, appPassword } = await request.json()

  // Store credentials in Supabase
  const { data, error } = await supabase
    .from('users')
    .upsert({ handle, app_password: appPassword })
    .select()

  if (error) {
    return NextResponse.json({ error: 'Failed to store credentials' }, { status: 500 })
  }

  // Set a session cookie
  const response = NextResponse.json({ message: 'Login successful' })
  response.cookies.set('session', 'authenticated', { httpOnly: true })

  return response
}
