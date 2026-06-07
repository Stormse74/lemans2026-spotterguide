Le Mans 2026 Spotterguide - robust CSV-version

Denne version er opdateret med:
- 4 billedkolonner: Billede1, Billede2, Billede3, Billede4
- #20 har nu Billede2 = 20b.jpg
- script.js er mere robust og kan læse CSV med semikolon eller komma
- hvis et billede mangler, vises placeholder i stedet for at siden går i stykker

Arbejdsgang fremover:
1. Læg nye billeder i images-mappen
2. Skriv filnavnet i spotterdata.xlsx under Billede1-4
3. Eksportér som data.csv med semikolon
4. Upload hele projektet til Cloudflare Pages


Kørernavne:
- Kørernavne er klikbare
- Klik åbner en Wikipedia-søgning i en ny fane
- Du behøver ikke vedligeholde links i Excel


Version med ekstra links og funktioner:
- Toplinks til officiel klasseguide, Motorsport.com entry list og Le Mans Ultimate cars
- Klasser-popup med kort forklaring
- Favoritmarkering med stjerne. Favoritter gemmes lokalt i browseren.
- Kørernavne åbner Wikipedia-søgning i ny fane
- Tekniske CSV/Excel-tekster er fjernet fra selve forsiden
