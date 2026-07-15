const fs = require('fs');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

const html = fs.readFileSync('/Users/dinathwijesooriya/LeoMinutes360/index.html', 'utf8');
const scriptContent = fs.readFileSync('/Users/dinathwijesooriya/LeoMinutes360/script.js', 'utf8');

const dom = new JSDOM(html, { runScripts: "outside-only", resources: "usable" });
const window = dom.window;

// Mock requestAnimationFrame
window.requestAnimationFrame = (cb) => setTimeout(cb, 16);

// Inject lucide
window.lucide = { createIcons: () => {} };

try {
  window.eval(scriptContent);
  console.log("Script evaluated successfully without throwing.");
} catch (e) {
  console.error("Error evaluating script:", e);
}

// Simulate DOMContentLoaded
window.document.dispatchEvent(new window.Event('DOMContentLoaded'));

console.log("DOMContentLoaded dispatched.");
setTimeout(() => {
    console.log("Waiting 100ms for any async errors...");
}, 100);
