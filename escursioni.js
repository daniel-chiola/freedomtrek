/* Freedomtrek — rendering delle escursioni da escursioni.json.
   Usato sia da escursioni.html (uscite future, con pulsante Iscriviti)
   sia da passate.html (uscite passate, senza pulsante).
   Solo textContent per inserire testo: mai innerHTML. */
(function () {
  'use strict';

  var MESI = ['gen', 'feb', 'mar', 'apr', 'mag', 'giu', 'lug', 'ago', 'set', 'ott', 'nov', 'dic'];

  function parseData(stringaData) {
    // "2026-07-31" -> Date locale a mezzanotte, senza scarti di fuso orario
    var parti = stringaData.split('-');
    return new Date(Number(parti[0]), Number(parti[1]) - 1, Number(parti[2]));
  }

  function formatKm(km) {
    return String(km).replace('.', ',') + ' km';
  }

  function creaTesto(tag, classe, testo) {
    var el = document.createElement(tag);
    if (classe) {
      el.className = classe;
    }
    el.textContent = testo;
    return el;
  }

  function creaPallino(difficolta) {
    var span = document.createElement('span');
    span.className = 'dot dot--' + difficolta.toLowerCase();
    span.setAttribute('aria-hidden', 'true');
    return span;
  }

  function creaCard(uscita, opzioni) {
    var data = parseData(uscita.data);

    var li = document.createElement('li');
    li.className = 'hike-card';

    var colonnaData = document.createElement('div');
    colonnaData.className = 'hike-card-date';
    colonnaData.appendChild(creaTesto('span', 'hike-card-day', String(data.getDate())));
    colonnaData.appendChild(creaTesto('span', 'hike-card-month', MESI[data.getMonth()]));
    li.appendChild(colonnaData);

    var corpo = document.createElement('div');
    corpo.className = 'hike-card-body';
    corpo.appendChild(creaTesto('h2', 'hike-card-title', uscita.titolo));
    corpo.appendChild(creaTesto('p', 'hike-card-place', uscita.luogo + ' · Ritrovo: ' + uscita.ritrovo));

    var meta = document.createElement('div');
    meta.className = 'hike-card-meta';

    var difficolta = document.createElement('span');
    difficolta.className = 'hike-card-difficulty';
    difficolta.appendChild(creaPallino(uscita.difficolta));
    difficolta.appendChild(document.createTextNode(uscita.difficolta));
    meta.appendChild(difficolta);

    meta.appendChild(creaTesto('span', null, uscita.dislivello + ' m di dislivello'));
    meta.appendChild(creaTesto('span', null, formatKm(uscita.km)));
    meta.appendChild(creaTesto('span', null, uscita.durata));

    corpo.appendChild(meta);
    li.appendChild(corpo);

    if (opzioni.mostraIscriviti && uscita.urlModulo) {
      var link = document.createElement('a');
      link.className = 'btn btn-primary';
      link.href = uscita.urlModulo;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.textContent = 'Iscriviti';
      li.appendChild(link);
    }

    return li;
  }

  function mostraMessaggio(container, testo) {
    container.appendChild(creaTesto('p', 'placeholder-note', testo));
  }

  function joinItaliano(lista) {
    if (lista.length === 0) {
      return '';
    }
    if (lista.length === 1) {
      return lista[0];
    }
    return lista.slice(0, -1).join(', ') + ' e ' + lista[lista.length - 1];
  }

  function popolaTeaser(elemento, passate) {
    if (!passate.length) {
      return;
    }
    var luoghi = [];
    passate.slice(0, 3).forEach(function (uscita) {
      if (luoghi.indexOf(uscita.luogo) === -1) {
        luoghi.push(uscita.luogo);
      }
    });

    elemento.textContent = '';
    elemento.appendChild(document.createTextNode(
      'Le nostre ultime uscite: ' + joinItaliano(luoghi) + '. '
    ));

    var link = document.createElement('a');
    link.href = 'passate.html';
    link.textContent = 'Guarda le nostre ultime uscite';
    elemento.appendChild(link);
  }

  function popola(container, uscite, opzioni) {
    container.textContent = '';
    if (!uscite.length) {
      mostraMessaggio(container, opzioni.messaggioVuoto);
      return;
    }
    uscite.forEach(function (uscita) {
      container.appendChild(creaCard(uscita, opzioni));
    });
  }

  function init() {
    var containerFuture = document.getElementById('hike-list-future');
    var containerPassate = document.getElementById('hike-list-past');
    var teaserPassate = document.getElementById('past-hikes-teaser');
    if (!containerFuture && !containerPassate && !teaserPassate) {
      return;
    }

    fetch('escursioni.json')
      .then(function (risposta) {
        return risposta.json();
      })
      .then(function (uscite) {
        var oggi = new Date();
        oggi.setHours(0, 0, 0, 0);

        var passate = uscite
          .filter(function (u) { return parseData(u.data) < oggi; })
          .sort(function (a, b) { return parseData(b.data) - parseData(a.data); });

        if (containerFuture) {
          var future = uscite
            .filter(function (u) { return parseData(u.data) >= oggi; })
            .sort(function (a, b) { return parseData(a.data) - parseData(b.data); });
          popola(containerFuture, future, {
            mostraIscriviti: true,
            messaggioVuoto: 'Nessuna uscita in programma al momento. Torna a trovarci presto.'
          });
        }

        if (containerPassate) {
          popola(containerPassate, passate, {
            mostraIscriviti: false,
            messaggioVuoto: 'Non ci sono ancora escursioni passate da mostrare.'
          });
        }

        if (teaserPassate) {
          popolaTeaser(teaserPassate, passate);
        }
      })
      .catch(function () {
        var container = containerFuture || containerPassate;
        if (container) {
          mostraMessaggio(container, 'Non è stato possibile caricare le escursioni al momento.');
        }
      });
  }

  document.addEventListener('DOMContentLoaded', init);
})();
