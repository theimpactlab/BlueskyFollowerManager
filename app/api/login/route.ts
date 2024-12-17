import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'edge'

const createSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables')
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false }
  })
}

export async function POST(request: Request) {
  try {
    const supabase = createSupabaseClient()

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
  } catch (error) {
    console.error('Login failed:', error)
    return NextResponse.json({ error: 'Login failed' }, { status: 500 })
  }
}

