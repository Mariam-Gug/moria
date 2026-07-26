/* =========================================================================
   Moria Bookshop — state layer
   -------------------------------------------------------------------------
   There is no server. Cart, session, accounts, subscribers, the theme and the
   last placed order all live in localStorage, and every mutation fires a
   DOM event so the header and the current view can repaint themselves.

   Accounts are stored with the password in plain text. That is only
   acceptable here because nothing real sits behind it: this is a local demo
   shop, and it should never be described as secure.
   ========================================================================= */

const STORAGE = {
  cart:        'moria_cart',
  loggedIn:    'moria_loggedIn',
  currentUser: 'moria_currentUser',
  accounts:    'moria_accounts',
  subscribers: 'moria_subscribers',
  theme:       'moria_theme',
  lastOrder:   'moria_lastOrder'
};

/* The one built-in credential pair. It is printed in the sign-in dialog,
   because a tester has no other way to discover it. */
const DEMO_ACCOUNT = {
  email: 'reader-dwarf@moria.com',
  password: 'dragonfire123',
  username: 'reader',
  race: 'Noble dwarf'
};

/* --- storage primitives -------------------------------------------------- */

function readStore(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw === null ? fallback : JSON.parse(raw);
  } catch (err) {
    /* Private-mode or corrupted JSON shouldn't take the shop down. */
    console.warn('Moria: could not read ' + key, err);
    return fallback;
  }
}

function writeStore(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (err) {
    console.warn('Moria: could not write ' + key, err);
    return false;
  }
}

function announce(name, detail) {
  document.dispatchEvent(new CustomEvent(name, { detail: detail }));
}

/* --- catalog lookups ----------------------------------------------------- */

function findBook(id) {
  return BOOKS.find(function (book) { return book.id === id; });
}

function booksOnShelf(shelf) {
  return BOOKS.filter(function (book) { return book.shelf === shelf; });
}

/* --- cart ---------------------------------------------------------------- */
/* Stored as [{ id, qty }]. Prices are never copied in, so a price change in
   data.js can't leave a stale amount sitting in someone's cart. */

const Cart = {
  lines: function () {
    const raw = readStore(STORAGE.cart, []);
    if (!Array.isArray(raw)) return [];
    return raw
      .filter(function (line) {
        return line && findBook(line.id) && Number(line.qty) > 0;
      })
      .map(function (line) {
        return { id: line.id, qty: Math.floor(Number(line.qty)) };
      });
  },

  save: function (lines) {
    writeStore(STORAGE.cart, lines);
    announce('cart:changed');
  },

  add: function (id, qty) {
    if (!findBook(id)) return false;
    const amount = Math.max(1, parseInt(qty, 10) || 1);
    const lines = Cart.lines();
    const line = lines.find(function (entry) { return entry.id === id; });

    if (line) {
      line.qty = Math.min(99, line.qty + amount);
    } else {
      lines.push({ id: id, qty: Math.min(99, amount) });
    }
    Cart.save(lines);
    return true;
  },

  setQty: function (id, qty) {
    const amount = parseInt(qty, 10);
    if (!amount || amount < 1) return Cart.remove(id);

    const lines = Cart.lines();
    const line = lines.find(function (entry) { return entry.id === id; });
    if (line) {
      line.qty = Math.min(99, amount);
      Cart.save(lines);
    }
  },

  remove: function (id) {
    Cart.save(Cart.lines().filter(function (line) { return line.id !== id; }));
  },

  clear: function () {
    Cart.save([]);
  },

  /* Cart lines joined to book records, ready to render. */
  detailed: function () {
    return Cart.lines().map(function (line) {
      const book = findBook(line.id);
      return {
        id: line.id,
        qty: line.qty,
        book: book,
        lineTotal: book.price * line.qty
      };
    });
  },

  count: function () {
    return Cart.lines().reduce(function (sum, line) { return sum + line.qty; }, 0);
  },

  total: function () {
    return Cart.detailed().reduce(function (sum, line) { return sum + line.lineTotal; }, 0);
  },

  isEmpty: function () {
    return Cart.lines().length === 0;
  }
};

/* --- accounts ------------------------------------------------------------ */

const Accounts = {
  all: function () {
    const list = readStore(STORAGE.accounts, []);
    return Array.isArray(list) ? list : [];
  },

  find: function (email) {
    const clean = String(email || '').trim().toLowerCase();
    return Accounts.all().find(function (account) {
      return account.email === clean;
    });
  },

  /* The built-in pair counts as taken, so sign-up can't shadow it. */
  taken: function (email) {
    const clean = String(email || '').trim().toLowerCase();
    return clean === DEMO_ACCOUNT.email || Boolean(Accounts.find(clean));
  },

  create: function (details) {
    const account = {
      username: String(details.username).trim(),
      email: String(details.email).trim().toLowerCase(),
      password: String(details.password),
      race: details.race,
      joined: new Date().toISOString()
    };
    const list = Accounts.all();
    list.push(account);
    writeStore(STORAGE.accounts, list);
    return account;
  }
};

/* --- session ------------------------------------------------------------- */

const Auth = {
  isLoggedIn: function () {
    return readStore(STORAGE.loggedIn, false) === true;
  },

  /* Returns the signed-in user, or null when the pair doesn't match. */
  signIn: function (email, password) {
    const clean = String(email || '').trim().toLowerCase();
    const pass = String(password || '');

    if (clean === DEMO_ACCOUNT.email && pass === DEMO_ACCOUNT.password) {
      return Auth.open(DEMO_ACCOUNT);
    }

    const account = Accounts.find(clean);
    if (account && account.password === pass) {
      return Auth.open(account);
    }
    return null;
  },

  /* Opens a session. Called straight after sign-up too, so a new account is
     signed in without making the user retype what they just entered. */
  open: function (account) {
    writeStore(STORAGE.loggedIn, true);
    writeStore(STORAGE.currentUser, {
      username: account.username,
      email: account.email,
      race: account.race || null
    });
    announce('auth:changed');
    return Auth.user();
  },

  signOut: function () {
    writeStore(STORAGE.loggedIn, false);
    writeStore(STORAGE.currentUser, null);
    announce('auth:changed');
  },

  user: function () {
    if (!Auth.isLoggedIn()) return null;
    const user = readStore(STORAGE.currentUser, null);
    return user && user.username ? user : null;
  },

  name: function () {
    const user = Auth.user();
    return user ? user.username : 'reader';
  }
};

/* --- newsletter ---------------------------------------------------------- */

const Subscribers = {
  all: function () {
    const list = readStore(STORAGE.subscribers, []);
    return Array.isArray(list) ? list : [];
  },

  /* 'added' | 'duplicate', so the footer can say something true. */
  add: function (email) {
    const clean = String(email).trim().toLowerCase();
    const list = Subscribers.all();
    if (list.indexOf(clean) !== -1) return 'duplicate';
    list.push(clean);
    writeStore(STORAGE.subscribers, list);
    return 'added';
  }
};

/* --- orders -------------------------------------------------------------- */
/* Only the most recent order is kept, so the confirmation screen survives a
   refresh instead of bouncing the reader back to an empty cart. */

const Orders = {
  place: function (details) {
    const order = {
      reference: Orders.reference(),
      placedAt: new Date().toISOString(),
      name: details.name,
      email: details.email,
      address: details.address,
      lines: Cart.detailed().map(function (line) {
        return {
          title: line.book.title,
          author: line.book.author,
          cover: line.book.cover,
          price: line.book.price,
          qty: line.qty,
          lineTotal: line.lineTotal
        };
      }),
      total: Cart.total()
    };
    writeStore(STORAGE.lastOrder, order);
    Cart.clear();
    return order;
  },

  last: function () {
    const order = readStore(STORAGE.lastOrder, null);
    return order && Array.isArray(order.lines) ? order : null;
  },

  /* Shaped like MOR-4F2A9 — recognisable in a bug report. */
  reference: function () {
    const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 5; i++) {
      code += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
    }
    return 'MOR-' + code;
  }
};

/* --- theme --------------------------------------------------------------- */
/* The first value is applied by an inline script in index.html before the
   page paints; this only reads it back and flips it. */

const Theme = {
  current: function () {
    return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
  },

  set: function (theme) {
    const next = theme === 'dark' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', next);
    writeStore(STORAGE.theme, next);
    announce('theme:changed', next);
    return next;
  },

  toggle: function () {
    return Theme.set(Theme.current() === 'dark' ? 'light' : 'dark');
  }
};

/* --- formatting and validation ------------------------------------------ */

function money(amount) {
  return '$' + Number(amount).toFixed(2);
}

function plural(count, one, many) {
  return count === 1 ? one : many;
}

/* Escapes anything that came from a user before it goes near innerHTML. */
function esc(value) {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/* Deliberately permissive: something@something.tld, no spaces. Good enough
   to catch a typo, and it never rejects a real address. */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/;

function isValidEmail(value) {
  return EMAIL_PATTERN.test(String(value || '').trim());
}
