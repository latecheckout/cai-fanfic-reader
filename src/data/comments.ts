export interface Comment {
  id: string;
  author: string;
  text: string;
  timestamp: string; // display string e.g. "Mar 3"
  likes: number;
  isAuthor?: boolean;
  replies?: Comment[];
}

type CommentsData = Record<string, Comment[]>;

// @DUMMY — Entire object below is hardcoded placeholder data (~1100 lines).
// @WIRE  — Replace with: GET /works/:slug/comments?chapter=:index
//          Wire point: ChapterComments.tsx line 60 (getComments call).
//          Delete this file once the API is live.
//          See: .claude/docs/wiring-guide.md#3-comments
// Keys are `${slug}-${chapterIndex}` (0-based chapter index)
const comments: CommentsData = {
  'work-01-0': [
    {
      id: 'w01-c0-1',
      author: 'velvet_arcana',
      text: 'the way vi\'s hands are described here. the way the author made me feel the weight of them. i\'m not okay.',
      timestamp: 'Feb 8',
      likes: 214,
      replies: [
        {
          id: 'w01-c0-1r1',
          author: 'south_of_piltover',
          text: 'EXACTLY. "hands that remembered the hammer before they remembered softness" — that line destroyed me.',
          timestamp: 'Feb 8',
          likes: 87,
        },
        {
          id: 'w01-c0-1r2',
          author: 'arcane_ink',
          text: 'I had to put my phone down and just sit with that sentence for a minute.',
          timestamp: 'Feb 9',
          likes: 61,
        },
      ],
    },
    {
      id: 'w01-c0-2',
      author: 'cait_defender',
      text: 'the f/f slowburn pipeline claims another victim (me). i\'ve been reading this for 3 hours',
      timestamp: 'Feb 10',
      likes: 156,
    },
    {
      id: 'w01-c0-3',
      author: 'hextech_heart',
      text: 'okay the lighting in the third scene — morning light through smoke — i could SEE it. the visual writing in this is so cinematic.',
      timestamp: 'Feb 11',
      likes: 98,
      replies: [
        {
          id: 'w01-c0-3r1',
          author: 'flameweaver',
          text: 'the author clearly watched the show on a very large screen and absorbed every frame',
          timestamp: 'Feb 11',
          likes: 44,
        },
      ],
    },
    {
      id: 'w01-c0-4',
      author: 'crystalarchive',
      text: 'I came here for the ship, I stayed for the prose. This is genuinely one of the best-written things I\'ve read this year, fanfic or otherwise.',
      timestamp: 'Feb 12',
      likes: 203,
    },
    {
      id: 'w01-c0-5',
      author: 'fireandflame_au',
      text: 'the tension in this chapter is IMMACULATE. not a single wasted line.',
      timestamp: 'Feb 13',
      likes: 77,
    },
    {
      id: 'w01-c0-6',
      author: 'south_downs_forever',
      text: 'Thank you so much for these comments — they make the late nights worth it. More soon. 💙',
      timestamp: 'Feb 14',
      likes: 312,
      isAuthor: true,
    },
  ],

  'work-01-1': [
    {
      id: 'w01-c1-1',
      author: 'cait_defender',
      text: 'the rooftop scene. I screamed. I literally screamed. My roommate came in to check on me.',
      timestamp: 'Feb 16',
      likes: 344,
      replies: [
        {
          id: 'w01-c1-1r1',
          author: 'velvet_arcana',
          text: 'same. I had to text three people about it immediately.',
          timestamp: 'Feb 16',
          likes: 122,
        },
      ],
    },
    {
      id: 'w01-c1-2',
      author: 'piltover_dawn',
      text: 'The chapter 2 pacing is perfect. Every scene earns its length.',
      timestamp: 'Feb 17',
      likes: 189,
    },
    {
      id: 'w01-c1-3',
      author: 'south_downs_forever',
      text: 'Chapter 2 is my favorite thing I\'ve written. The rooftop was the scene this whole fic was built around. 🌃',
      timestamp: 'Feb 18',
      likes: 441,
      isAuthor: true,
    },
  ],

  'work-02-0': [
    {
      id: 'w02-c0-1',
      author: 'geraltofstuff',
      text: 'Listen. I was NOT prepared for Yennefer in this chapter. The confrontation scene is going to live in my head for weeks.',
      timestamp: 'Dec 3',
      likes: 312,
      replies: [
        {
          id: 'w02-c0-1r1',
          author: 'witcher_devotee',
          text: 'The way she doesn\'t raise her voice ONCE. She doesn\'t need to. Absolutely chilling and perfect.',
          timestamp: 'Dec 3',
          likes: 167,
        },
      ],
    },
    {
      id: 'w02-c0-2',
      author: 'cirilla_ashen',
      text: 'The prose in this matches the brutality of the source material without being gratuitous. That\'s such a hard balance and you nailed it.',
      timestamp: 'Dec 4',
      likes: 244,
    },
    {
      id: 'w02-c0-3',
      author: 'roach_forever',
      text: 'I love how Roach gets treated with more dignity in this fic than in most canon appearances',
      timestamp: 'Dec 5',
      likes: 188,
    },
    {
      id: 'w02-c0-4',
      author: 'continent_writes',
      text: 'The last line of this chapter. I had to close my laptop and go for a walk.',
      timestamp: 'Dec 6',
      likes: 301,
      replies: [
        {
          id: 'w02-c0-4r1',
          author: 'geraltofstuff',
          text: 'I did the same. The timing of it. The author knows exactly when to stop.',
          timestamp: 'Dec 6',
          likes: 89,
        },
      ],
    },
  ],

  'work-02-1': [
    {
      id: 'w02-c1-1',
      author: 'witcher_devotee',
      text: 'the forest scene had me holding my breath. absolutely stunning.',
      timestamp: 'Dec 10',
      likes: 278,
    },
    {
      id: 'w02-c1-2',
      author: 'jaskier_bard',
      text: 'jaskier content!! I was worried he\'d be sidelined in this fic but he gets a whole beautiful moment here.',
      timestamp: 'Dec 11',
      likes: 195,
    },
    {
      id: 'w02-c1-3',
      author: 'continent_writes',
      text: 'Writing Yennefer and Ciri together is something I feel very deeply about. Thank you for seeing it. ✨',
      timestamp: 'Dec 12',
      likes: 389,
      isAuthor: true,
    },
  ],

  'work-03-0': [
    {
      id: 'w03-c0-1',
      author: 'middleearth_reader',
      text: 'The way you write Legolas and Gimli\'s friendship — the weight of it after everything — I\'m in pieces.',
      timestamp: 'Jan 5',
      likes: 267,
    },
    {
      id: 'w03-c0-2',
      author: 'rivendell_writes',
      text: 'Post-war fics in this fandom are rare and this one treats the grief with so much respect.',
      timestamp: 'Jan 6',
      likes: 198,
      replies: [
        {
          id: 'w03-c0-2r1',
          author: 'shire_born',
          text: 'The Shire chapters especially. The contrast between how it was and how it is now.',
          timestamp: 'Jan 6',
          likes: 91,
        },
      ],
    },
    {
      id: 'w03-c0-3',
      author: 'mirkwood_fic',
      text: 'the boat scene at the end of this chapter. I knew it was coming and I still wasn\'t ready.',
      timestamp: 'Jan 7',
      likes: 334,
    },
    {
      id: 'w03-c0-4',
      author: 'tolkien_devotee',
      text: 'Every update I leave this comment: this is extraordinary writing. That hasn\'t changed.',
      timestamp: 'Jan 8',
      likes: 412,
      isAuthor: true,
    },
  ],

  'work-04-0': [
    {
      id: 'w04-c0-1',
      author: 'team_free_will',
      text: 'dean\'s inner monologue in this chapter is so perfectly him. you\'ve cracked the code on how his brain works.',
      timestamp: 'Feb 20',
      likes: 389,
      replies: [
        {
          id: 'w04-c0-1r1',
          author: 'castiel_grace',
          text: 'the way he talks himself out of something before he even lets himself feel it. iconic characterization.',
          timestamp: 'Feb 20',
          likes: 156,
        },
      ],
    },
    {
      id: 'w04-c0-2',
      author: 'impala_67',
      text: 'the mixtape callback in chapter one. I gasped out loud. In a public place.',
      timestamp: 'Feb 21',
      likes: 511,
    },
    {
      id: 'w04-c0-3',
      author: 'bunker_library',
      text: 'I\'m really moved by everyone\'s responses. This fic exists because I needed them to have more time. 🖤',
      timestamp: 'Feb 22',
      likes: 623,
      isAuthor: true,
    },
  ],

  'work-05-0': [
    {
      id: 'w05-c0-1',
      author: 'good_omens_fan',
      text: 'the bookshop scene in chapter 1 is going to be quoted in my wedding vows. I need you to understand that.',
      timestamp: 'Mar 1',
      likes: 891,
      replies: [
        {
          id: 'w05-c0-1r1',
          author: 'crowley_fangirl',
          text: 'SAME.',
          timestamp: 'Mar 1',
          likes: 444,
        },
        {
          id: 'w05-c0-1r2',
          author: 'aziraphale_reads',
          text: '"He had always known, in the way that angels know things, which is slowly and with great resistance."',
          timestamp: 'Mar 1',
          likes: 677,
        },
      ],
    },
    {
      id: 'w05-c0-2',
      author: 'ineffable_husbands',
      text: 'The Ineffable Bureaucracy section is hilarious and I needed that laugh. The tonal control here is impeccable.',
      timestamp: 'Mar 2',
      likes: 334,
    },
    {
      id: 'w05-c0-3',
      author: 'southdownapiary',
      text: 'I keep re-reading the last paragraph. The rhythm of it. Sometimes a sentence is just perfect.',
      timestamp: 'Mar 3',
      likes: 289,
    },
    {
      id: 'w05-c0-4',
      author: 'angel_of_bookshops',
      text: 'Your comments are genuinely making me cry. Thank you for being here for this. 🍎',
      timestamp: 'Mar 4',
      likes: 567,
      isAuthor: true,
    },
  ],

  'work-06-0': [
    {
      id: 'w06-c0-1',
      author: 'bakudeku_archive',
      text: 'the scar scene. the SCAR SCENE. I\'ve been staring at my ceiling for ten minutes.',
      timestamp: 'Jan 18',
      likes: 722,
    },
    {
      id: 'w06-c0-2',
      author: 'ua_high_reader',
      text: 'katsuki actually listening in this chapter. not performing, not posturing. just listening. I nearly passed out.',
      timestamp: 'Jan 19',
      likes: 534,
      replies: [
        {
          id: 'w06-c0-2r1',
          author: 'deku_defense',
          text: 'and the silence before he speaks! the whole paragraph of silence! author understands!',
          timestamp: 'Jan 19',
          likes: 289,
        },
      ],
    },
    {
      id: 'w06-c0-3',
      author: 'plus_ultra_fic',
      text: 'Writing them as adults who carry their whole history felt important to me. Thank you for reading it. 💪',
      timestamp: 'Jan 20',
      likes: 891,
      isAuthor: true,
    },
  ],

  'work-07-0': [
    {
      id: 'w07-c0-1',
      author: 'critrolefan2019',
      text: 'The Battle of Exandria section had me crying at my desk. The way you wrote Caleb\'s exhaustion — not dramatic, just tired — feels so true to character.',
      timestamp: 'Jan 15',
      likes: 441,
      replies: [
        {
          id: 'w07-c0-1r1',
          author: 'mighty_nein_fan',
          text: 'The quiet grief in this fic hits harder than the loud grief in most others.',
          timestamp: 'Jan 15',
          likes: 189,
        },
      ],
    },
    {
      id: 'w07-c0-2',
      author: 'veth_brenatto',
      text: 'genuinely cannot believe this is free. the craft here is extraordinary.',
      timestamp: 'Jan 16',
      likes: 287,
    },
    {
      id: 'w07-c0-3',
      author: 'caduceus_clay',
      text: 'I keep re-reading the scene where Caduceus makes tea. It\'s such a small moment but it carries so much. The whole chapter breathes.',
      timestamp: 'Jan 17',
      likes: 198,
      replies: [
        {
          id: 'w07-c0-3r1',
          author: 'fjord_tallguy',
          text: 'Caduceus making tea is always a signal that something is about to be emotionally devastating and I love that this fic understands that.',
          timestamp: 'Jan 17',
          likes: 143,
        },
      ],
    },
    {
      id: 'w07-c0-4',
      author: 'theseaofmemories',
      text: 'Every chapter I come back to leave a comment because I need you to know this is keeping me going right now. Thank you.',
      timestamp: 'Jan 18',
      likes: 356,
    },
    {
      id: 'w07-c0-5',
      author: 'longcampaign_writes',
      text: 'Reading your comments every update is the most rewarding part of this process. More coming Thursday. 🕯️',
      timestamp: 'Jan 18',
      likes: 521,
      isAuthor: true,
    },
  ],

  'work-07-1': [
    {
      id: 'w07-c1-1',
      author: 'vex_de_rolo',
      text: 'Chapter 2 hit different. The timeskip was handled perfectly — you felt the years without being told about them.',
      timestamp: 'Jan 22',
      likes: 334,
    },
    {
      id: 'w07-c1-2',
      author: 'scanlan_shorthalt',
      text: 'the reunion scene. the REUNION SCENE. I have been waiting for this and you delivered in a way I couldn\'t have imagined.',
      timestamp: 'Jan 22',
      likes: 289,
      replies: [
        {
          id: 'w07-c1-2r1',
          author: 'pike_trickfoot',
          text: '"He was still him, just carried more carefully now." — I\'m putting this on my wall.',
          timestamp: 'Jan 23',
          likes: 211,
        },
      ],
    },
    {
      id: 'w07-c1-3',
      author: 'critrolefan2019',
      text: 'I said chapter 1 was your best writing and then chapter 2 arrived. I retract my previous statement.',
      timestamp: 'Jan 23',
      likes: 178,
    },
  ],

  'work-08-0': [
    {
      id: 'w08-c0-1',
      author: 'steddie_nation',
      text: 'The Hellfire reunion in chapter 1 broke me in the best way. Steve Harrington accepting himself. Eddie Munson still being Eddie.',
      timestamp: 'Feb 5',
      likes: 677,
    },
    {
      id: 'w08-c0-2',
      author: 'upside_down_reads',
      text: 'the small detail of Steve knowing everyone\'s coffee order now. he learned. he CARED enough to learn.',
      timestamp: 'Feb 6',
      likes: 445,
      replies: [
        {
          id: 'w08-c0-2r1',
          author: 'hawkins_writes',
          text: 'character development shown through tiny specific acts of care is my religion and this fic is a cathedral.',
          timestamp: 'Feb 6',
          likes: 312,
        },
      ],
    },
    {
      id: 'w08-c0-3',
      author: 'demobats_fan',
      text: 'I\'m genuinely emotional. Thank you for giving them the soft landing they deserved. 🎸',
      timestamp: 'Feb 7',
      likes: 823,
      isAuthor: true,
    },
  ],

  'work-09-0': [
    {
      id: 'w09-c0-1',
      author: 'spideypool_archive',
      text: 'wade\'s internal monologue is the best I\'ve ever read in this fandom. the boxes feel exactly right without being a parody.',
      timestamp: 'Mar 8',
      likes: 554,
    },
    {
      id: 'w09-c0-2',
      author: 'peter_b_parker',
      text: 'Peter\'s anxiety spiral in the second scene is painfully relatable and I hate it (I love it).',
      timestamp: 'Mar 9',
      likes: 389,
      replies: [
        {
          id: 'w09-c0-2r1',
          author: 'deadpool_4th_wall',
          text: 'I\'ve read this chapter four times and I find a new perfect detail every time.',
          timestamp: 'Mar 9',
          likes: 201,
        },
      ],
    },
    {
      id: 'w09-c0-3',
      author: 'marvel_multifandom',
      text: 'This fic is a gift to the fandom. Thank you for writing it.',
      timestamp: 'Mar 10',
      likes: 456,
    },
    {
      id: 'w09-c0-4',
      author: 'chimichanga_writes',
      text: 'Wade Wilson has never felt more whole as a character than in my fic, which is a sentence I never thought I\'d get to say. Thank you. 💛',
      timestamp: 'Mar 10',
      likes: 712,
      isAuthor: true,
    },
  ],

  'work-10-0': [
    {
      id: 'w10-c0-1',
      author: 'ship_manifest',
      text: 'the slow burn is already killing me. chapter one and I\'m already gone.',
      timestamp: 'Feb 28',
      likes: 334,
    },
    {
      id: 'w10-c0-2',
      author: 'coffee_and_fic',
      text: 'Every word earns its place. The economy of the prose here is incredible.',
      timestamp: 'Mar 1',
      likes: 245,
    },
    {
      id: 'w10-c0-3',
      author: 'archive_lurker',
      text: 'I don\'t usually comment but this fic demanded it. Stunning first chapter.',
      timestamp: 'Mar 1',
      likes: 289,
      replies: [
        {
          id: 'w10-c0-3r1',
          author: 'fic_recommends',
          text: 'Same. I had to say something. This is special.',
          timestamp: 'Mar 2',
          likes: 88,
        },
      ],
    },
    {
      id: 'w10-c0-4',
      author: 'pen_and_parchment',
      text: 'Getting to write these characters feels like such a privilege. Thank you for being here for it. ✍️',
      timestamp: 'Mar 2',
      likes: 534,
      isAuthor: true,
    },
  ],

  'work-11-0': [
    {
      id: 'w11-c0-1',
      author: 'azula_redemption',
      text: 'an azula redemption arc written with this much nuance. she\'s not fixed, she\'s just... trying. that\'s all you could ask.',
      timestamp: 'Jan 30',
      likes: 678,
      replies: [
        {
          id: 'w11-c0-1r1',
          author: 'fire_nation_fic',
          text: 'The line "she had mistaken control for strength for so long that she didn\'t know what strength felt like unguarded" — I need a moment.',
          timestamp: 'Jan 30',
          likes: 445,
        },
      ],
    },
    {
      id: 'w11-c0-2',
      author: 'aang_forgives',
      text: 'the Zuko POV sections are devastating. he doesn\'t know how to help her and he knows it.',
      timestamp: 'Jan 31',
      likes: 512,
    },
    {
      id: 'w11-c0-3',
      author: 'blue_flame_writes',
      text: 'Writing Azula is the hardest thing I\'ve ever done. Thank you for understanding what I was trying to do. 🔥',
      timestamp: 'Feb 1',
      likes: 891,
      isAuthor: true,
    },
  ],

  'work-12-0': [
    {
      id: 'w12-c0-1',
      author: 'omegaverse_enjoyer',
      text: 'the worldbuilding details in chapter 1 alone. I\'m obsessed with the way this universe works.',
      timestamp: 'Feb 12',
      likes: 334,
    },
    {
      id: 'w12-c0-2',
      author: 'a_b_o_archive',
      text: 'the social dynamics here feel so considered. it\'s not just tropes, it\'s a world.',
      timestamp: 'Feb 13',
      likes: 267,
      replies: [
        {
          id: 'w12-c0-2r1',
          author: 'dynamics_writes',
          text: 'The author has clearly thought deeply about what these dynamics would actually mean for people\'s lives. It shows.',
          timestamp: 'Feb 13',
          likes: 145,
        },
      ],
    },
    {
      id: 'w12-c0-3',
      author: 'fic_bingereader',
      text: 'Stayed up until 3am reading. No notes. Please update soon.',
      timestamp: 'Feb 14',
      likes: 489,
    },
    {
      id: 'w12-c0-4',
      author: 'world_builder_fic',
      text: 'The worldbuilding IS the story. I\'m so glad that\'s coming through. More very soon. 🌍',
      timestamp: 'Feb 15',
      likes: 567,
      isAuthor: true,
    },
  ],

  'work-13-0': [
    {
      id: 'w13-c0-1',
      author: 'coffee_shop_au',
      text: 'THE MEET CUTE. the dropped coffee and the matching orders — it\'s so simple and it WORKS.',
      timestamp: 'Mar 5',
      likes: 445,
    },
    {
      id: 'w13-c0-2',
      author: 'au_enthusiast',
      text: 'Modern AUs done right don\'t erase the characters\' core traits, they translate them. This fic understands that.',
      timestamp: 'Mar 6',
      likes: 312,
    },
    {
      id: 'w13-c0-3',
      author: 'barista_fiction',
      text: 'the last scene with the rain. that\'s a scene. that\'s CINEMA.',
      timestamp: 'Mar 6',
      likes: 234,
      replies: [
        {
          id: 'w13-c0-3r1',
          author: 'coffee_shop_au',
          text: 'The way the lighting is described. It\'s a painting.',
          timestamp: 'Mar 7',
          likes: 88,
        },
      ],
    },
    {
      id: 'w13-c0-4',
      author: 'latte_art_writes',
      text: 'I just wanted to write something warm and I\'m so glad it landed that way. Thank you all ☕',
      timestamp: 'Mar 7',
      likes: 623,
      isAuthor: true,
    },
  ],

  'work-14-0': [
    {
      id: 'w14-c0-1',
      author: 'casefic_lover',
      text: 'the mystery in chapter 1 is perfectly constructed. I thought I had it figured out and then the last paragraph happened.',
      timestamp: 'Jan 25',
      likes: 389,
    },
    {
      id: 'w14-c0-2',
      author: 'detective_duo',
      text: 'Their dynamic in this fic is so sharp. Every exchange lands.',
      timestamp: 'Jan 26',
      likes: 267,
      replies: [
        {
          id: 'w14-c0-2r1',
          author: 'mystery_reader',
          text: 'The banter without it feeling forced. That\'s the whole art.',
          timestamp: 'Jan 26',
          likes: 134,
        },
      ],
    },
    {
      id: 'w14-c0-3',
      author: 'plot_twist_writes',
      text: 'Left that twist at the end of chapter 1 specifically to see if anyone caught the setup. So far... no one has. 🔍',
      timestamp: 'Jan 27',
      likes: 534,
      isAuthor: true,
    },
  ],

  'sample-story-1-0': [
    {
      id: 'ss1-c0-1',
      author: 'drarry_nation',
      text: 'Eight year fics are my religion and this is exactly why. The way the war left marks on everyone but differently — this captures that so well.',
      timestamp: 'Nov 12',
      likes: 521,
      replies: [
        {
          id: 'ss1-c0-1r1',
          author: 'malfoy_redemption',
          text: 'Draco refusing to eat in the Great Hall for the first two weeks back. Tiny detail, huge characterization.',
          timestamp: 'Nov 12',
          likes: 234,
        },
        {
          id: 'ss1-c0-1r2',
          author: 'harry_no_more_war',
          text: 'And Harry noticing but not saying anything. Just... leaving food at the end of the table.',
          timestamp: 'Nov 13',
          likes: 312,
        },
      ],
    },
    {
      id: 'ss1-c0-2',
      author: 'greenandsilver',
      text: 'the slowburn is already killing me and we\'re one chapter in. I have made a terrible choice starting this at midnight.',
      timestamp: 'Nov 13',
      likes: 445,
    },
    {
      id: 'ss1-c0-3',
      author: 'hermione_was_right',
      text: 'I love how Hermione is written here. She\'s not a prop in the Drarry story, she\'s a person dealing with her own aftermath.',
      timestamp: 'Nov 14',
      likes: 287,
    },
    {
      id: 'ss1-c0-4',
      author: 'eighth_year_fics',
      text: 'The therapy subplot is so rare and so needed in HP fic. These characters went through TRAUMA. They need support. Thank you for including it.',
      timestamp: 'Nov 15',
      likes: 388,
    },
    {
      id: 'ss1-c0-5',
      author: 'room_of_requirement',
      text: 'chapter 1 has more emotional nuance than the last three books combined. i said what i said.',
      timestamp: 'Nov 16',
      likes: 592,
    },
    {
      id: 'ss1-c0-6',
      author: 'malfoy_redemption',
      text: 'The pacing here is everything. Nothing feels rushed, nothing lingers too long. You know exactly how much time each moment deserves.',
      timestamp: 'Nov 17',
      likes: 201,
    },
  ],

  'sample-story-2-0': [
    {
      id: 'ss2-c0-1',
      author: 'stucky_forever',
      text: 'The 1943 flashback structure is brilliant. Past and present folded together like that — you feel the whole weight of what was lost.',
      timestamp: 'Feb 3',
      likes: 567,
      replies: [
        {
          id: 'ss2-c0-1r1',
          author: 'brooklyn_boys',
          text: '"He still knew how to hold a person like they mattered." That sentence.',
          timestamp: 'Feb 3',
          likes: 344,
        },
      ],
    },
    {
      id: 'ss2-c0-2',
      author: 'wakanda_forever_au',
      text: 'Bucky in therapy is something I will always support and this fic does it with real dignity.',
      timestamp: 'Feb 4',
      likes: 389,
    },
    {
      id: 'ss2-c0-3',
      author: 'serum_and_plums',
      text: 'Thank you for treating the healing process as something that takes time and isn\'t linear. This fic gets it. 🛡️',
      timestamp: 'Feb 5',
      likes: 712,
      isAuthor: true,
    },
  ],

  'sample-story-3-0': [
    {
      id: 'ss3-c0-1',
      author: 'destiel_truther',
      text: 'the barn scene rewrite we deserved. I am at peace. I am healed.',
      timestamp: 'Dec 15',
      likes: 1024,
    },
    {
      id: 'ss3-c0-2',
      author: 'profound_bond',
      text: 'Cas actually getting to say the full thing. The whole thing. Without interruption. I\'m crying at my kitchen table.',
      timestamp: 'Dec 15',
      likes: 878,
      replies: [
        {
          id: 'ss3-c0-2r1',
          author: 'jimmy_novak_fan',
          text: '"You made me understand why humans fight so hard for ordinary things." I need a minute.',
          timestamp: 'Dec 16',
          likes: 445,
        },
      ],
    },
    {
      id: 'ss3-c0-3',
      author: 'empty_fix_it',
      text: 'This is the fix-it fic that fixes the fix-it fics. You made them both whole.',
      timestamp: 'Dec 16',
      likes: 634,
    },
    {
      id: 'ss3-c0-4',
      author: 'chuck_saw_this',
      text: 'I wrote this for me, and I found out a lot of us needed the same thing. Grateful for this community. ✨',
      timestamp: 'Dec 17',
      likes: 934,
      isAuthor: true,
    },
  ],

  'sample-story-4-0': [
    {
      id: 'ss4-c0-1',
      author: 'tony_stank_fan',
      text: 'Tony and Pepper navigating the post-Endgame world with Morgan. This is what I needed and didn\'t know I could have.',
      timestamp: 'Mar 3',
      likes: 445,
    },
    {
      id: 'ss4-c0-2',
      author: 'rescue_suit',
      text: 'Morgan Stark is written perfectly. She\'s a child but she\'s HIS child. The little details.',
      timestamp: 'Mar 4',
      likes: 367,
      replies: [
        {
          id: 'ss4-c0-2r1',
          author: 'three_thousand',
          text: '"She had his eyes and her mother\'s patience and somehow the universe decided that was enough." 💔',
          timestamp: 'Mar 4',
          likes: 289,
        },
      ],
    },
    {
      id: 'ss4-c0-3',
      author: 'lake_house_fic',
      text: 'This fic is soft and earned and I needed it so badly. Thank you. 💛',
      timestamp: 'Mar 5',
      likes: 612,
      isAuthor: true,
    },
  ],

  'sample-story-5-0': [
    {
      id: 'ss5-c0-1',
      author: 'zutara_always',
      text: 'The siege scene rewrite is EVERYTHING. Katara\'s fury is finally respected. I\'ve been waiting years for a fic to do this.',
      timestamp: 'Jan 12',
      likes: 789,
      replies: [
        {
          id: 'ss5-c0-1r1',
          author: 'southern_water_tribe',
          text: 'She\'s not softened here. She\'s not made smaller to fit the romance. She\'s KATARA. Thank you author.',
          timestamp: 'Jan 12',
          likes: 512,
        },
      ],
    },
    {
      id: 'ss5-c0-2',
      author: 'fire_and_water',
      text: 'I love that Zuko is kind of terrified of her and that\'s the attraction. He\'s never met someone who matches him.',
      timestamp: 'Jan 13',
      likes: 634,
    },
    {
      id: 'ss5-c0-3',
      author: 'ocean_spirit',
      text: 'Katara\'s voice in this fic is the truest version of her I\'ve encountered in 15 years of fandom. Thank you. 🌊',
      timestamp: 'Jan 14',
      likes: 923,
      isAuthor: true,
    },
  ],

  'sample-story-6-0': [
    {
      id: 'ss6-c0-1',
      author: 'lokius_stan',
      text: 'The TVA lighting described through Loki\'s eyes — fluorescent and wrong and somehow the first honest thing he\'s seen — that\'s a whole essay compressed into one paragraph.',
      timestamp: 'Feb 18',
      likes: 512,
    },
    {
      id: 'ss6-c0-2',
      author: 'time_variant',
      text: 'Mobius\'s patience in this chapter. Loki is so used to being managed and Mobius just... doesn\'t.',
      timestamp: 'Feb 19',
      likes: 389,
      replies: [
        {
          id: 'ss6-c0-2r1',
          author: 'sacred_timeline',
          text: 'The scene over the desk. Neither of them is performing. That\'s it. That\'s the whole ship.',
          timestamp: 'Feb 19',
          likes: 234,
        },
      ],
    },
    {
      id: 'ss6-c0-3',
      author: 'pruning_stick',
      text: 'I started this fic not expecting to care and now I\'m devastated. Genuinely. Thank you. 🥭',
      timestamp: 'Feb 20',
      likes: 678,
      isAuthor: true,
    },
  ],

  'sample-story-7-0': [
    {
      id: 'ss7-c0-1',
      author: 'reylo_archive',
      text: 'The force bond scenes are written with such physicality. You can feel the effort it takes to reach through the distance.',
      timestamp: 'Jan 8',
      likes: 445,
    },
    {
      id: 'ss7-c0-2',
      author: 'dark_side_ben',
      text: 'Kylo\'s conflict here is written without excusing him. He knows what he is. That tension is everything.',
      timestamp: 'Jan 9',
      likes: 334,
      replies: [
        {
          id: 'ss7-c0-2r1',
          author: 'resistance_writer',
          text: 'And Rey seeing it and being angry at herself for seeing it. That\'s the whole tragedy in two paragraphs.',
          timestamp: 'Jan 9',
          likes: 189,
        },
      ],
    },
    {
      id: 'ss7-c0-3',
      author: 'balance_in_the_force',
      text: 'Writing this ship is walking a tightrope and you haven\'t missed a step. I\'m in awe. ⚔️',
      timestamp: 'Jan 10',
      likes: 734,
      isAuthor: true,
    },
  ],

  'sample-story-8-0': [
    {
      id: 'ss8-c0-1',
      author: 'johnlock_always',
      text: 'the way John narrates — unreliable in the exact right ways — is so perfectly him. He sees everything except the important thing.',
      timestamp: 'Dec 20',
      likes: 567,
    },
    {
      id: 'ss8-c0-2',
      author: 'baker_street_fic',
      text: 'Sherlock\'s tells. John not reading them correctly. The dramatic irony. I\'m suffering in the best way.',
      timestamp: 'Dec 21',
      likes: 423,
      replies: [
        {
          id: 'ss8-c0-2r1',
          author: 'consulting_reader',
          text: '"Elementary," he said, meaning something entirely else.',
          timestamp: 'Dec 21',
          likes: 312,
        },
      ],
    },
    {
      id: 'ss8-c0-3',
      author: 'mrs_hudson_approved',
      text: 'John Watson is the most interesting unreliable narrator in fic and this chapter is a masterclass. 🍵',
      timestamp: 'Dec 22',
      likes: 812,
      isAuthor: true,
    },
  ],

  'sample-story-9-0': [
    {
      id: 'ss9-c0-1',
      author: 'hannigram_truthers',
      text: 'The dinner party scene at the start. The choreography of it. The way violence and beauty are made indistinguishable.',
      timestamp: 'Feb 25',
      likes: 534,
    },
    {
      id: 'ss9-c0-2',
      author: 'will_graham_sad',
      text: 'Will\'s empathy disorder as a narrative device here is used so thoughtfully. His perception is the story.',
      timestamp: 'Feb 26',
      likes: 389,
      replies: [
        {
          id: 'ss9-c0-2r1',
          author: 'florence_writes',
          text: '"He understood killers because he was never not imagining being them. Hannibal was the first person who saw that as a gift." The whole story is in that sentence.',
          timestamp: 'Feb 26',
          likes: 445,
        },
      ],
    },
    {
      id: 'ss9-c0-3',
      author: 'this_is_my_design',
      text: 'The cannibalism metaphor is handled with more care here than in some published literary fiction I\'ve read. 🦌',
      timestamp: 'Feb 27',
      likes: 712,
      isAuthor: true,
    },
  ],

  'sample-story-10-0': [
    {
      id: 'ss10-c0-1',
      author: 'sga_forever',
      text: 'The Atlantis rising scene revisited from this angle. All the emotional weight that was skipped in canon, finally given room.',
      timestamp: 'Jan 20',
      likes: 312,
    },
    {
      id: 'ss10-c0-2',
      author: 'mckay_sheppard',
      text: 'Rodney admitting he was scared in this chapter, just once, just to John, in the dark — I cried.',
      timestamp: 'Jan 21',
      likes: 267,
      replies: [
        {
          id: 'ss10-c0-2r1',
          author: 'pegasus_fic',
          text: 'And John just... not fixing it. Just staying. That\'s the whole relationship.',
          timestamp: 'Jan 21',
          likes: 156,
        },
      ],
    },
    {
      id: 'ss10-c0-3',
      author: 'ancient_tech_writes',
      text: 'Still here after all these years writing this fandom because of readers like you. Thank you. 🌊',
      timestamp: 'Jan 22',
      likes: 445,
      isAuthor: true,
    },
  ],

  'sample-story-11-0': [
    {
      id: 'ss11-c0-1',
      author: 'obikin_nation',
      text: 'the Mustafar scene reimagined. Obi-Wan\'s silence where there used to be words. It\'s worse and it\'s better and I can\'t stop reading.',
      timestamp: 'Mar 10',
      likes: 678,
      replies: [
        {
          id: 'ss11-c0-1r1',
          author: 'high_ground_fic',
          text: '"He had prepared a speech and found it would not come, and so he said his name instead." WHAT',
          timestamp: 'Mar 10',
          likes: 445,
        },
      ],
    },
    {
      id: 'ss11-c0-2',
      author: 'anakin_skywalker_sad',
      text: 'This fic understands that the tragedy isn\'t the fall — it\'s all the moments before where it could have gone differently.',
      timestamp: 'Mar 11',
      likes: 534,
    },
    {
      id: 'ss11-c0-3',
      author: 'chosen_one_writes',
      text: 'I spent three months writing the beginning of this fic before I could write the end. Thank you for reading it. 🌅',
      timestamp: 'Mar 11',
      likes: 923,
      isAuthor: true,
    },
  ],
};

export function getComments(slug: string, chapterIndex: number): Comment[] {
  return comments[`${slug}-${chapterIndex}`] ?? [];
}
