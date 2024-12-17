import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'
import { authenticateBluesky, getFollowers, followUser } from '../../utils/bluesky'

export const runtime = 'edge'

const createSupabaseClient = () => {
  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase environment variables:', { supabaseUrl, supabaseAnonKey })
    throw new Error('Missing Supabase environment variables')
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false }
  })
}

export async function POST() {
  try {
    console.log('Starting follow process')
    const supabase = createSupabaseClient()
    console.log('Supabase client created successfully')

    const cookieStore = cookies()
    const session = cookieStore.get('session')
    if (!session || session.value !== 'authenticated') {
      console.log('Unauthorized access attempt')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Retrieve user credentials from Supabase
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('handle, app_password')
      .single()

    if (userError) {
      console.error('Failed to retrieve user data:', userError)
      return NextResponse.json({ error: 'Failed to retrieve user data' }, { status: 500 })
    }

    if (!userData) {
      console.error('No user data found')
      return NextResponse.json({ error: 'No user data found' }, { status: 404 })
    }

    console.log('User data retrieved successfully')

    const agent = await authenticateBluesky(userData.handle, userData.app_password)
    console.log('Authenticated with Bluesky')

    const myFollowers = await getFollowers(agent, userData.handle)
    console.log(`Retrieved ${myFollowers.length} followers`)

    const followersOfFollowers = await Promise.all(
      myFollowers.slice(0, 40).map(follower => getFollowers(agent, follower.did))
    )
    console.log('Retrieved followers of followers')

    const potentialFollows = followersOfFollowers.flat()
      .sort(() => 0.5 - Math.random())
      .slice(0, 1500)
    console.log(`Selected ${potentialFollows.length} potential follows`)

    for (const user of potentialFollows) {
      await followUser(agent, user.did)
      await new Promise(resolve => setTimeout(resolve, 2000)) // 2 second delay
    }

    console.log('Follow process completed successfully')
    return NextResponse.json({ message: 'Follow process completed successfully' })
  } catch (error) {
    console.error('Follow process failed:', error)
    return NextResponse.json({ error: 'Follow process failed', details: error.message }, { status: 500 })
  }
}

