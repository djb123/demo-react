import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'

export const Route = createFileRoute('/')({
  component: Index,
})

function Index() {
  const [count, setCount] = useState(0)
  return (
    <div className="p-2">
      <h3>Welcome Home!</h3>
      <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
    </div>
  )
}