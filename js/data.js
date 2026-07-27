/* =========================================================================
   Moria Bookshop — catalog data
   -------------------------------------------------------------------------
   One flat list of books. Every cover points at a real file in img/, and the
   cover matches the book it is sold as. Nothing is hot-linked.

   "New arrivals" and "Bestsellers" are not separate collections: they are
   just books tagged with a shelf, so the catalog can filter down to them.
   ========================================================================= */

/* Order here is the order the genre filter lists them in. */
const GENRES = [
  'Epic Fantasy',
  'Grimdark',
  'Dark Fantasy',
  'Adventure',
  'Science Fiction',
  'Mythic'
];

const BOOKS = [
  {
    id: 'empires-ruin',
    title: "The Empire's Ruin",
    author: 'Brian Staveley',
    price: 26.81,
    genre: 'Epic Fantasy',
    year: 2021,
    pages: 736,
    shelf: 'new',
    cover: 'img/new-arr/new1.jpg',
    blurb:
      'The Annurian Empire has run out of the one thing holding it together, and the three people sent past the edge of the map to find more of it were chosen because nobody will miss them. A disgraced soldier, a monk with a gift for lying, and a historian chasing a rumour walk into country that eats armies.'
  },
  {
    id: 'priory-orange-tree',
    title: 'The Priory of the Orange Tree',
    author: 'Samantha Shannon',
    price: 31.26,
    genre: 'Epic Fantasy',
    year: 2019,
    pages: 848,
    shelf: 'new',
    cover: 'img/new-arr/new2.jpg',
    blurb:
      'A queen with no heir, a mage hidden inside her own court, and a dragonrider in the east sworn to kill everything the west worships. They have a thousand years of scripture between them and about a month before the Nameless One wakes.'
  },
  {
    id: 'fools-hope',
    title: "A Fool's Hope",
    author: 'Mike Shackle',
    price: 17.8,
    genre: 'Grimdark',
    year: 2020,
    pages: 560,
    shelf: 'new',
    cover: 'img/new-arr/new3.jpg',
    blurb:
      'The invasion already worked. What is left of the resistance is the wounded, the elderly and the barely trained, holding one valley against an army that has never lost a field.'
  },
  {
    id: 'shadow-of-the-gods',
    title: 'The Shadow of the Gods',
    author: 'John Gwynne',
    price: 15.55,
    genre: 'Epic Fantasy',
    year: 2021,
    pages: 496,
    shelf: 'new',
    cover: 'img/new-arr/new4.jpg',
    blurb:
      'The gods tore each other apart and left their bones in the ground, and their blood in the veins of anyone unlucky enough to inherit it. Three outcasts in a frozen, Norse-flavoured land are about to learn the going rate for divine ancestry.'
  },
  {
    id: 'assassins-apprentice',
    title: "Assassin's Apprentice",
    author: 'Robin Hobb',
    price: 22.4,
    genre: 'Epic Fantasy',
    year: 1995,
    pages: 480,
    shelf: 'bestseller',
    cover: 'img/swiper/1.jpg',
    blurb:
      'A royal bastard is handed to the stables at Buckkeep, then quietly trained to kill on the crown’s behalf. He also carries the Wit, an old animal magic the same court would hang him for.'
  },
  {
    id: 'the-blade-itself',
    title: 'The Blade Itself',
    author: 'Joe Abercrombie',
    price: 19.99,
    genre: 'Grimdark',
    year: 2006,
    pages: 536,
    cover: 'img/swiper/2.jpg',
    blurb:
      'A crippled torturer, a vain young duellist and a barbarian with an unfortunate reputation are pulled into the same war by a wizard who lies to all three of them. You will like the torturer most, which is the joke.'
  },
  {
    id: 'red-rising',
    title: 'Red Rising',
    author: 'Pierce Brown',
    price: 18.25,
    genre: 'Science Fiction',
    year: 2014,
    pages: 400,
    cover: 'img/swiper/3.jpg',
    blurb:
      'Darrow mines helium-3 under the surface of Mars so that humanity might live there one day. Then he climbs to the surface and finds it has been a garden city for three hundred years.'
  },
  {
    id: 'sword-of-kaigen',
    title: 'The Sword of Kaigen',
    author: 'M. L. Wang',
    price: 21.1,
    genre: 'Mythic',
    year: 2019,
    pages: 656,
    cover: 'img/swiper/4.jpg',
    blurb:
      'In a mountain village where the warriors can freeze air into blades, a mother and her son find out what the empire they have bled for actually thinks of them. It is a book about a family, and it hurts.'
  },
  {
    id: 'gardens-of-the-moon',
    title: 'Gardens of the Moon',
    author: 'Steven Erikson',
    price: 24.6,
    genre: 'Epic Fantasy',
    year: 1999,
    pages: 712,
    cover: 'img/swiper/5.jpg',
    blurb:
      'The Malazan Empire is overextended and the infantry know it before the generals do. Gods walk the siege lines, a fortress hangs in the sky over the city, and nobody explains anything to anyone.'
  },
  {
    id: 'paternus',
    title: 'Paternus: Rise of Gods',
    author: 'Dyrk Ashton',
    price: 16.4,
    genre: 'Mythic',
    year: 2016,
    pages: 428,
    cover: 'img/swiper/6.jpg',
    blurb:
      'Every myth humanity ever told was a field report. They are all still alive, still furious with each other, and the war restarts this afternoon in an ordinary hospital ward.'
  },
  {
    id: 'lord-of-the-rings',
    title: 'The Lord of the Rings',
    author: 'J. R. R. Tolkien',
    price: 34.99,
    genre: 'Epic Fantasy',
    year: 1954,
    pages: 1216,
    shelf: 'bestseller',
    cover: 'img/swiper/7.jpg',
    blurb:
      'One ring, one very long walk, and the mines of Moria somewhere in the middle. The book this shop is named after, and still the best argument anyone has made for reading fantasy at all.'
  },
  {
    id: 'rage-of-dragons',
    title: 'The Rage of Dragons',
    author: 'Evan Winter',
    price: 20.75,
    genre: 'Epic Fantasy',
    year: 2019,
    pages: 544,
    cover: 'img/swiper/8.jpg',
    blurb:
      'One woman in a generation can call a dragon. One man in a generation is born to fight like a god. Tau is neither, so he sets out to train himself into something considerably worse.'
  },
  {
    id: 'we-are-the-dead',
    title: 'We Are the Dead',
    author: 'Mike Shackle',
    price: 18.9,
    genre: 'Grimdark',
    year: 2019,
    pages: 528,
    cover: 'img/swiper/9.jpg',
    blurb:
      'The heroes lost in a single night. What follows is occupation, collaboration, and a resistance staffed entirely by people who were never meant to hold a sword.'
  },
  {
    id: 'name-of-the-wind',
    title: 'The Name of the Wind',
    author: 'Patrick Rothfuss',
    price: 23.5,
    genre: 'Epic Fantasy',
    year: 2007,
    pages: 662,
    shelf: 'bestseller',
    cover: 'img/swiper/11.jpg',
    blurb:
      'An innkeeper using a false name tells a travelling scribe how he became the most notorious magician of the age. He is a reliable narrator about the weather and almost nothing else.'
  },
  {
    id: 'hunger-of-the-gods',
    title: 'The Hunger of the Gods',
    author: 'John Gwynne',
    price: 27.3,
    genre: 'Epic Fantasy',
    year: 2022,
    pages: 592,
    shelf: 'new',
    cover: 'img/swiper/12.jpg',
    blurb:
      'Lik-Rifa is out of her cage, the dragon-god is hungry, and across Vigrid every war-band is picking a side. Most of them pick wrong.'
  },
  {
    id: 'prince-of-thorns',
    title: 'Prince of Thorns',
    author: 'Mark Lawrence',
    price: 15.95,
    genre: 'Grimdark',
    year: 2011,
    pages: 384,
    cover: 'img/swiper/13.jpg',
    blurb:
      'Jorg Ancrath is thirteen, commands a company of murderers, and intends to take his father’s kingdom back by the shortest available road. He is not the hero, and the book never once pretends otherwise.'
  },
  {
    id: 'emperors-blades',
    title: "The Emperor's Blades",
    author: 'Brian Staveley',
    price: 19.4,
    genre: 'Epic Fantasy',
    year: 2014,
    pages: 480,
    cover: 'img/swiper/14.jpg',
    blurb:
      'The emperor is murdered while his three children are scattered across the empire in training none of them chose. Each has to work out who did it before the same people arrive for them.'
  },
  {
    id: 'grey-bastards',
    title: 'The Grey Bastards',
    author: 'Jonathan French',
    price: 17.25,
    genre: 'Grimdark',
    year: 2018,
    pages: 432,
    cover: 'img/swiper/15.jpg',
    blurb:
      'Half-orcs on war-pigs patrol the badlands between two nations that both want them gone. Jackal wants to run the hoof, which means surviving his own brotherhood first.'
  },
  {
    id: 'kings-of-the-wyld',
    title: 'Kings of the Wyld',
    author: 'Nicholas Eames',
    price: 20.1,
    genre: 'Adventure',
    year: 2017,
    pages: 512,
    shelf: 'bestseller',
    cover: 'img/swiper/16.jpg',
    blurb:
      'The greatest mercenary band of their generation got old, got comfortable and got day jobs. Clay Cooper now has to get the band back together for one genuinely terrible idea.'
  },
  {
    id: 'dragon-mage',
    title: 'Dragon Mage',
    author: 'M. L. Spencer',
    price: 22.85,
    genre: 'Adventure',
    year: 2021,
    pages: 828,
    shelf: 'new',
    cover: 'img/swiper/17.jpg',
    blurb:
      'Aram cannot read, cannot hold a conversation, and cannot stop seeing the pattern underneath everything. That last one turns out to make him the most dangerous mage alive.'
  },
  {
    id: 'dreams-of-the-dying',
    title: 'Dreams of the Dying',
    author: 'Nicolas Lietzau',
    price: 25.4,
    genre: 'Dark Fantasy',
    year: 2021,
    pages: 700,
    cover: 'img/swiper/18.jpg',
    blurb:
      'A mercenary haunted by his own war record takes a contract on a tropical island where the sickness spreads through dreams instead of bodies. He is the worst possible person to send.'
  },
  {
    id: 'game-of-thrones',
    title: 'A Game of Thrones',
    author: 'George R. R. Martin',
    price: 29.99,
    genre: 'Epic Fantasy',
    year: 1996,
    pages: 807,
    shelf: 'bestseller',
    cover: 'img/swiper/19.jpg',
    blurb:
      'Summer is ending. Nine noble houses circle a throne none of them can hold, while the thing they should actually be worried about walks south of the Wall.'
  },
  {
    id: 'mistborn-final-empire',
    title: 'Mistborn: The Final Empire',
    author: 'Brandon Sanderson',
    price: 21.99,
    genre: 'Epic Fantasy',
    year: 2006,
    pages: 672,
    shelf: 'bestseller',
    cover: 'img/swiper/20.jpg',
    blurb:
      'The prophesied hero failed a thousand years ago and the Dark Lord has been running things ever since. Now a street thief with impossible powers is going to rob him.'
  },
  {
    id: 'way-of-kings',
    title: 'The Way of Kings',
    author: 'Brandon Sanderson',
    price: 28.5,
    genre: 'Epic Fantasy',
    year: 2010,
    pages: 1007,
    shelf: 'bestseller',
    cover: 'img/swiper/21.jpg',
    blurb:
      'On a world scoured bare by storms that strip rock to bone, a slave, a scholar and a general are each handed one piece of the same enormous secret. None of them compares notes for nine hundred pages.'
  },
  {
    id: 'gideon-the-ninth',
    title: 'Gideon the Ninth',
    author: 'Tamsyn Muir',
    price: 19.2,
    genre: 'Dark Fantasy',
    year: 2019,
    pages: 448,
    shelf: 'new',
    cover: 'img/swiper/22.jpg',
    blurb:
      'Necromancers in space, a haunted house full of locked puzzles, and a swordswoman who would rather be literally anywhere else. One very long grudge, competently weaponised.'
  },
  {
    id: 'black-prism',
    title: 'The Black Prism',
    author: 'Brent Weeks',
    price: 20.6,
    genre: 'Epic Fantasy',
    year: 2010,
    pages: 640,
    cover: 'img/swiper/23.jpg',
    blurb:
      'Gavin Guile turns light into solid matter and has five years left to live. He also has a son nobody knew about, standing on the wrong side of a war that is about to start.'
  },
  {
    id: 'jade-city',
    title: 'Jade City',
    author: 'Fonda Lee',
    price: 23.15,
    genre: 'Mythic',
    year: 2017,
    pages: 512,
    cover: 'img/swiper/24.jpg',
    blurb:
      'Jade gives power to the clans trained from birth to wear it. On the island of Kekon one family controls the trade, and a new drug is about to let anybody wear it at all.'
  },
  {
    id: 'eye-of-the-world',
    title: 'The Eye of the World',
    author: 'Robert Jordan',
    price: 26.4,
    genre: 'Epic Fantasy',
    year: 1990,
    pages: 782,
    shelf: 'bestseller',
    cover: 'img/swiper/25.jpg',
    blurb:
      'Three young men leave a village that has never mattered to anyone, chased out of it by things from stories. One of them is going to break the world, or mend it, and nobody will say which.'
  },
  {
    id: 'well-of-ascension',
    title: 'The Well of Ascension',
    author: 'Brandon Sanderson',
    price: 22.3,
    genre: 'Epic Fantasy',
    year: 2007,
    pages: 796,
    cover: 'img/swiper/27.jpg',
    blurb:
      'Winning was the easy part. There are three armies outside the walls, the mists have started killing people, and somebody is going to have to actually govern.'
  }
];

/* -------------------------------------------------------------------------
   Hero panels — every painting in slider/. The headline stays put and only
   the art cross-fades behind the arch, so each alt text has to describe its
   own picture rather than the page.
   ------------------------------------------------------------------------- */
const HERO_SLIDES = [
  {
    src: 'slider/5787979.jpg',
    alt: 'A cloaked swordsman silhouetted against a blood-red sky and rising moon'
  },
  {
    src: 'slider/838377.jpg',
    alt: 'A white-bearded wizard and a hobbit on a clifftop above a valley city of waterfalls'
  },
  {
    src: 'slider/6170007.jpg',
    alt: 'Spearmen on a lava ridge facing a red dragon with its wings spread'
  },
  {
    src: 'slider/1401668.jpg',
    alt: 'A warrior swinging a hammer that glows with molten runes'
  },
  {
    src: 'slider/Heroes_Cover-wrap.webp',
    alt: 'Two armies meeting at dusk beneath standing stones and torn banners'
  },
  {
    src: 'slider/6169945.jpg',
    alt: 'A pale, white-haired elf raising an engraved sword in the dark'
  },
  {
    src: 'slider/3220005.jpg',
    alt: 'Armoured riders drawing frost-covered blades under banners at dawn'
  },
  {
    src: 'slider/5625161.jpg',
    alt: 'Two hooded figures on a rooftop above a spired city washed in turquoise light'
  },
  {
    src: 'slider/Stunning-Original-Art.webp',
    alt: 'Three painted panels of armoured champions with burning and frost-lit swords'
  }
];

/* Genre strip on the home page. Each image is a cover already in the
   catalog, used here as a mood tile for the genre it belongs to. */
const GENRE_TILES = [
  { genre: 'Epic Fantasy',    image: 'img/swiper/21.jpg' },
  { genre: 'Grimdark',        image: 'img/swiper/13.jpg' },
  { genre: 'Dark Fantasy',    image: 'img/swiper/22.jpg' },
  { genre: 'Adventure',       image: 'img/swiper/16.jpg' },
  { genre: 'Science Fiction', image: 'img/swiper/3.jpg'  },
  { genre: 'Mythic',          image: 'img/swiper/24.jpg' }
];
