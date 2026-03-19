"use client";

import { Shield, Cpu, Radar, Bot, ActivitySquare, Wrench } from "lucide-react";
import { useCallback, useMemo, useRef, useState } from "react";
import { A2UIRenderer } from "../components/A2UIComponentLibrary";
import { SovereignChat } from "../components/SovereignChat";
import { AgentPanel } from "../components/AgentPanel";
import { MissionIntelligence } from "../components/MissionIntelligence";

type QuickAction = {
  label: string;
  query: string;
  icon: string;
  tone: "observe" | "verify" | "operate";
};

type QuickActionGroup = {
  title: string;
  hint: string;
  icon: typeof Radar;
  actions: QuickAction[];
};

const QUICK_ACTION_GROUPS: QuickActionGroup[] = [
  {
    title: "Observe",
    hint: "Read current system state without mutating runtime.",
    icon: Radar,
    actions: [
      { label: "Dashboard", query: "git status と git log --oneline -10 を実行して、ブランチ状態・最近のコミット・未コミット変更のサマリをダッシュボード表示して", icon: "📊", tone: "observe" },
      { label: "Missions", query: "active/missions/registry.json を読んでミッション一覧をテーブル表示して。なければ「ミッションなし」と表示", icon: "🎯", tone: "observe" },
      { label: "Agents", query: "knowledge/agents/ 配下のエージェント定義を一覧表示して。各エージェントのID、プロバイダー、モデル、capabilitiesをテーブルで", icon: "🤖", tone: "observe" },
      { label: "Audit Log", query: "evidence/audit/ 配下の最新の監査ログファイルを読んで、直近20件のイベントをタイムライン表示して", icon: "📋", tone: "observe" },
    ],
  },
  {
    title: "Verify",
    hint: "Run deterministic health and capability checks.",
    icon: ActivitySquare,
    actions: [
      { label: "Vital Check", query: "node dist/scripts/run_pipeline.js --input pipelines/vital-check.json を実行して結果を表示して", icon: "💓", tone: "verify" },
      { label: "Diagnostics", query: "node dist/scripts/run_pipeline.js --input pipelines/system-diagnostics.json を実行して結果を表示して", icon: "🔍", tone: "verify" },
      { label: "Capability Audit", query: "node dist/scripts/run_pipeline.js --input knowledge/public/governance/pipelines/code-skill-audit.json を実行して結果を表示して", icon: "🧩", tone: "verify" },
      { label: "Provider Check", query: "node dist/scripts/run_pipeline.js --input pipelines/agent-provider-check.json を実行して、各プロバイダーの状態をステータス表示して", icon: "🔌", tone: "verify" },
    ],
  },
  {
    title: "Operate",
    hint: "Use heavier actions when you need intervention or delivery work.",
    icon: Wrench,
    actions: [
      { label: "Build & Test", query: "pnpm run build と pnpm test を実行して、ビルド結果とテスト結果をステータス表示して", icon: "🔨", tone: "operate" },
      { label: "Policies", query: "knowledge/governance/agent-policies.yaml を読んで、ポリシー一覧をテーブル表示して", icon: "🛡", tone: "operate" },
      { label: "Upgrade Check", query: "node dist/scripts/run_pipeline.js --input pipelines/system-upgrade-check.json を実行して、アップデートの有無を表示して", icon: "⬆", tone: "operate" },
      { label: "Knowledge", query: "find knowledge/ -name '*.md' -o -name '*.json' | head -30 を実行して、ナレッジファイルをリスト表示して。ディレクトリ別にグループ化", icon: "🧠", tone: "operate" },
    ],
  },
];

const STATUS_CARDS = [
  {
    label: "Control Plane",
    value: "Mission-first",
    detail: "Event-driven orchestration and deterministic reconciliation.",
    icon: Shield,
  },
  {
    label: "Runtime",
    value: "Supervisor",
    detail: "Agent reuse, lease metadata, runtime doctor remediation.",
    icon: Bot,
  },
  {
    label: "Surface",
    value: "Outbox",
    detail: "Slack and Chronos share a single delivery contract.",
    icon: Radar,
  },
];

export default function ChronosMirrorV2() {
  const [surface, setSurface] = useState<any>(null);
  const [agentPanelOpen, setAgentPanelOpen] = useState(false);
  const sendQueryRef = useRef<((q: string) => void) | null>(null);
  const handleReady = useCallback((fn: (q: string) => void) => {
    sendQueryRef.current = fn;
  }, []);

  const handleA2UIMessage = useCallback((message: any) => {
    if (message.createSurface) {
      setSurface({ surfaceId: message.createSurface.surfaceId, title: message.createSurface.title, components: [] });
    }
    if (message.updateComponents) {
      setSurface((prev: any) => ({
        surfaceId: message.updateComponents.surfaceId,
        title: prev?.title || message.updateComponents.surfaceId,
        components: message.updateComponents.components,
      }));
    }
    if (message.deleteSurface) {
      setSurface(null);
    }
    if (message.type && message.type.startsWith("display:")) {
      const id = message.id || `auto-${Date.now()}`;
      setSurface({
        surfaceId: "auto-surface",
        title: "Dashboard",
        components: [{ id, type: message.type, props: message.props || message }],
      });
    }
  }, []);

  const handleQuickAction = useCallback((query: string) => {
    sendQueryRef.current?.(query);
  }, []);

  const activeSurfaceTitle = useMemo(
    () => surface?.title || "Mission Intelligence",
    [surface?.title],
  );

  return (
    <main className="min-h-screen w-screen overflow-hidden bg-black text-kyberion-gold">
      <div className="absolute inset-0 pointer-events-none opacity-30">
        <div className="absolute left-[-8%] top-[-6%] h-[32rem] w-[32rem] rounded-full bg-kyberion-gold/15 blur-[140px]" />
        <div className="absolute bottom-[-10%] right-[-10%] h-[28rem] w-[28rem] rounded-full bg-cyan-900/30 blur-[160px]" />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col gap-6 p-4 md:p-6">
        <header className="kyberion-glass rounded-[28px] border border-kyberion-gold/20 px-5 py-4 md:px-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-kyberion-gold/30 bg-black/30">
                <Shield className="h-5 w-5 text-kyberion-gold" />
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-[0.35em] text-kyberion-gold/55">Chronos Mirror</div>
                <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white/90 md:text-3xl">
                  Operator surface for mission control, runtime health, and delivery flow.
                </h1>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-white/55">
                  Keep the core simple: one durable mission authority, one event-driven orchestration layer, one runtime supervisor,
                  and thin surfaces for ingress and observability.
                </p>
              </div>
            </div>

            <button
              onClick={() => setAgentPanelOpen(true)}
              className="flex items-center gap-2 self-start rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/75 transition hover:border-kyberion-gold/30 hover:bg-kyberion-gold/10 hover:text-white"
            >
              <Cpu size={14} />
              <span>Agent Runtimes</span>
            </button>
          </div>
        </header>

        <div className="grid flex-1 gap-6 xl:grid-cols-[340px,minmax(0,1fr)]">
          <aside className="flex flex-col gap-6">
            <section className="kyberion-glass rounded-[28px] border border-kyberion-gold/20 p-4 md:p-5">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <div className="text-[10px] uppercase tracking-[0.28em] text-kyberion-gold/45">Quick Actions</div>
                  <div className="mt-1 text-sm text-white/55">Grouped by operator intent.</div>
                </div>
              </div>

              <div className="space-y-5">
                {QUICK_ACTION_GROUPS.map((group) => {
                  const Icon = group.icon;
                  return (
                    <div key={group.title} className="rounded-2xl border border-white/6 bg-black/25 p-3">
                      <div className="mb-3 flex items-start gap-3">
                        <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5">
                          <Icon size={14} className="text-kyberion-gold/80" />
                        </div>
                        <div>
                          <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/85">{group.title}</div>
                          <div className="mt-1 text-[11px] leading-5 text-white/45">{group.hint}</div>
                        </div>
                      </div>

                      <div className="grid gap-2">
                        {group.actions.map((action) => (
                          <button
                            key={action.label}
                            onClick={() => handleQuickAction(action.query)}
                            className="flex items-center justify-between rounded-xl border border-white/6 bg-white/5 px-3 py-2 text-left transition hover:border-kyberion-gold/25 hover:bg-kyberion-gold/10"
                          >
                            <div className="flex items-center gap-3">
                              <div className="text-sm">{action.icon}</div>
                              <div>
                                <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/82">{action.label}</div>
                                <div className="text-[10px] uppercase tracking-[0.14em] text-white/32">{action.tone}</div>
                              </div>
                            </div>
                            <div className="text-[10px] uppercase tracking-[0.2em] text-kyberion-gold/45">Run</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="grid gap-3 md:grid-cols-3 xl:grid-cols-1">
              {STATUS_CARDS.map((card) => {
                const Icon = card.icon;
                return (
                  <div key={card.label} className="kyberion-glass rounded-2xl border border-white/8 p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-black/25">
                        <Icon size={15} className="text-kyberion-gold/80" />
                      </div>
                      <div>
                        <div className="text-[10px] uppercase tracking-[0.22em] text-white/35">{card.label}</div>
                        <div className="mt-1 text-base font-semibold text-white/85">{card.value}</div>
                      </div>
                    </div>
                    <p className="mt-3 text-[11px] leading-5 text-white/48">{card.detail}</p>
                  </div>
                );
              })}
            </section>
          </aside>

          <section className="kyberion-glass flex min-h-[60vh] flex-col overflow-hidden rounded-[30px] border border-kyberion-gold/20">
            <div className="flex items-center justify-between border-b border-white/6 px-5 py-4 md:px-6">
              <div>
                <div className="text-[10px] uppercase tracking-[0.34em] text-kyberion-gold/42">Active Surface</div>
                <div className="mt-1 text-lg font-semibold tracking-tight text-white/88">{activeSurfaceTitle}</div>
              </div>
              <div className="rounded-full border border-white/8 bg-white/5 px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-white/45">
                {surface ? "interactive display" : "default intelligence"}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 md:p-6">
              {!surface ? (
                <MissionIntelligence />
              ) : (
                <div className="flex flex-col gap-6">
                  {surface.components?.map((component: any, index: number) => (
                    <A2UIRenderer key={component.id || index} type={component.type} props={component.props || {}} />
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>

        <SovereignChat onA2UIMessage={handleA2UIMessage} onReady={handleReady} />
        <AgentPanel isOpen={agentPanelOpen} onClose={() => setAgentPanelOpen(false)} />
      </div>
    </main>
  );
}
