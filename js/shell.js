/* =========================================================================
   Moria Bookshop — page shell
   -------------------------------------------------------------------------
   Everything that lives outside the routed view: the sticky header, live
   search, the cart drawer, the sign-in / create-account dialog, the footer
   newsletter, toasts and the loader.

   app.js owns the routes; this file owns the furniture around them.
   ========================================================================= */

const Shell = (function () {

  /* Number of books the header dropdown shows before it offers "see all". */
  const PREVIEW_LIMIT = 3;

  const el = function (id) { return document.getElementById(id); };

  const icon = function (name, cls) {
    return '<svg aria-hidden="true"' + (cls ? ' class="' + cls + '"' : '') +
           '><use href="#i-' + name + '"/></svg>';
  };

  let toastTimer = null;
  let restoreFocusTo = null;

  /* ===== toast =========================================================== */

  function toast(message) {
    const node = el('toast');
    node.innerHTML = icon('check') + '<span>' + esc(message) + '</span>';
    node.hidden = false;
    /* Restart the entry animation even if a toast is already showing. */
    node.style.animation = 'none';
    void node.offsetWidth;
    node.style.animation = '';

    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { node.hidden = true; }, 2800);
  }

  /* ===== loader ========================================================== */

  function dismissLoader() {
    const loader = el('loader');
    if (!loader || loader.classList.contains('is-gone')) return;
    loader.classList.add('is-gone');
    setTimeout(function () { loader.hidden = true; }, 700);
  }

  function startLoader() {
    /* The dragon is a 3.8 MB gif; don't wait for it to finish downloading. */
    const readyAt = Date.now() + 900;
    const finish = function () {
      setTimeout(dismissLoader, Math.max(0, readyAt - Date.now()));
    };
    if (document.readyState === 'complete') finish();
    else window.addEventListener('load', finish, { once: true });
    /* Hard stop, in case a slow asset never resolves. */
    setTimeout(dismissLoader, 4000);
  }

  /* ===== sticky header =================================================== */

  function watchScroll() {
    const masthead = el('masthead');
    const onScroll = function () {
      masthead.classList.toggle('is-stuck', window.scrollY > 8);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ===== theme =========================================================== */

  function paintTheme() {
    const dark = Theme.current() === 'dark';
    el('theme-toggle').setAttribute(
      'aria-label',
      dark ? 'Switch to light theme' : 'Switch to dark theme'
    );
  }

  /* ===== search ========================================================== */

  /* Case-insensitive match on title or author. */
  function searchBooks(query) {
    const term = String(query || '').trim().toLowerCase();
    if (!term) return [];
    return BOOKS.filter(function (book) {
      return book.title.toLowerCase().indexOf(term) !== -1 ||
             book.author.toLowerCase().indexOf(term) !== -1;
    });
  }

  function closeResults() {
    el('finder-results').hidden = true;
    el('finder-results').innerHTML = '';
    el('finder-input').setAttribute('aria-expanded', 'false');
  }

  function paintResults() {
    const input = el('finder-input');
    const box = el('finder-results');
    const term = input.value.trim();

    el('finder-clear').hidden = term === '';

    if (term === '') return closeResults();

    const hits = searchBooks(term);
    let html = '';

    if (hits.length === 0) {
      html =
        '<p class="results__none">No books match <strong>' + esc(term) + '</strong>. ' +
        'Try an author, or <a href="#/shop">browse everything</a>.</p>';
    } else {
      hits.slice(0, PREVIEW_LIMIT).forEach(function (book) {
        html +=
          '<a class="results__hit" href="#/book/' + book.id + '" role="option">' +
            '<img src="' + book.cover + '" alt="" loading="lazy">' +
            '<span>' +
              '<span class="results__title">' + esc(book.title) + '</span>' +
              '<span class="results__by">' + esc(book.author) + '</span>' +
            '</span>' +
            '<span class="results__price">' + money(book.price) + '</span>' +
          '</a>';
      });

      /* More than three matches: send the reader to the full catalog. */
      if (hits.length > PREVIEW_LIMIT) {
        html +=
          '<button class="results__all" type="button" data-see-all>' +
            '<span>See all ' + hits.length + ' results</span>' + icon('right') +
          '</button>';
      }
    }

    box.innerHTML = html;
    box.hidden = false;
    input.setAttribute('aria-expanded', 'true');
  }

  function seeAllResults() {
    const term = el('finder-input').value.trim();
    closeResults();
    closeNav();
    location.hash = '#/shop' + (term ? '?q=' + encodeURIComponent(term) : '');
  }

  function wireSearch() {
    const input = el('finder-input');
    const box = el('finder-results');

    input.addEventListener('input', paintResults);
    input.addEventListener('focus', function () {
      if (input.value.trim()) paintResults();
    });

    /* Enter goes to the full result list rather than the first hit — safer
       when the reader is halfway through typing. */
    input.addEventListener('keydown', function (event) {
      if (event.key === 'Enter') {
        event.preventDefault();
        if (input.value.trim()) seeAllResults();
      } else if (event.key === 'Escape') {
        closeResults();
      } else if (event.key === 'ArrowDown') {
        const first = box.querySelector('a, button');
        if (first) { event.preventDefault(); first.focus(); }
      }
    });

    box.addEventListener('click', function (event) {
      if (event.target.closest('[data-see-all]')) return seeAllResults();
      if (event.target.closest('.results__hit')) closeResults();
    });

    box.addEventListener('keydown', function (event) {
      const items = Array.prototype.slice.call(box.querySelectorAll('a, button'));
      const at = items.indexOf(document.activeElement);
      if (event.key === 'ArrowDown' && at > -1 && at < items.length - 1) {
        event.preventDefault();
        items[at + 1].focus();
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        if (at <= 0) input.focus(); else items[at - 1].focus();
      } else if (event.key === 'Escape') {
        closeResults();
        input.focus();
      }
    });

    el('finder-clear').addEventListener('click', function () {
      input.value = '';
      closeResults();
      input.focus();
    });

    el('search-toggle').addEventListener('click', function () {
      const finder = el('finder');
      const open = !finder.classList.contains('is-open');
      finder.classList.toggle('is-open', open);
      this.setAttribute('aria-expanded', String(open));
      if (open) input.focus(); else closeResults();
    });

    /* Clicking anywhere else puts the dropdown away. */
    document.addEventListener('click', function (event) {
      if (!el('finder').contains(event.target)) closeResults();
    });
  }

  /* Fills the header field from a catalog search, so the two stay in step. */
  function setSearchValue(value) {
    el('finder-input').value = value || '';
    el('finder-clear').hidden = !value;
  }

  /* ===== navigation ====================================================== */

  function closeNav() {
    el('mainnav').classList.remove('is-open');
    el('burger').setAttribute('aria-expanded', 'false');
    el('finder').classList.remove('is-open');
    el('search-toggle').setAttribute('aria-expanded', 'false');
  }

  function wireNav() {
    el('burger').addEventListener('click', function () {
      const open = !el('mainnav').classList.contains('is-open');
      el('mainnav').classList.toggle('is-open', open);
      this.setAttribute('aria-expanded', String(open));
    });

    el('mainnav').addEventListener('click', function (event) {
      if (event.target.closest('a')) closeNav();
    });
  }

  /* Highlights whichever nav entry matches the route being shown. */
  function markNav(href) {
    el('mainnav').querySelectorAll('a').forEach(function (link) {
      if (link.getAttribute('href') === href) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
  }

  /* ===== account ========================================================= */

  function closeAccountMenu() {
    el('account-menu').hidden = true;
    el('account-btn').setAttribute('aria-expanded', 'false');
  }

  function paintAuth() {
    const user = Auth.user();
    el('account-pip').hidden = !user;
    el('account-btn').setAttribute('aria-label', user ? 'Account menu' : 'Sign in');

    if (user) {
      el('account-name').textContent = user.username;
      el('account-race').textContent = user.race
        ? 'Signed in as a ' + user.race.toLowerCase() + '.'
        : 'Signed in to the demo shop.';
    } else {
      closeAccountMenu();
    }
  }

  function wireAccount() {
    el('account-btn').addEventListener('click', function () {
      if (!Auth.isLoggedIn()) return openAuth('signin');

      const open = el('account-menu').hidden;
      el('account-menu').hidden = !open;
      this.setAttribute('aria-expanded', String(open));
    });

    el('signout-btn').addEventListener('click', function () {
      Auth.signOut();
      closeAccountMenu();
      toast('Signed out. See you in the tunnels.');
    });

    document.addEventListener('click', function (event) {
      if (!event.target.closest('.account')) closeAccountMenu();
    });
  }

  /* ===== cart badge and drawer =========================================== */

  function paintCartBadge(bump) {
    const count = Cart.count();
    const badge = el('cart-badge');

    badge.textContent = count;
    badge.hidden = count === 0;
    el('cart-btn').setAttribute(
      'aria-label',
      count === 0 ? 'Cart, empty' : 'Cart, ' + count + ' ' + plural(count, 'item', 'items')
    );

    if (bump && count > 0) {
      badge.classList.remove('is-bumped');
      void badge.offsetWidth;
      badge.classList.add('is-bumped');
    }
  }

  function cartLineHtml(line) {
    return '' +
      '<article class="line" data-line="' + line.id + '">' +
        '<a class="line__art" href="#/book/' + line.id + '" tabindex="-1" aria-hidden="true">' +
          '<img src="' + line.book.cover + '" alt="" loading="lazy">' +
        '</a>' +
        '<div>' +
          '<div class="line__top">' +
            '<div>' +
              '<h3 class="line__title"><a href="#/book/' + line.id + '">' +
                esc(line.book.title) + '</a></h3>' +
              '<p class="line__by">' + esc(line.book.author) + '</p>' +
              '<p class="line__unit">' + money(line.book.price) + ' each</p>' +
            '</div>' +
            '<button class="line__drop" type="button" data-drop="' + line.id + '" ' +
                    'aria-label="Remove ' + esc(line.book.title) + ' from cart">' +
              icon('trash') +
            '</button>' +
          '</div>' +
          '<div class="line__foot">' +
            '<div class="stepper stepper--sm">' +
              '<button type="button" data-less="' + line.id + '" aria-label="One fewer">' +
                icon('minus') + '</button>' +
              '<input type="number" min="1" max="99" value="' + line.qty + '" ' +
                     'data-qty="' + line.id + '" aria-label="Quantity of ' + esc(line.book.title) + '">' +
              '<button type="button" data-more="' + line.id + '" aria-label="One more">' +
                icon('plus') + '</button>' +
            '</div>' +
            '<span class="line__total">' + money(line.lineTotal) + '</span>' +
          '</div>' +
        '</div>' +
      '</article>';
  }

  function paintDrawer() {
    const lines = Cart.detailed();
    const body = el('cart-body');
    const foot = el('cart-foot');

    if (lines.length === 0) {
      body.innerHTML =
        '<div class="blank">' +
          '<img class="blank__mark" src="img/smile-website-title.png" alt="">' +
          '<h3 class="blank__title">Nothing in here yet</h3>' +
          '<p class="blank__note">Your cart is empty. Pick something off the shelves ' +
            'and it will show up here.</p>' +
          '<a class="btn btn--accent" href="#/shop" data-close-cart>Browse the shelves</a>' +
        '</div>';
      foot.hidden = true;
      return;
    }

    body.innerHTML = lines.map(cartLineHtml).join('');
    el('cart-subtotal').textContent = money(Cart.total());
    foot.hidden = false;
  }

  function openCart() {
    restoreFocusTo = document.activeElement;
    paintDrawer();
    el('cart-drawer').hidden = false;
    document.body.classList.add('is-locked');
    el('cart-close').focus();
  }

  function closeCart() {
    if (el('cart-drawer').hidden) return;
    el('cart-drawer').hidden = true;
    document.body.classList.remove('is-locked');
    if (restoreFocusTo && document.body.contains(restoreFocusTo)) restoreFocusTo.focus();
  }

  function wireCart() {
    el('cart-btn').addEventListener('click', openCart);
    el('cart-close').addEventListener('click', closeCart);
    el('cart-veil').addEventListener('click', closeCart);

    el('cart-drawer').addEventListener('keydown', function (event) {
      if (event.key === 'Escape') closeCart();
    });

    el('cart-body').addEventListener('click', function (event) {
      const less = event.target.closest('[data-less]');
      const more = event.target.closest('[data-more]');
      const drop = event.target.closest('[data-drop]');
      const leave = event.target.closest('[data-close-cart], a[href^="#/"]');

      if (less) {
        const id = less.dataset.less;
        const line = Cart.lines().find(function (entry) { return entry.id === id; });
        if (line) Cart.setQty(id, line.qty - 1);
      } else if (more) {
        const id = more.dataset.more;
        const line = Cart.lines().find(function (entry) { return entry.id === id; });
        if (line) Cart.setQty(id, line.qty + 1);
      } else if (drop) {
        const title = findBook(drop.dataset.drop).title;
        Cart.remove(drop.dataset.drop);
        toast('Removed ' + title + '.');
      } else if (leave) {
        closeCart();
      }
    });

    el('cart-body').addEventListener('change', function (event) {
      const field = event.target.closest('[data-qty]');
      if (field) Cart.setQty(field.dataset.qty, field.value);
    });

    el('cart-checkout').addEventListener('click', closeCart);
  }

  /* ===== sign in / create account ======================================== */

  function showPane(which) {
    const registering = which === 'register';

    el('pane-signin').hidden = registering;
    el('pane-register').hidden = !registering;
    el('auth-modal').classList.toggle('is-register', registering);
    el('auth-title').textContent = registering ? 'Create an account' : 'Sign in';
    el('auth-eyebrow').textContent = registering ? 'Join the army of readers' : 'Speak, friend';

    clearAuthErrors();
    (registering ? el('reg-username') : el('signin-email')).focus();
  }

  function clearAuthErrors() {
    el('auth-modal').querySelectorAll('.field__err, .formerror').forEach(function (node) {
      node.textContent = '';
    });
    el('auth-modal').querySelectorAll('[aria-invalid]').forEach(function (node) {
      node.removeAttribute('aria-invalid');
    });
  }

  function openAuth(which) {
    restoreFocusTo = document.activeElement;
    el('auth-modal').hidden = false;
    document.body.classList.add('is-locked');
    showPane(which || 'signin');
  }

  function closeAuth() {
    el('auth-modal').hidden = true;
    document.body.classList.remove('is-locked');
    el('signin-form').reset();
    el('register-form').reset();

    /* form.reset() leaves a revealed password revealed, so re-hide them. */
    el('auth-modal').querySelectorAll('[data-peek]').forEach(function (peek) {
      el(peek.dataset.peek).type = 'password';
      peek.innerHTML = icon('eye');
      peek.setAttribute('aria-label', 'Show password');
      peek.setAttribute('aria-pressed', 'false');
    });

    clearAuthErrors();
    if (restoreFocusTo && document.body.contains(restoreFocusTo)) restoreFocusTo.focus();
  }

  /* Keeps tabbing inside the dialog. Escape is deliberately ignored: the
     close button in the corner is the only way out. */
  function trapFocus(event) {
    if (el('auth-modal').hidden) return;

    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    if (event.key !== 'Tab') return;

    const focusable = el('auth-modal').querySelectorAll(
      'button:not([disabled]), a[href], input:not([disabled]), select, textarea'
    );
    const live = Array.prototype.filter.call(focusable, function (node) {
      return node.offsetParent !== null;
    });
    if (live.length === 0) return;

    const first = live[0];
    const last = live[live.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  function fieldError(inputId, errorId, message) {
    el(errorId).textContent = message;
    el(inputId).setAttribute('aria-invalid', 'true');
  }

  function handleSignIn(event) {
    event.preventDefault();
    clearAuthErrors();

    const email = el('signin-email').value;
    const password = el('signin-password').value;

    if (!email.trim() || !password) {
      el('signin-error').textContent = 'Enter both your email and password.';
      return;
    }

    const user = Auth.signIn(email, password);
    if (!user) {
      el('signin-error').textContent = 'Incorrect email or password.';
      el('signin-email').setAttribute('aria-invalid', 'true');
      el('signin-password').setAttribute('aria-invalid', 'true');
      return;
    }

    closeAuth();
    toast('Welcome back, ' + user.username + '.');
  }

  function handleRegister(event) {
    event.preventDefault();
    clearAuthErrors();

    const username = el('reg-username').value.trim();
    const email = el('reg-email').value.trim();
    const password = el('reg-password').value;
    const repeat = el('reg-password2').value;
    const race = el('register-form').querySelector('input[name="race"]:checked');
    let ok = true;

    if (username.length < 4) {
      fieldError('reg-username', 'err-username', 'At least 4 characters.');
      ok = false;
    }

    if (!email) {
      fieldError('reg-email', 'err-email', 'Enter an email address.');
      ok = false;
    } else if (!isValidEmail(email)) {
      fieldError('reg-email', 'err-email', 'That does not look like an email address.');
      ok = false;
    } else if (Accounts.taken(email)) {
      fieldError('reg-email', 'err-email', 'That email is already registered.');
      ok = false;
    }

    if (password.length < 6) {
      fieldError('reg-password', 'err-password', 'At least 6 characters.');
      ok = false;
    }

    if (!repeat) {
      fieldError('reg-password2', 'err-password2', 'Repeat your password.');
      ok = false;
    } else if (repeat !== password) {
      fieldError('reg-password2', 'err-password2', 'The two passwords do not match.');
      ok = false;
    }

    if (!race) {
      el('err-race').textContent = 'Pick a race.';
      ok = false;
    }

    if (!ok) {
      el('register-error').textContent = 'Fix the fields marked above, then try again.';
      return;
    }

    const account = Accounts.create({
      username: username,
      email: email,
      password: password,
      race: race.value
    });
    Auth.open(account);
    closeAuth();
    toast('Account created. Welcome, ' + account.username + '.');
  }

  function wireAuth() {
    el('auth-close').addEventListener('click', closeAuth);
    el('go-register').addEventListener('click', function () { showPane('register'); });
    el('go-signin').addEventListener('click', function () { showPane('signin'); });

    el('fill-demo').addEventListener('click', function () {
      el('signin-email').value = DEMO_ACCOUNT.email;
      el('signin-password').value = DEMO_ACCOUNT.password;
      clearAuthErrors();
      el('signin-password').focus();
    });

    el('signin-form').addEventListener('submit', handleSignIn);
    el('register-form').addEventListener('submit', handleRegister);

    /* Show / hide password — the eye opens when the password is visible. */
    el('auth-modal').addEventListener('click', function (event) {
      const peek = event.target.closest('[data-peek]');
      if (!peek) return;

      const field = el(peek.dataset.peek);
      const reveal = field.type === 'password';

      field.type = reveal ? 'text' : 'password';
      peek.innerHTML = icon(reveal ? 'eye-off' : 'eye');
      peek.setAttribute('aria-label', reveal ? 'Hide password' : 'Show password');
      peek.setAttribute('aria-pressed', String(reveal));
    });

    document.addEventListener('keydown', trapFocus, true);
  }

  /* ===== newsletter ====================================================== */

  function wireSignup() {
    el('signup-form').addEventListener('submit', function (event) {
      event.preventDefault();

      const input = el('signup-email');
      const msg = el('signup-msg');
      const value = input.value.trim();

      msg.classList.remove('is-bad', 'is-good');

      if (!value) {
        msg.textContent = 'Enter an email address first.';
        msg.classList.add('is-bad');
        input.setAttribute('aria-invalid', 'true');
        return;
      }

      if (!isValidEmail(value)) {
        msg.textContent = 'That does not look like an email address.';
        msg.classList.add('is-bad');
        input.setAttribute('aria-invalid', 'true');
        return;
      }

      input.removeAttribute('aria-invalid');
      const result = Subscribers.add(value);

      msg.textContent = result === 'duplicate'
        ? 'You are already on the list — one letter a month, we promise.'
        : "Thanks, you're on the list!";
      msg.classList.add('is-good');
      input.value = '';
    });
  }

  /* ===== swipers ========================================================= */
  /* One carousel behaviour for both shelves. The track is a scroll-snap strip
     with its scrollbar hidden, so touch swiping is native and the arrows just
     scroll it a page at a time. */

  function swipeStep(track) {
    const slide = track.firstElementChild;
    if (!slide) return track.clientWidth;

    const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    const perSlide = slide.getBoundingClientRect().width + gap;
    /* Move as many whole slides as fit, always at least one. */
    return Math.max(perSlide, Math.floor(track.clientWidth / perSlide) * perSlide);
  }

  function paintSwipeNav(box) {
    const track = box.querySelector('[data-swipe-track]');
    const prev = box.querySelector('[data-swipe-prev]');
    const next = box.querySelector('[data-swipe-next]');
    const slack = track.scrollWidth - track.clientWidth;

    /* Nothing to scroll: hide the arrows rather than show two dead buttons.
       The 8px tolerance absorbs the track padding and sub-pixel snapping,
       which otherwise leave scrollLeft a hair above zero at the start. */
    box.classList.toggle('is-static', slack < 8);
    prev.disabled = track.scrollLeft <= 8;
    next.disabled = track.scrollLeft >= slack - 8;
  }

  function wireSwipers(root) {
    (root || document).querySelectorAll('[data-swipe]').forEach(function (box) {
      const track = box.querySelector('[data-swipe-track]');
      if (!track) return;

      box.querySelector('[data-swipe-prev]').addEventListener('click', function () {
        track.scrollBy({ left: -swipeStep(track), behavior: 'smooth' });
      });
      box.querySelector('[data-swipe-next]').addEventListener('click', function () {
        track.scrollBy({ left: swipeStep(track), behavior: 'smooth' });
      });

      track.addEventListener('scroll', function () { paintSwipeNav(box); }, { passive: true });
      window.addEventListener('resize', function () { paintSwipeNav(box); });

      /* Covers load lazily, so the track's width settles a beat late. */
      paintSwipeNav(box);
      setTimeout(function () { paintSwipeNav(box); }, 400);
    });
  }

  /* ===== scroll reveal =================================================== */

  let observer = null;

  function reveal(root) {
    const targets = (root || document).querySelectorAll('.reveal:not(.is-in)');

    if (!('IntersectionObserver' in window)) {
      targets.forEach(function (node) { node.classList.add('is-in'); });
      return;
    }

    if (!observer) {
      observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-in');
            observer.unobserve(entry.target);
          }
        });
      }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });
    }

    targets.forEach(function (node) { observer.observe(node); });
  }

  /* ===== boot ============================================================ */

  function init() {
    el('year').textContent = new Date().getFullYear();

    startLoader();
    watchScroll();
    wireSearch();
    wireNav();
    wireAccount();
    wireCart();
    wireAuth();
    wireSignup();

    el('theme-toggle').addEventListener('click', function () {
      Theme.toggle();
      paintTheme();
    });

    paintTheme();
    paintAuth();
    paintCartBadge(false);

    /* State changes repaint the furniture; app.js repaints the view. */
    document.addEventListener('cart:changed', function () {
      paintCartBadge(true);
      if (!el('cart-drawer').hidden) paintDrawer();
    });

    document.addEventListener('auth:changed', paintAuth);
  }

  return {
    init: init,
    toast: toast,
    icon: icon,
    markNav: markNav,
    closeNav: closeNav,
    openCart: openCart,
    closeCart: closeCart,
    openAuth: openAuth,
    searchBooks: searchBooks,
    setSearchValue: setSearchValue,
    wireSwipers: wireSwipers,
    reveal: reveal
  };
})();
