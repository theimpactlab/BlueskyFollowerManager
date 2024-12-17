import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'edge'

const createSupabaseClient = () => {
  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase environment variables:', { supabaseUrl: !!supabaseUrl, supabaseAnonKey: !!supabaseAnonKey })
    throw new Error('Missing Supabase environment variables')
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false }
  })
}

export async function POST(request: Request) {
  console.log('Login process started')
  try {
    const supabase = createSupabaseClient()
    console.log('Supabase client created successfully')

    const { handle, appPassword } = await request.json()
    console.log('Received login request for handle:', handle)

    // Store credentials in Supabase
    const { data, error } = await supabase
      .from('users')
      .upsert({ handle, app_password: appPassword })
      .select()

    if (error) {
      console.error('Failed to store credentials:', error)
      return NextResponse.json({ error: 'Failed to store credentials', details: error.message }, { status: 500 })
    }

    if (!data || data.length === 0) {
      console.error('No data returned after upsert')
      return NextResponse.json({ error: 'No data returned after upsert' }, { status: 500 })
    }

    console.log('Credentials stored successfully')

    // Set a session cookie
    const response = NextResponse.json({ message: 'Login successful', user: data[0] })
    response.cookies.set('session', 'authenticated', { 
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7 // 1 week
    })

    console.log('Login process completed successfully')
    return response
  } catch (error) {
    console.error('Login failed:', error)
    return NextResponse.json({ error: 'Login failed', details: error.message }, { status: 500 })
  }
}

