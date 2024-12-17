import { Suspense } from 'react'
import LoginForm from './components/LoginForm'
import FollowerManager from './components/FollowerManager'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-r from-blue-500 to-purple-600">
      <Suspense fallback={<div>Loading...</div>}>
        <LoginForm />
        <FollowerManager />
      </Suspense>
    </main>
  )
}

