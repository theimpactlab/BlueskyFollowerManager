import { Suspense } from 'react'
import FollowerManager from './components/FollowerManager'
import LoginForm from './components/LoginForm'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <h1 className="text-4xl font-bold mb-8">Bluesky Follower Manager</h1>
      <Suspense fallback={<div>Loading...</div>}>
        <LoginForm />
        <FollowerManager />
      </Suspense>
    </main>
  )
}

