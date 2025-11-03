import { useEffect, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { analyzeDescription, type AnalysisResult } from "@/lib/ai-scoper";
import AppShell from "@/components/layout/AppShell";
import { useToast } from "@/hooks/use-toast";


function generateStructuredText(input: string, result: AnalysisResult): string {
  const lines: string[] = [];

  // Overall Scope Summary
  const totalEffort = result.modules.reduce((acc, m) => {
    if (m.effort === "L") return acc + 3;
    if (m.effort === "M") return acc + 2;
    return acc + 1;
  }, 0);

  const overallSize = totalEffort <= 3 ? "Small" : totalEffort <= 6 ? "Medium" : "Large";

  lines.push("📦 Overall Scope Summary:");
  lines.push(`A ${overallSize}-scale feature set covering ${result.modules.map(m => m.name.toLowerCase()).join(", ")}.`);
  lines.push("");

  // Modules Table
  lines.push("🧩 Modules:");
  lines.push("");
  lines.push("| Module | Description | Effort | Risk / Dependency |");
  lines.push("|--------|-------------|--------|------------------|");
  
  result.modules.forEach((m) => {
    const risk = m.risks.length > 0 ? m.risks[0] : "No specific risks identified";
    lines.push(`| ${m.name} | ${m.description} | ${m.effort} | ${risk} |`);
  });

  lines.push("");

  // Gaps / Clarifications
  if ((result.flags?.length ?? 0) > 0) {
    lines.push("⚠️ Gaps / Clarifications Needed:");
    lines.push("");
    result.flags.forEach((f) => {
      lines.push(`- ${f}`);
    });
  }

  // Wrap entire content in fenced markdown code block
  const content = lines.join("\n");
  return `\`\`\`markdown\n${content}\n\`\`\``;
}

export default function Index() {
  const { toast } = useToast();
  const [input, setInput] = useState("");
  const [result, setResult] = useState<ReturnType<typeof analyzeDescription> | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const examples = [
    "User Login with OTP",
    "E-commerce Cart + Payments + Coupons",
    "Subscription billing with Stripe + Admin roles + Webhooks",
    "AI search + realtime collaboration + file uploads",
    "Multi-tenant dashboard with SSO + Audit logs",
  ];

  useEffect(() => {
    // Clear result when input is empty
    if (!input.trim()) {
      setResult(null);
    }
  }, [input]);

  const onScope = async () => {
    setIsAnalyzing(true);
    try {
      const res = await analyzeDescription(input);
      setResult(res);
    } catch (error) {
      console.error("Analysis failed:", error);
      toast({
        title: "Analysis Error",
        description: "Failed to analyze the feature description. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <AppShell>
      <div className="relative isolate">
        <div className="absolute inset-x-0 -top-24 -z-10 overflow-hidden blur-3xl">
          <svg className="-z-10 h-[28rem] w-full fill-primary/20" viewBox="0 0 1155 678" aria-hidden="true">
            <path d="M317.219 518.975L203.852 678 0 438.341l317.219 80.634L35.5 0l433.472 283.691L696.5 0l107.676 418.39L1155 357.269l-331.5 320.606-506.281-158.9z" />
          </svg>
        </div>
        <section className="container py-12 md:py-16">
          <div className="mx-auto max-w-3xl space-y-6">
            <h1 className="text-3xl font-extrabold tracking-tight">AI-Powered Feature Scoping & Effort Estimation</h1>
            <p className="text-sm text-muted-foreground">Paste a free-text feature description. Get detailed, actionable modules (UI screens, APIs, services) with precise effort sizing. Built for BD and pre-sales teams to draft proposals quickly.</p>

            <div className="flex flex-wrap gap-2 pt-1">
              {examples.map((ex) => (
                <button
                  key={ex}
                  onClick={() => setInput(ex)}
                  className="rounded-full border border-border/60 bg-secondary/60 px-3 py-1 text-xs text-foreground/80 hover:bg-secondary"
                >
                  {ex}
                </button>
              ))}
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium">Feature description</label>
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="e.g. User Login with OTP, E-commerce Cart + Payments, AI search + realtime collaboration"
                className="min-h-[120px]"
              />
              <div className="flex items-center gap-3">
                <Button onClick={onScope} className="shadow-sm" disabled={isAnalyzing || !input.trim()}>
                  {isAnalyzing ? "Analyzing..." : "Scope it"}
                </Button>
                <span className="text-xs text-muted-foreground">
                  {isAnalyzing ? "AI is analyzing your feature..." : !input.trim() ? "Enter a feature description above to get started" : "Works for many inputs; try the examples"}
                </span>
              </div>
            </div>
          </div>
        </section>

        {result && (
          <section className="container pb-20">
            <div className="mx-auto max-w-3xl">
              <div className="rounded-xl border bg-card/50 p-4 md:p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-sm font-medium">Proposed Modules</h3>
                  <Button
                    variant="secondary"
                    className="h-9"
                    onClick={() => {
                      const text = generateStructuredText(input, result);
                      navigator.clipboard.writeText(text);
                      toast({
                        title: "Copied!",
                        description: "Scoping summary copied to clipboard.",
                      });
                    }}
                  >
                    Copy summary
                  </Button>
                </div>

                <div className="space-y-6">
                  <div className="space-y-1">
                    <h4 className="text-sm font-medium">📦 Overall Scope Summary</h4>
                    <p className="text-xs text-muted-foreground">
                      {(() => {
                        const totalEffort = result.modules.reduce((acc, m) => {
                          if (m.effort === "L") return acc + 3;
                          if (m.effort === "M") return acc + 2;
                          return acc + 1;
                        }, 0);
                        const overallSize = totalEffort <= 3 ? "Small" : totalEffort <= 6 ? "Medium" : "Large";
                        return `A ${overallSize}-scale feature set covering ${result.modules.map(m => m.name.toLowerCase()).join(", ")}.`;
                      })()}
                    </p>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse table-fixed">
                      <thead>
                        <tr className="border-b border-border/50">
                          <th className="w-16 text-left py-3 px-2 text-xs font-medium text-muted-foreground">Step</th>
                          <th className="w-48 text-left py-3 px-2 text-xs font-medium text-muted-foreground">Module Name</th>
                          <th className="w-80 text-left py-3 px-2 text-xs font-medium text-muted-foreground">Description</th>
                          <th className="w-20 text-left py-3 px-2 text-xs font-medium text-muted-foreground">Effort</th>
                          <th className="w-80 text-left py-3 px-2 text-xs font-medium text-muted-foreground">Key Risk</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.modules.map((module, index) => (
                          <tr key={module.id} className="border-b border-border/30 hover:bg-muted/20">
                            <td className="py-3 px-2 text-xs font-medium text-muted-foreground">
                              {index + 1}.
                            </td>
                            <td className="py-3 px-2">
                              <div className="font-medium text-sm">{module.name}</div>
                            </td>
                            <td className="py-3 px-2">
                              <div className="text-xs text-muted-foreground">
                                {module.description}
                              </div>
                            </td>
                            <td className="py-3 px-2">
                              <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                                module.effort === "S" ? "bg-emerald-100 text-emerald-900" :
                                module.effort === "M" ? "bg-amber-100 text-amber-900" :
                                "bg-rose-100 text-rose-900"
                              }`}>
                                {module.effort}
                              </span>
                            </td>
                            <td className="py-3 px-2">
                              <div className="text-xs text-muted-foreground">
                                {module.risks.length > 0 ? module.risks[0] : "No specific risks identified"}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {(result.flags?.length ?? 0) > 0 && (
                    <div className="border border-amber-200/50 rounded-lg p-4 bg-amber-50/30 mt-6">
                      <h4 className="font-medium text-sm mb-3">⚠️ Gaps / Clarifications</h4>
                      <ul className="text-xs text-muted-foreground space-y-2">
                        {result.flags.map((flag, i) => (
                          <li key={i} className="ml-4">• {flag}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        )}

        <section className="container pb-20">
          <div className="mx-auto max-w-3xl">
            <div className="rounded-xl border bg-card/50 p-4 md:p-6">
              <h3 className="text-sm font-medium mb-6">📚 Effort Sizing Reference</h3>

              <div className="space-y-4">
                <div className="border-l-4 border-emerald-500 pl-4 py-2">
                  <h4 className="text-sm font-semibold text-emerald-900 mb-1">🟢 Small (S)</h4>
                  <p className="text-xs text-muted-foreground">2–8 hours</p>
                  <p className="text-xs text-muted-foreground">Minor tasks, quick fixes, or simple features with minimal dependencies.</p>
                </div>

                <div className="border-l-4 border-amber-500 pl-4 py-2">
                  <h4 className="text-sm font-semibold text-amber-900 mb-1">🟡 Medium (M)</h4>
                  <p className="text-xs text-muted-foreground">8–24 hours</p>
                  <p className="text-xs text-muted-foreground">Moderate complexity, may involve multiple steps or dependencies.</p>
                </div>

                <div className="border-l-4 border-rose-500 pl-4 py-2">
                  <h4 className="text-sm font-semibold text-rose-900 mb-1">🔴 Large (L)</h4>
                  <p className="text-xs text-muted-foreground">32+ hours</p>
                  <p className="text-xs text-muted-foreground">High complexity, multiple dependencies, and potential risks requiring careful planning.</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
