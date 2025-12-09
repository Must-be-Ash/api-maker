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
  private lastUrl: string = '';

  constructor(page: any, recordingId: string) {
    this.page = page;
    this.recordingId = recordingId;
  }

  /**
   * Inject monitoring script into the page to capture user actions
   */
  private async injectMonitoringScript() {
    await this.page.evaluate(() => {
      // Initialize or reset the recorded actions array
      (window as any)._recordedActions = (window as any)._recordedActions || [];

      // Skip if already injected (check for marker)
      if ((window as any)._actionRecorderInjected) {
        console.log('[ActionRecorder] Script already injected, skipping');
        return;
      }
      (window as any)._actionRecorderInjected = true;

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
        console.log('[ActionRecorder] Captured click:', action);
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
        console.log('[ActionRecorder] Captured input:', action);
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
        console.log('[ActionRecorder] Captured submit:', action);
      }, true);

      console.log('[ActionRecorder] Event listeners attached successfully');
    });
  }

  /**
   * Start recording user actions by injecting monitoring script
   */
  async startRecording() {
    this.recording = true;

    console.log('[ActionRecorder] Starting recording');

    // Inject the monitoring script into the current page
    await this.injectMonitoringScript();

    // Initialize last URL for navigation tracking
    this.lastUrl = this.page.url();
    console.log('[ActionRecorder] Initial URL:', this.lastUrl);

    // Poll for captured actions and URL changes
    this.startPolling();

    console.log('[ActionRecorder] Started recording');
  }

  /**
   * Poll the page for captured actions and URL changes
   */
  private startPolling() {
    const pollInterval = setInterval(async () => {
      if (!this.recording) {
        clearInterval(pollInterval);
        return;
      }

      try {
        // Check for URL changes (navigation detection)
        const currentUrl = this.page.url();
        if (currentUrl !== this.lastUrl) {
          console.log('[ActionRecorder] URL changed:', this.lastUrl, '->', currentUrl);

          // Record navigation action
          const action: RecordedAction = {
            type: 'navigate',
            selector: '',
            description: `Navigate to ${currentUrl}`,
            url: currentUrl,
            timestamp: Date.now(),
          };

          this.actions.push(action);
          await this.saveActions();

          // Update last URL
          this.lastUrl = currentUrl;

          // Re-inject monitoring script on the new page
          try {
            console.log('[ActionRecorder] Re-injecting script after navigation');
            await this.injectMonitoringScript();
          } catch (error) {
            console.log('[ActionRecorder] Error re-injecting script:', error);
          }
        }

        // Retrieve actions captured in the page
        const pageActions = await this.page.evaluate(() => {
          const actions = (window as any)._recordedActions || [];
          (window as any)._recordedActions = [];
          return actions;
        });

        if (pageActions && pageActions.length > 0) {
          console.log('[ActionRecorder] Retrieved', pageActions.length, 'actions from page');
          this.actions.push(...pageActions);
          await this.saveActions();
        }
      } catch (error) {
        // Page might be navigating or transitioning, ignore errors
        console.log('[ActionRecorder] Error polling:', error);
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
