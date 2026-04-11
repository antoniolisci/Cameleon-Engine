// Entry point for the behavior analysis module.
// Manages the sidebar tab integration without touching any existing JS.
//
// Isolation contract:
//   - reads NO data from the main engine
//   - emits NO global events
//   - sets NO window.* properties
//   - deactivates itself cleanly when any engine tab is clicked

import { mount } from './ui/behavior-view.js';

const BEHAVIOR_ROOT_ID = 'behavior-root';
const BEHAVIOR_BTN_ID  = 'behaviorTabBtn';
const ACTIVE_CLASS     = 'bhv-active';    // class on the sidebar button
const BHV_BODY_CLASS   = 'bhv-panel-open'; // class on body when module is visible

function init() {
  const root = document.getElementById(BEHAVIOR_ROOT_ID);
  const btn  = document.getElementById(BEHAVIOR_BTN_ID);
  if (!root || !btn) return;

  // Activate behavior view when its button is clicked
  btn.addEventListener('click', () => activateBehavior(root, btn));

  // Deactivate when any engine tab is clicked
  document.querySelectorAll('[data-tab-target]').forEach(tabBtn => {
    tabBtn.addEventListener('click', () => deactivateBehavior(root, btn));
  });
}

function activateBehavior(root, btn) {
  // Hide cockpit, show behavior panel
  document.body.classList.add(BHV_BODY_CLASS);
  root.hidden = false;

  // Style the button as active; clear active from engine tabs
  document.querySelectorAll('[data-tab-target]').forEach(b => b.classList.remove('active'));
  btn.classList.add(ACTIVE_CLASS);

  // Render (or re-render) the module
  mount(root);
}

function deactivateBehavior(root, btn) {
  document.body.classList.remove(BHV_BODY_CLASS);
  root.hidden = true;
  btn.classList.remove(ACTIVE_CLASS);
}

// Modules are deferred — DOM is ready when this runs.
init();
