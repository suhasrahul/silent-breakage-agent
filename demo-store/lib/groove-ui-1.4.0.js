/*
 * groove-ui v1.4.0 — a tiny fake component library for the demo.
 * Every component here is accessible. The page calls GrooveUI.mount().
 */
(function () {
  var theme = {
    ink: "#1E2433",
    muted: "#5B6170",   /* 6.3:1 on white, passes WCAG AA */
    accent: "#2F5BEA"
  };

  function textField(p) {
    return '<div class="g-field">' +
      '<label for="' + p.id + '">' + p.label + '</label>' +
      '<input id="' + p.id + '" type="' + (p.type || "text") + '" autocomplete="' + (p.autocomplete || "off") + '">' +
      '</div>';
  }

  function iconButton(p) {
    return '<button class="g-icon-btn" type="button" aria-label="' + p.label + '">' +
      '<svg aria-hidden="true" focusable="false" width="18" height="18" viewBox="0 0 24 24"><path d="' + p.icon + '" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>' +
      '</button>';
  }

  function iconLink(p) {
    return '<a class="g-icon-link" href="' + p.href + '" aria-label="' + p.label + '">' +
      '<svg aria-hidden="true" focusable="false" width="20" height="20" viewBox="0 0 24 24"><path d="' + p.icon + '" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>' +
      '</a>';
  }

  function cover(p) {
    return '<img class="g-cover" src="' + p.src + '" alt="' + p.alt + '" width="88" height="88">';
  }

  function note(p) {
    return '<p class="g-note" style="color:' + theme.muted + '">' + p.text + '</p>';
  }

  var components = { textField: textField, iconButton: iconButton, iconLink: iconLink, cover: cover, note: note };

  function mount() {
    document.querySelectorAll("[data-g]").forEach(function (el) {
      var props = JSON.parse(el.getAttribute("data-props") || "{}");
      el.outerHTML = components[el.getAttribute("data-g")](props);
    });
  }

  window.GrooveUI = { version: "1.4.0", mount: mount, theme: theme };
})();
