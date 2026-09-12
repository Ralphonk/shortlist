import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { ArrowUpRight, CalendarDays, Check, Sparkles, BriefcaseBusiness } from "lucide-react";
export default function Home() {
  return (
    <main className="welcome">
      <nav className="welcome-nav" aria-label="Main navigation">
      <div className="brand">
        ◈ shortlist<span>YOUR NEXT CHAPTER</span>
      </div>
      <ThemeToggle />
      </nav>
      <div className="welcome-hero">
      <div className="welcome-body">
        <span className="eyebrow">
          A LITTLE STRUCTURE. A LOT OF POSSIBILITY.
        </span>
        <h1>
          Your next opportunity.
          <br />
          <em>All in one place.</em>
        </h1>
        <p>
          From the first application to the final offer. Make space for the work
          that gets you there.
        </p>
        <div className="actions">
          <Link className="primary" href="/register">
            Create your workspace →
          </Link>
          <Link className="secondary" href="/demo">
            Explore the demo
          </Link>
        </div>
        <p className="muted">
          Already have an account? <Link href="/login">Sign in</Link>
        </p>
      </div>
      <div className="career-art" role="img" aria-label="Illustrative application board with an upcoming interview and a new offer">
        <div className="career-orbit orbit-one" />
        <div className="career-orbit orbit-two" />
        <span className="career-spark spark-one"><Sparkles size={26} /></span>
        <span className="career-spark spark-two">✦</span>
        <div className="career-board">
          <div className="career-board-top"><span>◈ shortlist</span><span className="career-avatar">YOU</span></div>
          <div className="career-board-heading"><div><small>ONE STEP CLOSER</small><h2>Your next chapter</h2></div><ArrowUpRight size={23} /></div>
          <div className="career-summary"><div><b>12</b><span>Applications</span></div><div><b>3</b><span>Interviews</span></div><div><b>1</b><span>Offer</span></div></div>
          <div className="career-job"><span className="career-company">a.</span><div><strong>Frontend Developer</strong><small>Acme Studio · Remote</small></div><span className="career-stage">Interview</span></div>
          <div className="career-job"><span className="career-company company-mint">n</span><div><strong>Product Engineer</strong><small>Northstar · Hybrid</small></div><span className="career-stage stage-mint">Offer</span></div>
          <div className="career-progress"><span>Applied</span><i /><span>Interview</span><i /><span><Check size={12} /> Offer</span></div>
        </div>
        <div className="career-float career-interview"><span className="career-icon"><CalendarDays size={22} /></span><div><small>YOU’RE ON THE CALENDAR</small><strong>Let’s meet tomorrow.</strong><span>Technical interview · 10:30 AM</span></div><span className="career-notification-dot" /></div>
        <div className="career-float career-offer"><span className="career-icon mint-icon"><Check size={24} /></span><div><small>THE NEXT CHAPTER STARTS</small><strong>You got the offer! <Sparkles size={16} /></strong><span>All that preparation paid off.</span></div></div>
        <div className="career-caption"><BriefcaseBusiness size={14} /> A little progress. Every day.</div>
      </div>
      </div>
      <div className="welcome-bottom">
        APPLICATIONS / INTERVIEWS / YOUR NEXT MOVE
      </div>
    </main>
  );
}
