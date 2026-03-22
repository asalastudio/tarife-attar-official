#!/usr/bin/env python3
"""Generate Shopify product import CSV for Atlas Collection — 28 waypoints, 56 rows."""

import csv

OUTPUT = "/Users/jordanrichter/Projects/Tarife Attar/Tarife-Attar-Site-Redesign/Tarife_Attar_Atlas_Shopify_Import_v4.csv"

COLUMNS = [
    "Handle", "Title", "Body (HTML)", "Vendor", "Product Category", "Type",
    "Tags", "Published", "Option1 Name", "Option1 Value", "Option2 Name",
    "Option2 Value", "Variant SKU", "Variant Grams", "Variant Inventory Tracker",
    "Variant Inventory Policy", "Variant Fulfillment Service", "Variant Price",
    "Variant Compare At Price", "Variant Requires Shipping", "Variant Taxable",
    "Variant Weight Unit", "Image Src", "Image Alt Text", "SEO Title",
    "SEO Description", "Status"
]

PRICING = {
    "Ember": {"6ml": "28.00", "12ml": "48.00"},
    "Tidal": {"6ml": "30.00", "12ml": "50.00"},
    "Petal": {"6ml": "30.00", "12ml": "50.00"},
    "Terra": {"6ml": "33.00", "12ml": "55.00"},
}

IMAGES = {
    "ADEN": "https://cdn.shopify.com/s/files/1/1989/5889/files/Aseel_149db521-8f19-440b-9a1e-f2b4f6ed98d4.jpg?v=1769116400",
    "SAANA": "https://cdn.shopify.com/s/files/1/1989/5889/files/freepik__create-a-luxury-ecommerce-studioquality-editorial-__16840_1b65ba27-4bf1-4c91-8803-cea9a5dcb560.png?v=1769116387",
    "GRANADA": "https://cdn.shopify.com/s/files/1/1989/5889/files/Oudh_Tobacco_8d59abaf-8d41-4d41-b2f8-71a66ab34998.jpg?v=1769116398",
    "MALABAR": "https://cdn.shopify.com/s/files/1/1989/5889/files/Vanilla_Sands.jpg?v=1758669428",
    "SERENGETI": "https://cdn.shopify.com/s/files/1/1989/5889/files/Black_Musk_4c602f31-f051-499c-bf0e-04f8c6612eb7.jpg?v=1758670943",
    "BEIRUT": "https://cdn.shopify.com/s/files/1/1989/5889/files/Frankincense_myrrh.jpg?v=1758502026",
    "TARIFA": "https://cdn.shopify.com/s/files/1/1989/5889/files/Rose_a63c494d-2b6e-4d13-88a4-482084e9715d.jpg?v=1758673105",
    "BAHIA": "https://cdn.shopify.com/s/files/1/1989/5889/files/freepik__create-a-luxury-ecommerce-studioquality-editorial-__448_69229292-005b-4ddb-9d06-eec70669848f.jpg?v=1769116364",
    "BAHRAIN": "https://cdn.shopify.com/s/files/1/1989/5889/files/freepik__create-a-luxury-ecommerce-studioquality-editorial-__449.jpg?v=1758692848",
    "BIG SUR": "https://cdn.shopify.com/s/files/1/1989/5889/files/Rose_a63c494d-2b6e-4d13-88a4-482084e9715d.jpg?v=1758673105",
    "MEISHAN": "https://cdn.shopify.com/s/files/1/1989/5889/files/Rose_7c5cad14-d578-4b66-b8d6-edf8e2048cd1.jpg?v=1758667052",
    "MONACO": "https://cdn.shopify.com/s/files/1/1989/5889/files/Aseel_63faae9b-fa48-4fa4-a978-40e4dc0ae89c.jpg?v=1758673131",
    "TANGIERS": "https://cdn.shopify.com/s/files/1/1989/5889/files/Rose_62a887bb-603d-400d-8c99-551d7669f4e5.jpg?v=1758672986",
    "TIGRIS": "https://cdn.shopify.com/s/files/1/1989/5889/files/Black_Musk_604425d4-8d59-4d44-b045-af11abe7115b.jpg?v=1758667194",
    "CARMEL": "https://cdn.shopify.com/s/files/1/1989/5889/files/Rose_a63c494d-2b6e-4d13-88a4-482084e9715d.jpg?v=1758673105",
    "DAMASCUS": "https://cdn.shopify.com/s/files/1/1989/5889/files/Rose_a63c494d-2b6e-4d13-88a4-482084e9715d.jpg?v=1758673105",
    "TOBAGO": "https://cdn.shopify.com/s/files/1/1989/5889/files/freepik__create-a-luxury-ecommerce-studioquality-editorial-__448_69229292-005b-4ddb-9d06-eec70669848f.jpg?v=1769116364",
    "KANDY": "https://cdn.shopify.com/s/files/1/1989/5889/files/freepik__create-a-luxury-ecommerce-studioquality-editorial-__448_69229292-005b-4ddb-9d06-eec70669848f.jpg?v=1769116364",
    "MANALI": "https://cdn.shopify.com/s/files/1/1989/5889/files/Aseel_9dbc3f2b-3b2d-4dfe-acb4-7f6c2aa8ca01.jpg?v=1769116374",
    "MEDINA": "https://cdn.shopify.com/s/files/1/1989/5889/files/White_Musk_71652ee9-dbf1-4ebc-ad66-1e6c5bd37b57.jpg?v=1758667081",
    "SIWA": "https://cdn.shopify.com/s/files/1/1989/5889/files/Rose_62a887bb-603d-400d-8c99-551d7669f4e5.jpg?v=1758672986",
    "ASTORIA": "https://cdn.shopify.com/s/files/1/1989/5889/files/Aseel_577f0749-a8c5-4a0a-a414-0b893d7921ab.jpg?v=1758669516",
    "HAVANA": "https://cdn.shopify.com/s/files/1/1989/5889/files/freepik__create-a-luxury-ecommerce-studioquality-editorial-__16840_1b65ba27-4bf1-4c91-8803-cea9a5dcb560.png?v=1769116387",
    "HUDSON": "https://cdn.shopify.com/s/files/1/1989/5889/files/freepik__create-a-luxury-ecommerce-studioquality-editorial-__448.jpg?v=1758691250",
    "MARRAKESH": "https://cdn.shopify.com/s/files/1/1989/5889/files/Vanilla_Sands.jpg?v=1758669428",
    "RIYADH": "https://cdn.shopify.com/s/files/1/1989/5889/files/Aseel_63faae9b-fa48-4fa4-a978-40e4dc0ae89c.jpg?v=1758673131",
    "SAMARKAND": "https://cdn.shopify.com/s/files/1/1989/5889/files/Oudh_Tobacco_8d59abaf-8d41-4d41-b2f8-71a66ab34998.jpg?v=1769116398",
    "SICILY": "https://cdn.shopify.com/s/files/1/1989/5889/files/freepik__create-a-luxury-ecommerce-studioquality-editorial-__16840_65053c23-6cb8-4495-b0c9-112a23f2ae67.png?v=1769116401",
}

# Each product: (waypoint, territory, legacy_name_or_None, coordinates, top, heart, base, seo_scent_words, seo_desc)
PRODUCTS = [
    # === EMBER ===
    {
        "waypoint": "ADEN",
        "territory": "Ember",
        "legacy": "Oud Fire",
        "coords": "12.7797° N, 45.0365° E",
        "top": "Bergamot, Pink Pepper, Geranium",
        "heart": "Ambergris, Patchouli, Violet",
        "base": "Musk, Oud, Vanilla",
        "seo_scent": "Warm Oud Amber",
        "seo_desc": "ADEN from the Ember territory — bergamot, ambergris, and oud in an alcohol-free perfume oil. Glass wand applicator.",
        "tags_extra": "oud, amber, bergamot, patchouli, oud fire",
    },
    {
        "waypoint": "SAANA",
        "territory": "Ember",
        "legacy": "Honey Oud",
        "coords": "15.3694° N, 44.1910° E",
        "top": "Honey, Floral Notes",
        "heart": "Cinnamon, Leather, Jasmine",
        "base": "Vanilla, Oud, Amber, Patchouli",
        "seo_scent": "Honey Oud Amber",
        "seo_desc": "SAANA from the Ember territory — honey, cinnamon, and warm oud in an alcohol-free perfume oil. Glass wand applicator.",
        "tags_extra": "honey, cinnamon, leather, vanilla, oud, honey oud",
    },
    {
        "waypoint": "GRANADA",
        "territory": "Ember",
        "legacy": "Granada Amber",
        "coords": "37.1773° N, 3.5986° W",
        "top": "Warm Amber",
        "heart": "Woody Notes, Sweet Amber Accord",
        "base": "Vanilla, Deep Amber",
        "seo_scent": "Warm Amber Vanilla",
        "seo_desc": "GRANADA from the Ember territory — warm amber, woody notes, and vanilla in an alcohol-free perfume oil. Glass wand applicator.",
        "tags_extra": "amber, vanilla, woody, granada amber",
    },
    {
        "waypoint": "MALABAR",
        "territory": "Ember",
        "legacy": "Vanilla Sands",
        "coords": "11.2588° N, 75.7804° E",
        "top": "Vanilla, Sweet Caramel",
        "heart": "Benzoin, Woody Notes",
        "base": "Amber, Musk, Warm Resins",
        "seo_scent": "Vanilla Amber Benzoin",
        "seo_desc": "MALABAR from the Ember territory — warm vanilla, golden amber, and benzoin in an alcohol-free perfume oil. Glass wand applicator.",
        "tags_extra": "vanilla, musk, amber, benzoin, caramel, vanilla sands",
    },
    {
        "waypoint": "SERENGETI",
        "territory": "Ember",
        "legacy": "Black Musk",
        "coords": "2.3333° S, 34.8333° E",
        "top": "Dark Musk",
        "heart": "Resinous Accord, Heady Notes",
        "base": "Rustic Musk, Deep Amber",
        "seo_scent": "Dark Musk Amber",
        "seo_desc": "SERENGETI from the Ember territory — dark musk, resinous accord, and deep amber in an alcohol-free perfume oil. Glass wand.",
        "tags_extra": "dark musk, resin, amber, black musk",
    },
    {
        "waypoint": "BEIRUT",
        "territory": "Ember",
        "legacy": None,
        "coords": "33.8938° N, 35.5018° E",
        "top": "Blood Mandarin, Grapefruit, Mint",
        "heart": "Cinnamon, Rose, Spices",
        "base": "Leather, Patchouli, Amber",
        "seo_scent": "Spiced Leather",
        "seo_desc": "BEIRUT from the Ember territory — blood mandarin, cinnamon, and leather in an alcohol-free perfume oil. Glass wand applicator.",
        "tags_extra": "citrus, spice, mandarin, cinnamon, leather, patchouli",
    },
    {
        "waypoint": "TARIFA",
        "territory": "Ember",
        "legacy": "Teeb Musk",
        "coords": "36.0143° N, 5.6044° W",
        "top": "White Flowers, Green Accord",
        "heart": "Jasmine, Soft Floral",
        "base": "Powdery Notes, Patchouli, Musk",
        "seo_scent": "Floral Musk",
        "seo_desc": "TARIFA from the Ember territory — white flowers, jasmine, and powdery musk in an alcohol-free perfume oil. Glass wand applicator.",
        "tags_extra": "floral, musk, jasmine, powdery, teeb musk",
    },
    # === TIDAL ===
    {
        "waypoint": "BAHIA",
        "territory": "Tidal",
        "legacy": "Coconut Jasmine",
        "coords": "12.9714° S, 38.5014° W",
        "top": "Coconut, Jasmine",
        "heart": "Gardenia, Frangipani, Vanilla",
        "base": "Light Musk, Creamy Accord",
        "seo_scent": "Coconut Jasmine",
        "seo_desc": "BAHIA from the Tidal territory — coconut, jasmine, and gardenia in an alcohol-free perfume oil. Glass wand applicator.",
        "tags_extra": "coconut, jasmine, gardenia, vanilla, tropical, coconut jasmine",
    },
    {
        "waypoint": "BAHRAIN",
        "territory": "Tidal",
        "legacy": "Blue Oud",
        "coords": "26.2041° N, 50.5515° E",
        "top": "Ozonic Notes, Metallic Accord",
        "heart": "Fresh Woods, Marine Accord",
        "base": "Warm Musk, Ambergris Accord",
        "seo_scent": "Fresh Marine Oud",
        "seo_desc": "BAHRAIN from the Tidal territory — ozonic marine accord and warm musk in an alcohol-free perfume oil. Glass wand applicator.",
        "tags_extra": "marine, aquatic, fresh, musk, ambergris, blue oud",
    },
    {
        "waypoint": "BIG SUR",
        "territory": "Tidal",
        "legacy": "Del Mar",
        "coords": "36.2704° N, 121.8081° W",
        "top": "Bergamot, Lemon",
        "heart": "Seaweed, Marine Accord",
        "base": "Musk, Ambroxan, Cedar",
        "seo_scent": "Coastal Marine",
        "seo_desc": "BIG SUR from the Tidal territory — bergamot, marine accord, and cedar in an alcohol-free perfume oil. Glass wand applicator.",
        "tags_extra": "marine, coastal, bergamot, cedar, ambroxan, del mar",
    },
    {
        "waypoint": "MEISHAN",
        "territory": "Tidal",
        "legacy": "China Rain",
        "coords": "30.0422° N, 103.8318° E",
        "top": "Green Notes",
        "heart": "White Lily, Floral Notes",
        "base": "Musk, Moss",
        "seo_scent": "Green Floral Rain",
        "seo_desc": "MEISHAN from the Tidal territory — green notes, white lily, and soft musk in an alcohol-free perfume oil. Glass wand applicator.",
        "tags_extra": "green, floral, lily, musk, moss, rain, china rain",
    },
    {
        "waypoint": "MONACO",
        "territory": "Tidal",
        "legacy": "Dubai Musk",
        "coords": "43.7384° N, 7.4246° E",
        "top": "Light Fruity Accord, Fresh Notes",
        "heart": "Airy Musk, Aquatic Accord",
        "base": "Vanilla, Light Amber",
        "seo_scent": "Fresh Musk",
        "seo_desc": "MONACO from the Tidal territory — airy musk, aquatic accord, and vanilla in an alcohol-free perfume oil. Glass wand applicator.",
        "tags_extra": "musk, aquatic, vanilla, fresh, airy, dubai musk",
    },
    {
        "waypoint": "TANGIERS",
        "territory": "Tidal",
        "legacy": "Regatta",
        "coords": "35.7595° N, 5.8340° W",
        "top": "Bergamot, Vervain",
        "heart": "Fennel, Hedione",
        "base": "Matcha Tea, Musk, Woody Notes",
        "seo_scent": "Fresh Bergamot Tea",
        "seo_desc": "TANGIERS from the Tidal territory — bergamot, hedione, and matcha tea in an alcohol-free perfume oil. Glass wand applicator.",
        "tags_extra": "bergamot, tea, fresh, woody, matcha, regatta",
    },
    {
        "waypoint": "TIGRIS",
        "territory": "Tidal",
        "legacy": None,
        "coords": "33.3152° N, 44.3661° E",
        "top": "Grapefruit",
        "heart": "Ginger, Ambrette",
        "base": "Ambroxan, Musk, Patchouli, Vetiver",
        "seo_scent": "Fresh Ginger Musk",
        "seo_desc": "TIGRIS from the Tidal territory — grapefruit, ginger, and ambroxan in an alcohol-free perfume oil. Glass wand applicator.",
        "tags_extra": "grapefruit, ginger, ambroxan, musk, vetiver, fresh",
    },
    # === PETAL ===
    {
        "waypoint": "CARMEL",
        "territory": "Petal",
        "legacy": "White Amber",
        "coords": "36.5552° N, 121.9233° W",
        "top": "Soft Floral Whisper",
        "heart": "Warm Amber, Woody Notes",
        "base": "Clean Musk, Light Skin Accord",
        "seo_scent": "Soft Amber Musk",
        "seo_desc": "CARMEL from the Petal territory — soft floral, warm amber, and clean musk in an alcohol-free perfume oil. Glass wand applicator.",
        "tags_extra": "amber, musk, floral, clean, skin scent, white amber",
    },
    {
        "waypoint": "DAMASCUS",
        "territory": "Petal",
        "legacy": "Turkish Rose",
        "coords": "37.7556° N, 30.5566° E",
        "top": "Rose Otto, Fresh Accords",
        "heart": "Bulgarian Rose, Green Stem",
        "base": "Woody Notes, Clean Musk",
        "seo_scent": "Rose Floral",
        "seo_desc": "DAMASCUS from the Petal territory — rose otto, Bulgarian rose, and clean musk in an alcohol-free perfume oil. Glass wand applicator.",
        "tags_extra": "rose, floral, bulgarian rose, musk, turkish rose",
    },
    {
        "waypoint": "TOBAGO",
        "territory": "Petal",
        "legacy": "Arabian Jasmine",
        "coords": "11.1889° N, 60.6317° W",
        "top": "Jasmine, Fresh Accords",
        "heart": "Sambac, Sweet Floral",
        "base": "Soft Musk, Light Woods",
        "seo_scent": "Jasmine Floral",
        "seo_desc": "TOBAGO from the Petal territory — jasmine sambac and soft musk in an alcohol-free perfume oil. Glass wand applicator.",
        "tags_extra": "jasmine, sambac, floral, musk, arabian jasmine",
    },
    {
        "waypoint": "KANDY",
        "territory": "Petal",
        "legacy": "Peach Memoir",
        "coords": "7.2906° N, 80.6337° E",
        "top": "Peach, Apple Blossom",
        "heart": "Pineapple Blossom",
        "base": "Wild Rose, Musk, Patchouli",
        "seo_scent": "Peach Floral",
        "seo_desc": "KANDY from the Petal territory — peach, apple blossom, and wild rose in an alcohol-free perfume oil. Glass wand applicator.",
        "tags_extra": "peach, fruity, rose, patchouli, blossom, peach memoir",
    },
    {
        "waypoint": "MANALI",
        "territory": "Petal",
        "legacy": "Himalayan Musk",
        "coords": "32.2396° N, 77.1887° E",
        "top": "Fresh Crisp Accords",
        "heart": "Cool Musk, Woody Notes",
        "base": "Earthy Musk, Soft Incense",
        "seo_scent": "Cool Musk",
        "seo_desc": "MANALI from the Petal territory — cool musk, woody notes, and soft incense in an alcohol-free perfume oil. Glass wand applicator.",
        "tags_extra": "musk, woody, incense, cool, earthy, himalayan musk",
    },
    {
        "waypoint": "MEDINA",
        "territory": "Petal",
        "legacy": "Musk Tahara",
        "coords": "24.5247° N, 39.5692° E",
        "top": "Powdery White Musk",
        "heart": "Soft Florals, Cotton, Sandalwood",
        "base": "Clean Musk, Creamy Accord",
        "seo_scent": "White Musk",
        "seo_desc": "MEDINA from the Petal territory — powdery white musk, sandalwood, and cotton in an alcohol-free perfume oil. Glass wand applicator.",
        "tags_extra": "white musk, powdery, sandalwood, cotton, clean, musk tahara",
    },
    {
        "waypoint": "SIWA",
        "territory": "Petal",
        "legacy": "White Egyptian Musk",
        "coords": "29.2032° N, 25.5195° E",
        "top": "ISO E Super, Aldehydes",
        "heart": "Light Musk, Ambroxan",
        "base": "White Amber, Skin Musk",
        "seo_scent": "Skin Musk Amber",
        "seo_desc": "SIWA from the Petal territory — light musk, ambroxan, and white amber in an alcohol-free perfume oil. Glass wand applicator.",
        "tags_extra": "musk, skin scent, ambroxan, amber, white musk, white egyptian musk",
    },
    # === TERRA ===
    {
        "waypoint": "ASTORIA",
        "territory": "Terra",
        "legacy": "Pacific Moss",
        "coords": "46.1879° N, 123.8313° W",
        "top": "Fir Needle, Fresh Sap",
        "heart": "Forest Floor, Green Moss",
        "base": "Cedar, Woody Earth",
        "seo_scent": "Forest Cedar Moss",
        "seo_desc": "ASTORIA from the Terra territory — fir needle, green moss, and cedar in an alcohol-free perfume oil. Glass wand applicator.",
        "tags_extra": "forest, cedar, moss, fir, woody, earthy, pacific moss",
    },
    {
        "waypoint": "HAVANA",
        "territory": "Terra",
        "legacy": "Oud & Tobacco",
        "coords": "23.1136° N, 82.3666° W",
        "top": "Whiskey Accord",
        "heart": "Cinnamon, Coriander",
        "base": "Tobacco, Oud, Incense, Sandalwood, Patchouli, Benzoin, Vanilla, Cedar",
        "seo_scent": "Tobacco Oud",
        "seo_desc": "HAVANA from the Terra territory — whiskey accord, tobacco, and oud in an alcohol-free perfume oil. Glass wand applicator.",
        "tags_extra": "tobacco, oud, whiskey, cinnamon, sandalwood, incense, oud tobacco",
    },
    {
        "waypoint": "HUDSON",
        "territory": "Terra",
        "legacy": "Spanish Sandalwood",
        "coords": "42.2529° N, 73.7910° W",
        "top": "Cardamom, Violet, Iris",
        "heart": "Sandalwood, Cedar",
        "base": "Ambroxan, Leather, Musk",
        "seo_scent": "Sandalwood Leather",
        "seo_desc": "HUDSON from the Terra territory — sandalwood, cedar, and leather in an alcohol-free perfume oil. Glass wand applicator.",
        "tags_extra": "sandalwood, cedar, leather, cardamom, iris, ambroxan, spanish sandalwood",
    },
    {
        "waypoint": "MARRAKESH",
        "territory": "Terra",
        "legacy": None,
        "coords": "31.6295° N, 7.9811° W",
        "top": "Plum, Cardamom, Lavender, Bergamot",
        "heart": "Nutmeg, Rose, Cinnamon, Cumin, Violet, Jasmine",
        "base": "Leather, Oud, Incense, Cedar, Patchouli",
        "seo_scent": "Rich Leather",
        "seo_desc": "MARRAKESH from the Terra territory — leather, oud, and spiced incense in an alcohol-free perfume oil. Glass wand applicator.",
        "tags_extra": "leather, oud, spice, incense, plum, cardamom, rose, cedar",
    },
    {
        "waypoint": "RIYADH",
        "territory": "Terra",
        "legacy": "Black Oud",
        "coords": "24.7136° N, 46.6753° E",
        "top": "Mandarin",
        "heart": "Rose, Oud",
        "base": "Labdanum, Patchouli, Musk",
        "seo_scent": "Rose Oud",
        "seo_desc": "RIYADH from the Terra territory — rose, oud, and labdanum in an alcohol-free perfume oil. Glass wand applicator.",
        "tags_extra": "oud, rose, labdanum, patchouli, musk, black oud",
    },
    {
        "waypoint": "SAMARKAND",
        "territory": "Terra",
        "legacy": "Oud Aura",
        "coords": "39.6542° N, 66.9597° E",
        "top": "Oud",
        "heart": "Vanilla",
        "base": "Birch, Smoky Accord",
        "seo_scent": "Smoky Oud Vanilla",
        "seo_desc": "SAMARKAND from the Terra territory — oud, vanilla, and smoky birch in an alcohol-free perfume oil. Glass wand applicator.",
        "tags_extra": "oud, vanilla, smoky, birch, woody, oud aura",
    },
    {
        "waypoint": "SICILY",
        "territory": "Terra",
        "legacy": "Sicilian Oudh",
        "coords": "37.5994° N, 14.0154° E",
        "top": "Bergamot, Pink Pepper, Davana",
        "heart": "Oud, White Amber, Rosemary",
        "base": "Leather, Musk, Vetiver",
        "seo_scent": "Bergamot Oud Leather",
        "seo_desc": "SICILY from the Terra territory — bergamot, oud, and leather in an alcohol-free perfume oil. Glass wand applicator.",
        "tags_extra": "bergamot, oud, leather, vetiver, rosemary, sicilian oudh",
    },
]


def make_handle(waypoint):
    return waypoint.lower().replace(" ", "-")


def make_body(p):
    parts = []
    if p["legacy"]:
        parts.append(f'<p><em>Formerly known as {p["legacy"]}</em></p>')
    parts.append(f'<p><strong>{p["territory"].upper()}</strong> · {p["coords"]}</p>')
    parts.append(
        f'<p><strong>Top:</strong> {p["top"]} | <strong>Heart:</strong> {p["heart"]} | <strong>Base:</strong> {p["base"]}</p>'
    )
    parts.append(
        "<p>Available in 6ml and 12ml · Glass wand applicator · Alcohol-free · Skin-safe · Cruelty-free · Phthalate-free</p>"
    )
    return "\n".join(parts)


def make_tags(p):
    base_tags = [
        p["territory"].lower(),
        "perfume oil",
        "niche fragrance",
        "alcohol free",
        "skin safe",
        "cruelty free",
    ]
    extras = [t.strip() for t in p["tags_extra"].split(",")]
    all_tags = base_tags + extras
    return ", ".join(all_tags)


def make_seo_title(p):
    return f'{p["waypoint"]} \u2014 {p["seo_scent"]} Perfume Oil | Niche Fragrance | Tarife Attar'


def make_sku(territory, waypoint, size):
    wp = waypoint.replace(" ", "-")
    return f"{territory.upper()}-{wp}-{size.upper()}"


def make_alt(p):
    return f'{p["waypoint"]} Perfume Oil by Tarife Attar | {p["territory"]} Territory'


def generate():
    rows = []
    for p in PRODUCTS:
        handle = make_handle(p["waypoint"])
        territory = p["territory"]
        prices = PRICING[territory]

        # Row 1: full product + 6ml variant
        row1 = {
            "Handle": handle,
            "Title": p["waypoint"],
            "Body (HTML)": make_body(p),
            "Vendor": "Tarife Attar",
            "Product Category": "Health & Beauty > Personal Care > Cosmetics > Perfume & Cologne",
            "Type": "Perfume Oil",
            "Tags": make_tags(p),
            "Published": "TRUE",
            "Option1 Name": "Size",
            "Option1 Value": "6ml",
            "Option2 Name": "",
            "Option2 Value": "",
            "Variant SKU": make_sku(territory, p["waypoint"], "6ML"),
            "Variant Grams": "30",
            "Variant Inventory Tracker": "shopify",
            "Variant Inventory Policy": "deny",
            "Variant Fulfillment Service": "manual",
            "Variant Price": prices["6ml"],
            "Variant Compare At Price": "",
            "Variant Requires Shipping": "TRUE",
            "Variant Taxable": "TRUE",
            "Variant Weight Unit": "g",
            "Image Src": IMAGES[p["waypoint"]],
            "Image Alt Text": make_alt(p),
            "SEO Title": make_seo_title(p),
            "SEO Description": p["seo_desc"],
            "Status": "active",
        }

        # Row 2: handle + 12ml variant only
        row2 = {col: "" for col in COLUMNS}
        row2["Handle"] = handle
        row2["Option1 Name"] = "Size"
        row2["Option1 Value"] = "12ml"
        row2["Variant SKU"] = make_sku(territory, p["waypoint"], "12ML")
        row2["Variant Grams"] = "45"
        row2["Variant Inventory Tracker"] = "shopify"
        row2["Variant Inventory Policy"] = "deny"
        row2["Variant Fulfillment Service"] = "manual"
        row2["Variant Price"] = prices["12ml"]
        row2["Variant Requires Shipping"] = "TRUE"
        row2["Variant Taxable"] = "TRUE"
        row2["Variant Weight Unit"] = "g"

        rows.append(row1)
        rows.append(row2)

    with open(OUTPUT, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=COLUMNS)
        writer.writeheader()
        writer.writerows(rows)

    print(f"CSV written to {OUTPUT}")
    print(f"Total rows (including header): {1 + len(rows)}")
    print(f"Data rows: {len(rows)}")
    print(f"Products: {len(PRODUCTS)}")


if __name__ == "__main__":
    generate()
