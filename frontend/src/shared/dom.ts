type EventRecord = {
  target: EventTarget;
  event: string;
  handler: EventListener | EventListenerObject;
  options?: AddEventListenerOptions;
  cleanup: () => void;
};

const cleanupRegistry: EventRecord[] = [];

// Declare global augmentation for custom events
declare global {
  interface WindowEventMap {
    "game": CustomEvent;
  }
}

function create(html: string) {
  const template = document.createElement("template");
  template.innerHTML = html.trim();
  const first = template.content.firstElementChild;
  if (!first)
    throw new Error("frontend.create(): HTML string must have at least one root element.");
  return first.cloneNode(true) as HTMLElement;
}

function mount(
  selector: HTMLElement | null, 
  component: HTMLElement,
  clear: boolean = true
) {
  if (selector) {
    if (clear)
      selector.innerHTML = "";
    selector.appendChild(component);
  } else {
    console.warn(`mount(): Target element not found or null.`);
  }
}

function navigateTo(component: HTMLElement, sectionId: string) {
  const dataId = document.querySelector(`[data-id="${sectionId}"]`);
  if (!dataId) {
    console.warn(`navigateTo(): No container found with id '${sectionId}'`);
    return;
  }
  mount(dataId as HTMLElement, component);
}

// Standard overloads
function registerEvent<K extends keyof DocumentEventMap>(
  target: Document,
  event: K,
  handler: (this: Document, ev: DocumentEventMap[K]) => any,
  options?: AddEventListenerOptions
): () => void;

function registerEvent<K extends keyof WindowEventMap>(
  target: Window,
  event: K,
  handler: (this: Window, ev: WindowEventMap[K]) => any,
  options?: AddEventListenerOptions
): () => void;

function registerEvent<K extends keyof HTMLElementEventMap>(
  target: HTMLElement,
  event: K,
  handler: (this: HTMLElement, ev: HTMLElementEventMap[K]) => any,
  options?: AddEventListenerOptions
): () => void;

// General fallback implementation
function registerEvent(
  target: EventTarget,
  event: string,
  handler: EventListener | EventListenerObject,
  options?: AddEventListenerOptions
): () => void {
  target.addEventListener(event, handler, options);

  const cleanup = () => target.removeEventListener(event, handler, options);
  cleanupRegistry.push({ target, event, handler, options, cleanup });
  return cleanup;
}

function cleanupEvents() {
  console.log(`DOM: Starting cleanup of registered events`);
  showRegistry();

  while (cleanupRegistry.length) {
    const { cleanup } = cleanupRegistry.pop()!;
    cleanup();
  }

  console.log(`DOM: Finished cleanup`);
  showRegistry();
}

function showRegistry() {
  console.log(`DOM: ${cleanupRegistry.length} event(s) registered`);

  cleanupRegistry.forEach((entry, index) => {
    console.log(`Event #${index + 1}:`);
    console.log(`  Target:`, entry.target);
    console.log(`  Event: ${entry.event}`);
    console.log(`  Handler:`, entry.handler);
    console.log(`  Options:`, entry.options);
  });
}

export default {
  create,
  mount,
  navigateTo,
  registerEvent,
  cleanupEvents
};