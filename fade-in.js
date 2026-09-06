/* Freedomtrek — fade-in leggero delle sezioni allo scroll, solo in index.html.
   Se IntersectionObserver non è supportato, o l'utente preferisce
   ridurre le animazioni, non viene aggiunta nessuna classe al body:
   .fade-section resta visibile con lo stile di default (nessuna
   opacity 0 applicata via CSS a prescindere dal JS). */
(function () {
  'use strict';

  if (!('IntersectionObserver' in window)) {
    return;
  }

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return;
  }

  var sezioni = document.querySelectorAll('.fade-section');
  if (!sezioni.length) {
    return;
  }

  document.body.classList.add('fade-in-ready');

  var observer = new IntersectionObserver(function (entries, oss) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        oss.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  sezioni.forEach(function (sezione) {
    observer.observe(sezione);
  });
})();
