# Lokale HEIC-Vorbereitung

Nur eigene Zimmerfotos werden bei fehlender nativer Unterstützung konvertiert. Das Originalmotiv und dessen Photoshop-Einbettung bleiben unangetastet. Ein Decoder läuft für genau ein Foto in einem separaten Worker und wird anschliessend beendet. Es gibt keinen CDN-Abruf, kein Tracking und keinen Foto-Upload. Die lesbare Raumkopie wird nur im Browser-Arbeitsspeicher gehalten.

## Versionen, Lizenz und Quellcode

- heic-to 1.6.7, Hopper Gee: https://github.com/hoppergee/heic-to ; npm-Paket mit Integrität in package-lock.json festgehalten.
- Enthaltenes libheif 1.23.7, struktur AG: https://github.com/strukturag/libheif/tree/v1.23.7
- Enthaltenes libde265 1.0.16: https://github.com/strukturag/libde265/tree/v1.0.16
- LGPL-3.0 oder neuer; vollständige Lizenztexte in docs/licenses und in den aufklappbaren Open-Source-Hinweisen der App. Herkunft und ursprüngliche Copyright-Hinweise bleiben im eingebetteten Decoder erhalten.

Die vollständigen entsprechenden Quelltexte und Bauanweisungen sind in den verlinkten Projekten verfügbar. heic-to liefert den verwendeten libheif-JavaScript-Build sowie die Build-Anleitung mit USE_UNSAFE_EVAL=0, USE_WASM=0 und LIBDE265_VERSION=1.0.16. Der Bibliothekscode wird abgesehen vom entfernten ESM-Export unverändert eingebettet. Unser separater Worker-Adapter und alle Einbettungsschritte stehen lesbar in scripts/embed-heic.cjs. Die Druck-App und die Bibliothek kommunizieren über Worker-Nachrichten.

## Reproduzieren und Bibliothek ersetzen

1. Mit npm ci das exakt festgelegte Paket installieren.
2. Optional den Decoder unter node_modules/heic-to/src/lib/libheif-without-unsafe-eval.js durch einen kompatiblen eigenen Build ersetzen. Der Build muss buildLibheif() mit HeifDecoder, primärem Bild, RGBA-display und heif_context_free bereitstellen.
3. node scripts/embed-heic.cjs ausführen. Der Bibliothekscode und unser Adapter werden gzip-komprimiert und als inaktiver Base64-Datenblock roomHeicDecoder in index.html eingebettet. Das V14-Archiv wird gleichzeitig synchronisiert. Kein weiterer öffentlicher statischer Endpunkt nötig.
4. npm test und npm run build ausführen. Der Test entpackt die eingebettete Nutzlast und vergleicht den vollständigen Programmcode exakt mit der installierten Bibliothek und dem lesbaren Worker-Adapter. Gzip-Verpackungen dürfen zwischen Betriebssystemen und zlib-Versionen abweichen; abweichender Programmcode wird weiterhin abgelehnt. Bei einem Bibliothekswechsel die Paketmetadaten entsprechend aktualisieren.

Die ausgelieferte HTML-Datei enthält bereits den vollständigen JavaScript-Decoder und benötigt zur Ausführung keine Verbindung zu npm oder den Quellcode-Repositories. Der Datenblock kann auch direkt durch eine eigene gzip-/Base64-codierte kompatible Worker-Fassung ersetzt werden. Die Anwendung verhindert solche Änderungen nicht.

## Grenzen und Prüfung

Maximal 30 MB Eingabe und 60 Millionen Pixel vor der RGBA-Allokation. Das primäre Bild wird vollständig mit den von libheif angewendeten Bildtransformationen decodiert. Die Raumkopie wird proportional auf maximal 4.096 Pixel an der langen Seite verkleinert und als JPEG mit Qualität 0,94 vorbereitet. Ein 45-Sekunden-Limit beendet den Worker. Schliessen, Moduswechsel und neue Bildauswahl verwerfen alte Resultate und beenden einen aktiven Decoder.

Automatische Tests prüfen Erfolg, Fehler, ursprüngliche Druckdaten und veraltete Ergebnisse. Zusätzlich wurde die echte Beispieldatei examples/example.heic aus libheif v1.23.7 lokal geladen und im Browser vollständig konvertiert und angezeigt. Testbilder bleiben ausserhalb von Git und dist. Die unveränderte Originalaufnahme wird weder vom Decoder noch von der App auf einem Server abgelegt.
