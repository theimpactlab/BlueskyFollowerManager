import { BskyAgent } from '@atproto/api'

export async function authenticateBluesky(handle: string, appPassword: string) {
  try {
    const agent = new BskyAgent({ service: 'https://bsky.social' })
    await agent.login({ identifier: handle, password: appPassword })
    return agent
  } catch (error) {
    console.error('Bluesky authentication error:', error)
    throw new Error('Failed to authenticate with Bluesky')
  }
}

export async function getFollowers(agent: BskyAgent, actor: string) {
  try {
    let followers: any[] = []
    let cursor: string | undefined
    do {
      const response = await agent.getFollowers({ actor, cursor, limit: 100 })
      followers = followers.concat(response.data.followers)
      cursor = response.data.cursor
    } while (cursor)
    return followers
  } catch (error) {
    console.error('Error getting followers:', error)
    throw new Error('Failed to get followers')
  }
}

export async function followUser(agent: BskyAgent, did: string) {
  try {
    return await agent.follow(did)
  } catch (error) {
    console.error('Error following user:', error)
    throw new Error('Failed to follow user')
  }
}

export async function unfollowUser(agent: BskyAgent, did: string) {
  try {
    return await agent.deleteFollow(did)
  } catch (error) {
    console.error('Error unfollowing user:', error)
    throw new Error('Failed to unfollow user')
  }
}

