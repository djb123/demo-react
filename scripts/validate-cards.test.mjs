import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const expected = { situation: 15, conversation: 10, context: 15, reflection: 12 }
const groups = Object.fromEntries(Object.keys(expected).map(category => [category, JSON.parse(readFileSync(new URL(`../src/data/${category}.json`, import.meta.url), 'utf8'))]))
const cards = Object.values(groups).flat()

test('all 52 front/back pairs are complete, unique, and assigned to the correct category', () => {
  assert.equal(cards.length, 52)
  assert.equal(new Set(cards.map(card => card.id)).size, 52)
  assert.deepEqual(cards.map(card => card.number), Array.from({ length: 52 }, (_, index) => index + 1))
  for (const [category, group] of Object.entries(groups)) {
    assert.equal(group.length, expected[category])
    for (const card of group) {
      assert.equal(card.category, category)
      assert.ok(card.title && card.sourcePage >= 4 && card.sourcePage <= 29)
      assert.ok(card.front.length && card.back.length)
      for (const side of ['front', 'back']) for (const section of card[side]) assert.ok(section.text.trim(), `${card.id}: empty ${side} section`)
    }
  }
})

test('every printed situation recommendation resolves to a conversation', () => {
  for (const card of groups.situation) {
    assert.equal(card.back.filter(section => section.heading?.startsWith('IF ')).length, 3)
    const referenced = new Set()
    for (const section of card.back.filter(section => section.text.startsWith('THEN choose'))) {
      const target = groups.conversation.find(candidate => section.text.includes(candidate.title.toUpperCase()))
      assert.ok(target, `${card.id}: unresolved ${section.text}`)
      referenced.add(target.id)
    }
    assert.deepEqual(new Set(card.related), referenced)
  }
})

test('the sample walkthrough resolves to the source cards and preserves its recommendation', () => {
  const path = ['situation-low-performance', 'conversation-motivation-strengths', 'context-leading-when-trust-is-low', 'reflection-reaction-vs-intention']
  for (const id of path) assert.ok(cards.some(card => card.id === id), id)
  assert.ok(cards.find(card => card.id === path[0]).related.includes(path[1]))
})
