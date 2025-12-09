import { RecordedAction } from '../types/skills';
import { connectDB } from '../mongodb';

/**
 * ActionRecorder captures user actions in a browser session
 * Uses page instrumentation to track clicks, inputs, and navigation
 */
export class ActionRecorder {
  private actions: RecordedAction[] = [];
  private page: any; // Use any to support both Playwright and Stagehand Page types
  private recording: boolean = false;
  private recordingId: string;

  constructor(page: any, recordingId: string) {
    this.page = page;
    this.recordingId = recordingId;
  }

  /**
   * Start recording user actions by injecting monitoring script
   */
  async startRecording() {
    this.recording = true;

    // Inject action capture script into the page
    await this.page.addInitScript(() => {
      // Store actions in window object for retrieval
      (window as any)._recordedActions = [];

      // Helper to generate XPath
      function getXPath(element: Element): string {
        if (element.id) {
          return `//*[@id="${element.id}"]`;
        }
        if (element === document.body) {
          return '/html/body';
        }

        let ix = 0;
        const siblings = element.parentNode?.childNodes || [];
        for (let i = 0; i < siblings.length; i++) {
          const sibling = siblings[i];
          if (sibling === element) {
            const parentXPath = getXPath(element.parentNode as Element);
            const tagName = element.tagName.toLowerCase();
            return `${parentXPath}/${tagName}[${ix + 1}]`;
          }
          if (sibling.nodeType === 1 && (sibling as Element).tagName === element.tagName) {
            ix++;
          }
        }
        return '';
      }

      // Helper to generate stable selector
      function getStableSelector(element: Element): string {
        // Try ID first
        if (element.id) {
          return `#${element.id}`;
        }

        // Try data-testid
        const testId = element.getAttribute('data-testid');
        if (testId) {
          return `[data-testid="${testId}"]`;
        }

        // Try name
        const name = element.getAttribute('name');
        if (name) {
          return `[name="${name}"]`;
        }

        // Try aria-label
        const ariaLabel = element.getAttribute('aria-label');
        if (ariaLabel) {
          return `[aria-label="${ariaLabel}"]`;
        }

        // Fallback to XPath
        return getXPath(element);
      }

      // Helper to get element description
      function getDescription(element: Element): string {
        const tagName = element.tagName.toLowerCase();
        const ariaLabel = element.getAttribute('aria-label');
        const placeholder = element.getAttribute('placeholder');
        const text = element.textContent?.trim().substring(0, 50);

        if (ariaLabel) return ariaLabel;
        if (placeholder) return `field with placeholder "${placeholder}"`;
        if (text && text.length > 0) return `"${text}"`;
        return tagName;
      }

      // Capture clicks
      document.addEventListener('click', (e) => {
        const target = e.target as Element;
        if (!target) return;

        const action = {
          type: 'click' as const,
          selector: getStableSelector(target),
          description: `Click ${getDescription(target)}`,
          timestamp: Date.now(),
        };

        (window as any)._recordedActions.push(action);
      }, true);

      // Capture inputs
      document.addEventListener('input', (e) => {
        const target = e.target as HTMLInputElement;
        if (!target) return;

        const action = {
          type: 'fill' as const,
          selector: getStableSelector(target),
          description: `Fill ${getDescription(target)}`,
          value: target.value,
          timestamp: Date.now(),
        };

        (window as any)._recordedActions.push(action);
      }, true);

      // Capture form submissions
      document.addEventListener('submit', (e) => {
        const target = e.target as Element;
        if (!target) return;

        const action = {
          type: 'click' as const,
          selector: getStableSelector(target),
          description: `Submit form`,
          timestamp: Date.now(),
        };

        (window as any)._recordedActions.push(action);
      }, true);
    });

    // Track navigation
    this.page.on('framenavigated', async (frame: any) => {
      if (frame === this.page.mainFrame()) {
        const action: RecordedAction = {
          type: 'navigate',
          selector: '',
          description: `Navigate to ${frame.url()}`,
          url: frame.url(),
          timestamp: Date.now(),
        };

        this.actions.push(action);
        await this.saveActions();
      }
    });

    // Poll for captured actions from the page
    this.startPolling();
  }

  /**
   * Poll the page for captured actions and save them
   */
  private startPolling() {
    const pollInterval = setInterval(async () => {
      if (!this.recording) {
        clearInterval(pollInterval);
        return;
      }

      try {
        // Retrieve actions captured in the page
        const pageActions = await this.page.evaluate(() => {
          const actions = (window as any)._recordedActions || [];
          (window as any)._recordedActions = [];
          return actions;
        });

        if (pageActions && pageActions.length > 0) {
          this.actions.push(...pageActions);
          await this.saveActions();
        }
      } catch (error) {
        // Page might be navigating, ignore errors
        console.log('[ActionRecorder] Error polling actions:', error);
      }
    }, 2000); // Poll every 2 seconds

    // Store interval for cleanup
    (global as any).recordingIntervals = (global as any).recordingIntervals || {};
    (global as any).recordingIntervals[this.recordingId] = pollInterval;
  }

  /**
   * Stop recording
   */
  async stopRecording() {
    this.recording = false;

    // Clear interval
    if ((global as any).recordingIntervals?.[this.recordingId]) {
      clearInterval((global as any).recordingIntervals[this.recordingId]);
      delete (global as any).recordingIntervals[this.recordingId];
    }

    // Final save
    await this.saveActions();
  }

  /**
   * Get all recorded actions
   */
  getActions(): RecordedAction[] {
    return this.actions;
  }

  /**
   * Save actions to MongoDB
   */
  private async saveActions() {
    try {
      const db = await connectDB();
      await db.collection('recording_sessions').updateOne(
        { recordingId: this.recordingId },
        {
          $set: {
            recordedActions: this.actions,
            updatedAt: new Date().toISOString()
          }
        }
      );
    } catch (error) {
      console.error('[ActionRecorder] Error saving actions:', error);
    }
  }

  /**
   * Manually add an action (for testing or special cases)
   */
  async addAction(action: RecordedAction) {
    this.actions.push(action);
    await this.saveActions();
  }
}
