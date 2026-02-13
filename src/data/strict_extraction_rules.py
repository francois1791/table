#!/usr/bin/env python3
"""
strict_extraction_rules.py — Règles strictes d'extraction d'ingrédients.

Ce fichier définit:
1. EXCLUSION_RULES: pour chaque ingrédient, les patterns de faux positifs à rejeter
2. validate_ingredient(): fonction qui vérifie si un ingrédient est un vrai positif dans un nom de plat
3. clean_database(): applique les règles à la base existante et supprime les faux positifs

Usage:
  - Import: from strict_extraction_rules import validate_ingredient, EXCLUSION_RULES
  - CLI:     python3 strict_extraction_rules.py          # audit seul (dry run)
  - CLI:     python3 strict_extraction_rules.py --apply   # applique les corrections
"""

import sqlite3
import re
import sys
import os

# ═══════════════════════════════════════════════════════════════════════════════
# RÈGLES D'EXCLUSION — Un ingrédient est un FAUX POSITIF si le nom du plat
# matche l'un des patterns d'exclusion listés.
# ═══════════════════════════════════════════════════════════════════════════════

EXCLUSION_RULES: dict[str, list[str]] = {

    # ── NOIX ──────────────────────────────────────────────────────────────────
    # "noix" seul = noix (walnut). Mais beaucoup d'expressions composées
    # utilisent "noix de X" pour désigner une coupe de viande ou autre chose.
    "noix": [
        r"noix de saint[- ]?jacques",   # chair de coquille saint-jacques
        r"noix de st[- ]?jacques",       # abrégé
        r"noix de coquille",            # noix de coquille saint-jacques
        r"noix de coco",                 # fruit tropical, pas noix
        r"noix de ris",                  # coupe de ris de veau
        r"noix de veau",                 # coupe de veau
        r"noix de joue",                 # coupe de joue
        r"noix de pécan",               # fruit sec distinct
        r"noix de cajou",               # fruit sec distinct
        r"noix de macadamia",           # fruit sec distinct
        r"noix de muscade",             # épice
        r"coconut",                      # anglais
    ],

    # ── NOISETTE ──────────────────────────────────────────────────────────────
    # "noisette" seul = noisette (hazelnut). Mais "beurre noisette" = beurre
    # clarifié, et "noisette de chevreuil" = coupe de viande.
    "noisette": [
        r"beurre noisette",
        r"noisettes? de chevreuil",
        r"noisettes? de veau",
        r"noisettes? d'agneau",
        r"noisettes? de biche",
        r"noisettes? de cerf",
        r"noisettes? de lapin",
        r"noisettes? de porc",
        r"noisettes? de marcassin",
        r"noisettes? de pré[- ]?salé",
        r"noisettes? de lièvre",
        r"noisettes? de sanglier",
    ],

    # ── PIGNON ────────────────────────────────────────────────────────────────
    # "pignon" seul = pignon de pin (pine nut). Mais "champignon" contient "pignon".
    "pignon": [
        r"champignon",
    ],

    # ── BAR ───────────────────────────────────────────────────────────────────
    # "bar" seul = bar (sea bass). Mais "barbue", "rhubarbe" contiennent "bar".
    "bar": [
        r"barb",          # barbue, barbecue, barbe
        r"barocco",
        r"baroque",
        r"rhubarbe",
    ],

    # ── AIL ───────────────────────────────────────────────────────────────────
    # "ail" seul = ail (garlic). Mais "volaille", "cocktail", "aile" contiennent "ail".
    # On utilise une approche POSITIVE: on vérifie que "ail" apparaît comme mot propre.
    # Les patterns ci-dessous listent les mots qui contiennent "ail" sans être de l'ail.
    "ail": [
        r"volaille",
        r"cocktail",
        r"\baile\b",      # aile de raie (NOT ail)
        r"\bailes\b",     # ailes
        r"médaillon",
        r"éventail",
        r"vitrail",
        r"sérail",
        r"travail",
        r"détail",
        r"corail",
        r"caille",
        r"paille",
        r"quaille",
        r"bailey",
        r"émaille",
        r"mail\b",
        r"marsannay",     # vin
    ],

    # ── OIE ───────────────────────────────────────────────────────────────────
    "oie": [
        r"foie",
    ],

    # ── POMME ─────────────────────────────────────────────────────────────────
    # "pomme" seul = pomme (apple). Mais "pomme de terre" = potato.
    "pomme": [
        r"pomme de terre",
        r"pommes de terre",
    ],

    # ── COCO ──────────────────────────────────────────────────────────────────
    "coco": [
        r"cocotte",
        r"cocon\b",
        r"coconut",
    ],

    # ── PIN ───────────────────────────────────────────────────────────────────
    "pin": [
        r"pintade",
        r"topinambour",
        r"épinard",
        r"pince",
        r"pincée",
        r"sapin",
        r"lapin",
    ],

    # ── RIS ───────────────────────────────────────────────────────────────────
    # Ne pas extraire "ris" seul s'il fait partie de "ris de veau" (sweetbreads ≠ rice)
    "ris": [
        r"ris de veau",
        r"ris de veau de lait",
    ],

    # ── BETTE ─────────────────────────────────────────────────────────────────
    "bette": [
        r"betterave",
    ],
}


# ═══════════════════════════════════════════════════════════════════════════════
# VALIDATION POSITIVE — Pour certains ingrédients courts et ambigus, on utilise
# un pattern positif (l'ingrédient DOIT matcher ce pattern pour être accepté)
# au lieu d'une liste d'exclusions.
# ═══════════════════════════════════════════════════════════════════════════════

POSITIVE_RULES: dict[str, str] = {
    # "ail" doit apparaître comme mot propre ou dans une expression culinaire d'ail
    "ail": r"""(?ix)                     # case-insensitive, verbose
        \bail\b                          # mot "ail" isolé
        | à\s+l'ail                      # à l'ail
        | d'ail                          # d'ail
        | aïoli                          # aïoli
        | aillet                         # aillet (jeune ail)
        | ail\s+(noir|confit|doux|frais|rose|des\s+ours|jeune)  # ail qualifié
        | aillé                          # aillé
        | crème\s+d'ail                  # crème d'ail
        | persillade                     # contient de l'ail
    """,
}


# ═══════════════════════════════════════════════════════════════════════════════
# SÉPARATION DE SOUS-TYPES — Certains ingrédients génériques doivent être
# séparés en sous-types distincts sur le plan gastronomique.
# Format: { ingrédient_générique: { sous_type: regex_pattern } }
# ═══════════════════════════════════════════════════════════════════════════════

SUBTYPE_RULES: dict[str, dict[str, str]] = {
    "ail": {
        "ail noir":      r"ail\s+noir",         # fermenté, goût umami/sucré
        "ail des ours":  r"ail\s+des\s+ours",   # plante sauvage
        "aillet":        r"aillet",              # jeune pousse d'ail
        "ail confit":    r"ail\s+confit",        # confit, texture fondante
    },
    "chou": {
        "chou-fleur":       r"chou[-\s]?fleur",        # chou-fleur
        "choucroute":       r"choucroute",             # choucroute
        "chou de Bruxelles": r"chou[s]?\s+de\s+bruxelles",  # chou de Bruxelles
    },
}


def resolve_subtype(ingredient: str, dish_name: str) -> str:
    """
    Résout le sous-type gastronomique d'un ingrédient.
    Ex: "ail" dans "magret, ail noir" → "ail noir"
    
    Returns:
        Le sous-type si trouvé, sinon l'ingrédient original.
    """
    if ingredient in SUBTYPE_RULES:
        dish_lower = dish_name.lower()
        for subtype, pattern in SUBTYPE_RULES[ingredient].items():
            if re.search(pattern, dish_lower, re.IGNORECASE):
                return subtype
    return ingredient


def validate_ingredient(ingredient: str, dish_name: str) -> bool:
    """
    Vérifie si un ingrédient est un vrai positif dans un nom de plat.
    
    Logique:
    - Si POSITIVE_RULES existe pour cet ingrédient:
        → L'ingrédient est valide SEULEMENT si le positive pattern matche.
        → Les exclusion rules ne sont PAS vérifiées (le positive rule prime).
    - Sinon, on vérifie les EXCLUSION_RULES:
        → Si un pattern d'exclusion matche → faux positif.
    
    Returns:
        True  = l'ingrédient est valide (vrai positif)
        False = l'ingrédient est un faux positif (à rejeter)
    """
    dish_lower = dish_name.lower()
    
    # 1. Si une règle positive existe, elle est EXCLUSIVE (remplace les exclusions)
    if ingredient in POSITIVE_RULES:
        return bool(re.search(POSITIVE_RULES[ingredient], dish_lower))
    
    # 2. Sinon, vérifier les règles d'exclusion
    if ingredient in EXCLUSION_RULES:
        for pattern in EXCLUSION_RULES[ingredient]:
            if re.search(pattern, dish_lower, re.IGNORECASE):
                return False
    
    return True


def audit_database(db_path: str) -> list[dict]:
    """Audite la base et retourne la liste des faux positifs."""
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    cursor.execute('''
        SELECT i.id, i.ingredient, i.categorie_ingredient, p.nom_plat, p.id
        FROM ingredients_clean i
        JOIN plats p ON i.plat_id = p.id
    ''')
    
    false_positives = []
    for row in cursor.fetchall():
        ing_id, ingredient, category, dish_name, plat_id = row
        if not validate_ingredient(ingredient, dish_name):
            false_positives.append({
                'ing_id': ing_id,
                'ingredient': ingredient,
                'category': category,
                'dish': dish_name,
                'plat_id': plat_id,
            })
    
    conn.close()
    return false_positives


def clean_database(db_path: str, dry_run: bool = True) -> int:
    """
    Supprime les faux positifs de la base de données.
    
    Args:
        db_path: chemin vers la base SQLite
        dry_run: si True, affiche seulement les résultats sans modifier la base
    
    Returns:
        nombre de faux positifs trouvés/supprimés
    """
    false_positives = audit_database(db_path)
    
    # Group by ingredient
    from collections import defaultdict
    by_ingredient = defaultdict(list)
    for fp in false_positives:
        by_ingredient[fp['ingredient']].append(fp)
    
    print(f"\n{'='*80}")
    print(f"{'AUDIT' if dry_run else 'NETTOYAGE'} — {len(false_positives)} faux positifs")
    print(f"{'='*80}")
    
    for ingredient, items in sorted(by_ingredient.items(), key=lambda x: -len(x[1])):
        print(f"\n❌ {ingredient.upper()} ({len(items)} faux positifs)")
        for item in items[:5]:
            print(f"   → {item['dish'][:75]}")
        if len(items) > 5:
            print(f"   ... et {len(items) - 5} autres")
    
    if not dry_run and false_positives:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        ids_to_delete = [fp['ing_id'] for fp in false_positives]
        cursor.executemany(
            'DELETE FROM ingredients_clean WHERE id = ?',
            [(id,) for id in ids_to_delete]
        )
        conn.commit()
        conn.close()
        print(f"\n✅ {len(false_positives)} faux positifs supprimés !")
    elif dry_run and false_positives:
        print(f"\n⚠️  Mode dry-run. Relancez avec --apply pour supprimer.")
    else:
        print("\n✅ Aucun faux positif trouvé !")
    
    return len(false_positives)


# ═══════════════════════════════════════════════════════════════════════════════
# RÈGLES D'EXTRACTION COMPLÉMENTAIRES — Ingrédients additionnels à extraire
# ═══════════════════════════════════════════════════════════════════════════════

# Patterns de détection pour les nouvelles catégories
ADDITIONAL_INGREDIENT_PATTERNS: dict[str, tuple[str, str]] = {
    # Épices et aromates
    "vanille": (r"vanille", "epice"),
    "safran": (r"safran", "epice"),
    "poivre": (r"\bpoivre\b", "epice"),
    "poivre de sichuan": (r"sichuan", "epice"),
    "curcuma": (r"curcuma", "epice"),
    "gingembre": (r"gingembre", "epice"),
    "cardamome": (r"cardamome", "epice"),
    "cannelle": (r"cannelle", "epice"),
    "muscade": (r"muscade", "epice"),
    "piment": (r"\bpiment\b", "epice"),
    "pimenton": (r"pimenton", "epice"),
    "paprika": (r"paprika", "epice"),
    "anis": (r"\banis\b", "epice"),
    "badiane": (r"badiane", "epice"),
    "miso": (r"miso", "epice"),
    "wasabi": (r"wasabi", "epice"),
    "yuzu kosho": (r"yuzu\s+kosho", "epice"),
    "fleur de sel": (r"fleur\s+de\s+sel", "epice"),
    
    # Herbes
    "basilic": (r"basilic", "herbe"),
    "thym": (r"\bthym\b", "herbe"),
    "romarin": (r"romarin", "herbe"),
    "estragon": (r"estragon", "herbe"),
    "ciboulette": (r"ciboulette", "herbe"),
    "persil": (r"persil", "herbe"),
    "coriandre": (r"coriandre", "herbe"),
    "cerfeuil": (r"cerfeuil", "herbe"),
    "livèche": (r"livèche", "herbe"),
    "sarriette": (r"sarriette", "herbe"),
    "menthe": (r"\bmenthe\b", "herbe"),
    "menthol": (r"menthol", "herbe"),
    "laurier": (r"laurier", "herbe"),
    "citronnelle": (r"citronnelle", "herbe"),
    
    # Produits laitiers
    "beurre": (r"\bbeurre\b(?!\s+noisette)", "produit_laitier"),
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
    
    # Condiments
    "huile d'olive": (r"huile\s+d['\s]?olive", "condiment"),
    "vinaigre": (r"vinaigre", "condiment"),
    "vinaigrette": (r"vinaigrette", "condiment"),
    "moutarde": (r"moutarde", "condiment"),
    "mayonnaise": (r"mayonnaise", "condiment"),
    "sauce soja": (r"sauce\s+soja", "condiment"),
    "miel": (r"\bmiel\b", "condiment"),
    "sirop": (r"\bsirop\b", "condiment"),
    
    # Champignons spécifiques
    "cèpe": (r"\bcèpe\b|cèpes", "champignon"),
    "chanterelle": (r"chanterelle", "champignon"),
    "shii-take": (r"shii[-]?take|shiitake", "champignon"),
    
    # Légumes additionnels
    "butternut": (r"butternut", "legume"),
    "salsifi": (r"salsifi", "legume"),
    "potimarron": (r"potimarron", "legume"),
    "patate douce": (r"patate\s+douce", "legume"),
    "scorsonère": (r"scorsonère", "legume"),
    
    # Fruits additionnels
    "bergamote": (r"bergamote", "fruit"),
    "citron vert": (r"citron\s+vert", "fruit"),
    "combava": (r"combava", "fruit"),
    "lime": (r"\blime\b", "fruit"),
    "sudachi": (r"sudachi", "fruit"),
}


def extract_additional_ingredients(dish_name: str, existing_ingredients: set[str] = None) -> list[tuple[str, str]]:
    """
    Extrait les ingrédients additionnels d'un nom de plat.
    
    Args:
        dish_name: Nom du plat à analyser
        existing_ingredients: Set d'ingrédients déjà extraits (pour éviter les doublons)
    
    Returns:
        Liste de tuples (ingredient, categorie)
    """
    if existing_ingredients is None:
        existing_ingredients = set()
    
    dish_lower = dish_name.lower()
    found = []
    
    for ingredient, (pattern, category) in ADDITIONAL_INGREDIENT_PATTERNS.items():
        if ingredient.lower() in existing_ingredients:
            continue
        if re.search(pattern, dish_lower, re.IGNORECASE):
            found.append((ingredient, category))
    
    return found


if __name__ == "__main__":
    db_path = os.path.join(os.path.dirname(__file__), 'menu_analytics.db')
    apply_mode = "--apply" in sys.argv
    clean_database(db_path, dry_run=not apply_mode)
