/* =========================================================================
   Moria Bookshop — router and views
   -------------------------------------------------------------------------
   A hash router over five views: home, catalog, product detail, checkout and
   order confirmation. Each view returns a string of HTML, gets dropped into
   <main>, and then wires up its own controls.

   The catalog's search, genre and sort live in the URL, so any filtered
   result is a link you can share, bookmark or paste into a bug report.
   ========================================================================= */

(function () {

  const view = document.getElementById('view');
  const el = function (id) { return document.getElementById(id); };
  const icon = Shell.icon;

  /* Catalog state. The hash is the source of truth; this is the working copy
     so typing in the search box doesn't re-render the whole page. */
  const shop = { q: '', genre: '', sort: 'featured', shelf: '' };

  const SORTS = {
    featured:   'Featured',
    'price-up': 'Price: low to high',
    'price-dn': 'Price: high to low',
    title:      'Title: A–Z'
  };

  const SHELVES = {
    new: {
      eyebrow: 'Just off the cart',
      title: 'New arrivals',
      note: 'Unpacked this week, still smelling of the printer. Seven of them, and two are already selling faster than we can restock.'
    },
    bestseller: {
      eyebrow: 'What everyone is reading',
      title: 'Bestsellers',
      note: 'The books we reorder most. If you are new to fantasy, start anywhere on this shelf and you will not go wrong.'
    }
  };

  /* ===== hash handling =================================================== */

  function parseHash() {
    const raw = location.hash.replace(/^#/, '') || '/';
    const cut = raw.indexOf('?');
    const path = cut === -1 ? raw : raw.slice(0, cut);
    const params = new URLSearchParams(cut === -1 ? '' : raw.slice(cut + 1));
    return { path: path, params: params };
  }

  function go(hash) {
    if (location.hash === hash) router();
    else location.hash = hash;
  }

  /* Writes the current filters back into the address bar without asking the
     router to redraw — replaceState doesn't fire hashchange. */
  function syncShopUrl() {
    const params = new URLSearchParams();
    if (shop.shelf) params.set('shelf', shop.shelf);
    if (shop.q) params.set('q', shop.q);
    if (shop.genre) params.set('genre', shop.genre);
    if (shop.sort !== 'featured') params.set('sort', shop.sort);

    const query = params.toString();
    history.replaceState(null, '', '#/shop' + (query ? '?' + query : ''));
  }

  /* ===== shared fragments ================================================ */

  function bookCard(book) {
    const flag = book.shelf === 'new' ? 'New'
      : book.shelf === 'bestseller' ? 'Bestseller' : '';

    return '' +
      '<article class="card reveal">' +
        '<div class="card__art">' +
          (flag ? '<span class="card__flag">' + flag + '</span>' : '') +
          '<img src="' + book.cover + '" alt="Cover of ' + esc(book.title) +
               ' by ' + esc(book.author) + '" loading="lazy">' +
          '<button class="btn btn--accent btn--sm btn--block card__quick" type="button" ' +
                  'data-add="' + book.id + '">Add to cart</button>' +
        '</div>' +
        '<div class="card__body">' +
          '<p class="card__genre">' + esc(book.genre) + '</p>' +
          '<h3 class="card__title"><a href="#/book/' + book.id + '">' +
            esc(book.title) + '</a></h3>' +
          '<p class="card__by">' + esc(book.author) + '</p>' +
          '<p class="card__cost">' + money(book.price) + '</p>' +
        '</div>' +
      '</article>';
  }

  function bookGrid(list) {
    return '<div class="grid">' + list.map(bookCard).join('') + '</div>';
  }

  function crumbs(trail) {
    let html = '<nav class="crumbs" aria-label="Breadcrumb"><a href="#/">Home</a>';
    trail.forEach(function (step, index) {
      const last = index === trail.length - 1;
      html += icon('right');
      html += last
        ? '<span aria-current="page">' + esc(step.label) + '</span>'
        : '<a href="' + step.href + '">' + esc(step.label) + '</a>';
    });
    return html + '</nav>';
  }

  function stepperHtml(id, value) {
    return '' +
      '<div class="stepper">' +
        '<button type="button" id="' + id + '-less" aria-label="One fewer">' +
          icon('minus') + '</button>' +
        '<input type="number" id="' + id + '" min="1" max="99" value="' + value + '" ' +
               'aria-label="Quantity">' +
        '<button type="button" id="' + id + '-more" aria-label="One more">' +
          icon('plus') + '</button>' +
      '</div>';
  }

  /* Wraps a strip of slides in a swiper: arrows either side, no scrollbar. */
  function swiper(label, slidesHtml, extraClass) {
    return '' +
      '<div class="swipe' + (extraClass ? ' ' + extraClass : '') + '" data-swipe>' +
        '<button class="swipe__nav swipe__nav--prev" type="button" data-swipe-prev ' +
                'aria-label="Previous ' + esc(label) + '">' + icon('left') + '</button>' +
        '<div class="swipe__track" data-swipe-track>' + slidesHtml + '</div>' +
        '<button class="swipe__nav swipe__nav--next" type="button" data-swipe-next ' +
                'aria-label="More ' + esc(label) + '">' + icon('right') + '</button>' +
      '</div>';
  }

  function blankState(title, note, action) {
    return '' +
      '<div class="blank reveal">' +
        '<img class="blank__mark" src="img/smile-website-title.png" alt="">' +
        '<h2 class="blank__title">' + esc(title) + '</h2>' +
        '<p class="blank__note">' + note + '</p>' +
        (action || '') +
      '</div>';
  }

  /* ===== view: home ====================================================== */

  function renderHome() {
    document.title = 'Moria Bookshop — fantasy books';

    const arrivals = booksOnShelf('new');
    const best = booksOnShelf('bestseller');

    view.innerHTML = '' +
      /* --- hero --- */
      '<section class="hero shell">' +
        '<div class="hero__grid">' +
          '<div>' +
            '<p class="eyebrow">Speak, friend, and enter</p>' +
            '<h1 class="hero__title">Explore every fantasy world known to <em>nerdkind</em></h1>' +
            '<p class="hero__lede">' +
              'Imagination is the only weapon in the war against reality. Arm yourself ' +
              'from our hand-picked volumes — epic, grimdark, mythic and everything ' +
              'buried in between.' +
            '</p>' +
            '<div class="hero__actions">' +
              '<a class="btn btn--accent" href="#/shop">Browse the shelves' + icon('right') + '</a>' +
              '<a class="btn btn--outline" href="#/shop?shelf=new">See what just arrived</a>' +
            '</div>' +
            '<div class="hero__facts">' +
              '<p class="hero__fact"><b>' + BOOKS.length + '</b><span>titles in stock</span></p>' +
              '<p class="hero__fact"><b>' + GENRES.length + '</b><span>genres</span></p>' +
              '<p class="hero__fact"><b>1</b><span>sleeping dragon</span></p>' +
            '</div>' +
          '</div>' +

          /* The arch: a doorway cut into the page, with the art behind it. */
          '<div class="hero__arch">' +
          '<div class="hero__panel" id="hero-panel">' +
            HERO_SLIDES.map(function (slide, index) {
              return '<div class="hero__slide' + (index === 0 ? ' is-on' : '') + '">' +
                       '<img src="' + slide.src + '" alt="' + esc(slide.alt) + '"' +
                       (index === 0 ? '' : ' loading="lazy"') + '>' +
                     '</div>';
            }).join('') +
            '<p class="hero__inscription">The doors stand open</p>' +
            '<div class="hero__dots" id="hero-dots" role="tablist" aria-label="Choose artwork">' +
              HERO_SLIDES.map(function (slide, index) {
                return '<button class="hero__dot" type="button" role="tab" ' +
                       'data-slide="' + index + '" aria-current="' + (index === 0) + '" ' +
                       'aria-label="Artwork ' + (index + 1) + ' of ' + HERO_SLIDES.length + '"></button>';
              }).join('') +
            '</div>' +
          '</div>' +
          '</div>' +
        '</div>' +
      '</section>' +

      /* --- the shelf: new arrivals --- */
      '<section class="band band--sink">' +
        '<div class="shell">' +
          '<div class="secthead reveal">' +
            '<div>' +
              '<p class="eyebrow">Just off the cart</p>' +
              '<h2 class="secthead__title">New arrivals</h2>' +
              '<p class="secthead__note">Shelved this week. Pick one up — they come off the ' +
                'shelf when you point at them.</p>' +
            '</div>' +
            '<a class="secthead__link" href="#/shop?shelf=new">All new arrivals' + icon('right') + '</a>' +
          '</div>' +

          '<div class="shelf reveal">' +
            swiper('new arrivals',
              arrivals.map(function (book) {
                return '' +
                  '<div class="shelf__book">' +
                    '<div class="shelf__cover">' +
                      '<img src="' + book.cover + '" alt="Cover of ' + esc(book.title) +
                           ' by ' + esc(book.author) + '" loading="lazy">' +
                    '</div>' +
                    '<a class="shelf__label" href="#/book/' + book.id + '">' +
                      '<span class="shelf__name">' + esc(book.title) + '</span>' +
                      '<span class="shelf__by">' + esc(book.author) + '</span>' +
                      '<span class="shelf__cost">' + money(book.price) + '</span>' +
                    '</a>' +
                  '</div>';
              }).join(''),
              'swipe--shelf') +
            '<div class="shelf__plank" aria-hidden="true"></div>' +
          '</div>' +
        '</div>' +
      '</section>' +

      /* --- bestsellers --- */
      '<section class="band">' +
        '<div class="shell">' +
          '<div class="secthead reveal">' +
            '<div>' +
              '<p class="eyebrow">What everyone is reading</p>' +
              '<h2 class="secthead__title">Bestsellers</h2>' +
              '<p class="secthead__note">The books we reorder most often, and the ones we ' +
                'press into your hands unprompted.</p>' +
            '</div>' +
            '<a class="secthead__link" href="#/shop?shelf=bestseller">All bestsellers' +
              icon('right') + '</a>' +
          '</div>' +
          '<div class="reveal">' +
            swiper('bestsellers', best.map(bookCard).join(''), 'swipe--cards') +
          '</div>' +
        '</div>' +
      '</section>' +

      /* --- genres --- */
      '<section class="band band--sink band--tight">' +
        '<div class="shell">' +
          '<div class="secthead reveal">' +
            '<div>' +
              '<p class="eyebrow">Pick your poison</p>' +
              '<h2 class="secthead__title">By genre</h2>' +
            '</div>' +
            '<a class="secthead__link" href="#/shop">Shop all ' + BOOKS.length + ' books' +
              icon('right') + '</a>' +
          '</div>' +
          '<div class="tiles reveal">' +
            GENRE_TILES.map(function (tile) {
              return '<a class="tile" href="#/shop?genre=' + encodeURIComponent(tile.genre) + '">' +
                       '<img src="' + tile.image + '" alt="" loading="lazy">' +
                       '<span>' + esc(tile.genre) + '</span>' +
                     '</a>';
            }).join('') +
          '</div>' +
        '</div>' +
      '</section>' +

      /* --- quote --- */
      '<section class="band">' +
        '<div class="shell quote reveal">' +
          '<blockquote>“There is nothing like looking, if you want to find something.”</blockquote>' +
          '<cite>J.R.R. Tolkien, The Hobbit</cite>' +
        '</div>' +
      '</section>';

    startHeroSlider();
    Shell.wireSwipers(view);
  }

  /* --- hero slider: only the painting changes, the headline stays put --- */

  let heroTimer = null;
  let heroAt = 0;

  function showSlide(index) {
    const slides = view.querySelectorAll('.hero__slide');
    const dots = view.querySelectorAll('.hero__dot');
    if (slides.length === 0) return;

    heroAt = (index + slides.length) % slides.length;

    slides.forEach(function (slide, i) { slide.classList.toggle('is-on', i === heroAt); });
    dots.forEach(function (dot, i) { dot.setAttribute('aria-current', String(i === heroAt)); });
  }

  function startHeroSlider() {
    clearInterval(heroTimer);

    const panel = el('hero-panel');
    if (!panel) return;

    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!still) heroTimer = setInterval(function () { showSlide(heroAt + 1); }, 6000);

    /* Stop cycling while someone is looking at, or tabbing through, the panel. */
    const hold = function () { clearInterval(heroTimer); };
    const resume = function () {
      clearInterval(heroTimer);
      if (!still) heroTimer = setInterval(function () { showSlide(heroAt + 1); }, 6000);
    };
    panel.addEventListener('mouseenter', hold);
    panel.addEventListener('mouseleave', resume);
    panel.addEventListener('focusin', hold);
    panel.addEventListener('focusout', resume);

    el('hero-dots').addEventListener('click', function (event) {
      const dot = event.target.closest('[data-slide]');
      if (!dot) return;
      showSlide(Number(dot.dataset.slide));
      resume();
    });
  }

  /* ===== view: catalog =================================================== */

  function matchingBooks() {
    const term = shop.q.trim().toLowerCase();

    let list = BOOKS.filter(function (book) {
      if (shop.shelf && book.shelf !== shop.shelf) return false;
      if (shop.genre && book.genre !== shop.genre) return false;
      if (!term) return true;
      return book.title.toLowerCase().indexOf(term) !== -1 ||
             book.author.toLowerCase().indexOf(term) !== -1;
    });

    if (shop.sort === 'price-up') list.sort(function (a, b) { return a.price - b.price; });
    else if (shop.sort === 'price-dn') list.sort(function (a, b) { return b.price - a.price; });
    else if (shop.sort === 'title') list.sort(function (a, b) { return a.title.localeCompare(b.title); });

    return list;
  }

  /* How many books the filters are drawing from, ignoring search and genre. */
  function shelfSize() {
    return shop.shelf ? booksOnShelf(shop.shelf).length : BOOKS.length;
  }

  function renderCatalog(params) {
    shop.shelf = params.get('shelf') === 'new' || params.get('shelf') === 'bestseller'
      ? params.get('shelf') : '';
    shop.q = params.get('q') || '';
    shop.genre = GENRES.indexOf(params.get('genre')) !== -1 ? params.get('genre') : '';
    shop.sort = SORTS[params.get('sort')] ? params.get('sort') : 'featured';

    const head = SHELVES[shop.shelf] || {
      eyebrow: 'The whole catalogue',
      title: 'Shop all books',
      note: 'Every book in the shop, all ' + BOOKS.length + ' of them. Search by title or ' +
            'author, narrow it down by genre, or sort by price if the budget is the deciding factor.'
    };

    document.title = head.title + ' — Moria Bookshop';
    Shell.setSearchValue(shop.q);

    view.innerHTML = '' +
      '<div class="shell">' +
        crumbs([{ label: head.title }]) +

        '<header class="pagehead">' +
          '<p class="eyebrow">' + esc(head.eyebrow) + '</p>' +
          '<h1 class="pagehead__title">' + esc(head.title) + '</h1>' +
          '<p class="pagehead__note">' + esc(head.note) + '</p>' +
        '</header>' +

        '<section class="band band--tight">' +
          '<div class="shopbar">' +
            '<div class="shopbar__find">' +
              icon('search') +
              '<label class="sr-only" for="shop-q">Search this shelf by title or author</label>' +
              '<input id="shop-q" type="search" placeholder="Search by title or author…" ' +
                     'value="' + esc(shop.q) + '" autocomplete="off">' +
            '</div>' +

            '<div class="shopbar__row">' +
              '<div class="chips" id="shop-genres" role="group" aria-label="Filter by genre">' +
                '<button class="chip" type="button" data-genre="" aria-pressed="' +
                  (shop.genre === '') + '">All genres</button>' +
                GENRES.map(function (genre) {
                  return '<button class="chip" type="button" data-genre="' + esc(genre) + '" ' +
                         'aria-pressed="' + (shop.genre === genre) + '">' + esc(genre) + '</button>';
                }).join('') +
              '</div>' +

              '<div class="sortwrap">' +
                '<label class="filterlabel" for="shop-sort">Sort</label>' +
                '<select id="shop-sort">' +
                  Object.keys(SORTS).map(function (key) {
                    return '<option value="' + key + '"' +
                           (shop.sort === key ? ' selected' : '') + '>' + SORTS[key] + '</option>';
                  }).join('') +
                '</select>' +
              '</div>' +
            '</div>' +
          '</div>' +

          '<div id="shop-results"></div>' +
        '</section>' +
      '</div>';

    paintShopResults();
    wireCatalog();
  }

  function paintShopResults() {
    const list = matchingBooks();
    const box = el('shop-results');
    const filtered = Boolean(shop.q || shop.genre);

    let html =
      '<div class="resultline" role="status">' +
        '<span><strong>' + list.length + '</strong> ' + plural(list.length, 'book', 'books') +
          (filtered ? ' of ' + shelfSize() : '') +
          (shop.q ? ' matching “' + esc(shop.q) + '”' : '') +
          (shop.genre ? ' in ' + esc(shop.genre) : '') +
        '</span>' +
        (filtered
          ? '<button class="btn btn--ghost btn--sm" type="button" id="shop-clear">Clear filters</button>'
          : '') +
      '</div>';

    if (list.length === 0) {
      html += blankState(
        'Nothing on that shelf',
        'No book here matches ' +
          (shop.q ? '“<strong>' + esc(shop.q) + '</strong>”' : 'that filter') +
          (shop.genre ? ' in <strong>' + esc(shop.genre) + '</strong>' : '') +
          '. Try a shorter search, a different genre, or clear the filters and start again.',
        '<button class="btn btn--accent" type="button" id="shop-reset">Clear filters</button>'
      );
    } else {
      html += bookGrid(list);
    }

    box.innerHTML = html;
    Shell.reveal(box);

    const clear = el('shop-clear');
    const reset = el('shop-reset');
    if (clear) clear.addEventListener('click', clearFilters);
    if (reset) reset.addEventListener('click', clearFilters);
  }

  function clearFilters() {
    shop.q = '';
    shop.genre = '';
    el('shop-q').value = '';
    Shell.setSearchValue('');
    el('shop-genres').querySelectorAll('[data-genre]').forEach(function (chip) {
      chip.setAttribute('aria-pressed', String(chip.dataset.genre === ''));
    });
    syncShopUrl();
    paintShopResults();
  }

  function wireCatalog() {
    /* Search as you type. Only the results block is redrawn, so the caret
       never jumps out of the field. */
    el('shop-q').addEventListener('input', function () {
      shop.q = this.value;
      Shell.setSearchValue(shop.q);
      syncShopUrl();
      paintShopResults();
    });

    el('shop-genres').addEventListener('click', function (event) {
      const chip = event.target.closest('[data-genre]');
      if (!chip) return;

      /* Tapping the active genre again clears it. */
      shop.genre = chip.dataset.genre === shop.genre ? '' : chip.dataset.genre;

      this.querySelectorAll('[data-genre]').forEach(function (other) {
        other.setAttribute('aria-pressed', String(other.dataset.genre === shop.genre));
      });
      syncShopUrl();
      paintShopResults();
    });

    el('shop-sort').addEventListener('change', function () {
      shop.sort = this.value;
      syncShopUrl();
      paintShopResults();
    });
  }

  /* ===== view: product detail ============================================ */

  function renderDetail(id) {
    const book = findBook(id);
    if (!book) return renderMissing();

    document.title = book.title + ' — Moria Bookshop';

    const shelfLabel = book.shelf === 'new' ? 'New arrivals'
      : book.shelf === 'bestseller' ? 'Bestsellers' : book.genre;
    const shelfHref = book.shelf
      ? '#/shop?shelf=' + book.shelf
      : '#/shop?genre=' + encodeURIComponent(book.genre);

    const related = BOOKS.filter(function (other) {
      return other.genre === book.genre && other.id !== book.id;
    }).slice(0, 4);

    view.innerHTML = '' +
      '<div class="shell">' +
        crumbs([
          { label: 'Shop all', href: '#/shop' },
          { label: shelfLabel, href: shelfHref },
          { label: book.title }
        ]) +

        '<div class="detail">' +
          '<div class="detail__side">' +
            '<div class="detail__art">' +
              '<img src="' + book.cover + '" alt="Cover of ' + esc(book.title) +
                   ' by ' + esc(book.author) + '">' +
            '</div>' +
          '</div>' +

          '<div>' +
            '<p class="eyebrow">' + esc(book.genre) + '</p>' +
            '<h1 class="detail__title">' + esc(book.title) + '</h1>' +
            '<p class="detail__by">by <strong>' + esc(book.author) + '</strong></p>' +
            '<p class="detail__cost">' + money(book.price) + '</p>' +
            '<p class="detail__blurb">' + esc(book.blurb) + '</p>' +

            '<div class="detail__buy">' +
              stepperHtml('detail-qty', 1) +
              '<button class="btn btn--accent" type="button" id="detail-add">' +
                icon('cart') + 'Add to cart</button>' +
              '<a class="btn btn--ghost" href="' + shelfHref + '">' +
                icon('left') + 'Back to ' + esc(shelfLabel.toLowerCase()) + '</a>' +
            '</div>' +

            '<dl class="detail__specs">' +
              '<div><dt>Genre</dt><dd>' + esc(book.genre) + '</dd></div>' +
              '<div><dt>First published</dt><dd>' + book.year + '</dd></div>' +
              '<div><dt>Pages</dt><dd>' + book.pages + '</dd></div>' +
              '<div><dt>Format</dt><dd>Paperback</dd></div>' +
              '<div><dt>In stock</dt><dd>Yes — ships by raven</dd></div>' +
            '</dl>' +
          '</div>' +
        '</div>' +
      '</div>' +

      (related.length
        ? '<section class="band band--sink">' +
            '<div class="shell">' +
              '<div class="secthead reveal">' +
                '<div>' +
                  '<p class="eyebrow">If you liked that</p>' +
                  '<h2 class="secthead__title">More ' + esc(book.genre.toLowerCase()) + '</h2>' +
                '</div>' +
                '<a class="secthead__link" href="#/shop?genre=' +
                  encodeURIComponent(book.genre) + '">All ' + esc(book.genre.toLowerCase()) +
                  icon('right') + '</a>' +
              '</div>' +
              bookGrid(related) +
            '</div>' +
          '</section>'
        : '');

    wireStepper('detail-qty');

    el('detail-add').addEventListener('click', function () {
      const qty = Math.max(1, parseInt(el('detail-qty').value, 10) || 1);
      Cart.add(book.id, qty);
      Shell.toast('Added ' + qty + ' × ' + book.title + ' to your cart.');
      Shell.openCart();
    });
  }

  function wireStepper(id) {
    const field = el(id);
    if (!field) return;

    const clamp = function () {
      let value = parseInt(field.value, 10);
      if (!value || value < 1) value = 1;
      if (value > 99) value = 99;
      field.value = value;
      el(id + '-less').disabled = value <= 1;
      return value;
    };

    el(id + '-less').addEventListener('click', function () {
      field.value = Math.max(1, (parseInt(field.value, 10) || 1) - 1);
      clamp();
    });
    el(id + '-more').addEventListener('click', function () {
      field.value = Math.min(99, (parseInt(field.value, 10) || 1) + 1);
      clamp();
    });
    field.addEventListener('change', clamp);
    field.addEventListener('blur', clamp);
    clamp();
  }

  /* ===== view: checkout ================================================== */

  function renderCheckout() {
    document.title = 'Checkout — Moria Bookshop';

    /* Guard: there is nothing to check out. */
    if (Cart.isEmpty()) {
      view.innerHTML =
        '<div class="shell">' +
          crumbs([{ label: 'Checkout' }]) +
          '<section class="band">' +
            blankState(
              'Your cart is empty',
              'Checkout opens once there is at least one book in the cart.',
              '<a class="btn btn--accent" href="#/shop">Browse the shelves</a>'
            ) +
          '</section>' +
        '</div>';
      return;
    }

    const lines = Cart.detailed();
    const user = Auth.user();

    view.innerHTML = '' +
      '<div class="shell">' +
        crumbs([{ label: 'Shop all', href: '#/shop' }, { label: 'Checkout' }]) +

        '<header class="pagehead">' +
          '<p class="eyebrow">Almost yours</p>' +
          '<h1 class="pagehead__title">Checkout</h1>' +
          '<p class="pagehead__note">No account needed — you can order as a guest. ' +
            'Nothing here is charged and nothing leaves your browser.</p>' +
        '</header>' +

        '<section class="band band--tight">' +
          '<div class="checkout">' +
            '<form class="panel" id="checkout-form" novalidate>' +
              '<h2 class="panel__title">Where is it going?</h2>' +
              '<p class="panel__note">Delivery by raven, usually within a fortnight.</p>' +

              '<div class="field">' +
                '<label for="co-name">Full name</label>' +
                '<input id="co-name" type="text" name="name" autocomplete="name" ' +
                       'placeholder="Gimli, son of Glóin" value="' +
                       (user ? esc(user.username) : '') + '" aria-describedby="err-co-name">' +
                '<span class="field__err" id="err-co-name"></span>' +
              '</div>' +

              '<div class="field">' +
                '<label for="co-address">Delivery address</label>' +
                '<textarea id="co-address" name="address" autocomplete="street-address" ' +
                          'placeholder="Chamber of Mazarbul, Level 7, Khazad-dûm" ' +
                          'aria-describedby="err-co-address"></textarea>' +
                '<span class="field__err" id="err-co-address"></span>' +
              '</div>' +

              '<div class="field">' +
                '<label for="co-email">Email</label>' +
                '<input id="co-email" type="email" name="email" autocomplete="email" ' +
                       'placeholder="you@example.com" value="' +
                       (user ? esc(user.email) : '') + '" aria-describedby="err-co-email">' +
                '<span class="field__err" id="err-co-email"></span>' +
              '</div>' +

              '<h2 class="panel__title">Payment</h2>' +
              '<p class="panel__note">This shop has no payment processor behind it.</p>' +

              '<p class="demopay">' + icon('check') +
                '<span><strong>Demo payment only.</strong> Type anything you like below. ' +
                'No card is taken, no charge is made, and the value is never stored.</span>' +
              '</p>' +

              '<div class="field">' +
                '<label for="co-pay">Demo payment code — not a card number</label>' +
                '<input id="co-pay" type="text" name="pay" autocomplete="off" inputmode="text" ' +
                       'placeholder="e.g. MITHRIL-1234" aria-describedby="err-co-pay">' +
                '<span class="field__err" id="err-co-pay"></span>' +
              '</div>' +

              '<p class="formerror" id="checkout-error" role="alert"></p>' +

              '<button class="btn btn--accent btn--block" type="submit">' +
                'Place order · ' + money(Cart.total()) + '</button>' +
            '</form>' +

            '<aside class="checkout__side">' +
              '<div class="panel">' +
                '<h2 class="panel__title">Order summary</h2>' +
                '<p class="panel__note">' + Cart.count() + ' ' +
                  plural(Cart.count(), 'item', 'items') + ' in your cart.</p>' +
                recapHtml(lines, Cart.total()) +
                '<p class="panel__note" style="margin:16px 0 0">' +
                  '<a href="#/shop">Keep browsing</a> — your cart is saved.</p>' +
              '</div>' +
            '</aside>' +
          '</div>' +
        '</section>' +
      '</div>';

    el('checkout-form').addEventListener('submit', handleCheckout);
  }

  function recapHtml(lines, total) {
    return '' +
      '<div class="recap">' +
        lines.map(function (line) {
          const book = line.book || line;
          return '<div class="recap__line">' +
                   '<img src="' + book.cover + '" alt="" loading="lazy">' +
                   '<div>' +
                     '<p class="recap__name">' + esc(book.title) + '</p>' +
                     '<p class="recap__qty">' + esc(book.author) + ' · ' +
                       money(book.price) + ' × ' + line.qty + '</p>' +
                   '</div>' +
                   '<span class="recap__cost">' + money(line.lineTotal) + '</span>' +
                 '</div>';
        }).join('') +
        '<div class="recap__total"><span>Total</span><strong>' + money(total) + '</strong></div>' +
      '</div>';
  }

  function handleCheckout(event) {
    event.preventDefault();

    ['err-co-name', 'err-co-address', 'err-co-email', 'err-co-pay', 'checkout-error']
      .forEach(function (id) { el(id).textContent = ''; });
    ['co-name', 'co-address', 'co-email', 'co-pay']
      .forEach(function (id) { el(id).removeAttribute('aria-invalid'); });

    const name = el('co-name').value.trim();
    const address = el('co-address').value.trim();
    const email = el('co-email').value.trim();
    const pay = el('co-pay').value.trim();
    let ok = true;

    const fail = function (inputId, errorId, message) {
      el(errorId).textContent = message;
      el(inputId).setAttribute('aria-invalid', 'true');
      ok = false;
    };

    if (name.length < 2) fail('co-name', 'err-co-name', 'Enter the name for the delivery.');
    if (address.length < 6) fail('co-address', 'err-co-address', 'Enter an address we can send a raven to.');
    if (!email) fail('co-email', 'err-co-email', 'Enter an email address.');
    else if (!isValidEmail(email)) fail('co-email', 'err-co-email', 'That does not look like an email address.');
    if (!pay) fail('co-pay', 'err-co-pay', 'Type anything here — it is a demo field.');

    if (!ok) {
      el('checkout-error').textContent = 'Fix the fields marked above, then place the order.';
      return;
    }

    /* Orders.place() snapshots the cart and then empties it. */
    Orders.place({ name: name, address: address, email: email });
    go('#/order');
  }

  /* ===== view: order confirmation ======================================== */

  function renderOrder() {
    const order = Orders.last();

    if (!order) {
      document.title = 'No order yet — Moria Bookshop';
      view.innerHTML =
        '<div class="shell"><section class="band">' +
          blankState(
            'No order to show',
            'Once you place an order, the confirmation lands here.',
            '<a class="btn btn--accent" href="#/shop">Browse the shelves</a>'
          ) +
        '</section></div>';
      return;
    }

    document.title = 'Order ' + order.reference + ' — Moria Bookshop';

    const count = order.lines.reduce(function (sum, line) { return sum + line.qty; }, 0);
    const placed = new Date(order.placedAt);

    view.innerHTML = '' +
      '<div class="shell">' +
        '<div class="done">' +
          '<div class="done__seal">' + icon('check') + '</div>' +
          '<p class="eyebrow">The dragon has your gold</p>' +
          '<h1 class="done__title">Order placed!</h1>' +
          '<p class="done__note">Thanks for reading with Moria Bookshop, ' +
            esc(order.name.split(' ')[0]) + '. ' + count + ' ' +
            plural(count, 'book is', 'books are') + ' on the way to ' +
            esc(order.email) + '. Your cart has been emptied.</p>' +
          '<p class="done__ref">Order reference <strong>' + esc(order.reference) + '</strong></p>' +

          '<div class="panel done__panel">' +
            '<h2 class="panel__title">What you ordered</h2>' +
            '<p class="panel__note">Placed ' + placed.toLocaleDateString() + ' at ' +
              placed.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + '</p>' +
            recapHtml(order.lines.map(function (line) {
              return { book: line, qty: line.qty, lineTotal: line.lineTotal };
            }), order.total) +

            '<dl class="detail__specs" style="margin-top:20px">' +
              '<div><dt>Name</dt><dd>' + esc(order.name) + '</dd></div>' +
              '<div><dt>Delivery</dt><dd>' + esc(order.address) + '</dd></div>' +
              '<div><dt>Email</dt><dd>' + esc(order.email) + '</dd></div>' +
              '<div><dt>Payment</dt><dd>Demo — nothing charged</dd></div>' +
            '</dl>' +
          '</div>' +

          '<div class="done__actions">' +
            '<a class="btn btn--accent" href="#/shop">Keep browsing' + icon('right') + '</a>' +
            '<a class="btn btn--outline" href="#/">Back to the front door</a>' +
          '</div>' +
        '</div>' +
      '</div>';
  }

  /* ===== view: contact =================================================== */

  /* The one place in the shop. Kept here so the footer and this page can
     never drift apart. */
  const SHOP_DETAILS = {
    address: '118 Akaki Tsereteli Ave, Tbilisi, Georgia',
    email: 'moriabookshop@gmail.com',
    phone: '+995 598 74 83 02',
    phoneHref: '+995598748302'
  };

  function renderContact() {
    document.title = 'Contact — Moria Bookshop';

    const mapQuery = encodeURIComponent(SHOP_DETAILS.address);

    view.innerHTML = '' +
      '<div class="shell">' +
        crumbs([{ label: 'Contact' }]) +

        '<header class="pagehead">' +
          '<p class="eyebrow">Come and find us</p>' +
          '<h1 class="pagehead__title">Contact</h1>' +
          '<p class="pagehead__note">The shop is a real address on a real street. ' +
            'Knock twice, ask for the dwarf, and mind the staircase on the way down.</p>' +
        '</header>' +

        '<section class="band band--tight">' +
          '<div class="contact">' +
            '<div class="panel reveal">' +
              '<h2 class="panel__title">Where to reach us</h2>' +
              '<p class="panel__note">Open 10:00–20:00, later if it is raining.</p>' +

              '<ul class="contactcards">' +
                '<li>' +
                  '<span class="contactcards__icon">' + icon('pin') + '</span>' +
                  '<span>' +
                    '<span class="contactcards__label">Address</span>' +
                    '<span class="contactcards__value">118 Akaki Tsereteli Ave<br>' +
                      'Tbilisi, Georgia</span>' +
                  '</span>' +
                '</li>' +
                '<li>' +
                  '<span class="contactcards__icon">' + icon('mail') + '</span>' +
                  '<span>' +
                    '<span class="contactcards__label">Email</span>' +
                    '<a class="contactcards__value" href="mailto:' + SHOP_DETAILS.email + '">' +
                      SHOP_DETAILS.email + '</a>' +
                  '</span>' +
                '</li>' +
                '<li>' +
                  '<span class="contactcards__icon">' + icon('phone') + '</span>' +
                  '<span>' +
                    '<span class="contactcards__label">Phone</span>' +
                    '<a class="contactcards__value" href="tel:' + SHOP_DETAILS.phoneHref + '">' +
                      SHOP_DETAILS.phone + '</a>' +
                  '</span>' +
                '</li>' +
              '</ul>' +

              '<a class="btn btn--outline btn--block" ' +
                 'href="https://www.google.com/maps/search/?api=1&query=' + mapQuery + '" ' +
                 'target="_blank" rel="noopener noreferrer">Open in Google Maps' +
                 icon('right') + '</a>' +
            '</div>' +

            '<div class="mapframe reveal">' +
              '<iframe title="Map showing Moria Bookshop at ' + esc(SHOP_DETAILS.address) + '" ' +
                      'src="https://www.google.com/maps?q=' + mapQuery + '&z=16&output=embed" ' +
                      'loading="lazy" referrerpolicy="no-referrer-when-downgrade" ' +
                      'allowfullscreen></iframe>' +
            '</div>' +
          '</div>' +
        '</section>' +
      '</div>';
  }

  /* ===== view: unknown route ============================================= */

  function renderMissing() {
    document.title = 'Not found — Moria Bookshop';
    view.innerHTML =
      '<div class="shell"><section class="band">' +
        blankState(
          'That page is in another dungeon',
          'The link you followed does not lead anywhere in this shop.',
          '<a class="btn btn--accent" href="#/shop">Browse the shelves</a>'
        ) +
      '</section></div>';
  }

  /* ===== router ========================================================== */

  function router() {
    const route = parseHash();
    const path = route.path;

    clearInterval(heroTimer);
    Shell.closeNav();

    /* The header field mirrors the catalog search. Anywhere else, a leftover
       term is just noise, so it goes. */
    if (path !== '/shop') Shell.setSearchValue('');

    if (path === '/' || path === '') {
      renderHome();
      Shell.markNav('#/');
    } else if (path === '/shop') {
      renderCatalog(route.params);
      const shelf = route.params.get('shelf');
      Shell.markNav(shelf === 'new' || shelf === 'bestseller' ? '#/shop?shelf=' + shelf : '#/shop');
    } else if (path.indexOf('/book/') === 0) {
      renderDetail(decodeURIComponent(path.slice('/book/'.length)));
      Shell.markNav('');
    } else if (path === '/checkout') {
      renderCheckout();
      Shell.markNav('');
    } else if (path === '/order') {
      renderOrder();
      Shell.markNav('');
    } else if (path === '/contact') {
      renderContact();
      Shell.markNav('#/contact');
    } else {
      renderMissing();
      Shell.markNav('');
    }

    Shell.reveal(view);
    window.scrollTo({ top: 0, behavior: 'auto' });
  }

  /* ===== global wiring =================================================== */

  /* Quick-add buttons live inside cards all over the site. */
  view.addEventListener('click', function (event) {
    const add = event.target.closest('[data-add]');
    if (!add) return;

    event.preventDefault();
    const book = findBook(add.dataset.add);
    if (!book) return;

    Cart.add(book.id, 1);
    Shell.toast('Added ' + book.title + ' to your cart.');
  });

  /* The cart drawer and the checkout page both read the cart, so a change
     made in one has to be reflected in the other. */
  document.addEventListener('cart:changed', function () {
    const path = parseHash().path;
    if (path === '/checkout') renderCheckout();
  });

  /* Signing in prefills the checkout form, so redraw it. */
  document.addEventListener('auth:changed', function () {
    if (parseHash().path === '/checkout' && !Cart.isEmpty()) renderCheckout();
  });

  window.addEventListener('hashchange', router);

  Shell.init();
  router();
})();
