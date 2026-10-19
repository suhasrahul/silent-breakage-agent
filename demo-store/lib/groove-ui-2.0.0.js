/*
 * groove-ui v2.0.0 — "cleaner, lighter, faster" redesign.
 * Nothing crashes and the page looks fine, but five components quietly
 * lost accessibility. See demo-store/CHANGELOG.md for what changed.
 */
(function () {
  var theme = {
    ink: "#1E2433",
    muted: "#B4B8C2",   /* new lighter gray: ~2:1 on white, FAILS contrast */
    accent: "#2F5BEA"
  };

  /* New styled label: a <span> that looks the same but is not connected to the input. */
  function textField(p) {
    return '<div class="g-field">' +
      '<span class="g-field-label">' + p.label + '</span>' +
      '<input id="' + p.id + '" type="' + (p.type || "text") + '" autocomplete="' + (p.autocomplete || "off") + '">' +
      '</div>';
  }

  /* Prop renamed: `label` is now `title` and only used if passed. */
  function iconButton(p) {
    var name = p.title ? ' aria-label="' + p.title + '"' : "";
    return '<button class="g-icon-btn" type="button"' + name + '>' +
      '<svg aria-hidden="true" focusable="false" width="18" height="18" viewBox="0 0 24 24"><path d="' + p.icon + '" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>' +
      '</button>';
  }

  /* Same rename as iconButton. */
  function iconLink(p) {
    var name = p.title ? ' aria-label="' + p.title + '"' : "";
    return '<a class="g-icon-link" href="' + p.href + '"' + name + '>' +
      '<svg aria-hidden="true" focusable="false" width="20" height="20" viewBox="0 0 24 24"><path d="' + p.icon + '" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>' +
      '</a>';
  }

  /* Prop renamed: `alt` is now `altText`. Old prop is silently ignored. */
  function cover(p) {
    var alt = p.altText ? ' alt="' + p.altText + '"' : "";
    return '<img class="g-cover" src="' + p.src + '"' + alt + ' width="88" height="88">';
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

  window.GrooveUI = { version: "2.0.0", mount: mount, theme: theme };
})();
