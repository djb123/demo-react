import { createFileRoute, Link } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { ArrowDown, ArrowRight, ArrowUpRight, BookOpen, Check, CheckCheck, ChevronRight, CircleHelp, Compass, Download, Layers, MessageCircle, Plus, RotateCcw, Search, SlidersHorizontal, Sparkles, Sprout, X } from 'lucide-react'
import { cards, cardById } from '../data'
import { categories } from '../data/categories'
import type { Category, LeadershipCard } from '../data/types'
import { Dialog } from '../components/Dialog'
import { useSession } from '../session'

type DeckSearch = { category: Category; q?: string; card?: string; guide?: boolean }
export const Route = createFileRoute('/')({
  validateSearch: (search: Record<string, unknown>): DeckSearch => ({
    category: categories.some(category => category.id === search.category) ? search.category as Category : 'situation',
    q: typeof search.q === 'string' ? search.q : undefined,
    card: typeof search.card === 'string' ? search.card : undefined,
    guide: search.guide === true || search.guide === 'true' ? true : undefined,
  }),
  component: Deck,
})

const icons = { situation: Compass, conversation: MessageCircle, context: SlidersHorizontal, reflection: Sprout }

function CardDetail({ card, selected, toggle, close, openCard, browse }: { card: LeadershipCard; selected: boolean; toggle: () => void; close: () => void; openCard: (id: string) => void; browse: (category: Category) => void }) {
  const [side, setSide] = useState<'front' | 'back'>('front')
  const Icon = icons[card.category]
  return <Dialog title={card.title} onClose={close} className={`detail-dialog category-${card.category}`}>
    <div className="detail-eyebrow"><Icon size={17} /><span>{card.category} card</span><span className="card-number">{String(card.number).padStart(2, '0')}</span></div>
    <h2>{card.title}</h2>
    <div className="tabs tabs-box side-tabs" role="tablist" aria-label="Card side" onKeyDown={event => { if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) { event.preventDefault(); const next = event.key === 'Home' ? 'front' : event.key === 'End' ? 'back' : side === 'front' ? 'back' : 'front'; setSide(next); document.getElementById(`tab-${next}`)?.focus() } }}>
      <button id="tab-front" tabIndex={side === 'front' ? 0 : -1} className={`tab ${side === 'front' ? 'tab-active' : ''}`} role="tab" aria-selected={side === 'front'} aria-controls="card-content" onClick={() => setSide('front')}>Front · The prompt</button>
      <button id="tab-back" tabIndex={side === 'back' ? 0 : -1} className={`tab ${side === 'back' ? 'tab-active' : ''}`} role="tab" aria-selected={side === 'back'} aria-controls="card-content" onClick={() => setSide('back')}>Back · The guidance</button>
    </div>
    <div id="card-content" role="tabpanel" aria-labelledby={`tab-${side}`} className={`card-content ${side}`}>
      {card[side].map((section, index) => {
        const target = side === 'back' && section.text.startsWith('THEN choose') ? cards.find(candidate => candidate.category === 'conversation' && section.text.includes(candidate.title.toUpperCase())) : undefined
        return <div key={index} className="card-section">{section.heading && <h3>{section.heading}</h3>}{target ? <button className="inline-card-link" onClick={() => openCard(target.id)}>{section.text}<ArrowUpRight size={16} /></button> : <p>{section.text}</p>}</div>
      })}
      {side === 'front' && <button className="text-button" onClick={() => setSide('back')}>Explore the guidance <ArrowRight size={16} /></button>}
    </div>
    {card.related.length > 0 && <div className="related-cards"><div className="section-label">Continue with a conversation</div><p>Follow the conditions on the back to choose your next card.</p>{card.related.map(id => {
      const related = cardById.get(id)
      return related && <button className="related-link" key={id} onClick={() => openCard(id)}><MessageCircle size={16} />{related.title}<ArrowUpRight size={16} /></button>
    })}</div>}
    <div className="detail-browse"><span className="section-label">Explore another perspective</span><div>{categories.filter(category => category.id !== card.category).map(category => <button className={`category-${category.id}`} key={category.id} onClick={() => browse(category.id)}>{category.name}<ArrowRight size={13} /></button>)}</div></div>
    <div className="detail-actions"><button className={`btn ${selected ? 'btn-outline' : 'btn-primary'}`} onClick={toggle}>{selected ? <Check size={17} /> : <Plus size={17} />}{selected ? 'Added to session · Remove' : 'Add to current session'}</button><span>Original deck · Page {card.sourcePage}</span></div>
  </Dialog>
}

function Deck() {
  const search = Route.useSearch()
  const navigate = Route.useNavigate()
  const { session, setSession, toggle, reset, exportSession, storageError } = useSession()
  const [confirmReset, setConfirmReset] = useState(false)
  const [sessionOpen, setSessionOpen] = useState(false)
  useEffect(() => { if (sessionOpen) document.getElementById('current-session')?.scrollIntoView({ behavior: 'smooth', block: 'start' }) }, [sessionOpen])
  const currentCategory = categories.find(category => category.id === search.category)!
  const activeCard = search.card ? cardById.get(search.card) : undefined
  const query = search.q?.trim().toLowerCase() || ''
  const filtered = cards.filter(card => query ? `${card.title} ${card.category} ${[...card.front, ...card.back].map(s => `${s.heading || ''} ${s.text}`).join(' ')}`.toLowerCase().includes(query) : card.category === search.category)
  const changeCategory = (category: Category) => { void navigate({ search: { category } }) }
  const openCard = (id: string) => { void navigate({ search: previous => ({ ...previous, card: id }) }) }
  const closeCard = () => { void navigate({ search: previous => ({ ...previous, card: undefined }), replace: true }) }
  const closeGuide = () => { void navigate({ search: previous => ({ ...previous, guide: undefined }), replace: true }) }
  const selectedCards = session.selected.map(id => cardById.get(id)!).filter(Boolean)
  const completedSteps = categories.filter(category => selectedCards.some(card => card.category === category.id)).length

  return <>
    <header className="site-header"><div className="header-inner">
      <Link to="/" search={{ category: 'situation' }} className="brand" aria-label="If This, Then That — home"><img src="/cards.svg" alt="" /><span><strong>IF THIS, THEN THAT<span className="brand-dot">.</span></strong><small>CARDS FOR LEADERS</small></span></Link>
      <nav aria-label="Main navigation"><Link to="/" search={{ category: search.category }} className="header-link active">The deck</Link><button className="header-link" onClick={() => void navigate({ search: previous => ({ ...previous, guide: true }) })}>How it works <CircleHelp size={15} /></button></nav>
      <button className="btn session-trigger" aria-label={`My session, ${session.selected.length} cards`} onClick={() => { setSessionOpen(true); if (sessionOpen) document.getElementById('current-session')?.scrollIntoView({ behavior: 'smooth', block: 'start' }) }}><Layers size={17} /><span>My session</span><span className="session-count">{session.selected.length}</span></button>
    </div></header>

    <main className="page-shell">
      <section className="hero-section" aria-labelledby="hero-title"><div className="hero-copy"><div className="eyebrow"><span /> SMALL PROMPTS. MEANINGFUL SHIFTS.</div><h1 id="hero-title">A little pause.<br />A better <em>conversation.</em></h1><p>52 cards for the moments that matter.<br />Find your situation. Choose your approach. Lead with intention.</p></div>
        <div className="hero-art" aria-hidden="true"><div className="mini-card mini-back"><Sprout /><span>REFLECT &<br />GROW.</span></div><div className="mini-card mini-middle"><MessageCircle /><span>CHOOSE YOUR<br />WORDS.</span></div><div className="mini-card mini-front"><span className="mini-label">A MOMENT TO LEAD</span><Compass size={32} strokeWidth={1.3} /><span className="mini-quote">Pause before<br /><em>reacting.</em></span><span className="mini-footer">IF THIS, THEN THAT <ArrowUpRight size={14} /></span></div><span className="art-caption">A small deck. A lasting practice.</span></div>
      </section>

      <div className="workspace-layout"><section className="deck-area" aria-label="Card library">
        <div className="category-navigation" role="navigation" aria-label="Card categories">{categories.map(category => {
          const Icon = icons[category.id]
          return <button key={category.id} className={`category-tab category-${category.id} ${search.category === category.id && !query ? 'is-active' : ''}`} onClick={() => changeCategory(category.id)} aria-current={search.category === category.id && !query ? 'page' : undefined}><Icon size={19} /><span>{category.name}</span><span className="tab-count">{category.count}</span></button>
        })}</div>

        <div className="deck-toolbar"><div><div className="section-label">{query ? 'FIND YOUR NEXT CARD' : `STEP ${currentCategory.step} / 04`}</div><h2>{query ? 'Search the whole deck' : currentCategory.action}</h2><p>{query ? `${filtered.length} ${filtered.length === 1 ? 'card matches' : 'cards match'} “${search.q}”` : currentCategory.description}</p></div><label className="input search-input"><Search size={17} /><input type="search" aria-label="Search all 52 cards" placeholder="Search all 52 cards…" value={search.q || ''} onChange={event => void navigate({ search: previous => ({ ...previous, q: event.target.value || undefined }), replace: true })} /></label></div>

        <div className="card-grid">{filtered.map(card => {
          const Icon = icons[card.category]
          const selected = session.selected.includes(card.id)
          return <article className={`card deck-card category-${card.category} ${selected ? 'is-selected' : ''}`} key={card.id}>
            <button className="card-main" onClick={() => openCard(card.id)} aria-label={`Open ${card.title}`}><div className="card-topline"><span><Icon size={14} />{card.category}</span><span className="card-number">{String(card.number).padStart(2, '0')}</span></div><h3>{card.title}</h3><p>{card.front[0]?.text}</p><div className="card-bottomline"><span>Explore card</span><ArrowUpRight size={19} /></div></button>
            <button className={`btn btn-circle card-add ${selected ? 'selected' : ''}`} aria-label={`${selected ? 'Remove' : 'Add'} ${card.title} ${selected ? 'from' : 'to'} session`} aria-pressed={selected} onClick={() => toggle(card.id)}>{selected ? <Check size={16} /> : <Plus size={16} />}</button>
          </article>
        })}</div>
        {filtered.length === 0 && <div className="empty-search"><Search size={28} /><h3>No cards found</h3><p>Try a word like “trust”, “feedback”, or “performance”.</p><button className="btn btn-outline" onClick={() => void navigate({ search: { category: search.category }, replace: true })}>Clear search</button></div>}
        <div className="deck-bottom-note"><BookOpen size={15} /><span>{query ? filtered.length : currentCategory.count} cards · Open a card to explore both sides</span></div>
      </section>

      <aside id="current-session" className={`session-panel ${sessionOpen ? 'mobile-open' : ''}`} aria-label="Current session">
        <div className="session-heading"><div><span className="section-label">YOUR SPACE TO THINK</span><h2>Current session<span className="badge">{session.selected.length}</span></h2></div><button className="btn btn-circle btn-ghost mobile-session-close" aria-label="Close session" onClick={() => setSessionOpen(false)}><X size={18} /></button></div>
        <input className="input session-title" aria-label="Session name" placeholder="Give this moment a name…" maxLength={100} value={session.title} onChange={event => setSession(previous => ({ ...previous, title: event.target.value }))} />
        <div className="session-progress" aria-label={`${completedSteps} of 4 stages explored`}>{categories.map(category => <span key={category.id} className={selectedCards.some(card => card.category === category.id) ? `filled category-${category.id}` : ''} />)}</div>
        <p className="progress-caption">{completedSteps === 4 ? <><CheckCheck size={14} /> All four perspectives explored</> : `${completedSteps} of 4 perspectives explored`}</p>
        <div className="session-steps">{categories.map(category => {
          const chosen = selectedCards.filter(card => card.category === category.id)
          const Icon = icons[category.id]
          return <div className={`session-step category-${category.id}`} key={category.id}><div className={`step-marker ${chosen.length ? 'has-cards' : ''}`}>{chosen.length ? <Check size={14} /> : category.step}</div><div className="step-content"><button className="step-title" onClick={() => { changeCategory(category.id); setSessionOpen(false) }}>{category.name}<ChevronRight size={14} /></button>{chosen.length ? chosen.map(card => <div className="selected-card" key={card.id}><button onClick={() => openCard(card.id)}><Icon size={13} /><span>{card.title}</span></button><button aria-label={`Remove ${card.title} from session`} onClick={() => toggle(card.id)}><X size={13} /></button></div>) : <button className="empty-step" onClick={() => { changeCategory(category.id); setSessionOpen(false) }}>{category.id === 'situation' ? 'Start with what’s happening' : category.id === 'conversation' ? 'Choose how to approach it' : category.id === 'context' ? 'Consider the bigger picture' : 'Make space for learning'}<Plus size={13} /></button>}</div></div>
        })}</div>
        {!selectedCards.length && <div className="session-tip"><Sparkles size={17} /><p>Make this deck your own.<br /><span>Tap <Plus size={12} /> on any card to add it here.</span></p></div>}
        <label className="notes-label" htmlFor="session-notes">My notes & next steps</label><textarea id="session-notes" className="textarea" placeholder="What’s on your mind? What will you try?" rows={4} value={session.notes} onChange={event => setSession(previous => ({ ...previous, notes: event.target.value }))} />
        <div className="session-actions"><button className="btn btn-outline" onClick={exportSession}><Download size={15} />Export session</button><button className="btn btn-ghost" aria-label="Start a new session" title="Start a new session" disabled={!session.selected.length && !session.notes && !session.title} onClick={() => setConfirmReset(true)}><RotateCcw size={16} /></button></div>
        <p className="saved-status">{storageError || <><span /> Saved in this browser · Just for you</>}</p>
      </aside></div>

      <section className="practice-note"><span className="practice-icon"><Sprout size={24} strokeWidth={1.4} /></span><div><h3>Good leadership is a practice.</h3><p>Bring a card into your next 1:1. Pause before a tough conversation. Come back and reflect.</p></div><button className="text-button" onClick={() => void navigate({ search: previous => ({ ...previous, guide: true }) })}>Get to know the deck <ArrowRight size={16} /></button></section>
    </main>
    <footer className="site-footer"><span>IF THIS, THEN THAT <span className="footer-divider">/</span> Cards for Leaders</span><span>Original card content by Complete Leadership Academy</span><span>Lead. Inspire. Achieve.</span></footer>

    {activeCard && <CardDetail key={activeCard.id} card={activeCard} selected={session.selected.includes(activeCard.id)} toggle={() => toggle(activeCard.id)} close={closeCard} openCard={openCard} browse={changeCategory} />}
    {search.card && !activeCard && <Dialog title="Card not found" onClose={closeCard}><h2>Card not found</h2><p>This card link doesn’t match the deck.</p><button className="btn btn-primary" onClick={closeCard}>Back to the deck</button></Dialog>}
    {search.guide && <Dialog title="How to use the deck" onClose={closeGuide} className="guide-dialog"><div className="eyebrow">A MORE INTENTIONAL WAY TO LEAD</div><h2>One moment.<br />Four perspectives.</h2><p className="guide-intro">Use the cards before, during, and after real leadership conversations. Start with a situation, then follow where it leads.</p><div className="guide-steps">{categories.map(category => <div key={category.id}><span className={`guide-number category-${category.id}`}>{category.step}</span><div><h3>{category.action}</h3><p>{category.description} {category.id === 'situation' ? 'Read the back to find the conversation that fits.' : category.id === 'conversation' ? 'Use its model, framing, and questions to guide the discussion.' : category.id === 'context' ? 'Trust, emotions, and relationships can change how you show up.' : 'Ask what worked and what you will do differently next time.'}</p></div></div>)}</div><div className="guide-example"><span className="section-label">FROM THE DECK · A SAMPLE WALKTHROUGH</span><h3>A strong team member’s performance slips.</h3><p>Diagnose before applying pressure. The printed example follows this path:</p><div className="example-path">{['low-performance', 'motivation-strengths', 'leading-when-trust-is-low', 'reaction-vs-intention'].map((slug, index) => {
      const card = cards.find(c => c.id.endsWith(slug))
      return card && <div key={slug}><button onClick={() => void navigate({ search: { category: card.category, card: card.id } })}>{card.title}<ArrowUpRight size={15} /></button>{index < 3 && <ArrowDown size={14} />}</div>
    })}</div><p>Address energy, apply clarity before pressure, and reflect before moving on.</p></div><p className="guide-footnote">Add useful cards to your session, capture notes, and export a copy. Sessions are saved on this device and browser; they don’t sync between devices.</p><button className="btn btn-primary" onClick={closeGuide}>Explore the cards <ArrowRight size={16} /></button></Dialog>}
    {confirmReset && <Dialog title="Start a new session" onClose={() => setConfirmReset(false)}><h2>A fresh perspective.</h2><p>Starting a new session clears the current cards, name, and notes. Export a copy first if you’d like to keep them.</p><div className="reset-actions"><button className="btn btn-outline" onClick={exportSession}><Download size={16} />Export current session</button><button className="btn btn-primary" onClick={() => { reset(); setConfirmReset(false) }}>Start fresh</button><button className="btn btn-ghost" onClick={() => setConfirmReset(false)}>Keep working</button></div></Dialog>}
  </>
}
