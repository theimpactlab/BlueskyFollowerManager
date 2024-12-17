import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'
import { authenticateBluesky, unfollowUser } from '../../utils/bluesky'

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

export async function POST() {
  try {
    const supabase = createSupabaseClient()

    const cookieStore = cookies()
    const session = cookieStore.get('session')
    if (!session || session.value !== 'authenticated') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Retrieve user credentials from Supabase
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('handle, app_password')
      .single()

    if (userError || !userData) {
      return NextResponse.json({ error: 'Failed to retrieve user data' }, { status: 500 })
    }

    const agent = await authenticateBluesky(userData.handle, userData.app_password)
    const { data: followedAccounts } = await supabase
      .from('followed_accounts')
      .select('user_did, follow_record_uri')

    if (followedAccounts && followedAccounts.length > 0) {
      for (const account of followedAccounts) {
        await unfollowUser(agent, account.user_did)
        await supabase
          .from('followed_accounts')
          .delete()
          .match({ user_did: account.user_did })
        await new Promise(resolve => setTimeout(resolve, 2000)) // 2 second delay
      }
    }

    return NextResponse.json({ message: 'Unfollow process completed successfully' })
  } catch (error) {
    console.error('Unfollow process failed:', error)
    return NextResponse.json({ error: 'Unfollow process failed' }, { status: 500 })
  }
}

