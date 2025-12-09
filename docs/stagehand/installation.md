# Installation

> Integrate Stagehand into an existing project.

export const V3Banner = () => <div className="mb-5 flex items-center justify-between gap-4 rounded-md border border-zinc-300 bg-zinc-100 dark:border-zinc-700/50 dark:bg-zinc-800/50 px-4 py-3 text-sm">
    <span className="text-zinc-600 dark:text-zinc-400">
      🐍  Looking for <strong className="text-zinc-900 dark:text-zinc-200">Stagehand in Python</strong>?
    </span>
    <a href="/v2/first-steps/introduction" className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors no-underline text-xs">
      Switch to v2 →
    </a>
  </div>;

<V3Banner />

Install Stagehand in your current app with the TypeScript SDK.

<Tip>
  We recommend using the Node.js runtime environment to run Stagehand scripts.

  **Bun is now supported** as long as you do not integrate Stagehand with Playwright. Playwright is not compatible with Bun.
</Tip>

<Tabs>
  <Tab title="TypeScript">
    ### Install dependencies

    <CodeGroup>
      ```bash npm theme={null}
      npm install @browserbasehq/stagehand
      ```

      ```bash pnpm theme={null}
      pnpm add @browserbasehq/stagehand
      ```

      ```bash yarn theme={null}
      yarn add @browserbasehq/stagehand
      ```

      ```bash bun icon="sparkles" theme={null}
      bun add @browserbasehq/stagehand
      ```
    </CodeGroup>

    <Tip>
      If you plan to run locally, you need to have [Chrome](https://www.google.com/chrome/) installed on your machine. For cloud browser sessions, skip this.
    </Tip>

    ### Configure environment

    Set environment variables (or a `.env` via your framework):

    <CodeGroup>
      ```bash Bash theme={null}
      OPENAI_API_KEY=your_api_key
      BROWSERBASE_API_KEY=your_api_key
      BROWSERBASE_PROJECT_ID=your_project_id
      ```
    </CodeGroup>

    ### Use in your codebase

    Add Stagehand where you need browser automation.

    ```typescript  theme={null}
    import "dotenv/config";
    import { Stagehand } from "@browserbasehq/stagehand";
    import { z } from "zod/v3";

    async function main() {
      const stagehand = new Stagehand({
        env: "BROWSERBASE"
      });

      await stagehand.init();
      const page = stagehand.context.pages()[0];

      await page.goto("https://example.com");

      // Act on the page
      await stagehand.act("Click the learn more button");

      // Extract structured data
      const description = await stagehand.extract("extract the description", z.string());

      console.log(description);
      await stagehand.close();
    }

    main().catch((err) => {
      console.error(err);
      process.exit(1);
    });
    ```
  </Tab>

  <Tab title="Python">
    <Note>
      **Python support is only available in Stagehand v2.**

      v3 currently only supports TypeScript. If you need Python support, please use v2.
    </Note>

    <Card title="Install Stagehand v2 for Python" icon="python" href="/v2/first-steps/installation#python">
      View the Python installation guide for Stagehand v2
    </Card>
  </Tab>
</Tabs>

## Next steps

<CardGroup cols={2}>
  <Card title="Configuration" icon="gear" href="/v3/configuration/browser">
    Environment, Browserbase vs Local, logging, timeouts, LLM customization
  </Card>

  <Card title="Act" icon="arrow-pointer" href="/v3/basics/act">
    Perform precise actions with natural language
  </Card>

  <Card title="Extract" icon="download" href="/v3/basics/extract">
    Typed data extraction with Zod schemas
  </Card>

  <Card title="Observe" icon="eye" href="/v3/basics/observe">
    Discover elements and suggested actions
  </Card>
</CardGroup>


---

> To find navigation and other pages in this documentation, fetch the llms.txt file at: https://docs.stagehand.dev/llms.txt