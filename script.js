// Inkwell: manga storybook scripts
// Features: ink mode, like button, show/hide synopsis, search + genre filter,
// book details popup, reading progress bar.

(function () {
  var body = document.body;

  // ---------- Helpers: save and load data in the browser ----------
  function load(key, fallback) {
    try {
      return JSON.parse(localStorage.getItem(key)) || fallback;
    } catch (error) {
      return fallback;
    }
  }

  function save(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      // Storage is blocked, so the page still works without saving.
    }
  }

  // ---------- Feature 1: Ink mode (dark / light) ----------
  var themeButton = document.getElementById('theme');

  if (load('ink', false)) {
    body.classList.add('ink');
  }

  themeButton.addEventListener('click', function () {
    var isInk = body.classList.toggle('ink');
    save('ink', isInk);
  });

  // ---------- Mobile menu ----------
  var menuButton = document.querySelector('.menu-btn');
  var menuList = document.querySelector('.nav ul');

  menuButton.addEventListener('click', function () {
    var isOpen = menuList.classList.toggle('open');
    menuButton.setAttribute('aria-expanded', isOpen);
  });

  // ---------- Feature 2: Like button ----------
  var likes = load('likes', {});

  function paintLike(button) {
    var liked = likes[button.dataset.id];
    button.classList.toggle('liked', !!liked);
    button.textContent = liked ? '♥ Liked' : '♡ Like';
  }

  document.querySelectorAll('.like').forEach(function (button) {
    paintLike(button);

    button.addEventListener('click', function () {
      var id = button.dataset.id;
      likes[id] = !likes[id];
      save('likes', likes);

      // Update every like button for the same book
      document.querySelectorAll('.like[data-id="' + id + '"]').forEach(paintLike);
    });
  });

  // ---------- Feature 3: Show / hide synopsis ----------
  document.querySelectorAll('.tog').forEach(function (button) {
    button.addEventListener('click', function () {
      var synopsis = button.closest('.info').querySelector('.syn');
      synopsis.hidden = !synopsis.hidden;
      button.textContent = synopsis.hidden ? 'Show synopsis' : 'Hide synopsis';
    });
  });

  // ---------- Feature 4: Search and genre filter ----------
  var cards = Array.prototype.slice.call(document.querySelectorAll('.card'));
  var searchBox = document.getElementById('q');
  var countText = document.getElementById('count');
  var chosenGenre = 'All';

  function filterCards() {
    var text = searchBox.value.trim().toLowerCase();
    var shown = 0;

    cards.forEach(function (card) {
      var genreMatch = chosenGenre === 'All' || card.dataset.genre === chosenGenre;
      var cardText = card.querySelector('h3').textContent + ' ' +
               card.querySelector('.by').textContent;
                var textMatch = cardText.toLowerCase().indexOf(text) > -1;
      var visible = genreMatch && textMatch;

      card.hidden = !visible;
      if (visible) {
        shown++;
      }
    });

    countText.textContent = shown
      ? shown + ' stories'
      : 'No stories match. Try another search or genre.';
  }

  if (searchBox) {
    searchBox.addEventListener('input', filterCards);

    document.querySelectorAll('.chip').forEach(function (chip) {
      chip.addEventListener('click', function () {
        document.querySelectorAll('.chip').forEach(function (other) {
          other.classList.remove('on');
        });
        chip.classList.add('on');
        chosenGenre = chip.dataset.g;
        filterCards();
      });
    });

    filterCards();
  }

  // ---------- Feature 5: Book details popup ----------
  var dialog = document.getElementById('dlg');

  document.querySelectorAll('.det').forEach(function (button) {
    button.addEventListener('click', function () {
      var card = button.closest('.card');

      document.getElementById('dt').textContent = card.querySelector('h3').textContent;
      document.getElementById('da').textContent = 'by ' + card.dataset.author;
      document.getElementById('dg').textContent = 'Genre: ' + card.dataset.genre;
      document.getElementById('ds').textContent = card.dataset.syn;
      document.getElementById('dc').textContent = 'Chapter: ' + card.dataset.ch;

      dialog.showModal();
    });
  });

  // ---------- Feature 6: Reading progress bar ----------
  var progressBar = document.getElementById('progress');

  window.addEventListener('scroll', function () {
    var scrollable = document.documentElement.scrollHeight - window.innerHeight;
    var percent = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
    progressBar.style.width = percent + '%';
  }, { passive: true });
})();
