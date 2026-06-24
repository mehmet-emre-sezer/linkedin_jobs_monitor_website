"""Kullanıcı arama tercihlerinden deterministik LinkedIn boolean sorgu üretir.

LLM kullanmaz — rol ve seviyelerden birebir, şeffaf sorgu kurar.
Örnek: roles=["ML Engineer"], levels=["Junior","Intern"]
       → '("Junior" OR "Intern") AND "ML Engineer"'
"""


def build_queries_from_preferences(roles: list[str], levels: list[str]) -> list[str]:
    """Her rol için bir sorgu. Rol yoksa boş liste döner (sorgu kurulamaz)."""
    clean_roles = [r.strip() for r in roles if r.strip()]
    if not clean_roles:
        return []

    clean_levels = [lvl.strip() for lvl in levels if lvl.strip()]
    level_block = ""
    if clean_levels:
        joined = " OR ".join(f'"{lvl}"' for lvl in clean_levels)
        level_block = f"({joined}) AND "

    return [f'{level_block}"{role}"' for role in clean_roles]
