/**
 * Global Utility Class Parser (Bootstrap Responsive-Aware)
 * Enables inline dynamic styling with optional Bootstrap breakpoints 
 * Example: h-[300px], md:h-[50rem], lg:bg-[#f5f5f5], sm:w-[100%]
 */
(function () {
  // Bootstrap Breakpoints (in pixels)
  const breakpoints = {
    sm: 576,
    md: 768,
    lg: 992,
    xl: 1200,
    xxl: 1400
  };

  function applyDynamicStyles(element) {
    const rawClass = typeof element.className === "string" 
      ? element.className 
      : element.getAttribute("class") || "";

    if (!rawClass) return;

    const classes = rawClass
      .replace(/[\u00A0\u1680\u180E\u2000-\u200B\u202F\u205F\u3000]/g, " ")
      .split(/\s+/);

    const screenWidth = window.innerWidth;

    classes.forEach((c) => {
      let match;

      // Match optional Bootstrap prefix: (sm:|md:|lg:|xl:|xxl:)? followed by utility class
      const regex = /^(?:(sm|md|lg|xl|xxl):)?(c|bg|h|max-h|min-h|top|bottom|w)-\[(.+)\]$/;
      match = c.match(regex);

      if (match) {
        const prefix = match[1];     // e.g., 'md' or undefined
        const property = match[2];   // e.g., 'h', 'bg', 'w'
        const value = match[3];      // e.g., '50rem', '#656565'

        // Check if breakpoint condition is satisfied
        if (!prefix || screenWidth >= breakpoints[prefix]) {
          applyCSSProperty(element, property, value);
        } else {
          // Reset style if screen drops below breakpoint
          resetCSSProperty(element, property);
        }
      }
    });
  }

  function applyCSSProperty(el, propKey, value) {
    const propMap = {
      c: "color",
      bg: "backgroundColor",
      h: "height",
      "max-h": "maxHeight",
      "min-h": "minHeight",
      top: "top",
      bottom: "bottom",
      w: "width"
    };
    if (propMap[propKey]) {
      el.style[propMap[propKey]] = value;
    }
  }

  function resetCSSProperty(el, propKey) {
    const propMap = {
      c: "color",
      bg: "backgroundColor",
      h: "height",
      "max-h": "maxHeight",
      "min-h": "minHeight",
      top: "top",
      bottom: "bottom",
      w: "width"
    };
    if (propMap[propKey]) {
      el.style[propMap[propKey]] = "";
    }
  }

  function init() {
    document.querySelectorAll("[class]").forEach(applyDynamicStyles);
  }

  // Initial load
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  // Handle browser window resize
  window.addEventListener("resize", init);

  // Observe DOM additions (SPAs / dynamic elements)
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === 1) {
          if (node.hasAttribute("class")) applyDynamicStyles(node);
          node.querySelectorAll?.("[class]").forEach(applyDynamicStyles);
        }
      });
    });
  });

  document.addEventListener("DOMContentLoaded", () => {
    observer.observe(document.body, { childList: true, subtree: true });
  });
})();