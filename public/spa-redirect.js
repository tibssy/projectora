// This script handles the SPA redirect logic for GitHub Pages.

;(function () {
  var l = window.location;
  var path = l.search.slice(1).split('&').filter(function (s) {
    return s.startsWith('p=');
  })[0];
  if (path) {
    window.history.replaceState(
      null,
      null,
      l.pathname.slice(0, -1) + decodeURIComponent(path.slice(2)) + l.hash
    );
  }
})();