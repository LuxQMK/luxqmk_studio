target_paths = [
    r"e:\UsersData\doria\OneDrive\klawiatury\gmmk3 100 ansi\gmmk-companion\index.html",
    r"e:\UsersData\doria\OneDrive\klawiatury\gmmk3 100 ansi\qmk_firmware\gmmk-studio\index.html"
]

for p in target_paths:
    with open(p, "r", encoding="utf-8") as f:
        text = f.read()

    # Clean known mojibake occurrences
    replacements = {
        "Roz' czono": "Rozłączono",
        "Wizualny Edytor Uk'adu": "Wizualny Edytor Układu",
        "Od>wie": "Odśwież",
        "Po' cz Klawiatury": "Połącz Klawiaturę",
        "Pokrtt'o (Enkoder)": "Pokrętło (Enkoder)",
        "O>wietlenie (Lighting)": "Oświetlenie (Lighting)",
        "Urz dzenia": "Urządzenia",
        "zmieni": "zmienić",
        "Utwrz Pen Kopi": "Utwórz Pełną Kopię",
        "Przywr z Kopii": "Przywróć z Kopii",
        "migawk": "migawkę",
        "przecignij": "przeciągnij",
        "Pami": "Pamięć",
        "wczeniej": "wcześniej",
        "Wyczy": "Wyczyść",
        "Podgld": "Podgląd",
        "Wskaniki": "Wskaźniki",
        "wasne": "własne",
        "gonoci": "głośności",
        "Wącz": "Włącz",
        "Wycz": "Wyłącz",
        "cignij": "ciągnij"
    }

    for k, v in replacements.items():
        text = text.replace(k, v)

    with open(p, "w", encoding="utf-8") as f:
        f.write(text)

print("Cleaned mojibake from index.html in both folders!")
