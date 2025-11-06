import { useEffect, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { analyzeDescription, type AnalysisResult } from "@/lib/ai-scoper";
import AppShell from "@/components/layout/AppShell";
import { useToast } from "@/hooks/use-toast";

function getEffortHours(effort: "XS" | "S" | "M" | "L" | "XL" | "XXL"): string {
  const hoursMap = {
    XS: "0.5-1 day (4-8 hours)",
    S: "1-2 days (8-16 hours)",
    M: "3-5 days (24-40 hours)",
    L: "6-10 days (48-80 hours)",
    XL: "11-15 days (88-120 hours)",
    XXL: "16+ days (128+ hours)",
  };
  return hoursMap[effort];
}

type RiskLevel = "High" | "Medium" | "Low";

function getRiskLevel(riskText: string): RiskLevel {
  const text = riskText.toLowerCase();
  // High risk indicators
  if (
    text.includes("critical") ||
    text.includes("security") ||
    text.includes("data loss") ||
    text.includes("breach") ||
    text.includes("vulnerability") ||
    text.includes("failure") ||
    text.includes("downtime") ||
    text.includes("major") ||
    text.includes("significant") ||
    text.includes("severe")
  ) {
    return "High";
  }
  // Medium risk indicators
  if (
    text.includes("dependency") ||
    text.includes("integration") ||
    text.includes("performance") ||
    text.includes("scalability") ||
    text.includes("complexity") ||
    text.includes("moderate") ||
    text.includes("potential")
  ) {
    return "Medium";
  }
  // Default to Low
  return "Low";
}

function getRiskBadgeColor(level: RiskLevel): string {
  switch (level) {
    case "High":
      return "bg-red-100 text-red-900";
    case "Medium":
      return "bg-amber-100 text-amber-900";
    case "Low":
      return "bg-emerald-100 text-emerald-900";
  }
}

function getShortRiskText(riskText: string): string {
  // Extract key words (2-4 words) from risk text
  const text = riskText.toLowerCase();
  
  // Common risk patterns to extract
  const patterns = [
    /(performance|scalability|speed)\s+(issue|concern|risk|problem)/i,
    /(security|vulnerability|breach|data loss)\s+(risk|concern|issue)/i,
    /(dependency|integration|external)\s+(issue|risk|concern|failure)/i,
    /(complexity|maintenance|technical)\s+(challenge|risk|issue)/i,
    /(storage|database|data)\s+(dependency|issue|risk)/i,
    /(ui|user interface|frontend)\s+(complexity|issue|risk)/i,
    /(api|backend|service)\s+(dependency|issue|risk)/i,
  ];
  
  for (const pattern of patterns) {
    const match = riskText.match(pattern);
    if (match) {
      const words = match[0].split(/\s+/).slice(0, 4);
      return words.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    }
  }
  
  // Fallback: extract first 2-4 meaningful words
  const words = riskText.split(/\s+/).filter(w => w.length > 2);
  if (words.length <= 4) {
    return words.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  }
  
  // Take first 3-4 words
  const shortWords = words.slice(0, 4);
  return shortWords.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

function calculateTotalDays(modules: AnalysisResult["modules"]): number {
  const total = modules.reduce((total, module) => {
    // XS = 0.5-1 day ≈ 0.75 days, S = 1-2 days ≈ 1.5 days, M = 3-5 days ≈ 4 days, L = 6-10 days ≈ 8 days, XL = 11-15 days ≈ 13 days, XXL = 16+ days ≈ 20 days
    const daysMap = {
      XS: 0.75,
      S: 1.5,
      M: 4,
      L: 8,
      XL: 13,
      XXL: 20,
    };
    return total + daysMap[module.effort];
  }, 0);
  return Math.round(total);
}

function generateStructuredText(input: string, result: AnalysisResult): string {
  const lines: string[] = [];

  // Overall Scope Summary
  const totalEffort = result.modules.reduce((acc, m) => {
    if (m.effort === "XXL") return acc + 6;
    if (m.effort === "XL") return acc + 5;
    if (m.effort === "L") return acc + 4;
    if (m.effort === "M") return acc + 3;
    if (m.effort === "S") return acc + 2;
    return acc + 1; // XS
  }, 0);

  const overallSize = totalEffort <= 2 ? "Extra Small" : totalEffort <= 4 ? "Small" : totalEffort <= 7 ? "Medium" : totalEffort <= 11 ? "Large" : totalEffort <= 16 ? "Extra Large" : "Extra Extra Large";

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
                        if (!result.modules || result.modules.length === 0) {
                          return "No modules to summarize.";
                        }
                        const totalEffort = result.modules.reduce((acc, m) => {
                          if (m.effort === "XXL") return acc + 6;
                          if (m.effort === "XL") return acc + 5;
                          if (m.effort === "L") return acc + 4;
                          if (m.effort === "M") return acc + 3;
                          if (m.effort === "S") return acc + 2;
                          return acc + 1; // XS
                        }, 0);
                        const overallSize = totalEffort <= 2 ? "Extra Small" : totalEffort <= 4 ? "Small" : totalEffort <= 7 ? "Medium" : totalEffort <= 11 ? "Large" : totalEffort <= 16 ? "Extra Large" : "Extra Extra Large";
                        return `A ${overallSize}-scale feature set covering ${result.modules.map(m => m.name.toLowerCase()).join(", ")}.`;
                      })()}
                    </p>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse table-fixed">
                      <thead>
                        <tr className="border-b border-border/50">
                          <th className="w-16 text-left py-3 px-2 text-xs font-medium text-muted-foreground">Step</th>
                          <th className="text-left py-3 px-2 text-xs font-medium text-muted-foreground">Module Name</th>
                          <th className="text-left py-3 px-2 text-xs font-medium text-muted-foreground">Sub-Modules</th>
                          <th className="w-20 text-left py-3 px-2 text-xs font-medium text-muted-foreground">Effort</th>
                          <th className="w-20 text-left py-3 px-2 text-xs font-medium text-muted-foreground">Risk</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.modules && result.modules.length > 0 ? result.modules.map((module, index) => {
                          const riskText = module.risks.length > 0 ? module.risks[0] : "No specific risks identified";
                          const riskLevel = getRiskLevel(riskText);
                          const riskBadgeColor = getRiskBadgeColor(riskLevel);
                          const dependencies = module.dependencies && module.dependencies.length > 0 
                            ? module.dependencies.join(", ") 
                            : null;

                          return (
                            <tr
                              key={module.id}
                              className="border-b border-border/30"
                            >
                              <td className="py-2 px-2 text-xs font-medium text-muted-foreground align-top">
                                <span>{index + 1}.</span>
                              </td>
                              <td className="py-2 px-2 align-top">
                                <div className="font-medium text-sm">{module.name}</div>
                              </td>
                              <td className="py-2 px-2 align-top">
                                {module.subModules && module.subModules.length > 0 ? (
                                  <ul className="space-y-0.5 ml-4">
                                    {module.subModules.map((subModule, idx) => (
                                      <li key={idx} className="text-xs text-foreground">
                                        • {subModule.name}
                                      </li>
                                    ))}
                                  </ul>
                                ) : (
                                  <span className="text-xs text-muted-foreground italic ml-4">—</span>
                                )}
                              </td>
                              <td className="py-2 px-2 align-top">
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <span className={`inline-flex items-center justify-center min-w-[2rem] h-6 px-2 rounded-full text-xs font-bold cursor-help ${
                                      module.effort === "XS" ? "bg-blue-100 text-blue-900" :
                                      module.effort === "S" ? "bg-emerald-100 text-emerald-900" :
                                      module.effort === "M" ? "bg-amber-100 text-amber-900" :
                                      module.effort === "L" ? "bg-rose-100 text-rose-900" :
                                      module.effort === "XL" ? "bg-purple-100 text-purple-900" :
                                      "bg-red-100 text-red-900"
                                    }`}>
                                      {module.effort}
                                    </span>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>{getEffortHours(module.effort)}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </td>
                              <td className="py-2 px-2 align-top">
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <button
                                      type="button"
                                      className={`inline-flex items-center justify-center w-6 h-6 rounded text-base font-bold focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 transition-colors ${
                                        riskLevel === "High" ? "text-red-600" :
                                        riskLevel === "Medium" ? "text-yellow-500" :
                                        "text-green-600"
                                      }`}
                                      style={{
                                        color: riskLevel === "High" ? "#dc2626" : 
                                               riskLevel === "Medium" ? "#eab308" : 
                                               "#16a34a"
                                      }}
                                      aria-label={`${riskLevel} Risk: ${riskText}${dependencies ? `. Dependencies: ${dependencies}` : ""}`}
                                    >
                                      ⚠
                                    </button>
                                  </TooltipTrigger>
                                  <TooltipContent className="max-w-xs">
                                    <div className="space-y-1">
                                      <p className="font-medium text-sm">{riskLevel} Risk</p>
                                      <p className="text-xs break-words">{riskText}</p>
                                      {dependencies && (
                                        <div className="pt-1 border-t border-border/30">
                                          <p className="text-xs font-medium text-muted-foreground">Dependencies:</p>
                                          <p className="text-xs break-words">{dependencies}</p>
                                        </div>
                                      )}
                                    </div>
                                  </TooltipContent>
                                </Tooltip>
                              </td>
                            </tr>
                          );
                        }) : (
                          <tr>
                            <td colSpan={5} className="py-4 text-center text-xs text-muted-foreground">
                              No modules found.
                            </td>
                          </tr>
                        )}
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

                  <div className="border-t border-border/50 mt-6 pt-6">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-foreground">
                        Total effort needed to implement this project would take approximately
                      </p>
                      <p className="text-lg font-bold text-primary">
                        {result.modules && result.modules.length > 0 ? (
                          <>
                            {calculateTotalDays(result.modules)} {calculateTotalDays(result.modules) === 1 ? "day" : "days"}
                          </>
                        ) : (
                          "0 days"
                        )}
                      </p>
                    </div>
                  </div>
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
                <div className="border-l-4 border-blue-500 pl-4 py-2">
                  <h4 className="text-sm font-semibold text-blue-900 mb-1">🔵 Extra Small (XS)</h4>
                  <p className="text-xs text-muted-foreground">0.5–1 day (4–8 hours)</p>
                  <p className="text-xs text-muted-foreground">Very small, trivial change. Best used for: UI text update, minor config.</p>
                </div>

                <div className="border-l-4 border-emerald-500 pl-4 py-2">
                  <h4 className="text-sm font-semibold text-emerald-900 mb-1">🟢 Small (S)</h4>
                  <p className="text-xs text-muted-foreground">1–2 days (8–16 hours)</p>
                  <p className="text-xs text-muted-foreground">Small, low complexity. Best used for: Small UI feature, simple API.</p>
                </div>

                <div className="border-l-4 border-amber-500 pl-4 py-2">
                  <h4 className="text-sm font-semibold text-amber-900 mb-1">🟡 Medium (M)</h4>
                  <p className="text-xs text-muted-foreground">3–5 days (24–40 hours)</p>
                  <p className="text-xs text-muted-foreground">Medium complexity. Best used for: New screen + API CRUD.</p>
                </div>

                <div className="border-l-4 border-rose-500 pl-4 py-2">
                  <h4 className="text-sm font-semibold text-rose-900 mb-1">🔴 Large (L)</h4>
                  <p className="text-xs text-muted-foreground">6–10 days (48–80 hours)</p>
                  <p className="text-xs text-muted-foreground">Large, multi-module work. Best used for: Payments, role-based modules.</p>
                </div>

                <div className="border-l-4 border-purple-500 pl-4 py-2">
                  <h4 className="text-sm font-semibold text-purple-900 mb-1">🟣 Extra Large (XL)</h4>
                  <p className="text-xs text-muted-foreground">11–15 days (88–120 hours)</p>
                  <p className="text-xs text-muted-foreground">Very large, cross-team dependencies. Best used for: Workflow automation, integrations.</p>
                </div>

                <div className="border-l-4 border-red-500 pl-4 py-2">
                  <h4 className="text-sm font-semibold text-red-900 mb-1">🔴 Extra Extra Large (XXL)</h4>
                  <p className="text-xs text-muted-foreground">16+ days (128+ hours)</p>
                  <p className="text-xs text-muted-foreground">Massive / Epic / Needs breakdown. Best used for: Analytics engines, Multi-system sync.</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
