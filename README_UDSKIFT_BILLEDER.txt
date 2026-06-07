Sådan udskifter du billeder

Billederne ligger i mappen images.

Eksempel:
Hvis du vil skifte BMW #15 ud, skal det nye billede bare hedde:
images/15.jpg

Hvis billedet har en anden filtype, fx webp eller png, skal du også rette data.js:
"image": "images/15.webp"

Det nemmeste er derfor:
1. Brug samme filtype som den gamle fil
2. Brug samme navn
3. Upload igen til Cloudflare Pages


Sådan tilføjer du onboard cam / links

Åbn data.js og find bilen.

Eksempel:

{
  "no": "15",
  ...
  "image": "images/15.jpg",
  "onboard": "https://www.youtube.com/watch?v=EKSEMPEL",
  "links": []
}

Hvis onboard-feltet er tomt, vises der ingen knap.
Hvis du indsætter et link, vises knappen "Onboard cam".
Linket åbner altid i en ny fane.

Du kan også tilføje ekstra links sådan:

"links": [
  {
    "title": "Team-side",
    "url": "https://eksempel.dk"
  },
  {
    "title": "YouTube onboard",
    "url": "https://www.youtube.com/..."
  }
]

Det vigtigste:
- Husk komma efter linjen før "onboard", hvis du redigerer manuelt.
- Link skal starte med https://
- Upload zip-filen igen til Cloudflare Pages efter ændring.
