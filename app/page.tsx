import Image from 'next/image'
import Quiz from '@/pages/quiz';  // Adjust the path based on where your Quiz component is located

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-1">
      <Quiz />
    </main>
  )
}
