#!/usr/bin/env python3
"""
gastronomic_fix.py — Script de correction complète de la base de données Michelin.
Applique toutes les corrections identifiées lors de l'audit.
"""

import sqlite3
import re
import json
import os
from collections import defaultdict
from typing import Dict, List, Tuple, Set

DB_PATH = '/home/ff/workspace/projects/menu-analytics/menu_analytics.db'
OUTPUT_DIR = '/home/ff/workspace/projects/menu-analytics-dashboard/my-app/src/data'

# ═══════════════════════════════════════════════════════════════════════════════
# CORRECTIONS À APPLIQUER
# ═══════════════════════════════════════════════════════════════════════════════

# 1. CORRECTION DES DOUBLONS ORTHOGRAPHIQUES
ORTHOGRAPHIC_FIXES = {
    "celeri": "céleri",  # Standardiser sur la version accentuée
}

# 2. NOUVELLES CATÉGORIES À CRÉER
NEW_CATEGORIES = ["epice", "herbe", "produit_laitier", "cereale", "condiment"]

# 3. RÈGLES DE Sous-TYPES À APPLIQUER
SUBTYPE_FIXES = [
    # Chou → chou-fleur quand le plat contient "chou-fleur"
    ("chou", r"chou[- ]?fleur", "chou-fleur"),
    # Chou → choucroute quand le plat contient "choucroute"  
    ("chou", r"choucroute", "choucroute"),
    # Chou → chou de Bruxelles quand le plat contient "chou de bruxelles"
    ("chou", r"chou[s]? de bruxelles", "chou de Bruxelles"),
]

# 4. INGRÉDIENTS MANQUANTS À EXTRAIRE avec patterns de détection
MISSING_INGREDIENTS_PATTERNS = {
    # Épices et aromates
    "vanille": (r"vanille", "epice"),
    "safran": (r"safran", "epice"),
    "poivre": (r"\bpoivre\b", "epice"),
    "gingembre": (r"gingembre", "epice"),
    "cardamome": (r"cardamome", "epice"),
    "cannelle": (r"cannelle", "epice"),
    "muscade": (r"muscade", "epice"),
    "piment": (r"\bpiment\b", "epice"),
    "miso": (r"miso", "epice"),
    "wasabi": (r"wasabi", "epice"),
    "yuzu kosho": (r"yuzu\s+kosho", "epice"),
    "fleur de sel": (r"fleur\s+de\s+sel", "epice"),
    
    # Herbes
    "basilic": (r"basilic", "herbe"),
    "thym": (r"\bthym\b", "herbe"),
    "romarin": (r"romarin", "herbe"),
    "estragon": (r"estragon", "herbe"),
    "persil": (r"persil", "herbe"),
    "coriandre": (r"coriandre", "herbe"),
    "cerfeuil": (r"cerfeuil", "herbe"),
    "livèche": (r"livèche", "herbe"),
    "sarriette": (r"sarriette", "herbe"),
    "menthe": (r"\bmenthe\b", "herbe"),
    "laurier": (r"laurier", "herbe"),
    "citronnelle": (r"citronnelle", "herbe"),
    "ciboulette": (r"ciboulette", "herbe"),
    
    # Produits laitiers
    "beurre": (r"\bbeurre\b(?!\s+noisette)", "produit_laitier"),  # Exclure beurre noisette
    "beurre salé": (r"beurre\s+salé", "produit_laitier"),
    "crème": (r"\bcr[eè]me\b", "produit_laitier"),
    "fromage": (r"\bfromage\b", "produit_laitier"),
    "comté": (r"comt[ée]|\bcomte\b", "produit_laitier"),
    "parmesan": (r"parmesan", "produit_laitier"),
    "reblochon": (r"reblochon", "produit_laitier"),
    "yaourt": (r"yaourt", "produit_laitier"),
    "lait": (r"\blait\b", "produit_laitier"),
    
    # Céréales/Féculents
    "riz": (r"\briz\b", "cereale"),
    "blé": (r"\bblé\b", "cereale"),
    "quinoa": (r"quinoa", "cereale"),
    "sarrasin": (r"sarrasin", "cereale"),
    "gnocchi": (r"gnocchi", "cereale"),
    "polenta": (r"polenta", "cereale"),
    "pain": (r"\bpain\b", "cereale"),
    "brioche": (r"brioche", "cereale"),
    "biscuit": (r"biscuit", "cereale"),
    
    # Condiments/Autres
    "huile d'olive": (r"huile\s+d['\s]?olive", "condiment"),
    "vinaigre": (r"vinaigre", "condiment"),
    "vinaigrette": (r"vinaigrette", "condiment"),
    "moutarde": (r"moutarde", "condiment"),
    "mayonnaise": (r"mayonnaise", "condiment"),
    "sauce soja": (r"sauce\s+soja|soja", "condiment"),
    "miel": (r"\bmiel\b", "condiment"),
    "sirop": (r"\bsirop\b", "condiment"),
    
    # Légumes supplémentaires
    "butternut": (r"butternut", "legume"),
    "salsifi": (r"salsifi", "legume"),
    "potimarron": (r"potimarron", "legume"),
    "patate douce": (r"patate\s+douce", "legume"),
    "cèpe": (r"\bcèpe\b|cèpes", "champignon"),
    "chanterelle": (r"chanterelle", "champignon"),
    
    # Fruits supplémentaires
    "bergamote": (r"bergamote", "fruit"),
    "citron vert": (r"citron\s+vert", "fruit"),
}

def get_db_connection():
    return sqlite3.connect(DB_PATH)

def fix_orthographic_duplicates(conn):
    """Corrige les doublons orthographiques (celeri → céleri)."""
    cursor = conn.cursor()
    
    # Fusionne les entrées avec céleri
    for old, new in ORTHOGRAPHIC_FIXES.items():
        # Vérifie si les deux existent
        cursor.execute('SELECT id FROM ingredients_clean WHERE ingredient = ?', (old,))
        old_ids = [r[0] for r in cursor.fetchall()]
        
        cursor.execute('SELECT id FROM ingredients_clean WHERE ingredient = ?', (new,))
        new_ids = [r[0] for r in cursor.fetchall()]
        
        if old_ids and new_ids:
            # Supprime les anciennes entrées (la nouvelle catégorie est déjà correcte)
            cursor.execute('DELETE FROM ingredients_clean WHERE ingredient = ?', (old,))
            print(f"  ✅ Fusionné '{old}' → '{new}' ({len(old_ids)} entrées)")
        elif old_ids:
            # Renomme si seule l'ancienne existe
            cursor.execute('UPDATE ingredients_clean SET ingredient = ? WHERE ingredient = ?', (new, old))
            print(f"  ✅ Renommé '{old}' → '{new}' ({len(old_ids)} entrées)")
    
    conn.commit()

def fix_subtypes(conn):
    """Sépare les ingrédients génériques en sous-types."""
    cursor = conn.cursor()
    
    updates = []
    for generic_ing, pattern, subtype in SUBTYPE_FIXES:
        cursor.execute('''
            SELECT i.id, i.ingredient, p.nom_plat 
            FROM ingredients_clean i
            JOIN plats p ON i.plat_id = p.id
            WHERE i.ingredient = ?
        ''', (generic_ing,))
        
        for row in cursor.fetchall():
            ing_id, ingredient, dish_name = row
            if re.search(pattern, dish_name, re.IGNORECASE):
                updates.append((subtype, ing_id))
    
    # Applique les mises à jour
    cursor.executemany('UPDATE ingredients_clean SET ingredient = ? WHERE id = ?', updates)
    conn.commit()
    
    print(f"  ✅ {len(updates)} sous-types séparés")
    return len(updates)

def extract_missing_ingredients(conn):
    """Extrait les ingrédients manquants des noms de plats."""
    cursor = conn.cursor()
    
    # Récupère les plats
    cursor.execute('SELECT id, nom_plat FROM plats WHERE nom_plat IS NOT NULL')
    dishes = cursor.fetchall()
    
    # Récupère les ingrédients existants par plat (pour éviter les doublons)
    cursor.execute('SELECT plat_id, ingredient FROM ingredients_clean')
    existing_by_plat = defaultdict(set)
    for plat_id, ing in cursor.fetchall():
        existing_by_plat[plat_id].add(ing.lower())
    
    new_ingredients = []
    
    for plat_id, dish_name in dishes:
        if not dish_name:
            continue
        dish_lower = dish_name.lower()
        existing = existing_by_plat[plat_id]
        
        for ingredient, (pattern, category) in MISSING_INGREDIENTS_PATTERNS.items():
            if ingredient.lower() in existing:
                continue
            if re.search(pattern, dish_lower, re.IGNORECASE):
                new_ingredients.append((plat_id, ingredient, category))
                existing.add(ingredient.lower())  # Évite les doublons dans le même plat
    
    # Insère les nouveaux ingrédients
    cursor.executemany(
        'INSERT INTO ingredients_clean (plat_id, ingredient, categorie_ingredient) VALUES (?, ?, ?)',
        new_ingredients
    )
    conn.commit()
    
    # Compte par catégorie
    by_category = defaultdict(int)
    for _, _, cat in new_ingredients:
        by_category[cat] += 1
    
    print(f"  ✅ {len(new_ingredients)} ingrédients manquants extraits:")
    for cat, count in sorted(by_category.items(), key=lambda x: -x[1]):
        print(f"      • {cat}: {count}")
    
    return len(new_ingredients)

def generate_json_files(conn):
    """Régénère les fichiers JSON pour le dashboard."""
    cursor = conn.cursor()
    
    # Récupère les stats par ingrédient avec info restaurants/étoiles
    cursor.execute('''
        SELECT 
            i.ingredient,
            i.categorie_ingredient,
            COUNT(*) as frequency,
            COUNT(DISTINCT r.id) as restaurants,
            r.distinction_michelin
        FROM ingredients_clean i
        JOIN plats p ON i.plat_id = p.id
        JOIN restaurants r ON p.restaurant_id = r.id
        GROUP BY i.ingredient, i.categorie_ingredient, r.distinction_michelin
    ''')
    
    ingredient_data = defaultdict(lambda: {
        'frequency': 0,
        'restaurants': set(),
        'by_stars': defaultdict(int),
        'category': ''
    })
    
    for row in cursor.fetchall():
        ingredient, category, freq, resto_id, stars = row
        ingredient_data[ingredient]['frequency'] += freq
        ingredient_data[ingredient]['restaurants'].add(resto_id)
        ingredient_data[ingredient]['category'] = category
        if stars:
            ingredient_data[ingredient]['by_stars'][stars] += freq
    
    # Total des plats pour calcul des pourcentages
    cursor.execute('SELECT COUNT(*) FROM plats')
    total_dishes = cursor.fetchone()[0]
    
    # Crée la liste des ingrédients
    ingredients_list = []
    for ingredient, data in ingredient_data.items():
        by_stars = dict(data['by_stars'])
        ingredients_list.append({
            'id': ingredient.replace(' ', '-'),
            'name': ingredient,
            'category': data['category'],
            'frequency': data['frequency'],
            'frequency_percent': round(data['frequency'] / total_dishes * 100, 2),
            'restaurants': len(data['restaurants']),
            'by_stars': by_stars,
            'star_percentages': {
                k: round(v / data['frequency'] * 100, 2) if data['frequency'] > 0 else 0
                for k, v in by_stars.items()
            }
        })
    
    # Trie par fréquence
    ingredients_list.sort(key=lambda x: -x['frequency'])
    
    # Sauvegarde
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    with open(os.path.join(OUTPUT_DIR, 'ingredients.json'), 'w', encoding='utf-8') as f:
        json.dump(ingredients_list, f, ensure_ascii=False, indent=2)
    
    print(f"  ✅ ingredients.json généré ({len(ingredients_list)} ingrédients)")
    
    # Génère dishes.json (infos des plats)
    cursor.execute('''
        SELECT p.id, p.nom_plat, p.category, r.distinction_michelin, r.ville
        FROM plats p
        JOIN restaurants r ON p.restaurant_id = r.id
    ''')
    
    dishes = []
    for row in cursor.fetchall():
        dishes.append({
            'id': row[0],
            'name': row[1],
            'category': row[2],
            'stars': row[3],
            'city': row[4]
        })
    
    with open(os.path.join(OUTPUT_DIR, 'dishes.json'), 'w', encoding='utf-8') as f:
        json.dump(dishes, f, ensure_ascii=False, indent=2)
    
    print(f"  ✅ dishes.json généré ({len(dishes)} plats)")
    
    return len(ingredients_list), len(dishes)

def print_stats(conn):
    """Affiche les statistiques finales."""
    cursor = conn.cursor()
    
    print("\n" + "="*80)
    print("STATISTIQUES FINALES")
    print("="*80)
    
    cursor.execute('SELECT COUNT(*) FROM ingredients_clean')
    total_ing = cursor.fetchone()[0]
    print(f"\n  Total ingrédients: {total_ing}")
    
    cursor.execute('SELECT COUNT(DISTINCT ingredient) FROM ingredients_clean')
    unique_ing = cursor.fetchone()[0]
    print(f"  Ingrédients uniques: {unique_ing}")
    
    print("\n  Par catégorie:")
    cursor.execute('''
        SELECT categorie_ingredient, COUNT(*) 
        FROM ingredients_clean 
        GROUP BY categorie_ingredient 
        ORDER BY COUNT(*) DESC
    ''')
    for row in cursor.fetchall():
        print(f"    • {row[0]}: {row[1]}")
    
    # Top 10 ingrédients
    print("\n  Top 10 ingrédients:")
    cursor.execute('''
        SELECT ingredient, COUNT(*) 
        FROM ingredients_clean 
        GROUP BY ingredient 
        ORDER BY COUNT(*) DESC 
        LIMIT 10
    ''')
    for row in cursor.fetchall():
        print(f"    • {row[0]}: {row[1]}")

def main():
    print("="*80)
    print("CORRECTION GASTRONOMIQUE COMPLÈTE")
    print("="*80)
    
    conn = get_db_connection()
    
    # 1. Corrige les doublons orthographiques
    print("\n1. Correction des doublons orthographiques...")
    fix_orthographic_duplicates(conn)
    
    # 2. Sépare les sous-types
    print("\n2. Séparation des sous-types...")
    subtype_count = fix_subtypes(conn)
    
    # 3. Extrait les ingrédients manquants
    print("\n3. Extraction des ingrédients manquants...")
    missing_count = extract_missing_ingredients(conn)
    
    # 4. Génère les JSON
    print("\n4. Génération des fichiers JSON...")
    ing_count, dish_count = generate_json_files(conn)
    
    # 5. Stats finales
    print_stats(conn)
    
    conn.close()
    
    print("\n" + "="*80)
    print("✅ CORRECTIONS TERMINÉES")
    print("="*80)
    
    return {
        'subtypes_fixed': subtype_count,
        'missing_extracted': missing_count,
        'total_ingredients': ing_count,
        'total_dishes': dish_count
    }

if __name__ == "__main__":
    main()
