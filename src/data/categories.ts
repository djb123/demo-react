import type { Category } from './types'

export const categories: { id: Category; name: string; action: string; description: string; count: number; step: string }[] = [
  { id: 'situation', name: 'Situation', action: 'Diagnose the situation', description: 'Pause and name what’s actually happening.', count: 15, step: '01' },
  { id: 'conversation', name: 'Conversation', action: 'Choose your conversation', description: 'Find the right approach and the words to begin.', count: 10, step: '02' },
  { id: 'context', name: 'Context', action: 'Adjust for context', description: 'Consider what could change how your message lands.', count: 15, step: '03' },
  { id: 'reflection', name: 'Reflection', action: 'Reflect and improve', description: 'Learn from the moment. Lead better next time.', count: 12, step: '04' },
]
