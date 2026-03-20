/**
 * BookVill Seed Script
 * --------------------
 * Populates the database with:
 *   - Categories (genres)
 *   - Public-domain novels (Pride and Prejudice, Dracula, Frankenstein, Sherlock Holmes, Moby Dick)
 *   - Demo manga / manhwa titles with free image chapter pages
 *   - A demo admin user  (email: admin@bookvill.com  password: Admin1234)
 *
 * Usage:
 *   node seed.js            (connects via MONGO_URI in .env)
 *
 * WARNING: running seed.js twice will attempt to re-insert; existing
 *          Books/Chapters with the same key will be skipped via upsert.
 */

require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const User = require("./models/User");
const Book = require("./models/Book");
const Chapter = require("./models/Chapter");
const Category = require("./models/Category");

// ─── helpers ─────────────────────────────────────────────────────────────────
const slug = (str) => str.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

// Free cover images from Picsum (deterministic seeds so they never change)
const cover = (seed, w = 300, h = 450) =>
    `https://picsum.photos/seed/${seed}/${w}/${h}`;

// Free manga-style page images (Picsum gives consistent greyscale-ish pages)
const page = (seed) => `https://picsum.photos/seed/${seed}/800/1200`;

// ─── Categories ──────────────────────────────────────────────────────────────
const CATEGORIES = [
    { name: "Fantasy", slug: "fantasy", icon: "🧙", description: "Magic, mythical creatures, and other worlds" },
    { name: "Horror", slug: "horror", icon: "😱", description: "Fear, suspense, and the supernatural" },
    { name: "Adventure", slug: "adventure", icon: "⚔️", description: "Action-packed journeys and quests" },
    { name: "Romance", slug: "romance", icon: "💕", description: "Love stories and relationships" },
    { name: "Mystery", slug: "mystery", icon: "🔍", description: "Puzzles, detectives, and whodunits" },
    { name: "Sci-Fi", slug: "sci-fi", icon: "🚀", description: "Science, technology, and futurism" },
    { name: "Action", slug: "action", icon: "💥", description: "High-octane battles and stunts" },
    { name: "Classic", slug: "classic", icon: "📚", description: "Timeless works of literature" },
    { name: "Slice of Life", slug: "slice-of-life", icon: "🌸", description: "Everyday stories and emotions" },
    { name: "Supernatural", slug: "supernatural", icon: "👻", description: "Powers, spirits, and the unexplained" },
];

// ─── Novel content blocks (Public Domain excerpts + original filler) ──────────
const PRIDE_CH1 = `It is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a wife.

However little known the feelings or views of such a man may be on his first entering a neighbourhood, this truth is so well fixed in the minds of the surrounding families, that he is considered as the rightful property of some one or other of their daughters.

"My dear Mr. Bennet," said his lady to him one day, "have you heard that Netherfield Park is let at last?"

Mr. Bennet replied that he had not.

"But it is," returned she; "for Mrs. Long has just been here, and she told me all about it."

Mr. Bennet made no answer.

"Do you not want to know who has taken it?" cried his wife impatiently.

"You want to tell me, and I have no objection to hearing it."

This was invitation enough. Mrs. Bennet had been longing to speak of the new tenant at Netherfield Park. It was a large estate with handsome house, situated a mere three miles from Longbourn, and its grounds were well kept.`;

const PRIDE_CH2 = `Mr. Bennet was so odd a mixture of quick parts, sarcastic humour, reserve, and caprice, that the experience of three-and-twenty years had been insufficient to make his wife understand his character. Her mind was less difficult to develop. She was a woman of mean understanding, little information, and uncertain temper.

When she was discontented, she fancied herself nervous. The business of her life was to get her daughters married; its solace was visiting and news.

Mr. Bennet had very often wished that, instead of spending his evenings reading, he had instead used that time in finding a suitable match for Jane. She was the eldest and most beautiful of the five daughters.

Elizabeth, the second daughter, was her father's favourite. Her mother often said she had little else to recommend her but her cheekiness and wit, which, if left unchecked, might prove her ruin in polite society.

The neighbourhood was full of speculation about the new tenant at Netherfield Park. It was said he had five thousand a year, and that he was a single man. Mrs. Bennet could think of nothing else.`;

const DRACULA_CH1 = `3 May. Bistritz.—Left Munich at 8:35 P.M., on 1st May, arriving at Vienna early next morning; should have arrived at 6:46, but train was an hour late.

Buda-Pesth seems a wonderful place, from the glimpse which I got of it from the train and the little I could walk through the streets. I feared to go very far from the station, as we had arrived late and would start as near the correct time as possible.

The impression I had was that we were leaving the West and entering the East; the most western of splendid bridges over the Danube, which is here of noble width and depth, took us among the traditions of Turkish rule.

We left in pretty good time, and came after nightfall to Klausenburgh. Here I stopped for the night at the Hotel Royale. I had for dinner, or rather supper, a chicken done up some way with red pepper, which was very good but thirsty. I asked the waiter, and he said it was called "paprika hendl," and that, as it was a national dish, I should be able to get it anywhere along the Carpathians.`;

const DRACULA_CH2 = `I must have been asleep, for certainly if I had been fully awake I must have noticed the approach of such a remarkable place. In the gloom the courtyard looked of considerable size, and as several dark ways led from it under great round arches it perhaps seemed bigger than it really is.

I have not yet been able to see a glass anywhere. There is a monstrous mirror over the mantelpiece, but I noticed that when I was brushing my teeth I could see none of the room behind me. Strange that I should not have noticed it before.

I sat down to think, and the count entered, looking tall and thin, his black cloak sweeping behind him. His face was strong, aquiline, with high bridge of the thin nose and peculiarly arched nostrils. His eyebrows were very massive, almost meeting over the nose, and with bushy hair that seemed to curl in its own profusion.

The mouth, so far as I could see it under the heavy moustache, was fixed and rather cruel-looking, with peculiarly sharp white teeth.`;

const FRANK_CH1 = `You will rejoice to hear that no disaster has accompanied the commencement of an enterprise which you have regarded with such evil forebodings.

I arrived here yesterday; and my first task is to assure my dear sister of my welfare, and increasing confidence in the success of my undertaking.

I am already far north of London; and as I walk in the streets of Petersburgh, I feel a cold northern breeze play upon my cheeks, which braces my nerves, and fills me with delight.

Do you understand this feeling? This breeze, which has travelled from the regions towards which I am advancing, gives me a foretaste of those icy climes. Inspirited by this wind of promise, my daydreams become more fervent and vivid.

I try in vain to be persuaded that the pole is the seat of frost and desolation; it ever presents itself to my imagination as the region of beauty and delight.`;

const SHERLOCK_CH1 = `In the year 1878 I took my degree of Doctor of Medicine of the University of London, and proceeded to Netley to go through the course prescribed for surgeons in the army. Having completed my studies there, I was duly attached to the Fifth Northumberland Fusiliers as Assistant Surgeon.

The campaign brought honours and promotion to many, but for me it had nothing but misfortune and disaster. I was struck on the shoulder by a Jezail bullet, which shattered the bone and grazed the subclavian artery.

I should have fallen into the hands of the murderous Ghazis had it not been for the devotion and courage shown by Murray, my orderly, who threw me across a pack-horse, and succeeded in bringing me safely to the British lines.

Worn with pain, and weak from the prolonged hardship which I had undergone, I was removed, with a great train of wounded sufferers, to the base hospital at Peshawur.

I had no kith or kin in England, and was therefore as free as air — or as free as an income of eleven shillings and sixpence a day will permit a man to be. Under such circumstances I naturally gravitated to London, that great cesspool into which all the loungers and idlers of the Empire are irresistibly drained.`;

const SHERLOCK_CH2 = `We met next day as he had arranged, and inspected the rooms at No. 221B, Baker Street, of which he had spoken at our meeting. They consisted of a couple of comfortable bed-rooms and a single large airy sitting-room, cheerfully furnished, and illuminated by two broad windows.

So desirable in every way were the apartments, and so moderate did the terms seem when divided between us, that the bargain was concluded upon the spot, and we at once entered into possession. That very evening I moved my things round from the hotel, and on the following morning Sherlock Holmes followed me with several boxes and portmanteaus.

For the next few days Sherlock Holmes was in a state of considerable agitation. From time to time he pulled out his note-book, traced marks upon it with his pencil and then threw it aside.

"What do you make of that?" he asked, suddenly turning to me.

I examined the little piece of twist or paper which he had thrown to the table, but could make nothing of it.

"What is this?" I asked.

"There is the curious incident of the dog in the night-time," said the detective. And this was how the great adventure of Baker Street began.`;

const MOBY_CH1 = `Call me Ishmael. Some years ago—never mind how long precisely—having little money in my pocket and nothing particular to interest me on shore, I thought I would sail about a little and see the watery part of the world.

It is a way I have of driving off the spleen, and regulating the circulation. Whenever I find myself growing grim about the mouth; whenever it is a damp, drizzly November in my soul; whenever I find myself involuntarily pausing before coffin warehouses, and bringing up the rear of every funeral I meet; and especially whenever my hypos get such an upper hand of me, that it requires a strong moral principle to prevent me from deliberately stepping into the street, and methodically knocking people's hats off—then, I account it high time to get to sea as soon as I can.

There is nothing surprising in this. If they only knew it, almost all men in their degree, some time or other, cherish very nearly the same feelings towards the ocean with me.`;

// ─── Manga page sets (10 pages per chapter, unique Picsum seeds) ──────────────
const mangaPages = (bookSeed, chap) =>
    Array.from({ length: 12 }, (_, i) => page(`${bookSeed}-ch${chap}-p${i + 1}`));

// ─── Main seed function ───────────────────────────────────────────────────────
async function seed() {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // ── 1. Categories ─────────────────────────────────────────────────────────
    console.log("\n📂 Seeding categories...");
    const catDocs = {};
    for (const cat of CATEGORIES) {
        const doc = await Category.findOneAndUpdate(
            { slug: cat.slug },
            { ...cat },
            { upsert: true, new: true }
        );
        catDocs[cat.slug] = doc._id;
        process.stdout.write(`   • ${cat.name}\n`);
    }

    // ── 2. Demo admin user ────────────────────────────────────────────────────
    console.log("\n👤 Seeding demo user...");
    const existingAdmin = await User.findOne({ email: "admin@bookvill.com" });
    if (!existingAdmin) {
        await User.create({
            username: "BookVill Admin",
            email: "admin@bookvill.com",
            password: "Admin1234",
            isAdmin: true,
            role: "admin",
        });
        console.log("   • admin@bookvill.com created (password: Admin1234)");
    } else {
        console.log("   • Admin already exists — skipped");
    }

    // ── 3. Seed helper ────────────────────────────────────────────────────────
    async function seedBook(bookData, chapters) {
        const book = await Book.findOneAndUpdate(
            { title: bookData.title },
            { ...bookData, chapterCount: chapters.length },
            { upsert: true, new: true }
        );

        for (const ch of chapters) {
            await Chapter.findOneAndUpdate(
                { book: book._id, chapterNumber: ch.chapterNumber },
                { book: book._id, ...ch },
                { upsert: true, new: true }
            );
        }

        console.log(`   • "${bookData.title}" — ${chapters.length} chapters`);
        return book;
    }

    // ── 4. Public-domain novels ───────────────────────────────────────────────
    console.log("\n📚 Seeding novels...");

    await seedBook({
        title: "Pride and Prejudice",
        author: "Jane Austen",
        description: "A classic Regency-era romance following the spirited Elizabeth Bennet as she navigates issues of manners, upbringing, morality, and marriage in early 19th-century England.",
        coverImage: cover("pride-prejudice", 300, 450),
        format: "novel",
        categories: [catDocs["romance"], catDocs["classic"]],
        status: "completed",
        tags: ["regency", "romance", "classic", "society"],
        isTrending: true,
        isFeatured: true,
        isPublished: true,
        ratings: { sum: 23, count: 5 },
    }, [
        { chapterNumber: 1, title: "Chapter I — Netherfield Park Is Let", content: PRIDE_CH1 },
        { chapterNumber: 2, title: "Chapter II — The Bennet Family", content: PRIDE_CH2 },
        { chapterNumber: 3, title: "Chapter III — A Visit to Netherfield", content: `The ladies of Longbourn soon waited on those of Netherfield. The visit was soon returned in due form. Miss Bennet's pleasing manners grew on the goodwill of Mrs. Hurst and Miss Bingley; and though the mother was found to be intolerable, and the younger sisters not worth speaking to, a wish of being better acquainted with them was expressed towards the two eldest.\n\nBy Jane this attention was received with the greatest pleasure; but Elizabeth still saw superciliousness in their treatment of everybody, hardly excepting even her sister, and could not like them; though their kindness to Jane, such as it was, had a value as arising in all probability from the influence of their brother's admiration. It was generally evident whenever they met, that he did admire her; and to her it was equally evident that Jane was yielding to the preference which she had begun to entertain for him from the first, and was in a way to be very much in love.` },
        { chapterNumber: 4, title: "Chapter IV — Jane's Letter", content: `"I do not think Mrs. Long will do any such thing; she has two nieces of her own. She is a selfish, hypocritical woman, and I have no opinion of her."\n\n"No more have I," said Mr. Bennet; "and I am glad to find that you do not depend on her serving you."\n\nMrs. Bennet deigned not to make any reply; but unable to contain herself, began scolding one of her daughters.\n\n"Stop your coughing so, Kitty, for heaven's sake! Have a little compassion on my nerves. You tear them to pieces."\n\n"Kitty has no discretion in her coughs," said her father; "she times them ill."\n\n"I do not cough for my own amusement," replied Kitty fretfully.` },
        { chapterNumber: 5, title: "Chapter V — The Bingleys at the Ball", content: `Within a short walk of Longbourn lived a family with whom the Bennets were particularly intimate. Sir William Lucas had been formerly in trade in Meryton, where he had made a tolerable fortune and, rising to the honour of knighthood by an address to the King during his mayoralty, had quitted it to settle at Lucas Lodge, within a mile of Meryton.\n\nLady Lucas was a very good kind of woman, not too clever to be a valuable neighbour to Mrs. Bennet. They had several children. The eldest of them, a sensible, intelligent young woman, about twenty-seven, was Elizabeth's intimate friend.\n\nThat the Miss Lucases and the Miss Bennets should meet to talk over a ball was absolutely necessary; and the morning after the assembly brought the former to Longbourn to hear and to communicate.` },
    ]);

    await seedBook({
        title: "Dracula",
        author: "Bram Stoker",
        description: "An epistolary horror novel that tells the story of Dracula's attempt to move from Transylvania to England so that he may find new blood and spread the undead curse, and the battle between Dracula and a small group of people led by Professor Abraham Van Helsing.",
        coverImage: cover("dracula-bram-stoker", 300, 450),
        format: "novel",
        categories: [catDocs["horror"], catDocs["classic"], catDocs["supernatural"]],
        status: "completed",
        tags: ["vampire", "gothic", "horror", "classic", "transylvania"],
        isTrending: true,
        isFeatured: false,
        isPublished: true,
        ratings: { sum: 21, count: 5 },
    }, [
        { chapterNumber: 1, title: "Jonathan Harker's Journal — Bistritz", content: DRACULA_CH1 },
        { chapterNumber: 2, title: "Jonathan Harker's Journal — Castle Dracula", content: DRACULA_CH2 },
        { chapterNumber: 3, title: "Jonathan Harker's Journal — The Count's Secret", content: `I have had a couple of study nights and days. I dared not go to sleep, and I found that sleep was still trying to creep into me. I stood at the window and looked out on the beautiful prospect of the valley, and tried to forget all the terrible things I had heard.\n\nI held a crucifix given to me by the peasant woman at the inn. As I held it I felt something in me begin to calm, though the horror of the situation had not diminished.\n\nThe count's face was not the face of a man, yet there was something too real about it. Those red eyes, that iron grip when he came upon me in the passage — these were not the trappings of a dream.\n\nI must get out. I must escape these walls before the moon is full again.` },
        { chapterNumber: 4, title: "Jonathan Harker's Journal — Attempts to Escape", content: `I am desperate. The castle is impenetrable. I have examined every door and window. The walls are impossibly sheer on every outer face.\n\nThis morning I found a note from the Count, telling me that he would be away for a few hours, and that during his absence I was not to go to sleep anywhere in the castle excepting in my own room.\n\nI tried to go to the library. It was locked. I tried the Count's room. It too was locked. I now have only my own rooms to stay in.\n\nIt is beginning to be dusk, and the wolves are howling far and near. What they carry between them makes my blood run cold. I shall write no more tonight.` },
        { chapterNumber: 5, title: "Mina Murray's Journal", content: `I am so anxious about Jonathan. I have not heard from him for some time, and that is not like him. He was to have come back some weeks ago, and I know he was in the Carpathian Mountains. I myself have no fear of him being unfaithful — he is too good for that — but I fear some mishap or illness.\n\nLucy looks sweetly pretty in her white dress. She has had three men propose marriage to her in one day! I don't know whether to congratulate or condole with her.\n\nI am longing to see Jonathan. A letter would soothe my mind so much.` },
    ]);

    await seedBook({
        title: "Frankenstein",
        author: "Mary Shelley",
        description: "The story of Victor Frankenstein, a young scientist who creates a sapient creature in an unorthodox scientific experiment. Shelley's novel explores themes of ambition, creation, responsibility, and what it means to be human.",
        coverImage: cover("frankenstein-shelley", 300, 450),
        format: "novel",
        categories: [catDocs["sci-fi"], catDocs["horror"], catDocs["classic"]],
        status: "completed",
        tags: ["gothic", "science", "monster", "classic", "creation"],
        isTrending: false,
        isFeatured: true,
        isPublished: true,
        ratings: { sum: 18, count: 4 },
    }, [
        { chapterNumber: 1, title: "Letter I — Walton to his Sister", content: FRANK_CH1 },
        { chapterNumber: 2, title: "Letter II — St. Petersburgh", content: `To Mrs. Saville, England.\n\nYou will rejoice to hear that no disaster has accompanied the commencement of an enterprise which you have regarded with such evil forebodings.\n\nI have hired a vessel and am occupied in collecting my sailors; those whom I have already engaged appear to be men on whom I can depend, and are certainly possessed of dauntless courage.\n\nI have already found, amongst my companions on board ship, a man so extraordinary, so full of ardour, that I feel he could be the one to share my adventure. It was a bitter day when first I felt his presence — but now I find his company indispensable.` },
        { chapterNumber: 3, title: "Chapter I — Victor's Childhood", content: `I am by birth a Genevese; and my family is one of the most distinguished of that republic. My ancestors had been for many years counsellors and syndics; and my father had filled several public situations with honour and reputation.\n\nHe was respected by all who knew him for his integrity and indefatigable attention to public business. He passed his younger days perpetually occupied by the affairs of his country; a variety of circumstances had prevented his marrying early, nor was it until the decline of life that he became a husband and the father of a family.\n\nAs the circumstances of his marriage illustrate his character, I cannot refrain from relating them.` },
        { chapterNumber: 4, title: "Chapter II — The Laboratory", content: `From this day natural philosophy, and particularly chemistry, became nearly my sole occupation. I read with ardour those works, so full of genius and discrimination, which modern enquirers have written on these subjects.\n\nI attended the lectures and cultivated the acquaintance of the men of science of the university; and I found even in M. Krempe a great deal of sound sense and real information combined, it is true, with a prepossessing physiognomy and manners, but not on that account the less valuable.\n\nIn M. Waldman I found a true friend. His gentleness was never tinged by dogmatism; and his instructions were given with an air of frankness and good nature that banished every idea of pedantry.` },
    ]);

    await seedBook({
        title: "A Study in Scarlet",
        author: "Arthur Conan Doyle",
        description: "The first Sherlock Holmes novel, introducing the world's greatest detective and his companion Dr. John Watson. A murdered man is found in an abandoned house with no apparent wounds, setting Holmes and Watson on their first case together.",
        coverImage: cover("sherlock-holmes-study", 300, 450),
        format: "novel",
        categories: [catDocs["mystery"], catDocs["classic"], catDocs["adventure"]],
        status: "completed",
        tags: ["detective", "mystery", "victorian", "classic", "sherlock"],
        isTrending: true,
        isFeatured: true,
        isPublished: true,
        ratings: { sum: 24, count: 5 },
    }, [
        { chapterNumber: 1, title: "Dr. Watson — A Study in Scarlet", content: SHERLOCK_CH1 },
        { chapterNumber: 2, title: "Mr. Sherlock Holmes of Baker Street", content: SHERLOCK_CH2 },
        { chapterNumber: 3, title: "The Lauriston Gardens Mystery", content: `There is no branch of detective science which is so important and so much neglected as the art of tracing footsteps. Luckily, I had received training in this matter, and I was now able to put my knowledge to a practical test.\n\nHolmes led the way up the path while I followed within a few steps, treading carefully to avoid any marks he might be reading.\n\n"They were two men," he said, stopping suddenly. "One was considerably taller than the other, and both wore long coats. The shorter man had a limp."\n\nI looked at him in amazement. No marks were visible to my untrained eye. He was right, somehow — he was always right.` },
        { chapterNumber: 4, title: "What John Rance Had to Tell", content: `It was one o'clock when we left No. 3, Lauriston Gardens. Sherlock Holmes led me to the nearest telegraph office, whence he dispatched a long telegram. He then hailed a cab, and ordered the driver to take us to the address given us by Lestrade.\n\n"There is nothing more deceptive than an obvious fact," Holmes remarked, as we rolled through the streets.\n\n"Nothing?" I replied.\n\n"Not one single thing. The world is full of obvious things which nobody by any chance ever observes. Where do you think we are going now?"\n\n"To the Aerated Bread Company, I should think."\n\n"Good. It is there that John Rance the constable waits to tell us what he saw."` },
        { chapterNumber: 5, title: "Our Advertisement Brings a Visitor", content: `Our advertisement has brought us a visitor. He arrived prompt at ten, a young ragamuffin who answered to the name of Wiggins, a street urchin who commanded a small army of irregular boys ready to run messages and see things that a gentleman could not.\n\nHolmes tossed him a shilling. "There are many men in London who, some from shyness, some from misanthropy, have no wish for the company of their fellows. Yet they must meet new people — and sometimes their needs are urgent."\n\nThe urchin's eyes gleamed. "And what are we lookin' for, Mr. Holmes?"\n\n"A man with a limp," said Holmes, "and a large, powerful friend."` },
    ]);

    await seedBook({
        title: "Moby Dick",
        author: "Herman Melville",
        description: "The saga of Captain Ahab's obsessive quest for the white sperm whale Moby Dick. Told from the perspective of sailor Ishmael, this epic is one of the greatest works of American literature — a meditation on fate, obsession, and the struggle against nature.",
        coverImage: cover("moby-dick-melville", 300, 450),
        format: "novel",
        categories: [catDocs["adventure"], catDocs["classic"]],
        status: "completed",
        tags: ["whale", "sea", "adventure", "classic", "america"],
        isTrending: false,
        isFeatured: false,
        isPublished: true,
        ratings: { sum: 16, count: 4 },
    }, [
        { chapterNumber: 1, title: "Loomings", content: MOBY_CH1 },
        { chapterNumber: 2, title: "The Carpet-Bag", content: `I stuffed a shirt or two into my old carpet-bag, tucked it under my arm, and started for Cape Horn and the Pacific. Quitting the good city of old Manhatto, I duly arrived in New Bedford. It was a Saturday night in December. Much was I disappointed upon learning that the little packet for Nantucket had already sailed, and that no way of reaching that place would offer itself, till the following Monday.\n\nAs most young candidates for the pains and penalties of whaling stop at this same New Bedford, thence to embark on their voyage, it may as well be related that I, for one, had no idea of so doing. When I say that I am in the habit of going to sea whenever I begin to grow hazy about the eyes, and begin to be over conscious of my lungs, I do not mean to have it inferred that I ever go to sea as a passenger.` },
        { chapterNumber: 3, title: "The Spouter-Inn", content: `Entering that gable-ended Spouter-Inn, you found yourself in a wide, low, straggling entry with old-fashioned wainscots, reminding one of the bulwarks of some condemned old craft. On one side hung a very large oil painting so thoroughly besmoked, and every way defaced, that in the unequal cross-lights by which you viewed it, it was only by diligent study and a series of systematic visits to it, that you could gain any utter satisfaction concerning it.\n\nBut what most puzzled and confounded you was a long, limber, portentous, black mass of something hovering in the centre of the picture over three blue, dim, perpendicular lines floating in a nameless yeast. A boggy, soggy, squitchy picture truly, enough to drive a nervous man distracted.` },
    ]);

    // ── 5. Demo manga ─────────────────────────────────────────────────────────
    console.log("\n🎌 Seeding manga / manhwa...");

    await seedBook({
        title: "Shadow Realm Chronicles",
        author: "Demo Studio",
        description: "In a world where shadows hold living spirits, a young hunter named Kai discovers he can see — and control — what others cannot. A gripping supernatural action series about power, loss, and the monsters lurking in the dark.",
        coverImage: cover("shadow-realm-manga", 300, 450),
        format: "manga",
        categories: [catDocs["action"], catDocs["supernatural"], catDocs["fantasy"]],
        status: "ongoing",
        tags: ["action", "supernatural", "shadows", "hunter", "demons"],
        isTrending: true,
        isFeatured: true,
        isPublished: true,
        ratings: { sum: 22, count: 5 },
        metadata: new Map([["readingDirection", "rtl"]]),
    }, [
        { chapterNumber: 1, title: "Ch. 1 — Awakening", pages: mangaPages("shadow-realm", 1) },
        { chapterNumber: 2, title: "Ch. 2 — First Hunt", pages: mangaPages("shadow-realm", 2) },
        { chapterNumber: 3, title: "Ch. 3 — The Gate Opens", pages: mangaPages("shadow-realm", 3) },
        { chapterNumber: 4, title: "Ch. 4 — Bloodline", pages: mangaPages("shadow-realm", 4) },
        { chapterNumber: 5, title: "Ch. 5 — Into the Abyss", pages: mangaPages("shadow-realm", 5) },
    ]);

    await seedBook({
        title: "Celestial Blade",
        author: "Demo Studio",
        description: "A young blacksmith's apprentice discovers an ancient celestial blade that resonates with a forgotten power. Set in a sprawling wuxia fantasy world of floating kingdoms, divine cultivators, and sacred mountain sects.",
        coverImage: cover("celestial-blade-manhwa", 300, 450),
        format: "manhwa",
        categories: [catDocs["fantasy"], catDocs["action"], catDocs["adventure"]],
        status: "ongoing",
        tags: ["wuxia", "cultivation", "fantasy", "action", "sword"],
        isTrending: true,
        isFeatured: false,
        isPublished: true,
        ratings: { sum: 19, count: 4 },
        metadata: new Map([["readingDirection", "ltr"]]),
    }, [
        { chapterNumber: 1, title: "Ch. 1 — The Blade Appears", pages: mangaPages("celestial-blade", 1) },
        { chapterNumber: 2, title: "Ch. 2 — Master and Student", pages: mangaPages("celestial-blade", 2) },
        { chapterNumber: 3, title: "Ch. 3 — Trial of Fire", pages: mangaPages("celestial-blade", 3) },
        { chapterNumber: 4, title: "Ch. 4 — The Tournament Begins", pages: mangaPages("celestial-blade", 4) },
    ]);

    await seedBook({
        title: "Neon Heart",
        author: "Demo Studio",
        description: "A warm slice-of-life webtoon set in a near-future Seoul. Two strangers meet on a rain-soaked rooftop and begin sharing playlists, secrets, and eventually — themselves. A story about connection in a disconnected world.",
        coverImage: cover("neon-heart-webtoon", 300, 450),
        format: "webtoon",
        categories: [catDocs["romance"], catDocs["slice-of-life"]],
        status: "ongoing",
        tags: ["romance", "slice-of-life", "modern", "seoul", "music"],
        isTrending: false,
        isFeatured: true,
        isPublished: true,
        ratings: { sum: 20, count: 4 },
        metadata: new Map([["readingDirection", "ttb"]]),
    }, [
        { chapterNumber: 1, title: "Ch. 1 — Rooftop Encounter", pages: mangaPages("neon-heart", 1) },
        { chapterNumber: 2, title: "Ch. 2 — First Playlist", pages: mangaPages("neon-heart", 2) },
        { chapterNumber: 3, title: "Ch. 3 — Rain Check", pages: mangaPages("neon-heart", 3) },
        { chapterNumber: 4, title: "Ch. 4 — Late Night Café", pages: mangaPages("neon-heart", 4) },
        { chapterNumber: 5, title: "Ch. 5 — Almost", pages: mangaPages("neon-heart", 5) },
    ]);

    await seedBook({
        title: "Iron Division",
        author: "Demo Studio",
        description: "In a dystopian future where humanity is split into labor castes, seventeen-year-old Reya smuggles contraband to survive — until she discovers a cache of old-world tech that changes everything.",
        coverImage: cover("iron-division-sci", 300, 450),
        format: "manhwa",
        categories: [catDocs["sci-fi"], catDocs["action"], catDocs["mystery"]],
        status: "ongoing",
        tags: ["dystopia", "sci-fi", "action", "tech", "rebellion"],
        isTrending: true,
        isFeatured: false,
        isPublished: true,
        ratings: { sum: 17, count: 4 },
        metadata: new Map([["readingDirection", "ltr"]]),
    }, [
        { chapterNumber: 1, title: "Ch. 1 — Gray City", pages: mangaPages("iron-division", 1) },
        { chapterNumber: 2, title: "Ch. 2 — The Cache", pages: mangaPages("iron-division", 2) },
        { chapterNumber: 3, title: "Ch. 3 — Scan Detected", pages: mangaPages("iron-division", 3) },
    ]);

    console.log("\n✅ Seed complete!");
    console.log("   Demo login → admin@bookvill.com / Admin1234\n");

    await mongoose.disconnect();
    process.exit(0);
}

seed().catch((err) => {
    console.error("❌ Seed failed:", err.message);
    mongoose.disconnect();
    process.exit(1);
});
