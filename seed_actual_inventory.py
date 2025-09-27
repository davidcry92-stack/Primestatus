#!/usr/bin/env python3
"""
Seed the database with actual inventory from the frontend data.
"""

import asyncio
import sys
import os
from datetime import datetime

# Add backend to path
sys.path.append('/app/backend')

from utils.database import products_collection, wictionary_collection

# Actual inventory data (converted from frontend JS to Python)
actual_inventory = [
    # LOWS TIER - IN STOCK
    {
        "name": "New York Skunk",
        "category": "flower",
        "price": 10.0,
        "original_price": 12.0,
        "image": "https://images.unsplash.com/photo-1536658979405-4223fdb31410?w=400&h=400&fit=crop",
        "description": "NYC classic sativa-dominant hybrid with skunky aroma",
        "thc": "16-20%",
        "vendor": "Smoakland Budget",
        "tier": "lows",
        "in_stock": True,
        "rating": 4.2,
        "reviews": 145
    },
    {
        "name": "Lovers Lane",
        "category": "flower",
        "price": 10.0,
        "original_price": 12.0,
        "image": "https://images.unsplash.com/photo-1574072158026-9b26e8c7cf95?w=400&h=400&fit=crop",
        "description": "Romantic sativa-dominant hybrid with uplifting effects",
        "thc": "15-19%",
        "vendor": "Smoakland Budget",
        "tier": "lows",
        "in_stock": True,
        "rating": 4.1,
        "reviews": 98
    },
    {
        "name": "Northern Lights",
        "category": "flower",
        "price": 10.0,
        "original_price": 15.0,
        "image": "https://images.unsplash.com/photo-1570737174876-b1d5dc7b5de4?w=400&h=400&fit=crop",
        "description": "Classic indica-dominant hybrid for relaxation",
        "thc": "16-18%",
        "vendor": "Smoakland Budget",
        "tier": "lows",
        "in_stock": True,
        "rating": 4.2,
        "reviews": 203
    },
    {
        "name": "Ice Cream Cake",
        "category": "flower",
        "price": 12.0,
        "original_price": 15.0,
        "image": "https://images.unsplash.com/photo-1544027993-37dbfe43562a?w=400&h=400&fit=crop",
        "description": "Sweet indica with creamy vanilla notes",
        "thc": "17-21%",
        "vendor": "Smoakland Budget",
        "tier": "lows",
        "in_stock": True,
        "rating": 4.3,
        "reviews": 156
    },
    {
        "name": "Blackberry Kush",
        "category": "flower",
        "price": 10.0,
        "original_price": 12.0,
        "image": "https://images.unsplash.com/photo-1516975381672-39bd9cbad5a0?w=400&h=400&fit=crop",
        "description": "Berry-flavored indica with relaxing effects",
        "thc": "16-20%",
        "vendor": "Smoakland Budget",
        "tier": "lows",
        "in_stock": True,
        "rating": 4.0,
        "reviews": 89
    },
    {
        "name": "Smalls",
        "category": "flower",
        "price": 8.0,
        "original_price": 10.0,
        "image": "https://images.unsplash.com/photo-1576535489495-2b6930f8c7d3?w=400&h=400&fit=crop",
        "description": "Small buds, big value - indica-dominant hybrid",
        "thc": "15-18%",
        "vendor": "Smoakland Budget",
        "tier": "lows",
        "in_stock": True,
        "rating": 3.9,
        "reviews": 67
    },
    {
        "name": "Raspberry Pie",
        "category": "flower",
        "price": 10.0,
        "original_price": 12.0,
        "image": "https://images.unsplash.com/photo-1571842602263-2ef7e6eeba9b?w=400&h=400&fit=crop",
        "description": "Sweet berry indica with dessert-like flavors",
        "thc": "16-19%",
        "vendor": "Smoakland Budget",
        "tier": "lows",
        "in_stock": True,
        "rating": 4.1,
        "reviews": 78
    },
    {
        "name": "Premium Northern Lights",
        "category": "flower",
        "price": 15.0,
        "original_price": 18.0,
        "image": "https://images.unsplash.com/photo-1608064430071-aabfac0b5b54?w=400&h=400&fit=crop",
        "description": "Premium version of the classic Northern Lights",
        "thc": "18-22%",
        "vendor": "Smoakland Budget",
        "tier": "lows",
        "in_stock": True,
        "rating": 4.4,
        "reviews": 134
    },

    # DEPS TIER - IN STOCK
    {
        "name": "LA Pop Rocks",
        "category": "flower",
        "price": 20.0,
        "original_price": 25.0,
        "image": "https://images.unsplash.com/photo-1605197788044-5a32c7078486?w=400&h=400&fit=crop",
        "description": "Popping indica hybrid with sweet flavors",
        "thc": "20-24%",
        "vendor": "Smoakland Standard",
        "tier": "deps",
        "in_stock": True,
        "rating": 4.5,
        "reviews": 167
    },
    {
        "name": "Black Jack",
        "category": "flower",
        "price": 18.0,
        "original_price": 22.0,
        "image": "https://images.unsplash.com/photo-1560450038-7d847b1fb393?w=400&h=400&fit=crop",
        "description": "Energizing sativa hybrid with spicy notes",
        "thc": "18-23%",
        "vendor": "Smoakland Standard",
        "tier": "deps",
        "in_stock": True,
        "rating": 4.3,
        "reviews": 123
    },
    {
        "name": "Maui Waui",
        "category": "flower",
        "price": 22.0,
        "original_price": 25.0,
        "image": "https://images.unsplash.com/photo-1536658979405-4223fdb31410?w=400&h=400&fit=crop",
        "description": "Pure Hawaiian sativa with tropical vibes",
        "thc": "20-25%",
        "vendor": "Smoakland Standard",
        "tier": "deps",
        "in_stock": True,
        "rating": 4.6,
        "reviews": 189
    },
    {
        "name": "Gelato 41",
        "category": "flower",
        "price": 25.0,
        "original_price": 28.0,
        "image": "https://images.unsplash.com/photo-1574072158026-9b26e8c7cf95?w=400&h=400&fit=crop",
        "description": "Premium Gelato phenotype with sweet creamy taste",
        "thc": "25-29%",
        "vendor": "Smoakland Standard",
        "tier": "deps",
        "in_stock": True,
        "rating": 4.7,
        "reviews": 234
    },

    # ZA (ZAZA) TIER - IN STOCK  
    {
        "name": "Lemon Cherry Gelato",
        "category": "flower",
        "price": 35.0,
        "original_price": 35.0,
        "image": "https://images.unsplash.com/photo-1605197788044-5a32c7078486?w=400&h=400&fit=crop",
        "description": "Premium za strain with citrus and cherry notes",
        "thc": "25-30%",
        "vendor": "Smoakland Premium",
        "tier": "za",
        "in_stock": True,
        "rating": 4.9,
        "reviews": 156
    },
    {
        "name": "Playmaker",
        "category": "flower",
        "price": 35.0,
        "original_price": 35.0,
        "image": "https://images.unsplash.com/photo-1560450038-7d847b1fb393?w=400&h=400&fit=crop",
        "description": "Balanced hybrid with energizing effects",
        "thc": "26-30%",
        "vendor": "Smoakland Premium",
        "tier": "za",
        "in_stock": True,
        "rating": 4.8,
        "reviews": 134
    },
    {
        "name": "Purple Runts",
        "category": "flower",
        "price": 35.0,
        "original_price": 35.0,
        "image": "https://images.unsplash.com/photo-1536658979405-4223fdb31410?w=400&h=400&fit=crop",
        "description": "Purple za strain with candy-like flavors",
        "thc": "24-28%",
        "vendor": "Smoakland Premium",
        "tier": "za",
        "in_stock": True,
        "rating": 4.9,
        "reviews": 167
    },
    {
        "name": "Lemon Cherry Push Pop",
        "category": "flower",
        "price": 35.0,
        "original_price": 35.0,
        "image": "https://images.unsplash.com/photo-1574072158026-9b26e8c7cf95?w=400&h=400&fit=crop",
        "description": "Sweet and sour za with push pop flavors",
        "thc": "26-31%",
        "vendor": "Smoakland Premium",
        "tier": "za",
        "in_stock": True,
        "rating": 4.9,
        "reviews": 189
    },

    # EDIBLES - IN STOCK
    {
        "name": "Wyld Gummies - Pear",
        "category": "edibles",
        "price": 20.0,
        "original_price": 20.0,
        "image": "https://images.unsplash.com/photo-1617627191898-1408bf607b4d?w=400&h=400&fit=crop",
        "description": "Premium pear-flavored gummies - 10mg each",
        "thc": "10mg per piece",
        "vendor": "Wyld",
        "tier": "deps",
        "in_stock": True,
        "rating": 4.6,
        "reviews": 234
    },
    {
        "name": "100mg Green Gummy",
        "category": "edibles",
        "price": 15.0,
        "original_price": 15.0,
        "image": "https://images.unsplash.com/photo-1639219579198-7695986aaf01?w=400&h=400&fit=crop",
        "description": "High-dose green gummy bear",
        "thc": "100mg total",
        "vendor": "Local",
        "tier": "lows",
        "in_stock": True,
        "rating": 4.2,
        "reviews": 89
    },

    # VAPES & CONCENTRATES - IN STOCK
    {
        "name": "Vape 1g",
        "category": "vapes",
        "price": 25.0,
        "original_price": 25.0,
        "image": "https://images.unsplash.com/photo-1605118363618-757344cd6efb?w=400&h=400&fit=crop",
        "description": "Premium 1g vape cartridge",
        "thc": "80-85%",
        "vendor": "Local",
        "tier": "deps",
        "in_stock": True,
        "rating": 4.4,
        "reviews": 156
    },
    {
        "name": "Fryd Cart \"Blue Razz\"",
        "category": "vapes",
        "price": 30.0,
        "original_price": 30.0,
        "image": "https://images.unsplash.com/photo-1605117913123-1f455435b384?w=400&h=400&fit=crop",
        "description": "Blue raspberry flavored hybrid vape cart",
        "thc": "85-90%",
        "vendor": "Fryd",
        "tier": "deps",
        "in_stock": True,
        "rating": 4.5,
        "reviews": 178
    },

    # BRANDED PRODUCTS - IN STOCK
    {
        "name": "Paleta Alien 2g Blunt",
        "category": "flower",
        "price": 35.0,
        "original_price": 35.0,
        "image": "https://images.unsplash.com/photo-1649127472494-4bb98d18f08f?w=400&h=400&fit=crop",
        "description": "Premium 2g indica blunt by Paletas",
        "thc": "25-30%",
        "vendor": "Paletas",
        "tier": "za",
        "in_stock": True,
        "rating": 4.8,
        "reviews": 145
    },
    {
        "name": "Sativa Blendz",
        "category": "flower",
        "price": 30.0,
        "original_price": 30.0,
        "image": "https://images.unsplash.com/photo-1653500976637-a020cdba6bd5?w=400&h=400&fit=crop",
        "description": "Premium sativa strain blend",
        "thc": "20-25%",
        "vendor": "Blendz",
        "tier": "deps",
        "in_stock": True,
        "rating": 4.6,
        "reviews": 167
    },
    {
        "name": "Smoakies 4 Pack",
        "category": "flower",
        "price": 20.0,
        "original_price": 20.0,
        "image": "https://images.unsplash.com/photo-1625565828426-c4b6ce15b76d?w=400&h=400&fit=crop",
        "description": "4-pack of premium pre-rolled joints",
        "thc": "18-23%",
        "vendor": "Smoakies",
        "tier": "deps",
        "in_stock": True,
        "rating": 4.4,
        "reviews": 189
    },

    # OUT OF STOCK PRODUCTS
    {
        "name": "Gelato",
        "category": "flower",
        "price": 10.0,
        "original_price": 12.0,
        "image": "https://images.unsplash.com/photo-1536658979405-4223fdb31410?w=400&h=400&fit=crop",
        "description": "Classic Gelato indica-dominant strain",
        "thc": "18-22%",
        "vendor": "Smoakland Budget",
        "tier": "lows",
        "in_stock": False,
        "rating": 4.3,
        "reviews": 145
    },
    {
        "name": "Cherry Runts",
        "category": "flower",
        "price": 12.0,
        "original_price": 15.0,
        "image": "https://images.unsplash.com/photo-1574072158026-9b26e8c7cf95?w=400&h=400&fit=crop",
        "description": "Sweet cherry-flavored sativa hybrid",
        "thc": "17-21%",
        "vendor": "Smoakland Budget",
        "tier": "lows",
        "in_stock": False,
        "rating": 4.1,
        "reviews": 98
    },
    {
        "name": "Bronx Glue",
        "category": "flower",
        "price": 20.0,
        "original_price": 25.0,
        "image": "https://images.unsplash.com/photo-1560450038-7d847b1fb393?w=400&h=400&fit=crop",
        "description": "NYC-inspired indica-dominant hybrid",
        "thc": "22-26%",
        "vendor": "Smoakland Standard",
        "tier": "deps",
        "in_stock": False,
        "rating": 4.5,
        "reviews": 167
    }
]

# Wictionary terms with cannabis slang and strain definitions
wictionary_terms = [
    {
        "term": "Za",
        "definition": "Premium, top-shelf cannabis. The highest quality tier available, typically featuring exotic strains with exceptional potency and flavor profiles.",
        "category": "slang",
        "etymology": "NYC cannabis culture term derived from 'exotic' - represents the pinnacle of cannabis quality"
    },
    {
        "term": "Deps",
        "definition": "Mid-tier cannabis quality. Good quality flower that's dependable and consistent, offering solid effects without premium pricing.",
        "category": "slang",
        "etymology": "Short for 'dependable' - reliable mid-tier cannabis that delivers consistent results"
    },
    {
        "term": "Lows",
        "definition": "Budget-friendly cannabis tier. Entry-level pricing for quality flower, perfect for daily use without breaking the bank.",
        "category": "slang",
        "etymology": "Refers to lower price point, not necessarily lower quality - accessible cannabis for all budgets"
    },
    {
        "term": "Sesher",
        "definition": "A person who regularly participates in cannabis sessions. Someone who enjoys sharing and consuming cannabis in social settings.",
        "category": "slang",
        "etymology": "Derived from 'session' - refers to someone who partakes in group cannabis consumption"
    },
    {
        "term": "Mids",
        "definition": "Medium-grade cannabis. Not the highest quality but not the lowest either - decent flower for everyday use.",
        "category": "slang",
        "etymology": "Short for 'middles' or 'mid-grade' - cannabis that falls in the middle quality range"
    },
    {
        "term": "Terps",
        "definition": "Terpenes - aromatic compounds found in cannabis that contribute to flavor, aroma, and effects. Key indicators of quality and strain characteristics.",
        "category": "science",
        "etymology": "Shortened form of 'terpenes' - scientific term for aromatic compounds in cannabis"
    },
    {
        "term": "Loud",
        "definition": "High-quality cannabis with a strong, pungent aroma. Flower that announces its presence with powerful scent.",
        "category": "slang",
        "etymology": "NYC street term - cannabis so aromatic it's 'loud' even when contained"
    },
    {
        "term": "Fire",
        "definition": "Exceptionally good quality cannabis. Top-tier flower with outstanding potency, flavor, and effects.",
        "category": "slang",
        "etymology": "Universal cannabis culture term indicating exceptional quality"
    },
    {
        "term": "Gelato",
        "definition": "Popular indica-dominant hybrid strain known for sweet, dessert-like flavors and balanced effects. Parent to many modern cultivars.",
        "category": "culture",
        "etymology": "Named for its sweet, creamy flavor profile reminiscent of Italian gelato ice cream"
    },
    {
        "term": "Northern Lights",
        "definition": "Classic indica strain famous for its relaxing effects and resilient growing characteristics. One of the most recognized cannabis strains worldwide.",
        "category": "culture",
        "etymology": "Named after the Aurora Borealis phenomenon, reflecting the strain's legendary status"
    },
    {
        "term": "Hybrid",
        "definition": "Cannabis strain created by crossing indica and sativa varieties, combining characteristics from both parent types.",
        "category": "science",
        "etymology": "Scientific breeding term - refers to offspring of different cannabis subspecies"
    },
    {
        "term": "Indica",
        "definition": "Cannabis subspecies typically associated with relaxing, sedating effects. Often preferred for evening use and pain relief.",
        "category": "science",
        "etymology": "Scientific classification - Cannabis indica, originally from the Indian subcontinent"
    },
    {
        "term": "Sativa",
        "definition": "Cannabis subspecies typically associated with energizing, uplifting effects. Often preferred for daytime use and creativity.",
        "category": "science",
        "etymology": "Scientific classification - Cannabis sativa, meaning 'cultivated cannabis'"
    },
    {
        "term": "THC",
        "definition": "Tetrahydrocannabinol - the primary psychoactive compound in cannabis responsible for the 'high' effect.",
        "category": "science",
        "etymology": "Scientific abbreviation for the main psychoactive cannabinoid in cannabis"
    },
    {
        "term": "Bodega",
        "definition": "NYC corner store where cannabis accessories and related products are often sold. Cultural hub of neighborhood cannabis community.",
        "category": "culture",
        "etymology": "NYC cultural term for corner stores, often serving as informal cannabis community centers"
    },
    {
        "term": "Eighth",
        "definition": "3.5 grams of cannabis flower - one-eighth of an ounce. Standard purchase quantity for personal use.",
        "category": "culture",
        "etymology": "Measurement term - 1/8th of an ounce, standard cannabis retail unit"
    },
    {
        "term": "Blunt",
        "definition": "Cannabis rolled in tobacco leaf or cigar wrap. Popular consumption method in urban cannabis culture.",
        "category": "culture",
        "etymology": "Named after Phillies Blunt cigars commonly used for rolling cannabis"
    },
    {
        "term": "Cart",
        "definition": "Vape cartridge containing cannabis oil. Convenient, discreet method of cannabis consumption.",
        "category": "culture",
        "etymology": "Shortened form of 'cartridge' - refers to pre-filled vape containers"
    },
    {
        "term": "Dab",
        "definition": "Cannabis concentrate consumption method involving vaporization on a heated surface. High-potency consumption technique.",
        "category": "culture",
        "etymology": "Refers to the small 'dab' amount needed due to concentrate potency"
    },
    {
        "term": "Kush",
        "definition": "Cannabis strain family originating from the Hindu Kush mountain region. Known for potent, relaxing effects and earthy flavors.",
        "category": "culture",
        "etymology": "Geographic origin - Hindu Kush mountain range between Afghanistan and Pakistan"
    },
    {
        "term": "OG",
        "definition": "Original Gangster - refers to classic, foundational cannabis strains. Also indicates authenticity and quality in cannabis culture.",
        "category": "culture",
        "etymology": "Hip-hop culture term adopted by cannabis community to indicate original, authentic strains"
    },
    {
        "term": "Runts",
        "definition": "Cannabis strain known for fruity, candy-like flavors reminiscent of Runts candy. Popular for its sweet taste profile.",
        "category": "culture",
        "etymology": "Named after Runts candy due to similar fruity, sweet flavor characteristics"
    },
    {
        "term": "Exotic",
        "definition": "Premium cannabis strains with unique genetics, rare terpene profiles, or exceptional quality. Top-tier cannabis varieties.",
        "category": "slang",
        "etymology": "Indicates rare, unique, or exceptionally high-quality cannabis varieties"
    },
    {
        "term": "Gassy",
        "definition": "Cannabis with strong fuel-like aroma, often indicating high potency and quality. Desirable terpene profile characteristic.",
        "category": "slang",
        "etymology": "Describes the fuel or gas-like aroma of certain high-quality cannabis strains"
    },
    {
        "term": "Sticky",
        "definition": "Cannabis flower with high resin content, indicating freshness and potency. Desirable texture characteristic.",
        "category": "slang",
        "etymology": "Refers to the tactile quality of resinous, high-quality cannabis flower"
    }
]

async def seed_database():
    """Seed the database with actual inventory and wictionary terms."""
    print("🌱 Starting database seeding with actual inventory...")
    
    # Clear existing products (keep only if you want to replace all)
    print("Clearing existing products...")
    await products_collection.delete_many({})
    
    # Add timestamps to products
    for product in actual_inventory:
        product["created_at"] = datetime.utcnow()
        product["updated_at"] = datetime.utcnow()
    
    # Insert actual inventory
    print(f"Inserting {len(actual_inventory)} products...")
    result = await products_collection.insert_many(actual_inventory)
    print(f"✅ Inserted {len(result.inserted_ids)} products")
    
    # Clear existing wictionary terms
    print("Clearing existing wictionary terms...")
    await wictionary_collection.delete_many({})
    
    # Add missing fields to wictionary terms
    for term in wictionary_terms:
        term["examples"] = []
        term["related_terms"] = []
        term["created_at"] = datetime.utcnow()
        term["updated_at"] = datetime.utcnow()
    
    # Insert wictionary terms
    print(f"Inserting {len(wictionary_terms)} wictionary terms...")
    result = await wictionary_collection.insert_many(wictionary_terms)
    print(f"✅ Inserted {len(result.inserted_ids)} wictionary terms")
    
    # Verify seeding
    product_count = await products_collection.count_documents({})
    wictionary_count = await wictionary_collection.count_documents({})
    
    print(f"\n📊 Database seeding complete!")
    print(f"Total products: {product_count}")
    print(f"Total wictionary terms: {wictionary_count}")
    
    # Show tier distribution
    za_count = await products_collection.count_documents({"tier": "za"})
    deps_count = await products_collection.count_documents({"tier": "deps"})
    lows_count = await products_collection.count_documents({"tier": "lows"})
    
    print(f"\nTier distribution:")
    print(f"Za (Premium): {za_count}")
    print(f"Deps (Mid-tier): {deps_count}")
    print(f"Lows (Budget): {lows_count}")
    
    # Show category distribution
    flower_count = await products_collection.count_documents({"category": "flower"})
    edibles_count = await products_collection.count_documents({"category": "edibles"})
    vapes_count = await products_collection.count_documents({"category": "vapes"})
    
    print(f"\nCategory distribution:")
    print(f"Flower: {flower_count}")
    print(f"Edibles: {edibles_count}")
    print(f"Vapes: {vapes_count}")
    
    # Show brand distribution
    brands = await products_collection.distinct("vendor")
    print(f"\nBrands available: {', '.join(brands)}")

if __name__ == "__main__":
    asyncio.run(seed_database())