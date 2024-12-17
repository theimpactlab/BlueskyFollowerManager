import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'
import { authenticateBluesky, getFollowers, followUser } from '../../utils/bluesky'

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
    const myFollowers = await getFollowers(agent, userData.handle)
    const followersOfFollowers = await Promise.all(
      myFollowers.slice(0, 40).map(follower => getFollowers(agent, follower.did))
    )
    const potentialFollows = followersOfFollowers.flat()
      .sort(() => 0.5 - Math.random())
      .slice(0, 1500)

    for (const user of potentialFollows) {
      await followUser(agent, user.did)
      await new Promise(resolve => setTimeout(resolve, 2000)) // 2 second delay
    }

    return NextResponse.json({ message: 'Follow process completed successfully' })
  } catch (error) {
    console.error('Follow process failed:', error)
    return NextResponse.json({ error: 'Follow process failed' }, { status: 500 })
  }
}

