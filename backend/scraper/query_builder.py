"""Kullanıcı arama tercihlerinden deterministik LinkedIn keyword sorgusu üretir.

ÖNEMLİ: LinkedIn guest (giriş yapmadan) iş araması boolean/tırnak DESTEKLEMEZ —
keyword'ü düz metin olarak arar. Bu yüzden AND/OR/tırnak KULLANMIYORUZ; her sorgu
düz "{seviye} {rol}" kombinasyonu.

Örnek: roles=["ML Engineer"], levels=["Junior","Intern"]
       → ["Junior ML Engineer", "Intern ML Engineer"]
"""


def build_queries_from_preferences(roles: list[str], levels: list[str]) -> list[str]:
    """Her (seviye × rol) için düz keyword sorgusu. Rol yoksa boş liste."""
    clean_roles = [r.strip() for r in roles if r.strip()]
    if not clean_roles:
        return []

    clean_levels = [lvl.strip() for lvl in levels if lvl.strip()]

    queries: list[str] = []
    for role in clean_roles:
        if clean_levels:
            for level in clean_levels:
                queries.append(f"{level} {role}")
        else:
            queries.append(role)
    return queries
