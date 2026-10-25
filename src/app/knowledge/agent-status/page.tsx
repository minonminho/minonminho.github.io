import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";
import { LanguageBar } from "@/components/daily-brief/language";
import { KnowledgeWorkspaceNav } from "@/components/knowledge/workspace-nav";
import { AgentStatusBoard } from "@/components/knowledge/agent-status-board";
import { getKnowledgeJobs } from "@/lib/knowledge/registry";

export const metadata = { title: "Agent Status · Knowledge · Minho Lee" };

export default function KnowledgeAgentStatusPage() {
  return <><Navbar showCvDownload={false} /><LanguageBar /><main className="site-shell flex-1 pb-20 pt-10 md:pb-28 md:pt-14">
    <KnowledgeWorkspaceNav />
    <header className="mt-10 border-b-2 border-border-strong pb-8"><p className="text-eyebrow text-signal-mint">KNOWLEDGE / EXECUTION</p><h1 className="text-display-xl mt-5">Agent Status<span className="text-signal-ice">.</span></h1><p className="mt-5 max-w-3xl text-subhead">Track terminology processing, concept validation, and publication jobs.</p></header>
    <AgentStatusBoard initialJobs={getKnowledgeJobs()} apiBaseUrl={process.env.NEXT_PUBLIC_KNOWLEDGE_API_URL ?? ""} />
  </main><Footer /></>;
}
