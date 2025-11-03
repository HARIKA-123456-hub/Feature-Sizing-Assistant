import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ModuleItem } from "@/lib/ai-scoper";

const effortColor: Record<string, string> = {
  S: "bg-emerald-600 text-white",
  M: "bg-amber-600 text-white",
  L: "bg-rose-600 text-white",
};

export function ModuleCard({ module }: { module: ModuleItem }) {
  return (
    <Card className="h-full border-border/60 shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg leading-6">{module.name}</CardTitle>
          <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${effortColor[module.effort]}`}>
            Effort: {module.effort}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">{module.description}</p>
        {module.risks.length > 0 && (
          <div className="space-y-1">
            <p className="text-xs font-medium text-foreground/80">Risk checks</p>
            <div className="flex flex-wrap gap-2">
              {module.risks.slice(0, 4).map((r, i) => (
                <Badge key={i} variant="secondary" className="border border-border/70 bg-secondary/60">
                  {r}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
