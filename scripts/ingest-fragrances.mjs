
import { createClient } from '@sanity/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables manually
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '../.env');

if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf8');
    envConfig.split('\n').forEach(line => {
        const [key, ...values] = line.split('=');
        if (key && values.length > 0) {
            const val = values.join('=').trim();
            process.env[key.trim()] = val;
        }
    });
}

const client = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
    token: process.env.SANITY_API_WRITE_TOKEN, // Use write token
    apiVersion: '2024-01-01',
    useCdn: false,
});

const data = {
    "territories": [
        {
            "_id": "territory-ember",
            "_type": "territory",
            "name": "EMBER",
            "slug": { "_type": "slug", "current": "ember" },
            "tagline": "The Intimacy of Ancient Routes",
            "description": "Spice. Warmth. The memory of caravans. Ember fragrances evoke the heat of distant markets, the amber glow of incense, the particular sweetness of places where the sun has permission to linger.",
            "keywords": ["Spice", "Warmth", "Incense", "Amber", "Resin"],
            "order": 1
        },
        {
            "_id": "territory-petal",
            "_type": "territory",
            "name": "PETAL",
            "slug": { "_type": "slug", "current": "petal" },
            "tagline": "The Exhale of Living Gardens",
            "description": "Bloom. Herb. The intelligence of green things. Petal fragrances capture flowers at their most alive, not the dried arrangements of potpourri but the wet vitality of gardens at dawn.",
            "keywords": ["Bloom", "Herb", "Floral", "Fresh", "Green"],
            "order": 2
        },
        {
            "_id": "territory-tidal",
            "_type": "territory",
            "name": "TIDAL",
            "slug": { "_type": "slug", "current": "tidal" },
            "tagline": "The Pull of Open Water",
            "description": "Salt. Mist. The liminal edge where land surrenders. Tidal fragrances occupy the threshold between solid and liquid, between knowing and dissolving.",
            "keywords": ["Salt", "Mist", "Aquatic", "Fresh", "Marine"],
            "order": 3
        },
        {
            "_id": "territory-terra",
            "_type": "territory",
            "name": "TERRA",
            "slug": { "_type": "slug", "current": "terra" },
            "tagline": "The Gravity of Deep Forests",
            "description": "Wood. Oud. The gravity of rooted things. Terra fragrances carry weight, not heaviness but substance, the kind of presence that comes from standing in forests older than human memory.",
            "keywords": ["Wood", "Oud", "Leather", "Earthy", "Musk"],
            "order": 4
        }
    ],
    "fragrances": [
        // =====================
        // EMBER TERRITORY (1-7)
        // =====================
        {
            "name": "ADEN",
            "legacyName": "Oud Fire",
            "territory": "territory-ember",
            "order": 1,
            "evocationPoint": { "location": "Aden, Yemen", "coordinates": "12.7797° N, 45.0365° E" },
            "evocation": ["Some cities exist as much in memory as in stone. Aden rises from volcanic rock at the throat of the Red Sea, a port that once moved more frankincense than any place on earth.", "This fragrance captures that threshold feeling: the moment a ship enters harbor after months at sea. Scorched sweetness. Resinous warmth. The sense that fire transforms rather than destroys.", "ADEN is an atmosphere, not a postcard. The oud at its center burns with volcanic energy, unapologetic and alive. But beneath the blaze lives something tender, honeyed, almost gentle."],
            "onSkin": ["Bergamot opens bright against geranium, while pink pepper adds spark. The heart unfolds into ambergris and patchouli, with violet tempering the warmth. The base grounds everything in clean musk, precious agarwood, and vanilla.", "This is oud rendered approachable. The initial brightness giving way to something unexpectedly tender. A warmth that clings to skin like whispered secrets."],
            "sillage": "Intimate yet present",
            "longevity": "8+ hours",
            "season": "Autumn fires, winter hearths",
            "notes": { "top": "Bergamot, Pink Pepper, Geranium", "heart": "Ambergris, Patchouli, Violet", "base": "Musk, Agarwood, Vanilla" },
            "fieldReport": { "concept": "A weathered copper vessel catches amber light through latticed shadows. Raw oud chips rest on a brass tray beside a sealed glass vial. Smoke curls from somewhere unseen.", "hotspots": [{ "_key": "h1", "item": "copper vessel", "meaning": "Traditional rendering tool" }, { "_key": "h2", "item": "amber light", "meaning": "Late afternoon, port city" }, { "_key": "h3", "item": "oud chips", "meaning": "The raw before the refined" }] }
        },
        {
            "name": "SAANA",
            "legacyName": "Honey Oud",
            "territory": "territory-ember",
            "order": 2,
            "evocationPoint": { "location": "Sana'a, Yemen", "coordinates": "15.3694° N, 44.1910° E" },
            "evocation": ["Sana'a sits at 2,300 meters above sea level, one of the oldest continuously inhabited cities on earth. Its tower houses rise like gingerbread fortresses, decorated in white gypsum lace against ochre stone. The air here is thinner, cooler, sweetened by altitude.", "Wild honey from the Yemeni highlands is among the most prized in the world, dark, resinous, almost medicinal in its complexity. Beekeepers carry their hives on donkeyback through mountain passes where frankincense trees cling to cliff faces and golden oud smoke drifts from every window.", "SAANA captures that marriage of sweetness and elevation. Honey not as confection but as sacrament, the golden thread that connects the hive to the hearth, the mountain to the market, the ancient to the eternal."],
            "onSkin": ["Golden honey meets precious agarwood in an opening that feels ancient and inevitable. Cinnamon warms while leather adds depth. Jasmine provides an unexpected floral brightness at the heart.", "Warm without being cloying, rich without being heavy. Vanilla and amber wrap the base in golden comfort while patchouli grounds everything. The kind of scent that makes strangers lean closer."],
            "sillage": "Moderate, inviting",
            "longevity": "10+ hours",
            "season": "Year-round comfort",
            "notes": { "top": "Honey, Floral Notes", "heart": "Cinnamon, Leather, Jasmine", "base": "Vanilla, Oud, Amber, Patchouli" },
            "fieldReport": { "concept": "A mountain honey market in the Yemeni highlands, clay jars of dark wild honey lined on stone shelves, golden light filtering through latticed tower windows. Oud smoke curling through the thin mountain air.", "hotspots": [{ "_key": "h1", "item": "clay honey jars", "meaning": "Sweetness earned by altitude" }, { "_key": "h2", "item": "latticed window", "meaning": "Sana'a's ancient geometry" }, { "_key": "h3", "item": "oud smoke", "meaning": "The sacred and the daily, intertwined" }] }
        },
        {
            "name": "GRANADA",
            "legacyName": "Granada Amber",
            "territory": "territory-ember",
            "order": 3,
            "evocationPoint": { "location": "Albaicín, Granada, Spain", "coordinates": "37.1773° N, 3.5986° W" },
            "evocation": ["The Albaicín climbs the hill opposite the Alhambra, its white walls and hidden gardens a living record of Moorish Granada. Walk these alleys in evening and the old quarter reveals what it holds.", "GRANADA captures that specific warmth, amber in its truest sense. Not bright, not sharp, but deep and enveloping. Essentially liquid amber: warm, woody, sweet, substantial.", "The Moors called this place the last sigh. Beauty that knows its own impermanence, sweetness that contains its own shadow."],
            "onSkin": ["Warm amber opens immediately, no preamble, no apology. Deep, resinous, glowing from within. Woody notes provide structure while vanilla adds sweetness that never cloys. The amber accord persists and persists.", "It envelops you like the Albaicín climbing the hill opposite the Alhambra. A fragrance that seems to understand impermanence, beauty that releases gracefully, but leaves its warmth behind."],
            "sillage": "Soft, enveloping",
            "longevity": "8+ hours",
            "season": "Cool evenings, warm nights",
            "notes": { "top": "Warm Amber", "heart": "Woody Notes, Sweet Amber Accord", "base": "Vanilla, Deep Amber" },
            "fieldReport": { "concept": "Evening in the Albaicín. White walls catching the last amber light. Through an archway, the red towers of Alhambra in soft focus.", "hotspots": [{ "_key": "h1", "item": "white walls", "meaning": "Moorish geometry beneath the surface" }, { "_key": "h2", "item": "amber light", "meaning": "The glow of memory" }, { "_key": "h3", "item": "Alhambra shadow", "meaning": "The view from what was lost" }] }
        },
        {
            "name": "MALABAR",
            "legacyName": "Vanilla Sands",
            "territory": "territory-ember",
            "order": 4,
            "evocationPoint": { "location": "Malabar Coast, India", "coordinates": "11.2588° N, 75.7804° E" },
            "evocation": ["The monsoon has just broken and the coast exhales. Vanilla arrived on these shores centuries ago and never left — it found the warmth it needed, the humidity, the ancient rhythm of harvest and trade.", "The Malabar Coast invented the spice route, and the golden sweetness of benzoin and amber have been traded here since the Phoenicians first followed the current south. You wear it and the skin warms to something golden: caramelized, soft-edged, the olfactory equivalent of lantern light on warm stone.", "There is something generous about a coast that fed the world's appetite for flavor. MALABAR carries that same abundance: warm, enveloping, unhurried in its sweetness."],
            "onSkin": ["Vanilla arrives immediately — warm, golden, almost caramelized, the way vanilla meets amber and skin heat. Benzoin deepens the sweetness, adding a soft, balsamic warmth that keeps the vanilla grounded and wearable. Woody notes provide structure while the base settles into creamy amber, musk, and warm resins that cling close to the skin for hours.", "MALABAR is the one people ask you about. A scent that strips away noise and leaves only the essential — creamy warmth, golden sweetness, the quiet confidence of a fragrance that never raises its voice. It wears as well under linen in August as it does under wool in December."],
            "sillage": "Close, centering",
            "longevity": "10+ hours",
            "season": "Year-round, evening ritual",
            "notes": { "top": "Vanilla, Sweet Caramel", "heart": "Benzoin, Woody Notes", "base": "Amber, Musk, Warm Resins" },
            "fieldReport": { "concept": "A spice warehouse on the Malabar Coast, vanilla pods and pepper berries drying on wooden racks, monsoon light filtering through open shutters. The hum of a coast that has traded with the world for millennia.", "hotspots": [{ "_key": "h1", "item": "vanilla pods", "meaning": "Patient sweetness, sun-cured" }, { "_key": "h2", "item": "open shutters", "meaning": "The coast invites the world in" }, { "_key": "h3", "item": "monsoon light", "meaning": "Warm even through cloud" }] }
        },
        {
            "name": "SERENGETI",
            "legacyName": "Black Musk",
            "territory": "territory-ember",
            "order": 5,
            "evocationPoint": { "location": "Serengeti, Tanzania", "coordinates": "2.3333° S, 34.8333° E" },
            "evocation": ["When the sun drops below the Serengeti, the plain does not go quiet. It transforms. Night sounds replace day sounds. The grass holds the heat of afternoon while the sky opens into a darkness so complete the Milky Way casts shadows.", "SERENGETI captures the African plain after dark: dark musk rising from sun-warmed earth, resinous accords like acacia sap cooling in evening air. Something heady and primal moves through the heart of it, the sense of vast space and ancient rhythm.", "This is not wilderness romanticized. This is wilderness felt, the particular weight of standing in a landscape that was old before humans learned to walk upright."],
            "onSkin": ["Dark musk opens with immediate depth, no preamble, no apology. Resinous accords build through the heart, heady and substantial. The base settles into rustic musk and deep amber, warm as sun-baked savanna.", "SERENGETI is comfortable with its own mystery. Present without performing, powerful without explaining. For those who do not need to be understood to be confident."],
            "sillage": "Deep, substantial",
            "longevity": "10+ hours",
            "season": "Evening, winter, ceremony",
            "notes": { "top": "Dark Musk", "heart": "Resinous Accord, Heady Notes", "base": "Rustic Musk, Deep Amber" },
            "fieldReport": { "concept": "The Serengeti at blue hour, endless grass stretching to the horizon, a single acacia silhouette against a sky turning from copper to indigo. The first stars appearing as the plain exhales its heat.", "hotspots": [{ "_key": "h1", "item": "acacia silhouette", "meaning": "The sentinel of the savanna" }, { "_key": "h2", "item": "blue hour sky", "meaning": "The threshold between worlds" }, { "_key": "h3", "item": "first stars", "meaning": "The same sky our ancestors watched" }] }
        },
        {
            "name": "BEIRUT",
            "legacyName": null,
            "territory": "territory-ember",
            "order": 6,
            "evocationPoint": { "location": "Beirut, Lebanon", "coordinates": "33.8938° N, 35.5018° E" },
            "evocation": ["Beirut has been destroyed and rebuilt seven times. Each resurrection layers new beauty over old scars. Art Deco facades beside Ottoman arches, bullet-pocked walls draped in bougainvillea. The city treats survival as a creative act.", "BEIRUT captures that defiant glamour: blood mandarin and grapefruit open with the brightness of a rooftop bar overlooking the Mediterranean, mint cutting through warm night air. Cinnamon and rose bloom at the heart, the old Levant refusing to be forgotten. Leather and patchouli anchor the base with the gravitas of a city that has outlived every empire that tried to claim it.", "This is not nostalgia. This is the particular beauty that emerges when gold and rubble share the same street, when every celebration carries the memory of what was lost, and every loss contains the seed of what comes next."],
            "onSkin": ["Blood mandarin and grapefruit open with Mediterranean brightness, while mint adds a cool, sharp edge. Cinnamon and rose define the heart, warm, spiced, unmistakably Levantine. Leather and amber at the base give it staying power.", "A fragrance that dances between lightness and depth, between the rooftop party and the quiet street below. For those who understand that resilience is the most attractive quality a city, or a person, can possess."],
            "sillage": "Present, substantial",
            "longevity": "8+ hours",
            "season": "Warm evenings, year-round",
            "notes": { "top": "Blood Mandarin, Grapefruit, Mint", "heart": "Cinnamon, Rose, Spices", "base": "Leather, Patchouli, Amber" },
            "fieldReport": { "concept": "A Beirut rooftop at golden hour, fairy lights strung between concrete pillars, the Mediterranean glittering beyond. A table set with arak and mezze, bougainvillea spilling over a wall still bearing the marks of history.", "hotspots": [{ "_key": "h1", "item": "fairy lights", "meaning": "Beauty assembled from what remains" }, { "_key": "h2", "item": "Mediterranean glitter", "meaning": "The sea that connects everything" }, { "_key": "h3", "item": "bougainvillea wall", "meaning": "Growth over scars" }] }
        },
        {
            "name": "TARIFA",
            "legacyName": "Teeb Musk",
            "territory": "territory-ember",
            "order": 7,
            "evocationPoint": { "location": "Tarifa, Spain", "coordinates": "36.0143° N, 5.6044° W" },
            "evocation": ["Tarifa is the southernmost point of continental Europe, a windswept town where the Atlantic meets the Mediterranean and Africa is visible across fourteen kilometers of churning strait. This is where the Atlas map begins: the edge of one world, within sight of another.", "Stand on the Punta de Tarifa and you can see Morocco. The wind carries jasmine and salt in equal measure, white flowers bending in the Levante while fishing boats pitch in the current below. Everything here exists in transition, between continents, between seas, between the known and the imagined.", "TARIFA captures that threshold energy: soft white florals grounded by powdery warmth and green freshness. A scent that belongs to the moment before departure, when everything is possible and nothing has been decided."],
            "onSkin": ["White flowers and green accord open with the freshness of coastal wind, bright and clean. Jasmine blooms softly at the heart, not heavy, not narcotic, but gentle and luminous. Powdery notes and patchouli settle into the base with a quiet musk.", "A scent that feels like standing at the edge of something. Light enough to move, warm enough to stay. For the moment between deciding and doing."],
            "sillage": "Soft, luminous",
            "longevity": "6-8 hours",
            "season": "Spring, summer, transitional moments",
            "notes": { "top": "White Flowers, Green Accord", "heart": "Jasmine, Soft Floral", "base": "Powdery Notes, Patchouli, Musk" },
            "fieldReport": { "concept": "The Punta de Tarifa at dawn, whitewashed lighthouse at the edge of Europe, the coast of Morocco visible through morning haze. White wildflowers bending in the Levante wind, fishing nets drying on the rocks below.", "hotspots": [{ "_key": "h1", "item": "lighthouse", "meaning": "The point where the map begins" }, { "_key": "h2", "item": "Moroccan coast", "meaning": "Another world, close enough to touch" }, { "_key": "h3", "item": "wildflowers", "meaning": "Beauty that thrives on the edge" }] }
        },

        // =====================
        // PETAL TERRITORY (1-7)
        // =====================
        {
            "name": "CARMEL",
            "legacyName": "White Amber",
            "territory": "territory-petal",
            "order": 1,
            "evocationPoint": { "location": "Carmel-by-the-Sea, California", "coordinates": "36.5552° N, 121.9233° W" },
            "evocation": ["Carmel-by-the-Sea was built by artists and poets who wanted a village without sidewalks, without street numbers, where the trees had more rights than the buildings. Every cottage carries a name instead of an address, and the fog rolls in each evening like a benediction.", "There is a particular quality of light here, Pacific gold filtered through cypress and Monterey pine, that softens everything it touches. The air smells of white sage, ocean mist, and the faintest warmth of sun on weathered wood.", "CARMEL captures that quiet radiance: soft floral whispers opening into warm amber, woody notes providing the architecture of coastal cottages, clean musk settling like evening fog on skin. A scent for those who understand that the most luxurious places are often the most understated."],
            "onSkin": ["A soft floral whisper opens with the gentleness of coastal morning, barely there, entirely present. Warm amber blooms at the heart with woody notes that feel like sun-warmed driftwood. Clean musk and a light skin accord settle close.", "CARMEL does not announce. It invites. A fragrance that feels like cashmere against bare skin, like the last hour of golden light before the fog arrives."],
            "sillage": "Whisper-close, second-skin",
            "longevity": "All day",
            "season": "Year-round, daily wear",
            "notes": { "top": "Soft Floral Whisper", "heart": "Warm Amber, Woody Notes", "base": "Clean Musk, Light Skin Accord" },
            "fieldReport": { "concept": "A weathered cottage in Carmel, no street number, just a name carved into driftwood. Cypress trees framing a path to the sea. Evening fog beginning to curl through the pines.", "hotspots": [{ "_key": "h1", "item": "carved driftwood", "meaning": "Names instead of numbers" }, { "_key": "h2", "item": "cypress frame", "meaning": "Nature as architecture" }, { "_key": "h3", "item": "evening fog", "meaning": "The Pacific's daily gift" }] }
        },
        {
            "name": "TOBAGO",
            "legacyName": "Arabian Jasmine",
            "territory": "territory-petal",
            "order": 2,
            "evocationPoint": { "location": "Tobago", "coordinates": "11.1889° N, 60.6317° W" },
            "evocation": ["Tobago's rainforest is the oldest protected forest in the Western Hemisphere, a canopy so dense that jasmine vines climb toward any crack of sunlight, releasing their perfume in waves that intensify as the tropical dusk settles.", "The jasmine here is different from its Mediterranean cousin: wilder, headier, sweetened by humidity and the salt carried inland on trade winds. Night-blooming and narcotic, it fills the air with something confessional, beauty that has nothing to hide.", "TOBAGO captures jasmine at full power: intoxicating, slightly dangerous, impossible to ignore. Not the pressed-flower delicacy of a perfumer's lab, but the living vine climbing a rain-forest wall."],
            "onSkin": ["A very beautiful blend of jasmine and sambac opens with bright, fresh intensity, capturing the flower at its most intoxicating. Classic jasmine accords weave through, honeyed and narcotic.", "Intoxicating without apology. The kind of fragrance that changes the energy of a room without anyone knowing why."],
            "sillage": "Present, undeniable",
            "longevity": "10+ hours",
            "season": "Warm evenings, any time you need power",
            "notes": { "top": "Jasmine, Bright Fresh Accords", "heart": "Sambac, Jasmine Absolute", "base": "White Musk, Soft Woods" },
            "fieldReport": { "concept": "Jasmine vines climbing through the canopy of Tobago's oldest rainforest, white flowers glowing against dark green, the last light of day caught in their petals. Humid air thick with perfume.", "hotspots": [{ "_key": "h1", "item": "white blooms", "meaning": "Opening as the sun sets" }, { "_key": "h2", "item": "rainforest canopy", "meaning": "The oldest protected forest in the Americas" }, { "_key": "h3", "item": "humid air", "meaning": "Perfume amplified by the tropics" }] }
        },
        {
            "name": "MEDINA",
            "legacyName": "Musk Tahara",
            "territory": "territory-petal",
            "order": 3,
            "evocationPoint": { "location": "Medina, Saudi Arabia", "coordinates": "24.5247° N, 39.5692° E" },
            "evocation": ["In Arabic, tahara means purity, specifically, the ritual cleanliness required before prayer. A state of being more than a physical condition: clear-minded, clear-hearted, ready to approach the sacred.", "MEDINA captures that quality of readiness. This is musk stripped of all animal associations, all heaviness, all complexity. What remains is something like clean cotton, like a room aired after prayer.", "There is a specific kind of peace in simplicity. Not emptiness, but fullness that has been organized, clarified, made spacious. MEDINA offers that gift."],
            "onSkin": ["Powdery white musk opens with immediate softness, clean, pillowy, almost abstract. Light florals emerge gently: lily, violet, rose, never demanding attention.", "MEDINA does not fill space. It clears it. A scent that creates room rather than taking it up, that offers the specific peace of simplicity."],
            "sillage": "Soft, second-skin",
            "longevity": "All day",
            "season": "Year-round, daily ritual",
            "notes": { "top": "Powdery White Musk", "heart": "Light Florals, Lily, Violet, Rose", "base": "Very Subtle Vanilla, Light Musk" },
            "fieldReport": { "concept": "Morning light through a simple window. White linen, freshly laundered. A single bar of soap, unbranded. The moment after the bath, before the day begins.", "hotspots": [{ "_key": "h1", "item": "window light", "meaning": "Clean, unfiltered" }, { "_key": "h2", "item": "white linen", "meaning": "Simplicity as luxury" }, { "_key": "h3", "item": "soap bar", "meaning": "Essential, nothing more" }] }
        },
        {
            "name": "KANDY",
            "legacyName": "Peach Memoir",
            "territory": "territory-petal",
            "order": 4,
            "evocationPoint": { "location": "Kandy, Sri Lanka", "coordinates": "7.2906° N, 80.6337° E" },
            "evocation": ["The hills of Umbria roll green and gold through central Italy, softer than Tuscany, less discovered, holding their secrets closer. In summer, the orchards release a particular sweetness.", "KANDY captures that ephemeral sweetness. This is not the syrupy peach of candies, but the real fruit, slightly fuzzy, slightly tart, entirely sophisticated.", "There is something nostalgic here. Kid gloves and linen closets, letters tied with ribbon, the sense of being cared for by someone who knew exactly what mattered."],
            "onSkin": ["Peach and apple blossom open with sophisticated fruitiness, nothing cloying, everything real. Pineapple blossom adds an unexpected tropical whisper. Wild rose, clean musk, and patchouli at the base.", "A very beautiful, sophisticated peach scent. Slightly musky, slightly powdery. The quiet opulence of materials that reveal themselves only to those paying attention."],
            "sillage": "Close, intimate",
            "longevity": "8+ hours",
            "season": "Spring, summer, elegant occasions",
            "notes": { "top": "Peach, Apple Blossom", "heart": "Pineapple Blossom", "base": "Wild Rose, Musk, Patchouli" },
            "fieldReport": { "concept": "An orchard in Umbria, morning light filtering through leaves. A single perfect peach in focus, still on the branch. The moment before the picking.", "hotspots": [{ "_key": "h1", "item": "perfect peach", "meaning": "Ripeness as revelation" }, { "_key": "h2", "item": "filtered light", "meaning": "Umbria's soft mornings" }, { "_key": "h3", "item": "harvest basket", "meaning": "Gathering what matters" }] }
        },
        {
            "name": "SIWA",
            "legacyName": "White Egyptian Musk",
            "territory": "territory-petal",
            "order": 5,
            "evocationPoint": { "location": "Siwa Oasis, Egypt", "coordinates": "29.2032° N, 25.5195° E" },
            "evocation": ["On the banks of the Nile, where the Valley of the Kings holds its ancient dead and the Temple of Karnak still stands after four thousand years, the rituals of adornment have never really stopped.", "SIWA captures that daily devotion. This is white musk at its most elegant, clean and subtle. ISO E Super provides that woody, almost-not-there presence. Ambroxan adds its particular magic.", "A very beautiful skin scent that can be worn all day, every day. Not the musk of seduction or statement, but the musk of self-possession."],
            "onSkin": ["ISO E Super opens with characteristic woody transparency, there and not there, felt more than smelled. Light musk provides the softest foundation while Ambroxan adds unique radiance.", "A very beautiful skin scent that can be worn all day, every day. Clean and subtle, embodying the quiet elegance of ritual, the daily practice of adorning oneself with intention."],
            "sillage": "Whisper-close, second-skin",
            "longevity": "All day",
            "season": "Year-round, daily wear",
            "notes": { "top": "ISO E Super, Aldehydes", "heart": "Light Musk, Ambroxan", "base": "White Amber, Skin Musk" },
            "fieldReport": { "concept": "Morning light on ancient stone. A simple vessel of oil waiting. The moment of preparation, before the world begins its demands.", "hotspots": [{ "_key": "h1", "item": "oil vessel", "meaning": "The daily sacred" }, { "_key": "h2", "item": "morning light", "meaning": "Ritual as renewal" }, { "_key": "h3", "item": "ancient stone", "meaning": "Four thousand years of intention" }] }
        },
        {
            "name": "MANALI",
            "legacyName": "Himalayan Musk",
            "territory": "territory-petal",
            "order": 6,
            "evocationPoint": { "location": "Manali, India", "coordinates": "32.2396° N, 77.1887° E" },
            "evocation": ["Above 3,400 meters, the air thins and something changes. The mind quiets. Thoughts that seemed essential at sea level reveal themselves as noise.", "MANALI captures that ascent: very fresh and very breezy, like the Himalayan mountains. Airy and uplifting but not overwhelming, wears close to you.", "MANALI offers the same gift: a scent that strips away noise and leaves only what is essential, what is true, what survives the climb."],
            "onSkin": ["Fresh, crisp accords open with the immediacy of high altitude, clean, stripped of everything unnecessary. Cool musk and woody notes define the heart, airy and uplifting throughout.", "MANALI offers what mountains offer: the elimination of noise, the revelation of essence. For those who need to think more clearly, act more decisively."],
            "sillage": "Light, present",
            "longevity": "6-8 hours",
            "season": "Clarity moments, decision-making, new beginnings",
            "notes": { "top": "Fresh Crisp Accords", "heart": "Cool Musk, Woody Notes", "base": "Earthy Musk, Soft Incense" },
            "fieldReport": { "concept": "Prayer flags snapping in high wind. Snow peaks visible through clear, thin air. The simplicity of altitude.", "hotspots": [{ "_key": "h1", "item": "prayer flags", "meaning": "Words carried by wind" }, { "_key": "h2", "item": "snow peaks", "meaning": "The view from stripped-down" }, { "_key": "h3", "item": "clear air", "meaning": "Nothing hidden, nothing extra" }] }
        },
        {
            "name": "DAMASCUS",
            "legacyName": "Turkish Rose",
            "territory": "territory-petal",
            "order": 7,
            "evocationPoint": { "location": "Isparta, Turkey", "coordinates": "37.7556° N, 30.5566° E" },
            "evocation": ["Every May, the rose fields of Isparta bloom in waves of pink. But the roses must be harvested before dawn. Once the sun touches them, their precious oils begin to evaporate.", "DAMASCUS captures the rose at that hour: cool and dewy, not yet warmed by sun. This is not the jammy, overripe rose. It is cleaner, greener, with a sharpness that speaks of morning frost.", "The Damask rose has been cultivated for its oil for over a thousand years. DAMASCUS carries that lineage lightly, not as burden, but as blessing."],
            "onSkin": ["Rose otto and Bulgarian rose open with the freshness of dawn-picked petals, cool, dewy, still holding the chill of mountain night. Woody notes provide structure while fresh accords keep everything bright.", "There is a specific kind of freshness here that is hard to find in rose fragrances. It is the green stem as much as the pink petal, the dew as much as the bloom."],
            "sillage": "Radiant but refined",
            "longevity": "8+ hours",
            "season": "Spring awakening, crisp days",
            "notes": { "top": "Rose Otto, Fresh Accords", "heart": "Bulgarian Rose, Green Stem", "base": "Woody Notes, Clean Musk" },
            "fieldReport": { "concept": "Rose fields before dawn, rows of pink disappearing into darkness. A single bloom in focus, dew still clinging. The first hint of light on the eastern hills.", "hotspots": [{ "_key": "h1", "item": "dew-covered rose", "meaning": "The moment before sun" }, { "_key": "h2", "item": "eastern light", "meaning": "Minutes until harvest ends" }, { "_key": "h3", "item": "basket", "meaning": "Traditional gathering" }] }
        },

        // =====================
        // TIDAL TERRITORY (1-7)
        // =====================
        {
            "name": "BAHIA",
            "legacyName": "Coconut Jasmine",
            "territory": "territory-tidal",
            "order": 1,
            "evocationPoint": { "location": "Salvador, Bahia, Brazil", "coordinates": "12.9714° S, 38.5014° W" },
            "evocation": ["Salvador de Bahia is where Africa met the Americas and decided to stay. The city runs on candomblé rhythms and coconut water, its streets paved in Portuguese stone but its soul decidedly Yoruba.", "BAHIA captures that particular joy: coconut and jasmine, with vanilla warmth and frangipani's exotic sweetness. This is not a tropical cliché. It is more complex, more grounded.", "There is a specific kind of happiness that comes from places where cultures mix without hierarchy, where everything borrowed becomes something new."],
            "onSkin": ["Coconut opens creamy and fresh, joined immediately by vanilla's warm embrace. Jasmine adds heady sweetness while frangipani brings the tropics without cliché.", "This is not a tropical cliché. There is sophistication beneath the sunny exterior, complexity earned through the meeting of worlds."],
            "sillage": "Radiant, sunny",
            "longevity": "6-8 hours",
            "season": "Summer days, vacation energy, joy",
            "notes": { "top": "Coconut, Jasmine", "heart": "Vanilla, Frangipani", "base": "Very Light Musk" },
            "fieldReport": { "concept": "Cobblestone street in the Pelourinho, sun-dappled. Coconut and lime on a ceramic plate. Tropical flowers spilling from a window box. Drums distant but present.", "hotspots": [{ "_key": "h1", "item": "cobblestones", "meaning": "Portuguese foundation" }, { "_key": "h2", "item": "coconut", "meaning": "Africa's gift to Brazil" }, { "_key": "h3", "item": "distant drums", "meaning": "Axé in everything" }] }
        },
        {
            "name": "BAHRAIN",
            "legacyName": "Blue Oud",
            "territory": "territory-tidal",
            "order": 2,
            "evocationPoint": { "location": "Bahrain Pearl Diving Coast", "coordinates": "26.2041° N, 50.5515° E" },
            "evocation": ["Before oil, there was pearl. For four thousand years, Bahraini divers descended into the Gulf, holding their breath for minutes at a time, hunting oysters in waters so warm they were nearly body-temperature.", "The new Bahrain moves faster. Chrome speedboats cutting across the same waters where wooden dhows once drifted. BAHRAIN captures both: the ancient depth and the modern velocity.", "There is something meditative about going under. And there is something exhilarating about breaking the surface. BAHRAIN offers both: depth and velocity, patience and power."],
            "onSkin": ["Fresh ozonic notes open with immediate velocity, metallic, bright, the chrome of modern Gulf luxury. Woody notes provide structure, almost steel-like in their precision. Marine accords weave through.", "A fragrance that moves, from depth to surface, from contemplation to exhilaration. Very fresh, woody, with ozonic notes and marine accords."],
            "sillage": "Fresh, dynamic",
            "longevity": "8+ hours",
            "season": "Year-round, particularly summer",
            "notes": { "top": "Ozonic Notes, Metallic Accord", "heart": "Fresh Woods, Marine Accord", "base": "Warm Musk, Ambergris Accord" },
            "fieldReport": { "concept": "Split image: underwater light, golden and diffused, a pearl resting on a diving stone. Above: chrome bow of a speedboat cutting through Gulf waters.", "hotspots": [{ "_key": "h1", "item": "pearl", "meaning": "Four thousand years of seeking" }, { "_key": "h2", "item": "chrome bow", "meaning": "Modern velocity" }, { "_key": "h3", "item": "Gulf waters", "meaning": "The constant beneath change" }] }
        },
        {
            "name": "BIG SUR",
            "legacyName": "Del Mar",
            "territory": "territory-tidal",
            "order": 3,
            "evocationPoint": { "location": "Big Sur, California", "coordinates": "36.2704° N, 121.8081° W" },
            "evocation": ["The Amalfi Coast was never supposed to support life, all vertical cliff and thin soil, lemon terraces carved into rock by centuries of stubborn agriculture.", "BIG SUR captures that tension between harsh and lush, between salt and sweet. A very fresh, realistic scent of salty ocean, the liminal edge where the cliff meets the sea.", "The coast does not care about productivity. It exists where it wants, blooms when it is ready. BIG SUR carries that same energy: unhurried, generous, unconcerned with performance."],
            "onSkin": ["Bergamot and lemon open with Mediterranean brightness, immediately joined by the realistic salt of seaweed. Marine accord provides oceanic depth while Ambroxan adds its luminous magic.", "BIG SUR does not perform. It exists. There is a generosity here that cannot be manufactured: the freshness of salt air, the warmth of sun-baked stone."],
            "sillage": "Soft, enveloping",
            "longevity": "6-8 hours",
            "season": "Summer, coastal energy",
            "notes": { "top": "Bergamot, Lemon", "heart": "Seaweed, Marine Accord", "base": "Musk, Ambroxan, Cedar" },
            "fieldReport": { "concept": "The Big Sur coastline at midday. Sea visible through cypress branches, impossibly blue. Salt spray catching the light. A worn path leading down to water.", "hotspots": [{ "_key": "h1", "item": "cypress branches", "meaning": "Stubborn beauty" }, { "_key": "h2", "item": "sea glimpse", "meaning": "Always present" }, { "_key": "h3", "item": "worn path", "meaning": "The way down to the edge" }] }
        },
        {
            "name": "MEISHAN",
            "legacyName": "China Rain",
            "territory": "territory-tidal",
            "order": 4,
            "evocationPoint": { "location": "Meishan, Sichuan, China", "coordinates": "30.0422° N, 103.8318° E" },
            "evocation": ["In the hills outside Meishan, tea terraces descend in green steps toward rivers fed by Himalayan snowmelt. When the rain comes, and in Sichuan, the rain always comes, the entire landscape exhales. Petrichor rises from warm stone, green tea leaves release their oils, and the mist settles into the valleys like a drawn curtain.", "MEISHAN captures that exhale: the unmistakable scent of rain meeting earth, green notes bright as new growth, white lily floating through the humid air. This is petrichor made wearable, the specific peace of a landscape that has been cultivated with patience for three thousand years.", "The genius of Chinese tea culture is knowing that water is the true protagonist. MEISHAN carries that same understanding: restraint as refinement, lightness as depth, the beauty of letting something pass through rather than holding on."],
            "onSkin": ["Light green top notes open with the freshness of tea leaves after rain. The heart reveals white lily and soft floral notes, aquatic, delicate, almost transparent. Musk and moss settle into the base like mist into a valley.", "MEISHAN does not try to hold on. It opens, releases, trusts the current. A fragrance for those who understand that the most beautiful things are also the most temporary."],
            "sillage": "Whisper-soft",
            "longevity": "4-6 hours (intentionally fleeting)",
            "season": "Spring, transitional moments",
            "notes": { "top": "Green Notes", "heart": "White Lily, Floral Notes", "base": "Musk, Moss" },
            "fieldReport": { "concept": "Tea terraces descending into mist outside Meishan, green steps disappearing into cloud. Rain just ended, every surface glistening. A single tea picker's basket resting on wet stone.", "hotspots": [{ "_key": "h1", "item": "tea terraces", "meaning": "Three thousand years of patience" }, { "_key": "h2", "item": "mist", "meaning": "The rain's gift to the valley" }, { "_key": "h3", "item": "wet stone", "meaning": "Petrichor, earth remembering water" }] }
        },
        {
            "name": "MONACO",
            "legacyName": "Dubai Musk",
            "territory": "territory-tidal",
            "order": 5,
            "evocationPoint": { "location": "Monaco", "coordinates": "43.7384° N, 7.4246° E" },
            "evocation": ["Monaco exists in a perpetual state of curated perfection, a city-state smaller than Central Park where every surface gleams, every yacht is polished, and the Mediterranean provides a backdrop so blue it looks retouched. Yet beneath the lacquer lives something genuine: the particular softness of Riviera dusk.", "At sunset, the harbor transforms. The light goes pink and gold, the superyachts become silhouettes, and the air carries the scent of salt water mixing with something sweeter, vanilla from the patisseries, warm skin, the last of the day's warmth releasing from stone.", "MONACO captures that hour: light and airy, sweet without excess, fresh without effort. A musk that floats rather than clings, an aquatic accord that suggests the sea without imitating it. Understated luxury made olfactory."],
            "onSkin": ["Light fruity accord and fresh notes open with effortless brightness, nothing forced, nothing straining. Airy musk and aquatic accord define the heart, floating rather than clinging. Vanilla and light amber settle into the base.", "Pillowy musk draped in rose, the soft power of harbor dusk. This is lightness itself: intimate, fresh, never shouting."],
            "sillage": "Close, floating",
            "longevity": "6-8 hours",
            "season": "Year-round, layering base",
            "notes": { "top": "Light Fruity Accord, Fresh Notes", "heart": "Airy Musk, Aquatic Accord", "base": "Vanilla, Light Amber" },
            "fieldReport": { "concept": "Monaco harbor at dusk, yacht masts silhouetted against a pink-gold sky. The Casino de Monte-Carlo glowing in the middle distance. A glass of rosé on a marble balustrade, untouched.", "hotspots": [{ "_key": "h1", "item": "yacht masts", "meaning": "Luxury at rest" }, { "_key": "h2", "item": "pink-gold sky", "meaning": "The Riviera's daily performance" }, { "_key": "h3", "item": "untouched rosé", "meaning": "The pleasure of not needing" }] }
        },
        {
            "name": "TANGIERS",
            "legacyName": "Regatta",
            "territory": "territory-tidal",
            "order": 6,
            "evocationPoint": { "location": "Tangier, Morocco", "coordinates": "35.7595° N, 5.8340° W" },
            "evocation": ["Tangier has always been a city of arrivals and departures, a port where Europe watches Africa across the strait and every café holds someone waiting for a boat, a deal, a new identity. The International Zone years gave it a reputation for reinvention that has never quite faded.", "The medina cascades down to the harbor in white and blue, its narrow streets opening suddenly onto terraces with views that stretch to Spain. The air carries bergamot from the Rif Mountains, mint from the tea sellers, and something green and herbal that belongs only to the Maghreb.", "TANGIERS captures that sense of threshold: bergamot and vervain open crisp and bright, fennel and hedione provide an unexpected aromatic heart, and the base settles into matcha tea and musk, a finishing note that suggests departure rather than arrival."],
            "onSkin": ["Bergamot and vervain open with immediate freshness, crisp, aromatic, clean as North African morning. Fennel and hedione define the heart, herbal and luminous. The base dries down into matcha tea, musk, and woody notes.", "TANGIERS carries the quiet confidence of old expertise: nothing to prove, everything to offer. For those who prefer to earn respect through consistency."],
            "sillage": "Fresh, present",
            "longevity": "6-8 hours",
            "season": "Spring through fall, professional settings",
            "notes": { "top": "Bergamot, Vervain", "heart": "Fennel, Hedione", "base": "Matcha Tea, Musk, Woody Notes" },
            "fieldReport": { "concept": "A Tangier medina terrace overlooking the strait, white and blue walls framing a view of the Spanish coast. Mint tea steaming on a brass tray. The sound of the call to prayer mixing with ferry horns.", "hotspots": [{ "_key": "h1", "item": "strait view", "meaning": "Europe and Africa in conversation" }, { "_key": "h2", "item": "mint tea", "meaning": "The ritual that connects everything" }, { "_key": "h3", "item": "ferry horn", "meaning": "Arrival and departure, always" }] }
        },
        {
            "name": "TIGRIS",
            "legacyName": null,
            "territory": "territory-tidal",
            "order": 7,
            "evocationPoint": { "location": "Tigris River, Iraq", "coordinates": "33.3152° N, 44.3661° E" },
            "evocation": ["The Tigris has carried civilization on its back for ten thousand years. Between its banks and those of the Euphrates, humanity invented writing, agriculture, the wheel, and the city. The water still flows through Baghdad as it flowed through Babylon, unhurried, carrying silt from the mountains of eastern Turkey to the marshes of the south.", "At dawn, the river turns from black to bronze. Fishermen cast nets from wooden boats unchanged in design for centuries. The air smells of wet earth and ginger, the particular freshness of a river that remembers everything but holds nothing.", "TIGRIS captures that ancient fluidity: grapefruit opening bright and clean, ginger and ambrette providing warmth at the heart, and a base of ambroxan, musk, patchouli, and vetiver that settles like alluvial sediment, rich, grounding, essential."],
            "onSkin": ["Grapefruit opens with the brightness of river dawn, clean, tart, immediate. Ginger and ambrette warm the heart with a seed-like, slightly honeyed quality. The base unfolds into ambroxan, musk, patchouli, and vetiver.", "A fragrance that flows rather than sits. Present without being static, warm without being heavy. For those who understand that the deepest things are always moving."],
            "sillage": "Moderate, flowing",
            "longevity": "8+ hours",
            "season": "Year-round, contemplative moments",
            "notes": { "top": "Grapefruit", "heart": "Ginger, Ambrette", "base": "Ambroxan, Musk, Patchouli, Vetiver" },
            "fieldReport": { "concept": "The Tigris at first light, bronze water flowing past date palms, a wooden fishing boat tethered to the bank. Baghdad's skyline visible through morning haze. Nets drying on the shore.", "hotspots": [{ "_key": "h1", "item": "bronze water", "meaning": "Ten thousand years of flow" }, { "_key": "h2", "item": "fishing boat", "meaning": "Design unchanged since Babylon" }, { "_key": "h3", "item": "morning haze", "meaning": "The river remembers everything" }] }
        },

        // =====================
        // TERRA TERRITORY (1-7)
        // =====================
        {
            "name": "ASTORIA",
            "legacyName": "Pacific Moss",
            "territory": "territory-terra",
            "order": 1,
            "evocationPoint": { "location": "Astoria, Oregon", "coordinates": "46.1879° N, 123.8313° W" },
            "evocation": ["Astoria sits where the Columbia River meets the Pacific, a town of Victorian houses and fishing boats at the edge of temperate rainforest so dense the light turns green before it reaches the ground. Moss covers everything: rooftops, railings, the hulls of boats that haven't moved in decades.", "The air here is perpetually damp, carrying fir needle and cedar from the forest, salt from the bar, and the particular green-earth scent of moss growing on moss. In winter, storms roll in from the Pacific and the town hunkers down. In summer, the fog burns off by noon and everything glistens.", "ASTORIA captures that Pacific Northwest character: fir needle and fresh sap opening into forest floor and green moss, grounded by cedar and woody earth. A scent for those who understand that the most alive places are often the wettest."],
            "onSkin": ["Fir needle and fresh sap open with immediate Pacific Northwest energy, green, resinous, alive. The heart reveals forest floor and green moss, damp and authentic. Cedar and woody earth settle into the base.", "ASTORIA smells like walking into an old-growth forest after rain. There is nothing performative here, only the particular beauty of a landscape that grows faster than anyone can clear it."],
            "sillage": "Present, grounding",
            "longevity": "8+ hours",
            "season": "Autumn, winter, rainy days",
            "notes": { "top": "Fir Needle, Fresh Sap", "heart": "Forest Floor, Green Moss", "base": "Cedar, Woody Earth" },
            "fieldReport": { "concept": "Moss-covered dock in Astoria, fishing boats at rest, the Columbia River meeting the Pacific in the distance. Fir trees framing a grey sky. Everything glistening with recent rain.", "hotspots": [{ "_key": "h1", "item": "moss-covered dock", "meaning": "Nature reclaiming the built world" }, { "_key": "h2", "item": "river mouth", "meaning": "Where fresh water meets salt" }, { "_key": "h3", "item": "fir trees", "meaning": "The forest that never stops growing" }] }
        },
        {
            "name": "HAVANA",
            "legacyName": "Oud & Tobacco",
            "territory": "territory-terra",
            "order": 2,
            "evocationPoint": { "location": "Habana Vieja, Cuba", "coordinates": "23.1136° N, 82.3666° W" },
            "evocation": ["The crumbling glory of Habana Vieja exists in permanent golden hour, the light somehow always amber, always forgiving, turning decay into romance. Tobacco leaves hang in doorways to dry.", "HAVANA captures that specific decadence: tobacco not as smoke but as leaf, honeyed and slightly fermented. Woody tobacco with boozy warmth, like whiskey aged in salt air.", "The sweetness here is not innocent. It knows what it is doing. Smoky and beautiful, truly unisex, capturing crumbling glory in permanent golden hour."],
            "onSkin": ["Agarwood and tobacco open with woody warmth, neither apologizing. A boozy whiskey accord adds decadence. Vanilla strings through everything, and smoky notes linger like the best Havana evenings.", "The sweetness knows exactly what it is doing: warm, slightly dangerous, impossibly inviting. A fragrance for late afternoons that become late evenings."],
            "sillage": "Warm, present",
            "longevity": "8+ hours",
            "season": "Evening, year-round",
            "notes": { "top": "Agarwood, Tobacco", "heart": "Boozy Whiskey Accord, Sweet Amber, Balsamic", "base": "Vanilla, Woody Notes, Smoky Accord" },
            "fieldReport": { "concept": "Tobacco leaves hanging in a doorway, backlit by afternoon sun. A weathered bar counter with rum bottles. Through a window, the suggestion of ocean.", "hotspots": [{ "_key": "h1", "item": "tobacco leaves", "meaning": "Drying, not burning" }, { "_key": "h2", "item": "rum bottles", "meaning": "Añejo, patient sweetness" }, { "_key": "h3", "item": "window light", "meaning": "Permanent golden hour" }] }
        },
        {
            "name": "HUDSON",
            "legacyName": "Spanish Sandalwood",
            "territory": "territory-terra",
            "order": 3,
            "evocationPoint": { "location": "Hudson, New York", "coordinates": "42.2529° N, 73.7910° W" },
            "evocation": ["Hudson sits on the east bank of its namesake river, a small city of Federal-era brick buildings and antique shops that was a whaling port before it became an artist colony. The surrounding valley is all rolling farmland and old-growth forest, the Catskill Mountains rising to the west.", "The air here carries the particular scent of the Hudson Valley: sandalwood warmth from antique shops, cedar from the forests, cardamom and violet from the garden cafés that line Warren Street. There is a curated wildness to it, sophistication that never forgets the land it sits on.", "HUDSON captures that balance: cardamom and violet opening with aromatic elegance, sandalwood and cedar providing the woody heart, ambroxan and leather grounding everything in substance. A scent for those who left the city but brought their taste with them."],
            "onSkin": ["Cardamom and violet open with aromatic sophistication, warm, slightly powdery, immediately interesting. Iris adds depth. Sandalwood and cedar define the heart, creamy and woody. Ambroxan, leather, and musk settle into the base.", "HUDSON bridges the urban and the rural. Polished without being precious, earthy without being rough. For weekends that feel important without trying."],
            "sillage": "Moderate, refined",
            "longevity": "8+ hours",
            "season": "Autumn, transitional moments",
            "notes": { "top": "Cardamom, Violet, Iris", "heart": "Sandalwood, Cedar", "base": "Ambroxan, Leather, Musk" },
            "fieldReport": { "concept": "Warren Street in Hudson on a fall morning, brick facades, antique shop windows catching golden light. The Catskills visible beyond the rooftops. Smoke rising from a café chimney.", "hotspots": [{ "_key": "h1", "item": "brick facades", "meaning": "Federal era, whaling money" }, { "_key": "h2", "item": "Catskill skyline", "meaning": "The wilderness that frames everything" }, { "_key": "h3", "item": "café smoke", "meaning": "The new Hudson, warming up" }] }
        },
        {
            "name": "MARRAKESH",
            "legacyName": null,
            "territory": "territory-terra",
            "order": 4,
            "evocationPoint": { "location": "Jemaa el-Fnaa, Morocco", "coordinates": "31.6295° N, 7.9811° W" },
            "evocation": ["Follow the smell and you will find the tanneries. In the medina, where leather merchants have worked since the 11th century, the air hangs thick with a scent unchanged for a thousand years.", "MARRAKESH captures the alchemy of the Chouara, not the first recoil, but the deeper understanding. Leather at its most honest, surrounded by spices. Plum sweetness. Cardamom lifting.", "This fragrance does not apologize for its complexity. Like Marrakesh itself, it asks you to stay long enough to understand."],
            "onSkin": ["Plum and cardamom open with unexpected sweetness, while lavender and bergamot add brightness. The heart reveals nutmeg, rose, cinnamon, cumin, violet and jasmine. The base is where the tanneries live: leather, agarwood, incense, cedar, patchouli, amber.", "A very leathery scent, reminiscent of the leather merchants in Morocco. Warm, spicy, fresh, smoky, woody, with hints of fruit and agarwood depth."],
            "sillage": "Present, substantial",
            "longevity": "10+ hours",
            "season": "Cool evenings, year-round",
            "notes": { "top": "Plum, Cardamom, Lavender, Bergamot, Green Notes", "heart": "Nutmeg, Rose, Cinnamon, Cumin, Violet, Jasmine", "base": "Leather, Agarwood, Incense, Cedar, Patchouli, Amber, Balsamic" },
            "fieldReport": { "concept": "The honey-colored walls of the tannery courtyard, vats of dye arranged in ancient geometry. Morning light catches leather hides drying on rooftops.", "hotspots": [{ "_key": "h1", "item": "dye vats", "meaning": "Ancient colors, living tradition" }, { "_key": "h2", "item": "drying hides", "meaning": "Transformation in progress" }, { "_key": "h3", "item": "honey walls", "meaning": "The medina holds its secrets" }] }
        },
        {
            "name": "RIYADH",
            "legacyName": "Black Oud",
            "territory": "territory-terra",
            "order": 5,
            "evocationPoint": { "location": "Riyadh Oud Souks, Saudi Arabia", "coordinates": "24.7136° N, 46.6753° E" },
            "evocation": ["Riyadh rises from the desert like a denial of nature, glass and steel where nothing should grow. But in the old souks, the ancient trade continues. Oud stalls lined with dark woods.", "RIYADH captures that duality: a slightly rose oud, executive and sophisticated. More on the masculine side, this is oud dressed for the modern world.", "The Saudi relationship with oud is intimate, worn daily, burned constantly, gifted with care. RIYADH honors that tradition while translating it for newcomers."],
            "onSkin": ["Rose oud opens with sophistication, floral and woody in perfect balance. Mandarin adds brightness while musk provides the backbone.", "RIYADH could walk into a boardroom. It could also find an oasis in empty sand. For those who want oud without the learning curve."],
            "sillage": "Refined, present",
            "longevity": "10+ hours",
            "season": "Year-round sophistication",
            "notes": { "top": "Mandarin", "heart": "Rose, Oud", "base": "Labdanum, Patchouli, Musk" },
            "fieldReport": { "concept": "Modern Riyadh visible through a souk archway. In the foreground, traditional oud chips on a brass scale. The coexistence of glass towers and ancient trade.", "hotspots": [{ "_key": "h1", "item": "souk archway", "meaning": "The threshold between worlds" }, { "_key": "h2", "item": "brass scale", "meaning": "Worth measured in tradition" }, { "_key": "h3", "item": "glass towers", "meaning": "The new Arabia, watching" }] }
        },
        {
            "name": "SAMARKAND",
            "legacyName": "Oud Aura",
            "territory": "territory-terra",
            "order": 6,
            "evocationPoint": { "location": "Samarkand, Uzbekistan", "coordinates": "39.6542° N, 66.9597° E" },
            "evocation": ["The forests of Borneo are among the oldest on earth, 130 million years of unbroken evolution, creating trees that dwarf cathedrals. Here the Aquilaria trees grow and produce agarwood.", "SAMARKAND captures oud at its most refined, rich and commanding. Not the barnyard funk of young wood, but the clean, animalic elegance that develops with time. Leather and smoky notes.", "There is a reason oud has been called the wood of the gods. Something about its density, its willingness to transform trauma into beauty, speaks to human aspiration."],
            "onSkin": ["Oud opens with its full character, animalic, smoky, commanding. Leather joins immediately. Vanilla softens without sweetening, while birch and smoky accords add depth.", "SAMARKAND does not apologize for its presence. This is fragrance as gravity: grounding, substantial, deserving of space."],
            "sillage": "Present, commanding",
            "longevity": "12+ hours",
            "season": "Evening, significant occasions",
            "notes": { "top": "Oud", "heart": "Vanilla", "base": "Birch, Smoky Accord" },
            "fieldReport": { "concept": "Oud chips arranged on dark wood, lit by a single shaft of forest light. The suggestion of vast trees beyond. Smoke curling from somewhere unseen.", "hotspots": [{ "_key": "h1", "item": "oud chips", "meaning": "Decades of patient transformation" }, { "_key": "h2", "item": "forest light", "meaning": "Cathedral darkness, broken" }, { "_key": "h3", "item": "distant smoke", "meaning": "The eternal rendering" }] }
        },
        {
            "name": "SICILY",
            "legacyName": "Sicilian Oud",
            "territory": "territory-terra",
            "order": 7,
            "evocationPoint": { "location": "Mount Etna, Sicily", "coordinates": "37.5994° N, 14.0154° E" },
            "evocation": ["Mount Etna has been erupting for 500,000 years. The Sicilians who farm its slopes know the volcano as they know a difficult parent: unpredictable, sometimes destructive, but ultimately the source of life.", "SICILY captures that productive danger: Sicilian bergamot opens bright against pink pepper. Davana adds fruity depth while agarwood provides the volcanic heart.", "Living near volcanoes teaches a particular philosophy: enjoy what you have while you have it, because the earth makes no promises."],
            "onSkin": ["Sicilian bergamot opens with Mediterranean brightness, joined by pink pepper and davana. Agarwood provides the volcanic heart while white amber glows. Vetiver smokes through the base.", "SICILY offers the philosophy of people who live near volcanoes: enjoy what you have while you have it. Generous, warm, and perfectly aware that nothing lasts forever."],
            "sillage": "Warm, embracing",
            "longevity": "8+ hours",
            "season": "Cool evenings, winter warmth",
            "notes": { "top": "Sicilian Bergamot, Pink Pepper, Davana", "heart": "Agarwood, White Amber, Rosemary", "base": "Leather, Musk, Vetiver" },
            "fieldReport": { "concept": "Mount Etna smoking in the background, peaceful for now. Citrus groves in the middle distance. The fertility that danger provides.", "hotspots": [{ "_key": "h1", "item": "smoking Etna", "meaning": "The source of richness" }, { "_key": "h2", "item": "citrus grove", "meaning": "Growth from destruction" }, { "_key": "h3", "item": "golden light", "meaning": "The hour of gratitude" }] }
        }
    ]
};

function slugify(text) {
    return text.toString().toLowerCase()
        .replace(/\s+/g, '-')           // Replace spaces with -
        .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
        .replace(/\-\-+/g, '-')         // Replace multiple - with single -
        .replace(/^-+/, '')             // Trim - from start of text
        .replace(/-+$/, '');            // Trim - from end of text
}

function splitNotes(notesStr) {
    if (!notesStr) return [];
    return notesStr.split(',').map(s => s.trim()).filter(Boolean);
}

// Map territory reference IDs (e.g., 'territory-ember') to atmosphere values (e.g., 'ember')
// NOTE: I am also storing the territory reference object as requested in the schema update.
const territoryMap = {
    'territory-tidal': 'tidal',
    'territory-ember': 'ember',
    'territory-petal': 'petal',
    'territory-terra': 'terra',
};

// Old Sanity product IDs that may hold images/Shopify data for renamed products.
// Maps new slug → array of old IDs to check (most likely first).
const LEGACY_IDS = {
    'saana':    ['product-petra', 'product-caravan', 'product-honey-oudh'],
    'malabar':  ['product-zanzibar', 'product-dune', 'product-vanilla-sands'],
    'tarifa':   ['product-oman', 'product-nizwa', 'product-teeb-musk', 'product-close'],
    'beirut':   ['product-ethiopia', 'product-devotion', 'product-frankincense-myrrh'],
    'meishan':  ['product-kyoto', 'product-china-rain'],
    'monaco':   ['product-dubai', 'product-dubai-musk'],
    'carmel':   ['product-amer', 'product-white-amber'],
    'tobago':   ['product-grasse', 'product-jasmine', 'product-arabian-jasmine'],
    'hudson':   ['product-tulum', 'product-spanish-sandalwood'],
    'tangiers': ['product-regatta'],
};

function parseCoordinates(coordString) {
    if (!coordString) return { latitude: null, longitude: null };
    const match = coordString.match(/([\d.]+)°\s*([NS]),?\s*([\d.]+)°\s*([EW])/);
    if (!match) return { latitude: null, longitude: null };
    let lat = parseFloat(match[1]);
    let lng = parseFloat(match[3]);
    if (match[2] === 'S') lat = -lat;
    if (match[4] === 'W') lng = -lng;
    return { latitude: lat, longitude: lng };
}

async function findLegacyProduct(slug) {
    const legacyIds = LEGACY_IDS[slug];
    if (!legacyIds) return null;
    for (const oldId of legacyIds) {
        const doc = await client.fetch(`*[_id == $id][0]`, { id: oldId });
        if (doc) return { id: oldId, doc };
        const draftDoc = await client.fetch(`*[_id == $id][0]`, { id: `drafts.${oldId}` });
        if (draftDoc) return { id: `drafts.${oldId}`, doc: draftDoc };
    }
    return null;
}

async function ingest() {
    console.log('Starting ingestion...\n');

    // 1. Ingest Territories
    for (const t of data.territories) {
        console.log(`  Territory: ${t.name}`);
        await client.createOrReplace({
            _id: t._id,
            _type: 'territory',
            name: t.name,
            slug: t.slug,
            tagline: t.tagline,
            description: t.description,
            keywords: t.keywords,
            order: t.order,
        });
    }
    console.log('✓ Territories ingested.\n');

    const oldIdsToDelete = [];

    // 2. Ingest Fragrances
    for (const f of data.fragrances) {
        const slug = slugify(f.name);
        const productId = `product-${slug}`;
        const { latitude, longitude } = parseCoordinates(f.evocationPoint.coordinates);

        const atlasPayload = {
            atmosphere: territoryMap[f.territory] || 'ember',
            territory: { _type: 'reference', _ref: f.territory },
            gpsCoordinates: f.evocationPoint.coordinates,
            latitude,
            longitude,
            evocationLocation: f.evocationPoint.location,
            evocationStory: f.evocation,
            onSkinStory: f.onSkin,
            fieldReportConcept: {
                concept: f.fieldReport.concept,
                hotspots: f.fieldReport.hotspots.map(h => ({
                    _key: h._key,
                    item: h.item,
                    meaning: h.meaning
                }))
            }
        };

        const existing = await client.fetch(`*[_id == $id][0]`, { id: productId });

        if (existing) {
            console.log(`  ✎ Updating: ${f.name} (${productId})`);
            await client.patch(productId)
                .set({
                    title: f.name,
                    legacyName: f.legacyName,
                    slug: { _type: 'slug', current: slug },
                    collectionType: 'atlas',
                    sillage: f.sillage,
                    longevity: f.longevity,
                    season: f.season,
                    notes: {
                        top: splitNotes(f.notes.top),
                        heart: splitNotes(f.notes.heart),
                        base: splitNotes(f.notes.base),
                    },
                    atlasData: {
                        ...existing.atlasData,
                        ...atlasPayload
                    }
                })
                .commit();
        } else {
            // Check for a legacy product that holds images/Shopify data
            const legacy = await findLegacyProduct(slug);
            const preserved = {};
            if (legacy) {
                console.log(`  ↗ Migrating: ${legacy.id} → ${productId} (${f.name})`);
                if (legacy.doc.mainImage) preserved.mainImage = legacy.doc.mainImage;
                if (legacy.doc.shopifyPreviewImageUrl) preserved.shopifyPreviewImageUrl = legacy.doc.shopifyPreviewImageUrl;
                if (legacy.doc.shopifyProductId) preserved.shopifyProductId = legacy.doc.shopifyProductId;
                if (legacy.doc.store) preserved.store = legacy.doc.store;
                if (legacy.doc.internalName) preserved.internalName = legacy.doc.internalName;
                if (legacy.doc.atlasData) {
                    atlasPayload.fieldReport = legacy.doc.atlasData.fieldReport || atlasPayload.fieldReport;
                    atlasPayload.audioJourney = legacy.doc.atlasData.audioJourney || undefined;
                    atlasPayload.audioOnSkin = legacy.doc.atlasData.audioOnSkin || undefined;
                }
                oldIdsToDelete.push(legacy.id);
            } else {
                console.log(`  + Creating: ${f.name} (${productId})`);
            }

            await client.create({
                _id: productId,
                _type: 'product',
                title: f.name,
                legacyName: f.legacyName,
                slug: { _type: 'slug', current: slug },
                collectionType: 'atlas',
                sillage: f.sillage,
                longevity: f.longevity,
                season: f.season,
                notes: {
                    top: splitNotes(f.notes.top),
                    heart: splitNotes(f.notes.heart),
                    base: splitNotes(f.notes.base),
                },
                atlasData: atlasPayload,
                ...preserved,
            });
        }
    }

    // 3. Archive ETHIOPIA (replaced by BEIRUT)
    const ethiopiaDoc = await client.fetch(`*[_id == "product-ethiopia"][0]`);
    if (ethiopiaDoc) {
        console.log(`\n  ✗ Archiving: ETHIOPIA (product-ethiopia)`);
        await client.patch('product-ethiopia')
            .set({ collectionType: 'archive', inStock: false })
            .commit();
    }

    // 4. Clean up old product documents that were migrated to new IDs
    if (oldIdsToDelete.length > 0) {
        console.log(`\n  Cleaning up ${oldIdsToDelete.length} legacy documents...`);
        for (const oldId of oldIdsToDelete) {
            try {
                await client.delete(oldId);
                console.log(`    Deleted: ${oldId}`);
            } catch (err) {
                console.warn(`    Could not delete ${oldId}: ${err.message}`);
            }
        }
    }

    console.log('\n✓ Ingestion complete.');
    console.log(`  ${data.fragrances.length} products processed.`);
    console.log(`  ${oldIdsToDelete.length} legacy documents cleaned up.`);
}

ingest().catch(err => {
    console.error('Ingestion failed:', err);
    process.exit(1);
});
