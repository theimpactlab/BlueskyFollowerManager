'use client'

import { useState, useEffect } from 'react'

export default function FollowerManager() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [followStatus, setFollowStatus] = useState('')

  useEffect(() => {
    checkLoginStatus()
  }, [])

  const checkLoginStatus = async () => {
    const response = await fetch('/api/check-login')
    if (response.ok) {
      setIsLoggedIn(true)
    }
  }

  const handleFollow = async () => {
    setFollowStatus('Following...')
    const response = await fetch('/api/follow', { method: 'POST' })
    if (response.ok) {
      setFollowStatus('Follow completed')
    } else {
      setFollowStatus('Follow failed')
    }
  }

  const handleUnfollow = async () => {
    setFollowStatus('Unfollowing...')
    const response = await fetch('/api/unfollow', { method: 'POST' })
    if (response.ok) {
      setFollowStatus('Unfollow completed')
    } else {
      setFollowStatus('Unfollow failed')
    }
  }

  if (!isLoggedIn) return null

  return (
    <div className="mt-8 space-y-4 bg-white p-6 rounded-xl shadow-lg max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Follower Manager</h2>
      <button
        onClick={handleFollow}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
      >
        Follow
      </button>
      <button
        onClick={handleUnfollow}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
      >
        Unfollow
      </button>
      {followStatus && <p className="text-center text-gray-600">{followStatus}</p>}
    </div>
  )
}

