# Introducing Stagehand

> Developers use Stagehand to reliably automate the web.

export const V3Banner = () => <div className="mb-5 flex items-center justify-between gap-4 rounded-md border border-zinc-300 bg-zinc-100 dark:border-zinc-700/50 dark:bg-zinc-800/50 px-4 py-3 text-sm">
    <span className="text-zinc-600 dark:text-zinc-400">
      🐍  Looking for <strong className="text-zinc-900 dark:text-zinc-200">Stagehand in Python</strong>?
    </span>
    <a href="/v2/first-steps/introduction" className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors no-underline text-xs">
      Switch to v2 →
    </a>
  </div>;

<V3Banner />

Stagehand is a browser automation framework used to control web browsers with natural language and code. By combining the power of AI with the precision of code, Stagehand makes web automation flexible, maintainable, and actually reliable.

## The Problem with Browser Automation

Traditional frameworks like Playwright and Puppeteer force you to write brittle scripts that break with every UI change. Web agents promise to solve this with AI, but leave you at the mercy of unpredictable behavior.

**You're stuck between two bad options:**

* **Too brittle**: Traditional selectors break when websites change
* **Too agentic**: AI agents are unpredictable and impossible to debug

## Enter Stagehand

Stagehand gives you the best of both worlds through four powerful primitives that let you choose exactly how much AI to use:

<CardGroup cols={2}>
  <Card title="Act" icon="play" href="/v3/basics/act">
    Execute actions using natural language
  </Card>

  <Card title="Extract" icon="database" href="/v3/basics/extract">
    Pull structured data with schemas
  </Card>

  <Card title="Observe" icon="eye" href="/v3/basics/observe">
    Discover available actions on any page
  </Card>

  <Card title="Agent" icon="robot" href="/v3/basics/agent">
    Automate entire workflows autonomously
  </Card>
</CardGroup>

```typescript  theme={null}
// Act - Execute natural language actions
await stagehand.act("click the login button");

// Extract - Pull structured data
const price = await stagehand.extract(
  "extract the price",
  z.number()
);

// Observe - Discover available actions
const actions = await stagehand.observe("find submit buttons");

// Agent - Automate entire workflows
const agent = stagehand.agent({
  cua: true,
  model: "google/gemini-2.5-computer-use-preview-10-2025",
});
await agent.execute("apply for this job");
```

## Why Developers Choose Stagehand

* **Precise Control**: Mix AI-powered actions with deterministic code. You decide exactly how much AI to use.

* **Actually Repeatable**: Save and replay actions exactly. No more "it worked on my machine" with browser automations.

* **Maintainable at Scale**: One script can automate multiple websites. When sites change, your automations adapt.

* **Composable Tools**: Choose your level of automation with Act, Extract, Observe, and Agent.

## Built for Modern Development

Stagehand is designed for developers building production browser automations and AI agents that need reliable web access.

<AccordionGroup>
  <Accordion title="Works Everywhere">
    Compatible with all Chromium-based browsers: Chrome, Edge, Arc, Brave, and more.
  </Accordion>

  <Accordion title="Built by Browserbase">
    Created and maintained by the team behind enterprise browser infrastructure.
  </Accordion>
</AccordionGroup>

## Get Started in 60 Seconds

<Info>
  **Pro tip**: For best results, we recommend using Stagehand with [Browserbase](https://www.browserbase.com) for reliable cloud browser infrastructure.
</Info>

<CardGroup cols={2}>
  <Card title="Quickstart" icon="rocket" href="/v3/first-steps/quickstart">
    Build your first automation in under a minute
  </Card>

  <Card title="Try Director" icon="wand-magic-sparkles" href="https://www.director.ai">
    Generate Stagehand scripts with AI
  </Card>

  <Card title="View Templates" icon="code" href="https://www.browserbase.com/templates">
    See real-world automation examples
  </Card>

  <Card title="Join Discord" icon="discord" href="https://discord.gg/stagehand">
    Get help from the community
  </Card>
</CardGroup>


---

> To find navigation and other pages in this documentation, fetch the llms.txt file at: https://docs.stagehand.dev/llms.txt