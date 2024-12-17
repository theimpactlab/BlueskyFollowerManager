import { BskyAgent, AtpSessionEvent, AtpSessionData } from '@atproto/api'

export async function authenticateBluesky(handle: string, appPassword: string) {
  const agent = new BskyAgent({ service: 'https://bsky.social' })
  await agent.login({ identifier: handle, password: appPassword })
  return agent
}

export async function getFollowers(agent: BskyAgent, actor: string) {
  let followers: any[] = []
  let cursor: string | undefined
  do {
    const response = await agent.getFollowers({ actor, cursor, limit: 100 })
    followers = followers.concat(response.data.followers)
    cursor = response.data.cursor
  } while (cursor)
  return followers
}

export async function followUser(agent: BskyAgent, did: string) {
  return await agent.follow(did)
}

export async function unfollowUser(agent: BskyAgent, did: string) {
  return await agent.deleteFollow(did)
}

