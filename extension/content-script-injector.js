// Content Script Injector
// This runs in the isolated content script context and injects the actual
// monitoring script into the page context so Playwright can access it

(function() {
  console.log('[Extension] Content script injector running');

  // Create script element to inject into page context
  const script = document.createElement('script');
  script.src = chrome.runtime.getURL('monitoring-script.js');
  script.onload = function() {
    console.log('[Extension] Monitoring script injected into page context');
    this.remove();
  };

  // Inject at document_start
  (document.head || document.documentElement).appendChild(script);

  console.log('[Extension] Injection initiated');
})();
