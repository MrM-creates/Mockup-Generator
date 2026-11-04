# Mockup-Server

## Architektur und Daten

Die bestehende HTML-App bleibt ohne Framework nutzbar. `api/mockup.js` läuft als Node-Funktion auf Vercel und importiert ausschliesslich `lib/mockup-service.cjs`. Öffentliche statische Dateien sind weiterhin nur `dist/index.html` und `dist/version.json`. `.vercelignore` erlaubt für CLI-Veröffentlichungen nur diese Quell-/Builddateien und die benötigten Servermodule. Der Build stoppt bei unerwarteten zusätzlichen Dateien in `dist`.

Das Originalmotiv bleibt im Browser. Das Script erhält dieselben Originalbytes wie bisher. Die Raumvorschau setzt einen lokal gerenderten fertigen Print mit Rand und optionalem Rahmen perspektivisch auf die Raumaufnahme. Der Bogenmodus und seine Schnittmarken gehören nicht ins Raum-Mockup. Das maximale PNG-Format ist 2.048 px an der langen Kante; es ersetzt keine Druckdatei.

- Virtuell: Nur Raumstil und Printmasse gehen an die API. Sol 6.1 ruft genau einmal das Bildwerkzeug GPT Image 2.5 Sunburst auf. Feste Vorgaben: 1.536 × 1.024 px, mittlere Qualität, JPEG. Keine freie Modell-/Qualitäts-/Anzahlwahl im Request.
- Eigenes Foto: keinerlei Bildübertragung. JPEG, PNG, WebP, AVIF und HEIC/HEIF bis 30 MB/60 Megapixel werden im Browser dekodiert.
- Die API akzeptiert nur virtuelle Zimmererzeugung ohne Bilddaten. Die früheren Modi own und remove werden mit HTTP 410 vor Quotenreservierung oder Anbieteraufruf abgelehnt. Auch room-Felder in virtuellen Anfragen werden zurückgewiesen. Alte geöffnete Clients müssen neu laden; es werden keine weiteren Foto-KI-Aufrufe gestartet.
- API-Schlüssel und Redis-Zugang liegen ausschliesslich auf dem Server. Kein Logging von Anfrageinhalten oder Bildbytes, keine Bilddateien im Backend, keine Bildablage im Zähler. Responses verwenden `store: false`. OpenAI verarbeitet die übermittelten Daten nach den eigenen API-Datenregeln; `store: false` ist keine Zusage über sämtliche providerseitigen Aufbewahrungsregeln.

## Production einrichten

Bestehendes Vercel-Projekt `mockup-generator`, Team `mrm-creates-projects`, Hauptzweig `main`. Der Nutzer hat die erstmaligen Upstash-Bedingungen selbst angenommen. Verwendete kostenlose Ressource: `print-studio-quota`, Region Frankfurt, `autoUpgrade=false`, `eviction=false`, `prodPack=false`. Bei Erreichen des kostenlosen Dienstlimits soll die KI aussetzen, nicht automatisch einen kostenpflichtigen Tarif aktivieren.

In den Vercel-Umgebungsvariablen für **Production**:

| Variable | Bedeutung |
| --- | --- |
| `OPENAI_API_KEY` | Geheimer OpenAI-Projektschlüssel mit Zugriff auf Responses und die verwendeten Modelle. API-Guthaben erforderlich. |
| `MOCKUP_ACCESS_CODE` | Eigener geheimer Zugangscode mit mindestens 12 Zeichen; nur für KI-Aufrufe. |
| `MOCKUP_DAILY_LIMIT` | Optional: 1–50 Versuche pro Tag; Standard 10. |
| `KV_REST_API_URL`, `KV_REST_API_TOKEN` | Von der Upstash-Integration bereitgestellte REST-Verbindung. Alternativ die Namen `UPSTASH_REDIS_REST_URL` und `UPSTASH_REDIS_REST_TOKEN`. |

Produktionsschlüssel bleiben als sensitive Variablen auf Vercel; keine echten Werte in Quelltext, Beispiele oder Chat kopieren. Die Upstash-Integration ist mit Production und Development verbunden; Preview erhält keine Produktionsberechtigungen. Nach Änderung der Variablen ist eine neue Vercel-Bereitstellung nötig. Die App nutzt den Zugangscode nur im Arbeitsspeicher, ohne Local Storage, Cookie oder URL-Parameter. Die Druck-App ist weiterhin ohne Code nutzbar.

## Nutzungslimit und Fehlersicherheit

Ein atomisches Redis-Lua-Script reserviert einen Versuch, eine Anfragekennung und eine globale Arbeitssperre. Der Tageswechsel richtet sich nach Europe/Zurich. Development, Preview und Production haben getrennte Zähler. Kennungen/Zähler laufen spätestens nach 48 Stunden ab; die Arbeitssperre läuft spätestens nach 285 Sekunden ab. Eine Anfrage an OpenAI hat maximal 240 Sekunden. Freigabe der Sperre erfolgt nur durch die passende Anfragekennung.

Keine Rückerstattung von Reservierungen nach unklarem Fehler: Ein Upstream-Aufruf kann bereits abgerechnet worden sein. Keine erneute Ausführung derselben Anfragekennung und kein automatischer Provider-Retry. Eine absichtlich neu gestartete Anfrage bekommt eine neue Kennung. Der Zähler begrenzt Versuche, nicht einen festen Dollarbetrag; tatsächliche API-Kosten hängen vom Tokenverbrauch ab. OpenAI-Accountlimits gelten zusätzlich.

Falsche Codes werden zeitkonstant per SHA-256 verglichen. Ein kurzlebiger globaler Fehlversuchszähler bremst mehr als 20 falsche Codes pro Minute; keine Speicherung von IP-Adressen oder Fotodaten. Der Server prüft Origin, Methode, JSON-/Bildgrenzen, Raumstil, Einwilligung und Printmasse. Bild- oder Upstream-Fehler werden ohne interne Antwortdaten/Schlüssel an den Browser gemeldet. Antworten werden nicht gecacht. Ohne gültige Schlüssel, Zugangscode und dauerhaften Zähler bleibt die KI geschlossen.

`MOCKUP_QUOTA_NAMESPACE` ist nur für isolierte Integrationstests vorgesehen. In Production nicht setzen oder zwischen Releases ändern; ein neuer Namensraum beginnt mit einem neuen Zähler.

## Lokal entwickeln

`npm run dev` startet ausschliesslich auf `http://127.0.0.1:4173`. Die lokale `.env.local` ist ignoriert; `.env.example` enthält ausschliesslich leere Vorlagenwerte. Für die KI sind ein lokaler Testcode, eine Development-Redis-Verbindung und ein eigener API-Schlüssel erforderlich. `index.html` kann weiterhin direkt geöffnet werden; dort funktionieren Raumfoto und lokale Platzierung, die Server-KI benötigt die Online-App oder den lokalen Entwicklungsserver.

Der Entwicklungsserver liefert nur die App, die Versionsdatei und die API aus; keine Verzeichnisauflistung und keine beliebigen lokalen Dateien. Nach Backend-Änderungen den Server neu starten. Frontend-Änderungen per Neuladen einlesen.

## Prüfung

`npm test` prüft die bestehenden 3.960 Druckkombinationen sowie API-Zugriff, Validierung, Fehler, Sperre/Limit/Deduplizierung, Quoten-Ausfall, Datenfluss, Projektionsmatrizen, physische Referenzmasse, lokale Bedienung, den lokalen Fotopfad ohne Netzwerk, veraltete Antworten und PNG. `npm run build` erzeugt ausschliesslich die zwei öffentlichen Dateien.

Vor Erstveröffentlichung zusätzlich mit echten Diensten geprüft: virtuelle Zimmererzeugung, Browser-Erzeugung und PNG-Export; dauerhafte Redis-Reservierung mit zwölf parallelen Anfragen über zwei getrennte Service-Instanzen, anschliessend Erreichen eines isolierten Testlimits von drei Versuchen und Ablehnung einer doppelten Anfrage. Der Quotenlasttest verwendet keinen echten Bildgenerator. Private Fotos und persönliche JSX-Dateien gehören weder in Testdaten noch in Deployment-Artefakte.

Offizielle Referenzen: [OpenAI-Bildwerkzeug](https://developers.openai.com/api/docs/guides/tools-image-generation), [Sol 6.1](https://developers.openai.com/api/docs/models/gpt-6.1-sol), [Upstash REST API](https://upstash.com/docs/redis/features/restapi), [Vercel Functions](https://vercel.com/docs/functions).
