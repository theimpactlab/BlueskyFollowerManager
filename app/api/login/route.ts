import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'edge'

const createSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase environment variables:', { supabaseUrl, supabaseAnonKey })
    throw new Error('Missing Supabase environment variables')
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false }
  })
}

export async function POST(request: Request) {
  try {
    console.log('Starting login process')
    const supabase = createSupabaseClient()
    console.log('Supabase client created successfully')

    const { handle, appPassword } = await request.json()

    // Store credentials in Supabase
    const { data, error } = await supabase
      .from('users')
      .upsert({ handle, app_password: appPassword })
      .select()

    if (error) {
      console.error('Failed to store credentials:', error)
      return NextResponse.json({ error: 'Failed to store credentials' }, { status: 500 })
    }

    console.log('Credentials stored successfully')

    // Set a session cookie
    const response = NextResponse.json({ message: 'Login successful' })
    response.cookies.set('session', 'authenticated', { httpOnly: true })

    console.log('Login process completed successfully')
    return response
  } catch (error) {
    console.error('Login failed:', error)
    return NextResponse.json({ error: 'Login failed', details: error.message }, { status: 500 })
  }
}

