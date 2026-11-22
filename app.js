/* ================================================================== *
 *  Myrthe, Run Coach · de hele marathon
 *  16 weken vanaf ma 23 nov 2026, marathon op zondag 14 maart 2027.
 *  2 trainingen per week: 1 doordeweeks en 1 lange in het weekend, naast de sportschool.
 *  Gebouwd op de hoofdapp van Kim. Alles lokaal in de browser.
 * ================================================================== */

const CONFIG = {
  unit:       "km",
  zonePaceSuffix: "",
  footEmoji:  "🏃‍♀️",
  mottos: [
    "Zet 'm op, strijder!",
    "Lekker begonnen, Myrthe!",
    "Je bouwt 'm mooi op, strijder.",
    "Halverwege, knap volgehouden! ⚡",
    "Die 42 km komt in zicht, strijder!",
    "Marathonloper! Wat een strijder 🏅",
  ],
  appName:    "De hele marathon",
  runner:     "Myrthe",
  goal:       "De hele marathon lopen",
  startDate:  new Date(2026, 10, 23),
  storeKey:   "myrthe-marathon.log.v1",
  coachName:  "Coach Bart",
  coachHandle:"@bartlopen",
  coachPhoto: "coach.jpg",
  athleteWord:"strijder",
  catchphrase:"Zet 'm op, strijder!",
};

const RUNNER = CONFIG.runner;
const GOAL = CONFIG.goal;
const START_DATE = CONFIG.startDate;
const STORE_KEY = CONFIG.storeKey;
const TOTAL_WEEKS = 16;
const UNIT = CONFIG.unit === "min" ? "min" : "km";
const UNIT_LABEL = UNIT;
const nlNum = (v) => String(v).replace(".", ",");
const ZONE_SUFFIX = CONFIG.zonePaceSuffix ?? "/km";
const COACH_INITIAL = (CONFIG.coachName.replace(/^coach\s+/i, "")[0] || "C").toUpperCase();

const ZONES = [
  { key: "duur",     name: "Rustig",          pace: "6:30–7:10/km", info: "RPE 3-4 · je kunt gewoon praten" },
  { key: "lang",     name: "Lange duurloop",  pace: "6:40–7:20/km", info: "RPE 3-4 · tijd op je benen" },
  { key: "doel",     name: "Marathontempo",   pace: "5:35–5:45/km", info: "RPE 5-6 · zo voelt 4 uur" },
  { key: "tempo",    name: "Stevig",          pace: "5:15–5:30/km", info: "RPE 6-7 · korte zinnen lukken nog" },
  { key: "interval", name: "Vlot",            pace: "4:55–5:10/km", info: "RPE 8 · kort en vlot, nooit sprinten" },
];
const zoneByKey = Object.fromEntries(ZONES.map((z) => [z.key, z]));

const COACH = {
  duur: [
    "Kun je nog praten? Dan zit je goed.",
    "Ontspannen schouders, rustige adem. Lekker bezig, Myrthe.",
    "Rustig lopen maakt je straks sterk op die 42 km.",
    "Te makkelijk? Mooi, dan doe je het precies goed.",
  ],
  lang: [
    "Rustiger starten dan je wil, de rest gaat dan vanzelf.",
    "Elke kilometer vandaag is er een in de bank voor maart.",
    "Niet op je horloge kijken, gewoon lekker doorlopen.",
    "Neem wat te drinken mee en eet onderweg, dat oefen je ook.",
  ],
  doel: [
    "Dit is het tempo van rond de 4 uur. Voel maar hoe het is.",
    "Elke kilometer even snel, dat is de hele kunst.",
    "Zo voelt het straks op 14 maart, maar dan nog wat langer. 😉",
    "Ontspannen blijven op dit tempo, daar win je je marathon mee.",
  ],
  tempo: [
    "Stevig, maar je houdt de baas over je adem.",
    "Tussen de blokken echt rustig, dat hoort erbij.",
    "Lekker oncomfortabel, precies goed.",
    "Hier word je sterker van, strijder.",
  ],
  interval: [
    "Vlot maar beheerst. Nooit sprinten.",
    "Elk blokje even snel, ook de laatste.",
    "Kort en fris, daar word je soepel van.",
    "Daarna lekker rustig uitlopen, dat mag.",
  ],
};
const coachLine = (zone) => {
  const arr = COACH[zone] || COACH.duur;
  return arr[Math.floor(Math.random() * arr.length)];
};

const DONE = [
  "💜 Sterk gedaan, Myrthe!",
  "🔥 Weer eentje afgevinkt.",
  "🌸 Lekker bezig, strijder.",
  "🏅 Weer een stap richting die 42 km.",
  "✅ Weer een week dichter bij maart. Top!",
  "🌟 Knap volgehouden!",
];

const WHY = {
  duur:     "Rustige kilometers bouwen je basis: een sterker hart, meer uithoudingsvermogen en pezen die weer wennen aan het lopen. Rustig lopen is geen luie training, het is de training waar je het meest van krijgt.",
  lang:     "De lange duurloop is de belangrijkste training van je week. Je lichaam leert vet verbranden, je benen leren uren door te gaan en je hoofd leert dat het kan. Met twee loopdagen per week is dit de training die je nooit overslaat.",
  doel:     "Lopen op marathontempo maakt dat tempo vertrouwd. Je leert hoe het voelt, zodat je het op de dag zelf vanzelf vasthoudt en niet te snel start.",
  tempo:    "Stevige blokken leren je lichaam een hoger tempo langer vol te houden. Daardoor voelt je marathontempo straks een stuk rustiger.",
  interval: "Korte vlotte blokjes verbeteren je conditie en je looppas. Daardoor voelt je gewone tempo straks makkelijker.",
};

/* --- Helpers: één training doordeweeks, één in het weekend, en de marathon op zondag --- */
const KIND_BY_ZONE = { duur: "Rustig", lang: "Lange duurloop", doel: "Marathontempo", tempo: "Stevig", interval: "Vlot" };
const d1 = (o) => ({ day: "d1", dayLabel: "Training 1 · doordeweeks", kind: KIND_BY_ZONE[o.zone], ...o });
const d2 = (o) => ({ day: "d2", dayLabel: "Training 2 · weekend",     kind: KIND_BY_ZONE[o.zone], ...o });
const zo = (o) => ({ day: "zo", dayLabel: "Zondag",                   kind: KIND_BY_ZONE[o.zone], ...o });

const PLAN = [
  /* ---------- Fase 1 · Weer op gang ---------- */
  { week: 1, dates: "23–29 nov", phase: "Fase 1 · Weer op gang", note: "Je halve van april zit nog in je lijf, dus we beginnen meteen met 12 km in het weekend. Wel rustig: tempo maakt nu niet uit, kilometers wel.", sessions: [
    d1({ zone: "duur", km: 6, title: "Weer beginnen: 6 km rustig", goal: "Lekker lopen, verder niets", why: "Je laatste 5 km ging op het eind moeizaam. Dat is heel normaal na een pauze, en meestal komt het door een te snelle start. Vandaag doe je het andersom: zo rustig dat het bijna te makkelijk voelt. Even wandelen mag.", blocks: [
      "6 km op 6:30–7:10/km",
      "Begin rustiger dan je wil, de eerste kilometer mag echt sloom",
      "Even wandelen? Prima, daarna gewoon weer door",
    ] }),
    d2({ zone: "lang", km: 12, title: "12 km rustig", goal: "Meteen een mooie lange loop", why: "Je liep in april een halve marathon aan één stuk, dus 12 km rustig kan je lijf prima aan. Het geheim is het tempo: zo rustig dat je de hele tijd kunt praten. Dan kom je fris thuis.", blocks: [
      "12 km op 6:40–7:20/km",
      "Kun je nog praten? Dan zit je goed",
      "Neem iets te drinken mee als je dat fijn vindt",
    ] }),
  ]},
  { week: 2, dates: "30 nov–6 dec", phase: "Fase 1 · Weer op gang", note: "In het weekend 14 km. Doordeweeks voor het eerst een paar korte versnellingen.", sessions: [
    d1({ zone: "duur", km: 7, title: "7 km met versnellingen", goal: "Je benen wakker maken", blocks: [
      "6 km rustig op 6:30–7:10/km",
      "Daarna 4× 20 sec soepel versnellen, met 1 min wandelen ertussen",
      "Soepel betekent: snel, maar ontspannen. Nooit sprinten",
    ] }),
    d2({ zone: "lang", km: 14, title: "14 km rustig", goal: "Langer lopen wordt weer gewoon", blocks: ["14 km op 6:40–7:20/km", "Neem drinken mee"] }),
  ]},
  { week: 3, dates: "7–13 dec", phase: "Fase 1 · Weer op gang", note: "Doordeweeks een paar vlotte minuten, in het weekend al 16 km.", sessions: [
    d1({ zone: "interval", km: 7, title: "6× 1 minuut vlot", goal: "Even voelen hoe snel voelt", blocks: [
      "2 km rustig inlopen",
      "6× 1 min vlot op 4:55–5:10/km, met 2 min rustig ertussen",
      "Rustig uitlopen tot 7 km",
    ] }),
    d2({ zone: "lang", km: 16, title: "16 km rustig", goal: "Op weg naar de halve", blocks: [
      "16 km op 6:40–7:20/km",
      "Oefen vanaf nu met eten onderweg: na een uur een gelletje of een paar snoepjes",
    ] }),
  ]},
  { week: 4, dates: "14–20 dec", phase: "Fase 1 · Weer op gang", recovery: true, note: "Rustweek. Even minder, zodat je lijf de eerste drie weken kan verwerken. Daar word je sterker van.", sessions: [
    d1({ zone: "duur", km: 6, title: "Rustige 6 km", goal: "Herstellen", blocks: ["6 km op 6:30–7:10/km"] }),
    d2({ zone: "lang", km: 12, title: "12 km rustig", goal: "Lekker lopen, niets bewijzen", blocks: ["12 km op 6:40–7:20/km"] }),
  ]},

  /* ---------- Fase 2 · Basis ---------- */
  { week: 5, dates: "21–27 dec", phase: "Fase 2 · Basis", note: "Kerstweek! Kies zelf je momenten rond de feestdagen. Een lange loop op tweede kerstdag is trouwens heerlijk.", sessions: [
    d1({ zone: "tempo", km: 8, title: "3× 6 minuten stevig", goal: "Een hoger tempo vasthouden", blocks: [
      "2 km rustig inlopen",
      "3× 6 min stevig op 5:15–5:30/km, met 2 min rustig ertussen",
      "Rustig uitlopen tot 8 km",
    ] }),
    d2({ zone: "lang", km: 18, title: "18 km rustig", goal: "Kerstkilometers", blocks: ["18 km op 6:40–7:20/km", "Drinken en een gelletje mee"] }),
  ]},
  { week: 6, dates: "28 dec–3 jan", phase: "Fase 2 · Basis", note: "Oud en nieuw. Je eerste lange loop van 2027 is meteen een halve marathon!", sessions: [
    d1({ zone: "duur", km: 8, title: "8 km met versnellingen", goal: "Soepel het jaar uit", blocks: ["7 km rustig op 6:30–7:10/km", "6× 20 sec soepel versnellen aan het eind"] }),
    d2({ zone: "lang", km: 21.1, title: "21,1 km rustig", goal: "Een halve marathon, maar dan als training", blocks: [
      "21,1 km op 6:40–7:20/km",
      "Veel rustiger dan in april, dat is precies de bedoeling",
      "Eet en drink onderweg, net zoals je straks in maart doet",
    ] }),
  ]},
  { week: 7, dates: "4–10 jan", phase: "Fase 2 · Basis", note: "Voor het eerst een stuk op marathontempo. Zo leer je hoe 4 uur voelt.", sessions: [
    d1({ zone: "doel", km: 9, title: "2× 3 km op marathontempo", goal: "Voelen hoe rond de 4 uur loopt", blocks: [
      "2 km rustig inlopen",
      "2× 3 km op 5:35–5:45/km, met 3 min rustig ertussen",
      "Rustig uitlopen tot 9 km",
    ] }),
    d2({ zone: "lang", km: 23, title: "23 km rustig", goal: "Voorbij de halve", blocks: ["23 km op 6:40–7:20/km", "Elk half uur een paar slokken, elk uur een gelletje"] }),
  ]},
  { week: 8, dates: "11–17 jan", phase: "Fase 2 · Basis", recovery: true, note: "Rustweek met een testje: in het weekend loop je 10 km zo snel als het die dag gaat. Daarmee weten we of 4 uur erin zit.", sessions: [
    d1({ zone: "duur", km: 6, title: "Rustig met versnellingen", goal: "Fris worden voor je test", blocks: ["5 km rustig", "4× 20 sec soepel versnellen"] }),
    d2({ zone: "tempo", kind: "Testloop", km: 13, title: "⏱️ 10 km tijdrit", goal: "Kijken waar je staat", why: "Met deze tijd zien we of rond de 4 uur realistisch is. Rond 52 minuten of sneller: dan zit 4 uur erin. Rond 55 tot 57 minuten: dan mikken we op 4:15. Boven het uur: dan wordt het genieten richting 4:30. Alles is goed, het is een meting en geen examen. Stuur me je tijd, dan zet ik je tempo's bij.", blocks: [
      "2 km rustig inlopen, met 3 korte versnellingen",
      "10 km zo snel als het vandaag gaat, maar de eerste 2 km rustig opbouwen",
      "Elke kilometer ongeveer even snel, dat is de truc",
      "1 km rustig uitlopen",
      "Vul je tijd in, dan kijkt Coach Bart mee",
    ] }),
  ]},

  /* ---------- Fase 3 · Lange duurlopen ---------- */
  { week: 9, dates: "18–24 jan", phase: "Fase 3 · Lange duurlopen", note: "Na je test gaan de lange lopen echt omhoog. Vanaf nu is elke lange loop een nieuw record.", sessions: [
    d1({ zone: "tempo", km: 9, title: "4× 1 km stevig", goal: "Sterker op tempo", blocks: [
      "2 km rustig inlopen",
      "4× 1 km stevig op 5:15–5:30/km, met 2 min rustig ertussen",
      "Rustig uitlopen tot 9 km",
    ] }),
    d2({ zone: "lang", km: 26, title: "26 km rustig", goal: "Je langste loop tot nu toe", blocks: ["26 km op 6:40–7:20/km", "Oefen met wat je op de marathon wil eten en drinken"] }),
  ]},
  { week: 10, dates: "25–31 jan", phase: "Fase 3 · Lange duurlopen", note: "Doordeweeks langer op marathontempo, in het weekend 28 km.", sessions: [
    d1({ zone: "doel", km: 10, title: "2× 4 km op marathontempo", goal: "Je marathontempo vasthouden", blocks: [
      "1,5 km rustig inlopen",
      "2× 4 km op 5:35–5:45/km, met 2 min rustig ertussen",
      "Rustig uitlopen tot 10 km",
    ] }),
    d2({ zone: "lang", km: 28, title: "28 km rustig", goal: "Weer een nieuw record", blocks: ["28 km op 6:40–7:20/km", "Drinken en een gelletje per 45 min"] }),
  ]},
  { week: 11, dates: "1–7 feb", phase: "Fase 3 · Lange duurlopen", note: "Je eerste 30 km! Neem er de tijd voor en kies een mooie route.", sessions: [
    d1({ zone: "doel", km: 10, title: "6 km op marathontempo", goal: "Aan één stuk op tempo", blocks: [
      "2 km rustig inlopen",
      "6 km op 5:35–5:45/km",
      "Rustig uitlopen tot 10 km",
    ] }),
    d2({ zone: "lang", km: 30, title: "🌟 Je eerste 30 km", goal: "Over de 30 heen", blocks: [
      "30 km op 6:40–7:20/km",
      "Rustiger starten dan je wil, de laatste 10 km worden zwaar",
      "Neem genoeg mee: drinken en een gelletje per 45 min",
      "Daarna: goed eten, veel slapen. Je hebt het verdiend 💜",
    ] }),
  ]},
  { week: 12, dates: "8–14 feb", phase: "Fase 3 · Lange duurlopen", recovery: true, note: "Rustweek. Minder kilometers, zodat je straks fris aan je langste loop begint.", sessions: [
    d1({ zone: "duur", km: 7, title: "Rustige 7 km", goal: "Herstellen", blocks: ["7 km op 6:30–7:10/km"] }),
    d2({ zone: "lang", km: 20, title: "20 km rustig", goal: "Lekker lopen, niets bewijzen", blocks: ["20 km op 6:40–7:20/km"] }),
  ]},

  /* ---------- Fase 4 · Piek ---------- */
  { week: 13, dates: "15–21 feb", phase: "Fase 4 · Piek", note: "Je langste loop: 32 km! Daarna gaat het alleen nog maar rustiger.", sessions: [
    d1({ zone: "doel", km: 11, title: "3× 3 km op marathontempo", goal: "Tempo vasthouden als je al moe bent", blocks: [
      "1,5 km rustig inlopen",
      "3× 3 km op 5:35–5:45/km, met 2 min rustig ertussen",
      "Rustig uitlopen tot 11 km",
    ] }),
    d2({ zone: "lang", km: 32, title: "🌟 32 km, je langste loop", goal: "Hierna weet je: ik kan het", why: "Dit is de belangrijkste training van je hele schema. Na 32 km weet je lijf én je hoofd dat de marathon gaat lukken. De laatste 10 km op de dag zelf loop je op adrenaline en publiek. Doe precies wat je op 14 maart ook doet: hetzelfde ontbijt, dezelfde schoenen, hetzelfde eten onderweg.", blocks: [
      "32 km op 6:40–7:20/km",
      "Oefen je marathonontbijt en je eten onderweg",
      "Draag wat je op de marathon ook aantrekt",
      "Daarna: goed eten, veel slapen. Je hebt het verdiend 💜",
    ] }),
  ]},
  { week: 14, dates: "22–28 feb", phase: "Fase 4 · Piek", note: "Nog één stevige week. Je lange loop is korter, maar met een flink stuk op marathontempo.", sessions: [
    d1({ zone: "duur", km: 8, title: "8 km rustig", goal: "Herstellen van je 32 km", blocks: ["8 km op 6:30–7:10/km", "4× 20 sec soepel versnellen aan het eind"] }),
    d2({ zone: "doel", km: 26, title: "26 km met 10 km op tempo", goal: "Je generale op marathontempo", blocks: [
      "12 km rustig op 6:40–7:20/km",
      "10 km op 5:35–5:45/km",
      "4 km rustig uitlopen",
      "Voelt het tempo zwaar? Dan zetten we je marathontempo samen iets bij",
    ] }),
  ]},

  /* ---------- Fase 5 · Naar de start ---------- */
  { week: 15, dates: "1–7 mrt", phase: "Fase 5 · Naar de start", note: "Afbouwen. Minder kilometers, maar je blijft wel even op tempo lopen. Je wordt nu elke dag frisser.", sessions: [
    d1({ zone: "doel", km: 8, title: "4 km op marathontempo", goal: "Scherp blijven, niet moe worden", blocks: [
      "2 km rustig inlopen",
      "4 km op 5:35–5:45/km",
      "Rustig uitlopen tot 8 km",
    ] }),
    d2({ zone: "lang", km: 16, title: "16 km met 5 km op tempo", goal: "Nog één keer lekker lang", blocks: [
      "8 km rustig op 6:40–7:20/km",
      "5 km op 5:35–5:45/km",
      "3 km rustig uitlopen",
    ] }),
  ]},
  { week: 16, dates: "8–14 mrt", phase: "Fase 5 · Naar de start", race: true, raceLabel: "🏅 Jouw marathon", raceSub: "Marathon · 42,2 km, rond de 4 uur", note: "Dit is je week! Doordeweeks alleen even los, en op zondag loop je je marathon. Kijk eens hoe ver je in 16 weken gekomen bent.", sessions: [
    d1({ zone: "duur", km: 6, title: "Los en fris", goal: "Benen wakker houden", blocks: [
      "Liefst dinsdag of woensdag",
      "4 km rustig, daarna 3× 1 min op marathontempo",
      "Rustig uitlopen tot 6 km",
      "Daarna rust tot zondag",
    ] }),
    zo({ zone: "doel", kind: "Marathon", km: 42.2, title: "🏅 Je marathon", countdown: "marathon", goal: "De hele marathon lopen, rond de 4 uur als het lukt", why: "In november begon je weer, na een maand zonder lopen. Vandaag loop je 42,2 km. Wat de klok ook zegt, dat is enorm. Het hoofddoel is finishen, rond de 4 uur is de bonus. De grootste fout op een marathon is te snel starten. Houd je daaraan, dan wordt het een feest.", blocks: [
      "Ontbijt drie uur voor de start, wat je bij je 32 km ook at",
      "De eerste 5 km op 5:50/km, echt niet sneller, ook al voelt het traag",
      "Daarna op 5:35–5:45/km",
      "Elke 30 à 40 min een gelletje, bij elke drankpost een paar slokken",
      "Na 30 km begint de echte marathon: klein ritme, korte pasjes, door!",
      "Gefinisht? Stuur me je tijd, ik wil het meteen weten! 🎉",
    ] }),
  ]},
];

const INFO = [
  { icon: "📱", title: "Zo werkt je app", items: [
    "Tik op een training: je ziet precies wat je doet en waarom.",
    "Klaar? Vul je afstand en tijd in en vink hem af. Zo zie je je voortgang groeien.",
    "Kan een week niet? Schuif alles een week op met de knop bij het schema, of zet een vakantie in je planning. Je marathon blijft natuurlijk op 14 maart staan.",
  ]},
  { icon: "🎯", title: "Je doel, eerlijk bekeken", items: [
    "Doel 1 is de hele marathon lopen. Je liep in april al een halve aan één stuk, dus de basis is er.",
    "Doel 2 is rond de 4 uur. Dat is 5:41 per kilometer, 42 km lang. Met twee loopdagen per week is dat ambitieus, maar niet onmogelijk.",
    "De 10 km tijdrit in januari (week 8) vertelt ons eerlijk wat erin zit. Daarna zet ik je tempo's bij.",
    "Twee keer per week is genoeg om de marathon uit te lopen. Voor rond de 4 uur is het krap. Heb je vanaf januari tijd en zin, dan helpt een derde rustige loop van 30 tot 40 minuten echt. Het hoeft niet.",
  ]},
  { icon: "🧠", title: "Waarom dit schema werkt", items: [
    "De lange duurloop is de basis. Die groeit van 12 naar 32 km, met kleine stappen van zo'n 2 km per keer. Zo krijgen je spieren, pezen en botten de tijd om mee te groeien.",
    "Elke vierde week is een rustweek (week 4, 8 en 12). Je wordt sterker als je lichaam kan herstellen, niet tijdens de training zelf.",
    "Je loopt één keer 30 km (week 11) en één keer 32 km (week 13). Na die twee weet je lijf én je hoofd dat 42 km gaat lukken. De laatste 10 km op de dag zelf loop je op adrenaline en publiek.",
    "Ongeveer 80% van je kilometers is rustig. Dat bouwt je uithoudingsvermogen zonder dat je moe of geblesseerd raakt.",
    "Doordeweeks train je specifiek: eerst vlot en stevig om sterker te worden, vanaf januari op marathontempo. Zo wordt 5:40 per kilometer vertrouwd.",
    "In week 14 loop je 10 km op marathontempo in een lange loop. Dat is je generale: lukt dat, dan zit je goed.",
    "De laatste twee weken bouw je af. Minder kilometers, wel nog even op tempo. Zo sta je fris én scherp aan de start.",
    "Elke lange loop oefen je met eten en drinken. Veel marathons gaan mis op energie, niet op conditie. Jij hebt dat dan al tien keer geoefend.",
  ]},
  { icon: "✅", title: "Zo haal je het zeker", items: [
    "De lange duurloop in het weekend sla je nooit over. Is het weekend vol? Schuif hem dan naar maandag, en maak de doordeweekse training die week kort.",
    "Mis je toch een lange loop? Dan loop je de volgende week niet ineens veel verder. Neem de afstand van de gemiste week en ga daarna weer verder met het schema.",
    "Rustig is echt rustig. De grootste valkuil is je lange loop te snel lopen. Dan ben je moe voor de volgende training en loop je meer kans op blessures.",
    "Ziek of iets opspelen rond de 30 of 32 km? Laat het me meteen weten, dan passen we het samen aan. Er zit genoeg ruimte in het schema.",
    "Na week 8 en na week 14 kijken we samen naar je tijden. Dan zetten we je tempo's bij, zodat je op 14 maart precies goed start.",
  ]},
  { icon: "🗓️", title: "Zo werkt je week", items: [
    "Je loopt twee keer per week: één keer doordeweeks en één keer in het weekend. Wanneer precies kies je zelf.",
    "Doordeweeks past je loop mooi vóór 10:00, of in je pauze tussen 14:00 en 16:00.",
    "In het weekend loop je je lange duurloop. Dat is de belangrijkste training van je week: die sla je nooit over.",
    "Laat minstens één dag zitten tussen je twee trainingen.",
    "Mis je er een? Niet inhalen, gewoon verder met de volgende.",
  ]},
  { icon: "🏋️‍♀️", title: "Sportschool en hardlopen", items: [
    "Blijf lekker gaan! Kracht maakt je sterker op het eind van de marathon en helpt blessures voorkomen.",
    "Twee keer is top, één keer is genoeg. Kies dan voor benen en romp: squats, lunges, deadlifts, kuitheffen en een plank.",
    "Geen zware beentraining de dag vóór je lange loop. De dag erna mag wel.",
    "Vanaf maart (week 15 en 16) alleen nog licht trainen, en de laatste vier dagen voor de marathon niet meer.",
  ]},
  { icon: "🌡️", title: "Wat betekent RPE?", items: [
    "RPE staat bij je trainingen en zegt hoe zwaar iets mag voelen, op een schaal van 1 tot 10. 1 is op de bank zitten, 10 is alles geven wat je hebt.",
    "RPE 3-4, rustig en lange duurloop: je voelt dat je loopt, maar hele zinnen lukken nog.",
    "RPE 5-6, marathontempo: lekker doorlopen, praten gaat nog, maar niet meer zo makkelijk.",
    "RPE 6-7, stevig: het kost moeite, je kunt nog korte zinnen zeggen.",
    "RPE 8, vlot: zwaar, er komen nog maar een paar woorden uit.",
    "Je gevoel telt mee: bij wind, kou of een drukke dag loop je op gevoel in plaats van op je horloge.",
  ]},
  { icon: "🍌", title: "Eten en drinken onderweg", items: [
    "Langer dan een uur lopen: neem drinken mee.",
    "Vanaf 15 km: na een uur een gelletje of wat snoepjes, daarna elke 30 à 40 minuten.",
    "Oefen dit bij elke lange loop. Je maag moet er ook aan wennen, en op de marathon wil je geen verrassingen.",
    "Na een lange loop helpt iets met koolhydraten en eiwit, zoals yoghurt met banaan of een boterham met kaas.",
    "De laatste twee dagen voor de marathon eet je wat meer koolhydraten: pasta, rijst, brood.",
  ]},
  { icon: "👟", title: "Schoenen en kleding", items: [
    "Loop je marathon op schoenen die je al kent, met minstens 50 km erop. Nieuwe schoenen op de dag zelf is vragen om blaren.",
    "Liep je in april ook al op dit paar? Kijk of ze nog goed zijn. Na zo'n 600 à 800 km zijn ze vaak op.",
    "Draag op je 32 km precies wat je op de marathon aantrekt.",
  ]},
  { icon: "🌙", title: "Lopen in de winter", items: [
    "Jouw schema loopt precies door de donkere maanden. Reflectie of een lampje is geen luxe.",
    "Trek een laag minder aan dan je denkt. Na 10 minuten heb je het warm.",
    "Muts en handschoenen maken een groot verschil.",
    "Glad? Dan loop je rustig op een veilige route, of je schuift je training een dag.",
  ]},
  { icon: "🩹", title: "Als er iets opspeelt", items: [
    "Spierpijn na een lange loop is normaal.",
    "Pijn die je looppas verandert: wandelen. Gaat het niet weg, stoppen.",
    "Scheenbenen, knie of achillespees die blijven zeuren: een paar dagen rust en laat het me weten.",
    "Ziek of koorts: niet lopen. Daarna rustig de draad weer oppakken.",
  ]},
  { icon: "😴", title: "Herstel en slaap", items: [
    "Je wordt sterker tussen je trainingen, niet tijdens.",
    "Goed slapen doet meer dan een extra kilometer.",
    "Drukke week? Maak de doordeweekse training korter. Je lange loop in het weekend probeer je altijd te houden.",
  ]},
];

const BADGES = [
  { id: "first",   icon: "👟", name: "Begonnen",          desc: "1 training afgevinkt",       test: (s) => s.done >= 1 },
  { id: "week",    icon: "✅", name: "Week compleet",     desc: "Een hele week afgerond",     test: (s) => s.fullWeeks >= 1 },
  { id: "tien",    icon: "🔟", name: "Dubbele cijfers",   desc: "10 km in één training",      test: (s) => s.maxDist >= 10 },
  { id: "tijdrit", icon: "⏱️", name: "Getest",            desc: "10 km tijdrit gelopen",      test: (s) => s.tijdritDone },
  { id: "halve",   icon: "🌗", name: "Halve marathon",    desc: "21,1 km in één training",    test: (s) => s.maxDist >= 21 },
  { id: "streak",  icon: "🔥", name: "Op dreef",          desc: "Reeks van 8 trainingen",     test: (s) => s.streak >= 8 },
  { id: "half",    icon: "⚡", name: "Halverwege",        desc: "50% van je schema",          test: (s) => s.done >= s.total / 2 },
  { id: "dertig",  icon: "🌟", name: "30 km",             desc: "Je eerste 30 km gelopen",    test: (s) => s.maxDist >= 30 },
  { id: "tweedertig", icon: "💪", name: "32 km",          desc: "Je langste loop gedaan",     test: (s) => s.maxDist >= 32 },
  { id: "km300",   icon: "🚀", name: "300 km",            desc: "300 km totaal gelopen",      test: (s) => s.km >= 300 },
  { id: "marathon",icon: "🏅", name: "Marathonloper",     desc: "De hele marathon gelopen",   test: (s) => s.raceDone },
  { id: "vieruur", icon: "💜", name: "Rond de 4 uur",     desc: "Marathon in 4:05 of sneller", test: (s) => s.vierUur },
];

/* ================================================================== *
 *  State
 * ================================================================== */
const LEGACY_KEYS = CONFIG.legacyKeys || [];

function leesSleutel(k) {
  try { const v = JSON.parse(localStorage.getItem(k)); return v && typeof v === "object" ? v : null; }
  catch { return null; }
}
function aantalSessies(o) { return o ? Object.keys(o).filter((k) => /^w\d+-/.test(k)).length : 0; }
function samenvoegen(hoofd, extra) { return { ...extra, ...hoofd }; }

/* Voortgang laden. Staat er iets onder een oudere opslagsleutel, dan nemen we
   dat over, zodat niemand zijn afgevinkte trainingen kwijtraakt. */
function loadLog() {
  let uit = leesSleutel(STORE_KEY) || {};
  const eigen = aantalSessies(uit);
  LEGACY_KEYS.forEach((k) => {
    const oud = leesSleutel(k);
    if (aantalSessies(oud)) uit = samenvoegen(uit, oud);
  });
  if (aantalSessies(uit) > eigen) {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(uit)); } catch {}
  }
  return uit;
}
function saveLog() {
  log.__saved = Date.now();
  try { localStorage.setItem(STORE_KEY, JSON.stringify(log)); } catch {}
  idbZet(log);
  renderLaatstOpgeslagen();
}

/* ----- Tweede back-up in IndexedDB ---------------------------------- *
 *  localStorage kan door de browser worden opgeruimd. Elke opslag gaat
 *  daarom ook naar IndexedDB; bij opstarten halen we terug wat vollediger is.
 * -------------------------------------------------------------------- */
const IDB_NAAM = "bartlopen-runcoach", IDB_STORE = "logs";
function idbOpen() {
  return new Promise((ok, nee) => {
    if (!window.indexedDB) return nee(new Error("geen indexedDB"));
    const r = indexedDB.open(IDB_NAAM, 1);
    r.onupgradeneeded = () => {
      if (!r.result.objectStoreNames.contains(IDB_STORE)) r.result.createObjectStore(IDB_STORE);
    };
    r.onsuccess = () => ok(r.result);
    r.onerror = () => nee(r.error);
  });
}
async function idbZet(data) {
  try {
    const db = await idbOpen();
    await new Promise((ok, nee) => {
      const t = db.transaction(IDB_STORE, "readwrite");
      t.objectStore(IDB_STORE).put(JSON.parse(JSON.stringify(data)), STORE_KEY);
      t.oncomplete = ok; t.onerror = () => nee(t.error);
    });
  } catch {}
}
async function idbHaal() {
  try {
    const db = await idbOpen();
    return await new Promise((ok, nee) => {
      const t = db.transaction(IDB_STORE, "readonly");
      const q = t.objectStore(IDB_STORE).get(STORE_KEY);
      q.onsuccess = () => ok(q.result || null);
      q.onerror = () => nee(q.error);
    });
  } catch { return null; }
}
function herstelUitBackup() {
  return idbHaal().then((kopie) => {
    if (!kopie) { idbZet(log); return false; }
    if (aantalSessies(kopie) > aantalSessies(log)) {
      log = samenvoegen(log, kopie);
      saveLog(); renderAll();
      toast("Je voortgang is teruggehaald 🔄");
      return true;
    }
    idbZet(log);
    return false;
  }).catch(() => false);
}
function renderLaatstOpgeslagen() {
  const el = document.getElementById("lastSaved");
  if (!el) return;
  const t = log.__saved;
  if (!t) { el.textContent = ""; return; }
  const d = new Date(t), pad = (n) => String(n).padStart(2, "0");
  el.textContent = `Laatst opgeslagen: ${d.getDate()}-${pad(d.getMonth() + 1)} om ${pad(d.getHours())}:${pad(d.getMinutes())} · ${aantalSessies(log)} trainingen ingevuld`;
}
let log = loadLog();

const sid = (week, day) => `w${week}-${day}`;
const flatSessions = PLAN.flatMap((w) => w.sessions.map((s) => ({ ...s, week: w.week })));
const totalSessions = flatSessions.length;
const LAST_SESSION = flatSessions[flatSessions.length - 1];
/* Vaste ankers, zodat behaalde badges niet verschuiven als er weken bijkomen. */
const TIJDRIT_SESSION = { week: 8, day: "d2" }; /* 10 km tijdrit, half januari */
const MARATHON_SESSION = { week: 16, day: "zo" }; /* de marathon, zo 14 maart 2027 */
/* Laatste dag waarop een training nog op tijd is: doordeweeks t/m vrijdag, weekend t/m zondag. */
const DAY_OFFSET = { ma: 0, di: 1, wo: 2, do: 3, vr: 4, za: 5, zo: 6, d1: 4, d2: 6 };

const escapeHtml = (value = "") => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#039;");

function dateAtDay(dayIndex) {
  const date = new Date(schedStartMs());
  date.setDate(date.getDate() + dayIndex);
  date.setHours(12, 0, 0, 0);
  return date;
}

function sessionDate(week, day) {
  return dateAtDay((week - 1) * 7 + (DAY_OFFSET[day] ?? 0));
}

function isoDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function planningEntries() {
  return Array.isArray(log.__planning) ? log.__planning : [];
}

function planningForWeek(week) {
  const start = isoDate(dateAtDay((week - 1) * 7));
  const end = isoDate(dateAtDay((week - 1) * 7 + 6));
  return planningEntries().filter((entry) => entry.start <= end && (entry.end || entry.start) >= start);
}

function parseTime(str) {
  if (!str) return null;
  const parts = String(str).split(":").map((p) => parseInt(p, 10));
  if (parts.some((n) => Number.isNaN(n))) return null;
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return parts[0] * 60;
}

function durationParts(str) {
  const total = parseTime(str) || 0;
  return { minutes: Math.floor(total / 60), seconds: total % 60 };
}

function durationValue(minutes, seconds) {
  const m = Math.max(0, parseInt(minutes, 10) || 0);
  const s = Math.min(59, Math.max(0, parseInt(seconds, 10) || 0));
  return `${m}:${String(s).padStart(2, "0")}`;
}
function paceSeconds(distance, timeStr) {
  const d = parseFloat(String(distance).replace(",", "."));
  const sec = parseTime(timeStr);
  if (!d || !sec) return null;
  return sec / d;
}
function fmtPace(perKm) {
  if (!perKm) return null;
  const m = Math.floor(perKm / 60);
  const s = Math.round(perKm % 60);
  return `${m}:${String(s).padStart(2, "0")} /km`;
}

/* Afgeleide statistieken uit de log */
function computeStats() {
  let done = 0, km = 0, maxDist = 0, maxTime = 0, bestPace = 0, secs = 0, raceDone = false, vierUur = false;
  flatSessions.forEach((s) => {
    const e = log[sid(s.week, s.day)];
    if (!e || !e.done) return;
    done++;
    const d = parseFloat(String(e.distance || "").replace(",", ".")) || 0;
    km += d;
    if (d > maxDist) maxDist = d;
    const t = parseTime(e.time) || 0;
    secs += t;
    if (t > maxTime) maxTime = t;
    const p = paceSeconds(e.distance, e.time);
    if (p && (bestPace === 0 || p < bestPace)) bestPace = p;
    if (s.week === MARATHON_SESSION.week && s.day === MARATHON_SESSION.day) {
      raceDone = true;
      if (t > 0 && t <= 4 * 3600 + 5 * 60) vierUur = true;
    }
  });
  let streak = 0, run = 0;
  flatSessions.forEach((s) => {
    const e = log[sid(s.week, s.day)];
    if (e && e.done) { run++; streak = Math.max(streak, run); } else run = 0;
  });
  let fullWeeks = 0;
  PLAN.forEach((w) => {
    if (w.sessions.every((s) => log[sid(w.week, s.day)]?.done)) fullWeeks++;
  });
  const klaar = (a) => !!log[sid(a.week, a.day)]?.done;
  const tijdritDone = klaar(TIJDRIT_SESSION);
  return { done, total: totalSessions, km, maxDist, maxTime, bestPace, secs, raceDone, vierUur, tijdritDone, streak, fullWeeks };
}

function currentWeek() {
  const diff = Math.floor((Date.now() - schedStartMs()) / (7 * 864e5));
  /* Uit PLAN afleiden, niet uit TOTAL_WEEKS: anders blijft de huidige week
     hangen op de oude laatste week zodra er weken bijkomen. */
  return Math.min(PLAN[PLAN.length - 1].week, Math.max(1, diff + 1));
}

/* ================================================================== *
 *  Rendering
 * ================================================================== */
const $ = (id) => document.getElementById(id);

function animateCount(el, to, suffix = "") {
  const dur = 700, t0 = performance.now();
  const dec = to % 1 !== 0;
  function step(t) {
    const k = Math.min(1, (t - t0) / dur);
    const v = to * (1 - Math.pow(1 - k, 3));
    el.textContent = (dec ? v.toFixed(1).replace(".", ",") : Math.round(v)) + suffix;
    if (k < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

function renderHero(stats) {
  $("runnerName").textContent = RUNNER;
  $("goalText").textContent = GOAL;
  const pct = Math.round((stats.done / stats.total) * 100);
  $("ringPct").textContent = `${pct}%`;
  const r = 52, c = 2 * Math.PI * r;
  const fg = $("ringFg");
  fg.style.strokeDasharray = c;
  fg.style.strokeDashoffset = c;
  requestAnimationFrame(() => { fg.style.strokeDashoffset = c * (1 - pct / 100); });
  const mottos = CONFIG.mottos || ["Zet 'm op, strijder!", "Lekker bezig, strijder!", "Je bouwt 'm rustig op, strijder.", "Halverwege, knap volgehouden! ⚡", "Bijna race-klaar, strijder!", "Finisher! Wat een prestatie, strijder. 🏅"];
  $("heroMotto").textContent =
    stats.raceDone ? mottos[5] : pct >= 80 ? mottos[4] : pct >= 50 ? mottos[3] : pct >= 20 ? mottos[2] : pct > 0 ? mottos[1] : mottos[0];
  renderCountdown();
  renderSubgoal();
}

function raceTarget() {
  /* Het eerstvolgende doel dat nog moet komen. Gelopen = datum voorbij óf afgevinkt.
     Via dateAtDay rekenen, niet met milliseconden: dat schuift bij de zomertijd. */
  const vandaag = new Date().setHours(0, 0, 0, 0);
  const datumVan = (w) => {
    const d = w.sessions[w.sessions.length - 1].day;
    return dateAtDay((w.week - 1) * 7 + (DAY_OFFSET[d] ?? 6)).setHours(0, 0, 0, 0);
  };
  const doelen = PLAN.filter((w) => w.race || w.finish || w.tuneup);
  const gelopen = (w) => {
    const d = w.sessions[w.sessions.length - 1].day;
    return datumVan(w) < vandaag || !!log[sid(w.week, d)]?.done;
  };
  const volgende = doelen.find((w) => !gelopen(w));
  const rw = volgende || doelen[doelen.length - 1] || PLAN[PLAN.length - 1];
  const rs = rw.sessions[rw.sessions.length - 1];
  return { rw, rs, date: new Date(datumVan(rw)), allesGelopen: !volgende };
}

function raceInfo() {
  const { rs, date, allesGelopen } = raceTarget();
  const days = Math.round((new Date(date).setHours(0, 0, 0, 0) - new Date().setHours(0, 0, 0, 0)) / 864e5);
  return { days: allesGelopen ? -1 : days, name: rs.countdown || rs.title.replace(/^[^\p{L}\d]+/u, "").trim() };
}

const NL_DAG = ["zondag", "maandag", "dinsdag", "woensdag", "donderdag", "vrijdag", "zaterdag"];
const NL_MAAND = ["januari", "februari", "maart", "april", "mei", "juni", "juli", "augustus", "september", "oktober", "november", "december"];
function renderSubgoal() {
  const el = document.querySelector(".hero-subgoal");
  if (!el) return;
  const { rw, rs, date, allesGelopen } = raceTarget();
  const d = new Date(date);
  const voorbij = allesGelopen || new Date(date).setHours(12, 0, 0, 0) < new Date().setHours(0, 0, 0, 0);
  const soort = rw.race ? "🏁 Doelrace" : rw.finish ? "🎉 Mijlpaal" : "🎯 Tussendoel";
  /* Flexibele trainingen hebben geen vaste dag: dan noemen we de week. */
  const ma = dateAtDay((rw.week - 1) * 7);
  const wanneer = /^d\d+$/.test(rs.day)
    ? `week van ${ma.getDate()} ${NL_MAAND[ma.getMonth()]}`
    : `${NL_DAG[d.getDay()]} ${d.getDate()} ${NL_MAAND[d.getMonth()]}`;
  const kop = `${voorbij ? "🎉 Gelopen" : soort} · ${wanneer}`;
  el.innerHTML = `<span>${kop}</span><strong>${rw.raceSub || rs.title.replace(/^[^\p{L}\d]+/u, "").trim()}</strong>`;
}

function renderCountdown() {
  const motto = $("heroMotto");
  if (!motto) return;
  let el = $("raceCountdown");
  if (!el) {
    el = document.createElement("p");
    el.id = "raceCountdown";
    el.className = "hero-countdown";
    motto.after(el);
  }
  const { days, name } = raceInfo();
  const wks = Math.round(days / 7), mon = Math.round(days / 30);
  el.textContent =
    days > 180 ? `🗓️ jouw grote doel: over ~${mon} maanden, ${name}` :
    days > 14 ? `🗓️ nog ${wks} weken tot je ${name}` :
    days > 1 ? `🗓️ nog ${days} dagen tot je ${name}` :
    days === 1 ? `🗓️ morgen is het zover: ${name}!` :
    days === 0 ? `🔥 vandaag is het zover: ${name}!` :
    `🎉 ${name} volbracht, chapeau!`;
}

function renderStats(stats) {
  animateCount($("statDone"), stats.done);
  animateCount($("statKm"), Math.round(stats.km * 10) / 10, " km");
  animateCount($("statStreak"), stats.streak);
  const cw = currentWeek();
  const wk = PLAN.find((w) => w.week === cw);
  const wkDone = wk.sessions.filter((s) => log[sid(cw, s.day)]?.done).length;
  $("statWeek").textContent = `${wkDone}/${wk.sessions.length}`;
}

function renderNextUp() {
  const cw = currentWeek();
  const next =
    flatSessions.find((s) => s.week >= cw && !log[sid(s.week, s.day)]?.done) ||
    flatSessions.find((s) => !log[sid(s.week, s.day)]?.done);
  const box = $("nextUp");
  if (!next) {
    box.innerHTML = `<div class="nextup-card done"><span class="nextup-eyebrow">🏅 Schema compleet</span><strong>Alles afgevinkt, chapeau, ${RUNNER}!</strong></div>`;
    return;
  }
  const z = zoneByKey[next.zone];
  box.innerHTML = `
    <button class="nextup-card zone-${next.zone}" data-week="${next.week}" data-day="${next.day}">
      <span class="nextup-eyebrow">Volgende training · week ${next.week} · ${next.dayLabel}</span>
      <strong>${next.title}</strong>
      <span class="nextup-meta">${nlNum(next[UNIT])} ${UNIT_LABEL} · ${z.name}</span>
      <span class="nextup-go">Openen ›</span>
    </button>`;
  box.querySelector(".nextup-card").addEventListener("click", () => openDetail(next.week, next.day));
}

const PLANNING_META = {
  race: {
    icon: "🏁", label: "Tussentijdse race",
    advice: "Laat deze race je lange training vervangen. Houd de training ervoor rustig en plan daarna minimaal één hersteldag.",
  },
  vacation: {
    icon: "🌴", label: "Vakantie",
    advice: "Gemiste trainingen hoef je niet in te halen. Pak bij thuiskomst de eerstvolgende rustige training op.",
  },
  rest: {
    icon: "🩹", label: "Rust / blessure",
    advice: "Herstel gaat voor het schema. Hervat pas pijnvrij en bouw de eerste week extra rustig op.",
  },
};

function formatPlanDate(value) {
  if (!value) return "";
  const date = new Date(`${value}T12:00:00`);
  return date.toLocaleDateString("nl-NL", { day: "numeric", month: "short", year: "numeric" });
}

function renderPlanning() {
  const list = $("planningList");
  if (!list) return;
  const entries = [...planningEntries()].sort((a, b) => a.start.localeCompare(b.start));
  if (!entries.length) {
    list.innerHTML = `<div class="planning-empty"><span>🗓️</span><p>Nog niets gepland. Voeg een vakantie of oefenwedstrijd toe zodra je die weet.</p></div>`;
    return;
  }
  list.innerHTML = entries.map((entry) => {
    const meta = PLANNING_META[entry.type] || PLANNING_META.rest;
    const period = entry.end && entry.end !== entry.start
      ? `${formatPlanDate(entry.start)} – ${formatPlanDate(entry.end)}`
      : formatPlanDate(entry.start);
    return `<article class="planning-item plan-${entry.type}">
      <span class="planning-icon">${meta.icon}</span>
      <div class="planning-copy">
        <span class="planning-type">${meta.label} · ${period}</span>
        <strong>${escapeHtml(entry.title)}</strong>
        ${entry.note ? `<p>${escapeHtml(entry.note)}</p>` : ""}
        <p class="planning-advice"><b>Coachadvies:</b> ${meta.advice}</p>
      </div>
      <button class="planning-remove" type="button" data-plan-id="${escapeHtml(entry.id)}" aria-label="${escapeHtml(entry.title)} verwijderen">×</button>
    </article>`;
  }).join("");
  list.querySelectorAll(".planning-remove").forEach((button) => {
    button.addEventListener("click", () => {
      log.__planning = planningEntries().filter((entry) => entry.id !== button.dataset.planId);
      saveLog();
      renderAll();
      toast("Uit je planning verwijderd");
    });
  });
}

function renderZones() {
  $("zonesList").innerHTML = ZONES.map((z) => `
    <div class="zone-row zone-${z.key}">
      <span class="zone-dot"></span>
      <div class="zone-main"><strong>${z.name}</strong><span>${z.info}</span></div>
      <span class="zone-pace">${z.pace}${ZONE_SUFFIX ? `<small>${ZONE_SUFFIX}</small>` : ""}</span>
    </div>`).join("");
}

function renderChart() {
  const volumeSub = document.querySelector("#volumeChart")?.closest(".panel")?.querySelector(".panel-sub");
  if (volumeSub) volumeSub.textContent = `${(typeof UNIT !== "undefined" ? UNIT : "min") === "min" ? "minuten" : "kilometers"} · gepland · gedaan`;
  const cwBar = currentWeek();
  const max = Math.max(...PLAN.map((w) => w.sessions.reduce((n, s) => n + s[UNIT], 0)));
  $("volumeChart").innerHTML = PLAN.map((w) => {
    const planned = w.sessions.reduce((n, s) => n + s[UNIT], 0);
    const doneMin = w.sessions.reduce((n, s) => n + (log[sid(w.week, s.day)]?.done ? s[UNIT] : 0), 0);
    const h = Math.round((planned / max) * 100);
    const fill = planned ? Math.round((doneMin / planned) * 100) : 0;
    const cls = ((w.race || w.tuneup || w.finish) ? "is-race" : w.recovery ? "is-rest" : "") + (w.week === cwBar ? " is-now" : "");
    return `
      <div class="bar ${cls}" title="Week ${w.week}: ${nlNum(Math.round(planned * 10) / 10)} ${UNIT_LABEL} gepland">
        <div class="bar-track" style="height:${h}%">
          <div class="bar-fill" style="height:${fill}%"></div>
        </div>
        <span class="bar-x">${w.week}</span>
      </div>`;
  }).join("");
}

function tagOf(w) {
  if (w.finish) return `<span class="week-tag tag-race">Finale</span>`;
  if (w.race) return `<span class="week-tag tag-race">Raceweek</span>`;
  if (w.tuneup) return `<span class="week-tag tag-tuneup">${w.tuneupTag || "Wedstrijd"}</span>`;
  if (w.recovery) return `<span class="week-tag tag-rest">Herstel</span>`;
  if (w.taper) return `<span class="week-tag tag-taper">Taper</span>`;
  return "";
}

function renderWeeks() {
  const cw = currentWeek();
  const todayIso = isoDate(new Date());
  let html = "", lastPhase = "";
  PLAN.forEach((w, i) => {
    if (w.phase !== lastPhase) { html += `<h4 class="sub-phase reveal">${w.phase}</h4>`; lastPhase = w.phase; }
    const sess = w.sessions.map((s) => {
      const e = log[sid(w.week, s.day)] || {};
      const z = zoneByKey[s.zone];
      const pace = fmtPace(paceSeconds(e.distance, e.time));
      const bits = [];
      if (e.distance) bits.push(`${e.distance} km`);
      if (pace) bits.push(pace);
      if (e.hr) bits.push(`${e.hr} bpm`);
      const logged = bits.length ? `<span class="session-logged">📊 ${bits.join(" · ")}</span>` : "";
      const lastDay = w.sessions[w.sessions.length - 1].day;
      const isRaceSession = (w.race || w.tuneup || w.finish) && s.day === lastDay;
      const isToday = isoDate(sessionDate(w.week, s.day)) === todayIso;
      const raceKicker = isRaceSession
        ? `<span class="session-race-kicker">${w.raceLabel || (w.race ? "🏅 Doelrace" : w.tuneup ? "🏁 Wedstrijd" : "🏁 Finale")}</span>`
        : "";
      const isFlexibleSlot = /^d\d+$/.test(s.day);
      const badgeLabel = isFlexibleSlot ? s.day.slice(1) : s.dayLabel.slice(0, 2);
      return `
        <button class="session zone-${s.zone} ${isRaceSession ? "is-race-session" : ""} ${e.done ? "is-done" : ""} ${isToday ? "is-today" : ""}" data-week="${w.week}" data-day="${s.day}">
          <span class="session-day ${isFlexibleSlot ? "is-slot" : ""}" title="${s.dayLabel}">${isRaceSession ? "<small>🏁</small>" : ""}${badgeLabel}</span>
          <span class="session-body">
            ${raceKicker}
            <span class="session-title">${s.title}${isToday ? ' <span class="today-badge">Vandaag</span>' : ""}</span>
            <span class="session-meta">${nlNum(s[UNIT])} ${UNIT_LABEL} · ${s.kind}</span>
            ${logged}
          </span>
          <span class="session-check">${e.done ? "✓" : ""}</span>
        </button>`;
    }).join("");
    const weekPlans = planningForWeek(w.week);
    const planStrip = weekPlans.length ? `<div class="week-planning">${weekPlans.map((entry) => {
      const meta = PLANNING_META[entry.type] || PLANNING_META.rest;
      return `<span>${meta.icon} ${escapeHtml(entry.title)}</span>`;
    }).join("")}</div>` : "";
    html += `
      <article class="week-card reveal ${w.tuneup ? "is-tuneup-week" : ""} ${w.race ? "is-goal-race-week" : ""} ${w.week === cw ? "is-current" : ""} ${w.week < cw ? (w.sessions.every((x) => log[sid(w.week, x.day)]?.done) ? "is-complete" : "is-missed") : ""}" style="--i:${i % 4}">
        <header class="week-head">
          <div><span class="week-no">Week ${w.week}</span><span class="week-dates">${weekDateLabel(w)}</span></div>
          ${w.week === cw ? `<span class="week-tag tag-now">Nu</span>` : w.week < cw ? (w.sessions.every((x) => log[sid(w.week, x.day)]?.done) ? `<span class="week-tag tag-done">✓ af</span>` : `<span class="week-tag tag-missed">gemist</span>`) : tagOf(w)}
        </header>
        ${planStrip}
        ${w.note ? `<p class="week-note">${w.note}</p>` : ""}
        <div class="session-list">${sess}</div>
      </article>`;
  });
  $("weeksList").innerHTML = html;
  /* Koppen altijd kloppend met het schema */
  const schemaKop = [...document.querySelectorAll(".phase-head")].find((e) => /Het schema/.test(e.textContent));
  if (schemaKop) schemaKop.textContent = `Het schema · ${PLAN.length} weken`;
  $("weeksList").querySelectorAll(".session").forEach((b) =>
    b.addEventListener("click", () => openDetail(+b.dataset.week, b.dataset.day)));
  observeReveals();
}

function renderBadges(stats) {
  $("badgeGrid").innerHTML = BADGES.map((b) => {
    const got = b.test(stats);
    return `
      <div class="badge ${got ? "got" : "locked"}" title="${b.desc}">
        <span class="badge-icon">${got ? b.icon : "🔒"}</span>
        <strong>${b.name}</strong>
        <span class="badge-desc">${b.desc}</span>
      </div>`;
  }).join("");
}

function renderInfo() {
  /* Open kaarten blijven open als de lijst opnieuw wordt getekend. */
  const open = new Set([...document.querySelectorAll("#infoList details[open]")].map((d) => d.dataset.i));
  const eerste = !document.querySelector("#infoList details");
  $("infoList").innerHTML = INFO.map((c, i) => `
    <details class="info-card" data-i="${i}" ${(eerste && i === 0) || open.has(String(i)) ? "open" : ""}>
      <summary><span class="info-icon">${c.icon}</span><span class="info-title">${c.title}</span></summary>
      <ul>${c.items.map((t) => `<li>${t}</li>`).join("")}</ul>
    </details>`).join("");
}

/* ----- Snelknop: gelijk naar je trainingen ------------------------------ */
function renderNaarTrainingen() {
  const hero = document.querySelector("#listView .hero");
  if (!hero) return;
  let btn = document.getElementById("naarTrainingen");
  if (!btn) {
    btn = document.createElement("button");
    btn.id = "naarTrainingen";
    btn.type = "button";
    btn.className = "naar-trainingen";
    btn.addEventListener("click", naarTrainingen);
    hero.insertAdjacentElement("afterend", btn);
  }
  const cw = currentWeek();
  const laatste = PLAN[PLAN.length - 1].week;
  const volgende = flatSessions.find((s) => s.week >= cw && !log[sid(s.week, s.day)]?.done);
  const sub = volgende
    ? `Week ${cw} van ${laatste} · volgende: ${volgende.title.replace(/^[^\p{L}\d]+/u, "").trim()}`
    : `Week ${cw} van ${laatste} · bekijk je schema`;
  const emoji = (typeof CONFIG !== "undefined" && CONFIG.footEmoji) || "🏃";
  btn.setAttribute("aria-label", `Gelijk naar je trainingen. ${sub}`);
  btn.innerHTML = `<span class="nt-icoon" aria-hidden="true">${emoji}</span>` +
    `<span class="nt-tekst"><strong>Gelijk naar je trainingen</strong><small>${escapeHtml(sub)}</small></span>` +
    `<span class="nt-pijl" aria-hidden="true">↓</span>`;
}
function naarTrainingen() {
  const doel = document.querySelector(".week-card.is-current") || document.querySelector(".weeks");
  if (!doel) return;
  doel.classList.add("in");
  const bar = document.querySelector(".topbar");
  const y = doel.getBoundingClientRect().top + window.scrollY - (bar ? bar.offsetHeight : 0) - 8;
  window.scrollTo({ top: Math.max(0, y), behavior: "smooth" });
}

function addJumpButton() {
  const head = document.querySelector(".weeks .phase-head");
  if (!head || document.getElementById("jumpNow")) return;
  const btn = document.createElement("button");
  btn.id = "jumpNow";
  btn.type = "button";
  btn.className = "jump-now";
  btn.textContent = "Naar deze week ↓";
  btn.addEventListener("click", () =>
    document.querySelector(".week-card.is-current")?.scrollIntoView({ behavior: "smooth", block: "start" }));
  head.insertAdjacentElement("afterend", btn);
}

/* ----- Extra's: begroeting, records, consistentie ------------------- */
function greetingWord() {
  const h = new Date().getHours();
  return h < 6 ? "Goedenacht" : h < 12 ? "Goedemorgen" : h < 18 ? "Goedemiddag" : "Goedenavond";
}
function renderGreeting() {
  const copy = document.querySelector(".hero-copy");
  if (!copy) return;
  let el = document.getElementById("heroGreeting");
  if (!el) {
    el = document.createElement("p");
    el.id = "heroGreeting";
    el.className = "hero-greeting";
    copy.insertBefore(el, copy.firstChild);
  }
  el.textContent = `${greetingWord()}, ${RUNNER.split(" ")[0]} 👋`;
}
function renderRecords(stats) {
  const anchor = document.querySelector(".weeks");
  if (!anchor) return;
  let sec = document.getElementById("recordsPanel");
  if (!sec) {
    sec = document.createElement("section");
    sec.id = "recordsPanel";
    sec.className = "panel reveal";
    anchor.parentNode.insertBefore(sec, anchor);
  }
  const pace = fmtPace(stats.bestPace);
  const longest = UNIT === "min"
    ? (stats.maxTime ? `${Math.round(stats.maxTime / 60)} min` : "–")
    : (stats.maxDist ? `${nlNum(stats.maxDist)} km` : "–");
  const totaalMin = stats.secs ? `${Math.round(stats.secs / 60)} min` : "–";
  const rows = UNIT === "min"
    ? [
        stats.bestPace ? ["⚡ Snelste tempo", pace] : ["✅ Trainingen gedaan", String(stats.done)],
        ["⏱️ Langste loop", longest],
        ["📊 Totaal gelopen", totaalMin],
        ["🔥 Langste reeks", String(stats.streak)],
      ]
    : [
        ["⚡ Snelste tempo", pace || "–"],
        ["🏔️ Verste loop", longest],
        ["📊 Totaal gelopen", `${nlNum(Math.round(stats.km * 10) / 10)} km`],
        ["🔥 Langste reeks", String(stats.streak)],
      ];
  sec.innerHTML = `<h3 class="panel-head">Jouw records</h3>
    <div class="records">${rows.map(([l, v]) =>
      `<div class="record"><span class="record-val">${v}</span><span class="record-label">${l}</span></div>`).join("")}</div>`;
}
function renderConsistency() {
  const grid = document.querySelector(".stats-grid");
  if (!grid) return;
  let sec = document.getElementById("consistencyStrip");
  if (!sec) {
    sec = document.createElement("section");
    sec.id = "consistencyStrip";
    sec.className = "panel consistency-panel reveal";
    grid.parentNode.insertBefore(sec, grid.nextSibling);
  }
  const todayIso = isoDate(new Date());
  const cw = currentWeek();
  let done = 0, total = 0;
  const cols = PLAN.map((w) => {
    const cells = w.sessions.map((s) => {
      const e = log[sid(w.week, s.day)] || {};
      const dIso = isoDate(sessionDate(w.week, s.day));
      total++;
      if (e.done) done++;
      const cls = e.done ? "is-done" : dIso < todayIso ? "is-missed" : "is-todo";
      return `<span class="ccell ${cls}${dIso === todayIso ? " is-today" : ""}" title="Week ${w.week} \u00b7 ${s.dayLabel}"></span>`;
    }).join("");
    return `<div class="cweek${w.week === cw ? " is-current" : ""}"><div class="ccells">${cells}</div><span class="cweek-no">${w.week}</span></div>`;
  }).join("");
  const pct = total ? Math.round((done / total) * 100) : 0;
  sec.innerHTML = `
    <h3 class="panel-head">Consistentie <span class="panel-sub">elk blokje is een training</span></h3>
    <div class="cweeks">${cols}</div>
    <div class="cons-foot">
      <div class="cons-legend"><span><i class="ck ck-done"></i>afgerond</span><span><i class="ck ck-missed"></i>gemist</span><span><i class="ck ck-todo"></i>komt nog</span></div>
      <span class="cons-score"><strong>${done}/${total}</strong> gedaan \u00b7 ${pct}%</span>
    </div>`;
}

/* ----- Schema opschuiven (drukke week) ------------------------------ */
const NL_MND = ["jan", "feb", "mrt", "apr", "mei", "jun", "jul", "aug", "sep", "okt", "nov", "dec"];
function weekOffset() { return (log && log.__weekOffset) || 0; }
function schedStartMs() { return START_DATE.getTime() + weekOffset() * 7 * 864e5; }
function weekDateLabel(w) {
  if (!weekOffset()) return w.dates;
  const mon = dateAtDay((w.week - 1) * 7), sun = dateAtDay((w.week - 1) * 7 + 6);
  return `${mon.getDate()} ${NL_MND[mon.getMonth()]}–${sun.getDate()} ${NL_MND[sun.getMonth()]}`;
}
function renderShiftControl() {
  const head = document.querySelector(".weeks .phase-head");
  if (!head) return;
  let el = document.getElementById("shiftControl");
  if (!el) {
    el = document.createElement("div");
    el.id = "shiftControl";
    el.className = "shift-control reveal";
    head.insertAdjacentElement("afterend", el);
  }
  const off = weekOffset();
  const wk = (n) => `${n} week${n > 1 ? "en" : ""}`;
  el.innerHTML = off > 0
    ? `<div class="shift-copy"><strong>Schema ${wk(off)} opgeschoven</strong><span>Je hele schema loopt nu ${wk(off)} langer. Niks staat op gemist.</span></div><div class="shift-btns"><button id="shiftMore" type="button">Nog een week</button><button id="shiftReset" type="button" class="ghost">Ongedaan maken</button></div>`
    : `<div class="shift-copy"><strong>Drukke week gehad?</strong><span>Schuif je hele schema een week op, dan raak je niks kwijt.</span></div><div class="shift-btns"><button id="shiftMore" type="button">Schuif 1 week op ↦</button></div>`;
  el.querySelector("#shiftMore").addEventListener("click", () => {
    if (!confirm("Je hele schema een week opschuiven?\n\nAlle trainingen schuiven mee. Je kunt dit altijd terugzetten.")) return;
    log.__weekOffset = weekOffset() + 1; saveLog(); renderAll();
    toast("Schema een week opgeschoven 📅");
  });
  const rs = el.querySelector("#shiftReset");
  if (rs) rs.addEventListener("click", () => {
    log.__weekOffset = 0; saveLog(); renderAll();
    toast("Opschuiven ongedaan gemaakt");
  });

  /* Duidelijke melding bovenaan: een per ongeluk verschoven schema moet je
     meteen zien, niet pas als je ver naar beneden scrollt. */
  const hero = document.querySelector(".hero");
  let notice = document.getElementById("shiftNotice");
  if (off > 0 && hero) {
    if (!notice) {
      notice = document.createElement("div");
      notice.id = "shiftNotice";
      notice.className = "shift-notice";
      hero.insertAdjacentElement("afterend", notice);
    }
    notice.innerHTML = `<div class="shift-copy"><strong>\u{1F4C5} Je schema staat ${wk(off)} opgeschoven</strong><span>Daardoor sta je ${wk(off)} eerder in je schema dan de kalender. Klopt dat niet? Zet het gewoon terug.</span></div><div class="shift-btns"><button id="noticeReset" type="button">Zet terug</button></div>`;
    notice.querySelector("#noticeReset").addEventListener("click", () => {
      log.__weekOffset = 0; saveLog(); renderAll();
      toast("Schema teruggezet \u{1F4C5}");
    });
  } else if (notice) {
    notice.remove();
  }
}

function renderAll() {
  const stats = computeStats();
  renderHero(stats);
  renderNaarTrainingen();
  renderStats(stats);
  renderGreeting();
  renderConsistency();
  renderNextUp();
  renderPlanning();
  renderChart();
  renderZones();
  renderWeeks();
  addJumpButton();
  renderShiftControl();
  renderBadges(stats);
  renderRecords(stats);
  renderInfo();
  observeReveals();
}

/* ----- Detailweergave ------------------------------------------------ */
function openDetail(week, day) {
  const w = PLAN.find((x) => x.week === week);
  const s = w.sessions.find((x) => x.day === day);
  /* Alleen de wedstrijd zelf is een wedstrijd, niet de andere trainingen in die week. */
  const isRaceDetail = (w.race || w.tuneup || w.finish) && s.day === w.sessions[w.sessions.length - 1].day;
  const id = sid(week, day);
  const e = log[id] || {};
  const z = zoneByKey[s.zone];
  const enteredTime = durationParts(e.time);

  $("detailTitle").textContent = `Week ${week} · ${s.dayLabel}`;
  $("detailBody").innerHTML = `
    <div class="detail-hero zone-${s.zone}">
      <span class="detail-kind">${s.kind} · ${nlNum(s[UNIT])} ${UNIT_LABEL}</span>
      <h2>${s.title}</h2>
      <p class="detail-goal">${s.goal}</p>
      <span class="detail-zone">${z.name} · ${z.info}</span>
    </div>

    <div class="coach-bubble">
      <div class="coach-ava">
        <img src="${CONFIG.coachPhoto}" alt="${CONFIG.coachName}" onerror="this.style.display='none'">
        <span>${COACH_INITIAL}</span>
      </div>
      <div class="coach-text">
        <strong>${CONFIG.coachName} <span class="coach-handle">${CONFIG.coachHandle}</span></strong>
        <p>${coachLine(s.zone)}</p>
      </div>
    </div>

    <section class="detail-block why">
      <h4>${isRaceDetail ? (s.kind === "Testloop" ? "Waarom deze testloop" : w.finish ? "Waarom deze mijlpaal" : "Waarom deze wedstrijd") : "Waarom deze training"}</h4>
      <p>${s.why || WHY[s.zone] || ""}</p>
    </section>

    <section class="detail-block">
      <h4>Opbouw</h4>
      <ol class="block-list">${s.blocks.map((b) => `<li>${b}</li>`).join("")}</ol>
    </section>

    <section class="detail-block">
      <h4>${isRaceDetail ? (s.kind === "Testloop" ? "Invullen na je testloop" : w.finish ? "Invullen na je mijlpaal" : "Invullen na de wedstrijd") : "Invullen na de training"}</h4>
      <div class="form-grid">
        <label>Afstand (km)
          <input id="fDistance" type="text" inputmode="decimal" placeholder="bv. 6,2" value="${escapeHtml(e.distance ?? "")}">
        </label>
        <label>Tijd
          <span class="duration-input">
            <input id="fTimeMinutes" type="number" inputmode="numeric" min="0" max="999" placeholder="36" value="${enteredTime.minutes || ""}" aria-label="Minuten">
            <span>min</span>
            <input id="fTimeSeconds" type="number" inputmode="numeric" min="0" max="59" placeholder="30" value="${enteredTime.seconds || ""}" aria-label="Seconden">
            <span>sec</span>
          </span>
        </label>
        <label class="full">Gemiddeld tempo
          <output id="fPace" class="pace-out">${fmtPace(paceSeconds(e.distance, e.time)) || "–"}</output>
        </label>
        <label>Hartslag (bpm)
          <input id="fHr" type="number" inputmode="numeric" placeholder="bv. 152" value="${escapeHtml(e.hr ?? "")}">
        </label>
        <label>Gevoel / zwaarte
          <select id="fFeel">
            ${["", "1 · heel licht", "2 · licht", "3 · prima", "4 · pittig", "5 · zwaar"]
              .map((o) => `<option value="${o}" ${String(e.feel ?? "") === o ? "selected" : ""}>${o || "Kies…"}</option>`).join("")}
          </select>
        </label>
        <label class="full">Notitie
          <textarea id="fNote" rows="2" placeholder="Hoe ging het?">${escapeHtml(e.note ?? "")}</textarea>
        </label>
      </div>
    </section>

    <div class="detail-actions">
      <button id="toggleDone" class="btn-primary ${e.done ? "is-done" : ""}">${e.done ? "✓ Gedaan" : "Markeer als gedaan"}</button>
      <button id="saveSession" class="btn-ghost">Opslaan</button>
    </div>`;

  const readTime = () => {
    if (!$("fTimeMinutes").value && !$("fTimeSeconds").value) return "";
    return durationValue($("fTimeMinutes").value, $("fTimeSeconds").value);
  };
  const recalc = () => ($("fPace").textContent = fmtPace(paceSeconds($("fDistance").value, readTime())) || "–");
  $("fDistance").addEventListener("input", recalc);
  $("fTimeMinutes").addEventListener("input", recalc);
  $("fTimeSeconds").addEventListener("input", () => {
    if (+$("fTimeSeconds").value > 59) $("fTimeSeconds").value = "59";
    recalc();
  });

  const collect = () => ({
    ...log[id],
    distance: $("fDistance").value.trim(),
    time: readTime(),
    hr: $("fHr").value.trim(),
    feel: $("fFeel").value,
    note: $("fNote").value.trim(),
  });

  $("saveSession").addEventListener("click", () => {
    log[id] = collect(); saveLog();
    toast("Opgeslagen 💾");
    closeDetail();
  });
  $("toggleDone").addEventListener("click", () => {
    const cur = collect();
    cur.done = !cur.done;
    log[id] = cur; saveLog();
    if (cur.done) {
      celebrate();
      toast(!isRaceDetail
        ? DONE[Math.floor(Math.random() * DONE.length)]
        : s.kind === "Testloop"
          ? "⏱️ Genoteerd! Coach Bart kijkt mee."
          : "🏅 Marathon gelopen! Wat een strijder, Myrthe!");
    }
    closeDetail();
  });

  showView("detail");
}

function closeDetail() { renderAll(); showView("list"); }

function showView(name) {
  const list = $("listView"), detail = $("detailView"), back = $("backButton");
  if (name === "detail") {
    list.classList.add("hidden");
    detail.classList.remove("hidden");
    requestAnimationFrame(() => detail.classList.add("is-in"));
    back.classList.remove("hidden");
    window.scrollTo(0, 0);
  } else {
    detail.classList.remove("is-in");
    back.classList.add("hidden");
    setTimeout(() => {
      detail.classList.add("hidden");
      list.classList.remove("hidden");
      window.scrollTo(0, 0);
    }, 280);
  }
}

/* ----- Invliegende beelden -------------------------------------------- */
let io, initialRevealDone = false;
function observeReveals() {
  // Na de eerste keer: nieuw getekende blokken meteen tonen (geen her-animatie bij navigeren)
  if (initialRevealDone) {
    document.querySelectorAll(".reveal:not(.in)").forEach((el) => el.classList.add("in"));
    return;
  }
  io = io || new IntersectionObserver((entries) => {
    entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
  }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
  document.querySelectorAll(".reveal:not(.in)").forEach((el) => io.observe(el));
}

/* ----- Toast ----------------------------------------------------------- */
let toastT;
function toast(msg) {
  const t = $("toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toastT);
  toastT = setTimeout(() => t.classList.remove("show"), 2200);
}

/* ----- Confetti --------------------------------------------------------- */
function celebrate() {
  const cv = $("confetti");
  const ctx = cv.getContext("2d");
  cv.width = innerWidth; cv.height = innerHeight;
  const cs = getComputedStyle(document.documentElement);
  const colors = ["--volt", "--flame", "--pastel-blue", "--violet"]
    .map((v) => cs.getPropertyValue(v).trim()).filter(Boolean).concat("#ffffff");
  const parts = Array.from({ length: 140 }, () => ({
    x: innerWidth / 2, y: innerHeight / 3,
    vx: (Math.random() - 0.5) * 14, vy: Math.random() * -16 - 4,
    s: Math.random() * 7 + 4, c: colors[(Math.random() * colors.length) | 0],
    r: Math.random() * Math.PI, vr: (Math.random() - 0.5) * 0.4,
  }));
  let frame = 0;
  (function loop() {
    frame++;
    ctx.clearRect(0, 0, cv.width, cv.height);
    parts.forEach((p) => {
      p.vy += 0.45; p.x += p.vx; p.y += p.vy; p.r += p.vr;
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r);
      ctx.fillStyle = p.c; ctx.fillRect(-p.s / 2, -p.s / 2, p.s, p.s * 0.6);
      ctx.restore();
    });
    if (frame < 120) requestAnimationFrame(loop);
    else ctx.clearRect(0, 0, cv.width, cv.height);
  })();
}

/* ================================================================== *
 *  Init
 * ================================================================== */
/* Branding uit CONFIG zetten (zodat templaten makkelijk is) */
document.title = `${CONFIG.appName}, ${CONFIG.coachHandle}`;
if ($("appName")) $("appName").textContent = CONFIG.appName;
if ($("brandHandle")) $("brandHandle").textContent = CONFIG.coachHandle;
if ($("footCredit")) {
  $("footCredit").innerHTML =
    `<span class="catch">${CONFIG.catchphrase}</span>` +
    `Coaching door ${CONFIG.coachName} · TikTok <strong>${CONFIG.coachHandle}</strong> ${CONFIG.footEmoji || "🏃\u200d♀️"}`;
}

function setPlanningForm(open) {
  const form = $("planningForm");
  const toggle = $("togglePlanningForm");
  form.classList.toggle("hidden", !open);
  toggle.setAttribute("aria-expanded", String(open));
  toggle.textContent = open ? "× Sluiten" : "＋ Toevoegen";
  if (open && !$("planStart").value) $("planStart").value = isoDate(new Date());
}

$("togglePlanningForm").addEventListener("click", () => {
  setPlanningForm($("planningForm").classList.contains("hidden"));
});
$("cancelPlanning").addEventListener("click", () => setPlanningForm(false));
$("planningForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const start = $("planStart").value;
  const end = $("planEnd").value || start;
  if (end < start) {
    toast("De einddatum ligt vóór de startdatum");
    return;
  }
  const entry = {
    id: `plan-${Date.now()}`,
    type: $("planType").value,
    title: $("planTitle").value.trim(),
    start,
    end,
    note: $("planNote").value.trim(),
  };
  log.__planning = [...planningEntries(), entry];
  saveLog();
  $("planningForm").reset();
  setPlanningForm(false);
  renderAll();
  toast("Toegevoegd aan je schema 🗓️");
});

$("backButton").addEventListener("click", closeDetail);
$("resetButton").addEventListener("click", () => {
  if (confirm("Alle ingevulde voortgang wissen?")) { log = {}; saveLog(); renderAll(); toast("Voortgang gewist"); }
});

/* ----- Back-up: exporteren / importeren ------------------------------- */
function downloadJSON(filename, obj) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([JSON.stringify(obj, null, 2)], { type: "application/json" }));
  a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

function downloadText(filename, text, type) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([text], { type }));
  a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

function icsEscape(value) {
  return String(value || "")
    .replaceAll("\\", "\\\\")
    .replaceAll(/\r?\n/g, "\\n")
    .replaceAll(",", "\\,")
    .replaceAll(";", "\\;");
}

function icsDay(value) {
  const date = typeof value === "string" ? new Date(`${value}T12:00:00`) : value;
  return isoDate(date).replaceAll("-", "");
}

function addDays(value, amount) {
  const date = typeof value === "string" ? new Date(`${value}T12:00:00`) : new Date(value);
  date.setDate(date.getDate() + amount);
  return date;
}

function calendarFile() {
  const stamp = new Date().toISOString().replaceAll(/[-:]/g, "").replace(/\.\d{3}/, "");
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "PRODID:-//bartlopen//Run Coach//NL",
    `X-WR-CALNAME:${icsEscape(CONFIG.appName)} · ${icsEscape(RUNNER)}`,
  ];
  flatSessions.forEach((session) => {
    const date = sessionDate(session.week, session.day);
    const z = zoneByKey[session.zone];
    lines.push(
      "BEGIN:VEVENT",
      `UID:${sid(session.week, session.day)}-${icsDay(date)}@bartlopen.nl`,
      `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${icsDay(date)}`,
      `DTEND;VALUE=DATE:${icsDay(addDays(date, 1))}`,
      `SUMMARY:${icsEscape(`${CONFIG.footEmoji || "🏃\u200d♀️"} ${session.title}`)}`,
      `DESCRIPTION:${icsEscape(`${nlNum(session[UNIT])} ${UNIT_LABEL} · ${z.name}\n${session.goal}\n\n${session.blocks.join("\n")}`)}`,
      "TRANSP:TRANSPARENT",
      "END:VEVENT",
    );
  });
  planningEntries().forEach((entry) => {
    const meta = PLANNING_META[entry.type] || PLANNING_META.rest;
    lines.push(
      "BEGIN:VEVENT",
      `UID:${icsEscape(entry.id)}@bartlopen.nl`,
      `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${icsDay(entry.start)}`,
      `DTEND;VALUE=DATE:${icsDay(addDays(entry.end || entry.start, 1))}`,
      `SUMMARY:${icsEscape(`${meta.icon} ${entry.title}`)}`,
      `DESCRIPTION:${icsEscape(`${entry.note ? `${entry.note}\n\n` : ""}Coachadvies: ${meta.advice}`)}`,
      "TRANSP:TRANSPARENT",
      "END:VEVENT",
    );
  });
  lines.push("END:VCALENDAR");
  return `${lines.join("\r\n")}\r\n`;
}
$("exportBtn").addEventListener("click", () => {
  downloadJSON(`${CONFIG.appName.replace(/\s+/g, "-")}-voortgang.json`, {
    app: "bartlopen-runcoach", storeKey: STORE_KEY, runner: RUNNER,
    exportedAt: new Date().toISOString(), log,
  });
  toast("Back-up opgeslagen ⬇︎");
});
$("importBtn").addEventListener("click", () => $("importFile").click());
$("importFile").addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);
      const incoming = data && data.log ? data.log : data;
      if (!incoming || typeof incoming !== "object") throw new Error("ongeldig");
      log = { ...log, ...incoming };
      saveLog(); renderAll();
      toast("Back-up geladen ⬆︎, welkom terug!");
    } catch {
      toast("Kon dit bestand niet lezen");
    }
    e.target.value = "";
  };
  reader.readAsText(file);
});

$("calendarBtn").addEventListener("click", () => {
  downloadText(`${CONFIG.appName.replace(/\s+/g, "-")}-schema.ics`, calendarFile(), "text/calendar;charset=utf-8");
  toast("Agenda-bestand staat klaar 🗓️");
});

$("pdfBtn").addEventListener("click", () => {
  document.body.classList.add("print-schema");
  const cleanup = () => document.body.classList.remove("print-schema");
  window.addEventListener("afterprint", cleanup, { once: true });
  window.print();
  setTimeout(cleanup, 1500);
});

/* Alles tekenen */
renderAll();
renderLaatstOpgeslagen();
herstelUitBackup();
/* Na de intro-animatie geen her-fade meer; failsafe die alles zeker toont */
setTimeout(() => { initialRevealDone = true; }, 900);
setTimeout(() => document.querySelectorAll(".reveal:not(.in)").forEach((el) => el.classList.add("in")), 1600);

/* Intro-splash netjes weg laten faden (tikken slaat 'm over) */
(function () {
  const splash = $("splash");
  if (!splash) return;
  const hide = () => splash.classList.add("gone");
  setTimeout(hide, 1100);
  splash.addEventListener("click", hide);
  setTimeout(() => splash.remove(), 1700);
})();

/* Service worker voor offline gebruik (alleen op http/https, niet via file://) */
if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
  /* Auto-verversen: nieuwe versie neemt over -> pagina herlaadt zichzelf een keer */
  const hadController = !!navigator.serviceWorker.controller;
  let autoReloaded = false;
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (!hadController || autoReloaded) return;
    autoReloaded = true;
    window.location.reload();
  });
  navigator.serviceWorker.register("sw.js").catch(() => {});
}

/* Vraag de browser om je voortgang echt te bewaren. Zonder dit mag een
   browser opgeslagen gegevens opruimen als er ruimte nodig is, en dan ben
   je je afgevinkte trainingen kwijt. */
if (navigator.storage && navigator.storage.persist) {
  navigator.storage.persisted()
    .then((al) => (al ? true : navigator.storage.persist()))
    .catch(() => {});
}
