import situation from './situation.json'
import conversation from './conversation.json'
import context from './context.json'
import reflection from './reflection.json'
import type { LeadershipCard } from './types'

export const cards = [...situation, ...conversation, ...context, ...reflection] as LeadershipCard[]
export const cardById = new Map(cards.map(card => [card.id, card]))
