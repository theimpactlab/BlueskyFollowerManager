import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'
import { authenticateBluesky, getFollowers, followUser } from '../../utils/bluesky'

export const runtime = 'edge'

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!)

export async function POST() {
  const session = cookies().get('session')
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

  try {
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
    return NextResponse.json({ error: 'Follow process failed' }, { status: 500 })
  }
}

