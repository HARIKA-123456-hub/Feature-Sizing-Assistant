import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function handleAIAnalysis(req: any, res: any) {
  try {
    const { input } = req.body;
    
    if (!input || typeof input !== 'string') {
      return res.status(400).json({ error: 'Invalid input provided' });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: 'OpenAI API key not configured' });
    }

    const prompt = `You are a Senior Software Solution Architect.

Your task:
Given ANY feature description input, break the feature into logically meaningful high-level modules. 
Do NOT go too granular (avoid splitting into tiny tasks).

For each module, provide:
1. **Module Name**
2. **Short Description**
3. **Effort Size** → XS / S / M / L / XL / XXL (T-shirt sizing):
   - XS = 0.5-1 day (Very small, trivial change - UI text update, minor config)
   - S = 1-2 days (Small, low complexity - Small UI feature, simple API)
   - M = 3-5 days (Medium complexity - New screen + API CRUD)
   - L = 6-10 days (Large, multi-module work - Payments, role-based modules)
   - XL = 11-15 days (Very large, cross-team dependencies - Workflow automation, integrations)
   - XXL = 16+ days (Massive/Epic - Analytics engines, Multi-system sync)
4. **Sub-Modules** (break down the module into 2-5 specific sub-components with optional effort sizing)
5. **Key Risk or Dependency**
6. **Dependencies** (other modules or external systems this module depends on)

Finally, list any **Gaps / Clarifications Needed**.

**Feature:** ${input}

**Sequential Order Guidelines:**
1. Foundation modules first (authentication, data models, core infrastructure)
2. Core business features second (main functionality, APIs, business logic)
3. User-facing features third (UI, dashboards, user interfaces)
4. Supporting features last (analytics, reporting, admin tools, integrations)

Return ONLY a valid JSON array in this exact format:
[
  {
    "name": "Module Name",
    "description": "What it does",
    "effort": "XS|S|M|L|XL|XXL",
    "subModules": [
      {
        "name": "Sub-module name",
        "effort": "XS|S|M|L|XL|XXL",
        "description": "What this sub-module does"
      }
    ],
    "risk": "Main risk",
    "dependencies": ["Dependency 1", "Dependency 2"],
    "gaps": ["Gap 1", "Gap 2"]
  }
]

**Rules:**
- Keep modules high-level, not granular
- Use T-shirt sizing: XS = 0.5-1 day, S = 1-2 days, M = 3-5 days, L = 6-10 days, XL = 11-15 days, XXL = 16+ days
- Include realistic risks and dependencies
- Identify gaps/clarifications needed
- Focus on functional scope, not implementation details
- Arrange modules in logical sequential order (foundation → core features → supporting features)`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a Senior Software Solution Architect who breaks down features into high-level modules with realistic effort estimates, risks, and identifies gaps/clarifications needed. Always arrange modules in logical sequential order from foundation to core features to supporting features."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 2000,
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error("No response from OpenAI");
    }

    // Parse the JSON response (handle markdown formatting)
    let cleanResponse = response.trim();
    if (cleanResponse.startsWith('```json')) {
      cleanResponse = cleanResponse.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleanResponse.startsWith('```')) {
      cleanResponse = cleanResponse.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }
    
    const aiModules = JSON.parse(cleanResponse);
    
    // Convert to ModuleItem format with IDs and scores
    const modules = aiModules.map((module: any) => ({
      id: module.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
      name: module.name,
      description: module.description,
      effort: module.effort,
      risks: module.risk ? [module.risk] : [],
      score: module.effort === "XXL" ? 16 : module.effort === "XL" ? 13 : module.effort === "L" ? 8 : module.effort === "M" ? 4 : module.effort === "S" ? 2 : 1,
      subModules: module.subModules || [],
      dependencies: module.dependencies || [],
    }));

    // Extract gaps from all modules
    const allGaps = aiModules.flatMap((module: any) => module.gaps || []);

    res.json({ modules, flags: allGaps });

  } catch (error) {
    console.error("AI analysis failed:", error);
    res.status(500).json({ error: 'AI analysis failed', details: error.message });
  }
}
