import { Link } from 'react-router-dom'
import Button from '../components/Button.jsx'

function ColumnMock({ title, cards=2 }){
  return (
    <div className="rounded-2xl bg-neutral-200/50 p-4">
      <div className="mb-4 text-center font-semibold text-neutral-800">{title}</div>
      <div className="space-y-3">
        {Array.from({length:cards}).map((_,i)=> (
          <div key={i} className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
            <div className="mb-2 h-2 w-3/4 rounded bg-neutral-200"></div>
            <div className="h-2 w-1/2 rounded bg-neutral-200"></div>
          </div>
        ))}
      </div>
    </div>
  )
}

function Feature({ title, desc, icon }){
  return (
    <div className="text-center">
      <div className="mx-auto mb-4 grid h-14 w-14 place-content-center rounded-2xl bg-neutral-900 text-xl text-white">{icon}</div>
      <div className="text-xl font-semibold">{title}</div>
      <p className="mx-auto mt-2 max-w-sm text-neutral-600">{desc}</p>
    </div>
  )
}

export default function LandingPage(){
  return (
    <div>
      {/* HERO */}
      <section className="mx-auto max-w-6xl px-4 pt-12 sm:pt-16 md:pt-20">
        <div className="text-center">
          <h1 className="mx-auto max-w-5xl text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-neutral-900 leading-tight">
            Organize your job search<br className="hidden sm:block" /> in one place
          </h1>
          <p className="mx-auto mt-6 max-w-3xl text-lg text-neutral-500">
            Track your job applications across different stages with our intuitive drag-and-drop board. Stay organized and never lose track of an opportunity.
          </p>
          <div className="mt-8 flex items-center justify-center">
            <Link to="/signup"><Button size="lg" className="px-6 py-3">Get Started</Button></Link>
          </div>
        </div>

        {/* Board preview mock */}
        <div className="mx-auto mt-16 max-w-5xl rounded-3xl border bg-white p-6 shadow-lg">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
            <ColumnMock title="Wishlist" cards={1} />
            <ColumnMock title="Applied" cards={2} />
            <ColumnMock title="Interviewing" cards={1} />
            <ColumnMock title="Offer" cards={0} />
            <ColumnMock title="Rejected" cards={0} />
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="mt-16 border-t bg-neutral-100/80">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <h2 className="mb-2 text-center text-3xl font-bold">Why JobTracker?</h2>
          <p className="mx-auto mb-12 max-w-3xl text-center text-neutral-600">
            Built for job seekers who want to stay organized and focused on what matters most.
          </p>
          <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
            <Feature
              title="Organized Tracking"
              desc="Keep all your applications organized in one place with our intuitive kanban board."
              icon="📋"
            />
            <Feature
              title="Focus on Progress"
              desc="Track your progress with visual stats and move applications through different stages."
              icon="🎯"
            />
            <Feature
              title="Mobile Ready"
              desc="Access your job board anywhere, anytime with our responsive design."
              icon="📱"
            />
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t bg-white">
        <div className="mx-auto max-w-6xl px-4 py-10">
          <div className="grid grid-cols-1 items-center gap-6 md:grid-cols-3">
            <div className="flex items-center gap-2">
              <span className="grid h-8 w-8 place-content-center rounded-full bg-neutral-900 text-white">JT</span>
              <span className="font-semibold text-neutral-900">JobTracker</span>
            </div>
            <div className="text-center text-sm text-neutral-600">© 2025 JobTracker. All rights reserved.</div>
            <div className="flex justify-end gap-6 text-sm text-neutral-600">
              <a href="#" className="hover:text-neutral-900">About</a>
              <a href="#" className="hover:text-neutral-900">Privacy Policy</a>
              <a href="#" className="hover:text-neutral-900">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}