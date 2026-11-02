export type Category = 'situation' | 'conversation' | 'context' | 'reflection'

export interface CardSection {
  heading?: string
  text: string
}

export interface LeadershipCard {
  id: string
  number: number
  category: Category
  title: string
  front: CardSection[]
  back: CardSection[]
  related: string[]
  sourcePage: number
}
