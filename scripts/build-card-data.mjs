import { readFileSync, writeFileSync } from 'node:fs'

const titles = [
  'Accountability Avoidance', 'Silence or Withdrawal', 'Passive Resistance', 'Low Performance', 'Burnout Signals', 'Growth Uncertainty', 'High Performer Problems', 'Bad Attitude', 'Lack of Ownership', 'Role Confusion', 'Team Conflict', 'Culture Drift', 'Change Resistance', 'Decision Gridlock', 'Project Breakdown',
  'Alignment', 'Feedback', 'Coaching', 'Motivation & Strengths', 'Growth', 'Change', 'Conflict Resolution', 'Decision-Making', 'Culture', 'Recognition',
  'Leading When You’re Emotionally Triggered', 'Leading Without Formal Authority', 'Leading Someone More Experienced Than You', 'Leading a Low Performer', 'Leading a High Performer with a Bad Attitude', 'Leading Someone Who Doesn’t Respect You', 'Leading a Former Peer', 'Leading Your Boss', 'Leading a New Hire', 'Leading Under Time Pressure', 'Leading Publicly', 'Leading When Trust Is Low', 'Leading Through Gossip or Negativity', 'Leading When Standards Keep Slipping', 'Leading After You’ve Let Things Slide',
  'Reaction vs. Intention', 'Emotional Awareness', 'Avoided Conversations', 'Hesitation vs. Action', 'Comfort vs. Clarity', 'Control vs. Listening', 'Assume vs. Clarify', 'Pushing vs. Exploring', 'Symptom vs. Problem', 'Let It Slide vs. Held the Line', 'Rescue vs. Ownership', 'Unhealthy Patterns',
]
const models = [
  ['BCS Model', 'Benefits → Challenges → Solutions', 'Lead with clarity, not assumptions.'],
  ['SBIP Model', 'Situation → Behavior → Impact → Plan', 'Address behavior, not emotion.', 'Based on the SBI model developed by the Center for Creative Leadership.'],
  ['3 C’s Framework', 'Curiosity → Clarity → Co-Creation', 'Develop thinking, not dependency.'],
  ['MINE Model', 'Motivation → Interests & Strengths → Needs → Environment', 'Understand the MINE before applying pressure.'],
  ['JCP Framework', 'Job → Career → Purpose', 'Shift thinking from today’s tasks to tomorrow’s impact.'],
  ['WTC Model', 'Why → Transparency → Control', 'Lead through uncertainty, not around it.'],
  ['DEAL Method', 'Discover → Empathize → Align → Lock in', 'Resolve the issue, not the emotion.'],
  ['DECIDE Model', 'Define → Explore → Consider → Identify → Decide Without Delay → Evaluate', 'Clarity beats consensus.'],
  ['VBC Model', 'Values → Behaviors → Commitments', 'Build culture with people, not for them.'],
  ['STYLE Model', 'Specific → Tailored → Why → Land → Echo', 'Reinforce what you want repeated.'],
]
const slug = text => text.toLowerCase().replace(/[’']/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
const flat = text => text.replace(/\s+/g, ' ').trim()
const clean = text => text.replace(/\|/g, 'I').replace(/\bcrediblity\b/g, 'credibility').replace(/\bpossiblities\b/g, 'possibilities').replace(/\bighore\b/g, 'ignore').replace(/\bcutlure\b/g, 'culture').replace(/\bdoea\b/g, 'does').replace(/PLAN \{Co-Create\)/g, 'PLAN (Co-Create)').replace(/can l influence/g, 'can I influence').replace(/Am \/\n/g, 'Am I\n').replace(/I ead/g, 'Lead').replace(/I everage/g, 'Leverage').replace(/\bInv ite\b/g, 'Invite').replace(/\bam\nunintentionally/g, 'am I\nunintentionally')
const cards = []
for (let n = 4; n <= 29; n++) {
  const sides = JSON.parse(readFileSync(`.card-extraction/page-${n}.json`, 'utf8')).map(clean)
  for (let row = 0; row < 2; row++) {
    const index = (n - 4) * 2 + row
    const category = index < 15 ? 'situation' : index < 25 ? 'conversation' : index < 40 ? 'context' : 'reflection'
    const frontRaw = sides[row * 2].trim().split(/\n\n+/).slice(1).join('\n\n').split(new RegExp(`\\n${category.toUpperCase()}`))[0].trim()
    let front = []
    let back = []
    const raw = sides[row * 2 + 1].trim()
    const related = []
    if (category === 'situation') {
      const prompt = flat(frontRaw).replace(/ Pause before reacting\.$/, '')
      front = [{ text: prompt }, { text: 'Pause before reacting.' }]
      const body = flat(raw.replace(/^START HERE\s+DIAGNOSE\s+THE SITUATION\s+/, ''))
      const matches = [...body.matchAll(/IF (.*?)THEN choose (an? .*? Card)/g)]
      if (matches.length !== 3) throw new Error(`Expected three recommendations: ${titles[index]}`)
      back = matches.map(match => {
        const condition = match[1].replace(/[\s=»>2→-]+$/, '').trim()
        const recommendation = match[2].replace(/DECISION- MAKING/g, 'DECISION-MAKING')
        const target = recommendation.replace(/^an? /, '').replace(/ Card$/, '')
        related.push(`conversation-${slug(target)}`)
        return { heading: `IF ${condition}`, text: `THEN choose ${recommendation}.` }
      })
      const last = matches.at(-1)
      back.push({ text: body.slice(last.index + last[0].length).trim() })
    } else if (category === 'conversation') {
      const [model, steps, quote, attribution] = models[index - 15]
      front = [{ text: quote }, { heading: model, text: steps }, ...(attribution ? [{ text: attribution }] : [])]
      const body = raw.replace(/^HOW TO LEAD\s+THIS CONVERSATION\s+USE THE [^\n]+\n/, '').trim()
      const lines = body.split('\n')
      let section = null
      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed) continue
        if (/^[A-Z][A-Z &-]+(?: \(Co-Create\))?$/.test(trimmed) || /^(Before you have the conversation|After this conversation):/.test(trimmed)) {
          if (section) back.push(section)
          if (trimmed.startsWith('After this conversation:')) section = { heading: 'After this conversation', text: trimmed.replace('After this conversation:', '').trim() }
          else section = { heading: trimmed.replace(/:$/, ''), text: '' }
        } else {
          if (!section) section = { text: '' }
          section.text = flat(`${section.text} ${trimmed.replace(/^[—=→>-]+\s*/, '')}`)
        }
      }
      if (section) back.push(section)
    } else if (category === 'context') {
      front = [{ text: flat(frontRaw).replace(/ Adjust before you act\.$/, '') }, { text: 'Adjust before you act.' }]
      const body = raw.replace(/^CONSIDER\s+THE CONTEXT\s+LEADER ADJUSTMENT\s+/, '')
      const [adjustments, remainder] = body.split('Ask yourself:')
      const paragraphs = remainder.trim().split(/\n\n+/)
      back = [{ heading: 'Leader adjustment', text: flat(adjustments).replace(/(?:^|\s)[*¢+es] /g, '\n• ').trim() }, { heading: 'Ask yourself', text: flat(paragraphs[0]) }, { text: flat(paragraphs.slice(1).join(' ')) }]
    } else {
      front = [{ text: flat(frontRaw) }]
      const blocks = raw.replace(/^AND LEARN\s+/, '').split(/\n\n+/)
      let section = null
      for (const block of blocks) {
        if (block.startsWith('When ')) {
          if (section) back.push(section)
          const lines = block.split('\n')
          let heading = lines.shift()
          if (heading === 'When you pushed for an') heading += ` ${lines.shift()}`
          section = { heading, text: flat(lines.join(' ')) }
        } else if (section && !section.text) section.text = flat(block)
        else { if (section) { back.push(section); section = null }; back.push({ text: flat(block) }) }
      }
      if (section) back.push(section)
    }
    cards.push({ id: `${category}-${slug(titles[index])}`, number: index + 1, category, title: titles[index], front, back, related: [...new Set(related)], sourcePage: n })
  }
}
for (const category of ['situation', 'conversation', 'context', 'reflection']) {
  const group = cards.filter(card => card.category === category)
  writeFileSync(`src/data/${category}.json`, JSON.stringify(group, null, 2) + '\n')
  console.log(`${category}: ${group.length} cards`)
}
for (const card of cards) for (const id of card.related) if (!cards.some(c => c.id === id)) throw new Error(`Unresolved ${id}`)
