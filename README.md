# Print Studio V14.4

`index.html` im Browser öffnen. `HTML Script/print-mockup generator V14.html` ist identisch. V13 bleibt als unverändertes Originalarchiv erhalten.

## Bedienung

Die helle Oberfläche folgt den lokalen Vorgaben aus `app-ui-foundation`, `flider-ui-system` und `frontend-skill`; Struktur und Designentscheidungen stehen in `docs/UI-CONTRACT.md`.

- **Bildfläche:** Bild direkt auf die Vorschau ziehen oder dort auswählen. „Bild wechseln“ ersetzt es. Ungültige Dateien lassen das bisherige Motiv stehen und zeigen eine verständliche Meldung.
- **Inspektor:** „Fertiges Endmaß“ oder „Papier ausnutzen“, Format, Rand und Rahmen stehen zusammen rechts; auf schmalen Bildschirmen unter der Vorschau. Rahmenmaterial und Breite erscheinen erst beim Einschalten des Rahmens. Weitere Randvorlagen und der Mockup-Prompt sind eingeklappt.
- **Bildgrösse:** An einer Bildecke ziehen oder den Prozentregler verwenden. 100 % ist die maximale unbeschnittene Einpassung innerhalb der eingestellten Mindestränder; 10–100 % sind möglich. Proportionen und Bildmitte bleiben erhalten. Die tatsächlichen Ränder und die Druckauflösung aktualisieren sich live. Pfeiltasten am Eckgriff ändern die Grösse; Home/End wählen Minimum/Maximum.
- **Zurück zur maximalen Grösse:** „Bild maximal einpassen“ beim Endmaß bzw. „Papier optimal nutzen“ beim ganzen Papier. Beide behalten den Modus. Neue Format-, Ausrichtungs- und Randeinstellungen setzen die manuelle Verkleinerung auf 100 % zurück. Rahmen und Randfarbe ändern die Druckgrösse nicht.
- **Export:** „Photoshop-Script laden“ ist die Hauptaktion. PNG-Export und Photoshop-Hilfe stehen im Menü mit den drei Punkten. Eckgriffe werden nicht in die PNG-Vorschau exportiert. Die manuelle Bildgrösse geht direkt in die gemeinsame Berechnung für das Script ein.

## Ganzes Motiv und frei wählbare Ränder

Das Motiv wird immer vollständig und proportional dargestellt. Weder Vorschau noch Photoshop-Script beschneiden das Bild. Bei einem hochgeladenen Motiv zählen dessen tatsächliche Pixelproportionen; vor dem Upload dienen die Proportionen des gewählten Referenzformats als Beispiel.

Direkt bei der Formatwahl wählst du die Druckgrösse: **Fertiges Endmaß** ist die Voreinstellung und begrenzt den Print inklusive Rand auf die gewählten Maße. **Papier ausnutzen** vergrössert das ganze Motiv innerhalb der Mindestränder auf den passenden Druckbogen. Beide erhalten das vollständige Original und sein Seitenverhältnis. Das kleinste passende Papier aus A5, A4, A3 oder A2 wird automatisch berechnet; darüber ergibt sich ein benutzerdefinierter Bogen.

Beispiel für einen vorhandenen Rahmen: „Fertiges Endmaß“, 40 × 50 cm, Hochformat, „Ohne“ Rand, 100 % und ein 4:5-Motiv ergeben 40 × 50 cm Bildfläche auf A2. Die Schnittkanten liegen 1 cm von den Seiten und 4,7 cm von oben/unten entfernt. Das Photoshop-Script setzt acht schwarze Marken ausserhalb des Endmaßes. Mit 1 cm Mindestrand bleibt das Endmaß 40 × 50 cm; die Bildfläche beträgt 38 × 47,5 cm. Bei anderen Motivproportionen entsteht zusätzliche freie Fläche, ohne Beschnitt.

Der seitliche Mindestrand ist frei in Millimetern einstellbar (20 mm = 2 cm). Schnellwahlen: 3 mm, 1 cm, 2 cm sowie die bisherigen Rand-Presets. Die Vorschau und die darunter angezeigten tatsächlichen Ränder aktualisieren sich sofort. Oben und unten ergibt sich zusätzlicher Platz aus den Bildproportionen. Bei sehr hohen Motiven begrenzt die gewählte Fläche die Vergrösserung; dann wird auch der seitliche Rand grösser als das eingestellte Minimum. Passepartout mit breiterem unteren Mindestrand bleibt möglich.

Beispiel ohne Upload, Referenzformat 30 × 40 cm, Hochformat, Papier ausnutzen:

| Seitlicher Mindestrand | Papier | Bildfläche | Rand oben/unten |
| --- | --- | --- | --- |
| 1 cm | A2, 42 × 59,4 cm | 40 × 53,33 cm | je ca. 3,03 cm |
| 2 cm | A2, 42 × 59,4 cm | 38 × 50,67 cm | je ca. 4,37 cm |

Der Schalter **Rahmen anzeigen** beeinflusst nur die Simulation. Er verändert weder Papierwahl noch Bild- und Randmaße im Script. Leinwand ist weiterhin separat wählbar.

## Druckauflösung und Papierwahl

Die Papierwahl berücksichtigt die erforderlichen Maße, nicht die Anzahl der Bildpixel. Das gewählte Referenzformat bestimmt das kleinste passende A-Papier; das vollständige Motiv wird anschliessend innerhalb der Mindestränder möglichst gross eingepasst. Eine niedrige Auflösung verkleinert weder das Papier noch das Bild automatisch.

Nach dem Laden zeigt die App die effektiven ppi der tatsächlichen Bildfläche an: `min(Pixelbreite / Bildbreite in Zoll, Pixelhöhe / Bildhöhe in Zoll)`. Referenz sind 300 ppi für detailreiche Drucke aus der Nähe. Die benötigten Pixelmaße werden jeweils auf ganze Pixel aufgerundet. Eigene Hinweisstufen: ab 300 ppi ausreichend, 150 bis unter 300 ppi unter der Empfehlung, darunter niedrig. Das sind Orientierungshilfen, keine verbindlichen Qualitätsgrenzen. Schärfe, Kompression und Motivinhalt werden nicht analysiert. Bei grösserem Betrachtungsabstand kann weniger Auflösung ausreichen; siehe [Adobe: Print resolution for images](https://helpx.adobe.com/photoshop/desktop/crop-resize-transform/resize-adjust-resolution/resolution-specs-for-printing-images.html).

„Pixel und Druckgrösse“ zeigt vorhandene Pixel und die maximale Bildfläche bei 300 ppi. Beispiel im Modus „Papier ausnutzen“: A2, 1 cm Mindestrand und Motiv 3:4 ergeben 40 × 53,33 cm Bildfläche; dafür sind 4.725 × 6.300 px empfohlen. Mit 600 × 800 px sind es 38,1 ppi. Durch Verkleinern des Bildes steigt die Auflösung; ein grösserer Rand oder kleineres Referenzformat kann ebenfalls helfen. Leinwand bezieht die Bewertung auf die sichtbare Bildfläche, ohne den Umschlag.

Die Warnung ist kein Exportverbot. Das JSX enthält die Bewertung aus der Export-Momentaufnahme als Kommentar, ohne zusätzliche druckbare Elemente. Die 300-ppi-Dokumentauflösung ersetzt keine fehlenden Bilddetails. Änderungen betreffen weder die unveränderten Originalbytes noch die Smartobjekt-Platzierung.

## Vorschläge bei niedriger Auflösung

Bei weniger als 300 ppi zeigt die App zwei Wege. „Grösse behalten · Bild extern aufbereiten“ nennt die Originalpixel, die empfohlenen Zielpixel und den notwendigen linearen Vergrösserungsfaktor. Das Bild wird in einem eigenen Werkzeug aufbereitet und anschliessend über „Bild wechseln“ geladen. Die App bietet keine eigene Hochskalierung an und sendet keine Bilddaten an einen Dienst.

„Passendes Rahmenformat verwenden“ prüft die tatsächlich in der Auswahlliste vorhandenen Rahmen. Massgeblich ist das fertige Endmaß inklusive der eingestellten Mindestränder und der vollständigen, proportionalen Bildfläche bei 100 % Einpassung. Der grösste geeignete Rahmen bis zur aktuellen Referenzgrösse wird vorgeschlagen. Bei genügend Pixeln kann auch das bereits gewählte Rahmenformat ausreichen, wenn der Print auf dessen Endmaß begrenzt wird. Zu jedem Vorschlag stehen A-Papier, Bildfläche und effektive Auflösung. Passt kein Standardrahmen, wird ein benutzerdefiniertes Endmaß angeboten, auf ganze Millimeter abgerundet und als „Kein Standardrahmen“ gekennzeichnet. Ein Format ohne gültige Bildfläche oder ohne passendes A-Papier bis A2 wird nicht empfohlen. Leinwand wird entsprechend mit Umschlag geprüft.

Erst „Vorschlag übernehmen“ übernimmt das Endmaß und setzt die Bildskalierung auf 100 %. Der fertige Print wird auf dem Papier zentriert; Schnittmarken begrenzen das Endmaß. Der Rahmenschalter beeinflusst weiterhin nur die Darstellung. Änderungen an Format und Rand passen das Endmaß weiter an; Die Auswahl „Papier ausnutzen“ kehrt ausdrücklich zur ganzen Papierfläche zurück. Eine Rücksetzung der Bildskalierung behält dagegen das Endmaß. Das tatsächliche Endmaß steht direkt in den Druckmaßen. Auch hier bleibt das Original vollständig erhalten.

Beispiel im Modus „Papier ausnutzen“: 2.400 × 3.200 px, Referenz 30 × 40 cm, 1 cm Mindestrand: vorgeschlagen wird Rahmen 21 × 30 cm auf A3. Die Bildfläche beträgt 19 × 25,33 cm bei ca. 320,8 ppi. Mit nur 600 × 800 px passt kein Standardrahmen; die App schlägt 7 × 8,7 cm Endmaß auf A5 vor, mit ca. 304,8 ppi. Die Vorschläge werden beim Klick erneut berechnet, damit ein zwischenzeitlicher Bild- oder Randwechsel keine veralteten Einstellungen übernehmen kann.

V14.2 wurde zusätzlich lokal in Chrome mit einem 600 × 800 px PNG geprüft: Vorschlag übernehmen, exaktes Endmaß, A5, 304,8 ppi und Rückkehr zur Papierfläche. Beide Wege und die Übernahme sind auch bei 390 × 844 px bedienbar. Der echte Browserdownload enthält weiterhin die unveränderten PNG-Bytes. Das daraus erzeugte Dokument wurde in Photoshop 2026 kontrolliert: `PrintTemplate_70x87_auf_A5`, 1 cm Mindestrand, eingebettetes Smartobjekt und acht druckbare Schnittmarken ausserhalb des Endmaßes. Die bestehenden Dokumente bleiben erhalten. Zusätzlich zum bisherigen Layoutsatz werden 112 übernommene Vorschläge mit Vorschau-/JSX-Vergleich geprüft.

## Photoshop

1. Motiv direkt in der Vorschau hochladen, Format und Mindestrand einstellen; optional an den Eckgriffen die Bildgrösse verändern.
2. „Photoshop-Script laden“ wählen.
3. Photoshop → Datei → Skripte → Durchsuchen oder die heruntergeladene JSX-Datei in Photoshop ziehen. Das zuvor in der App geladene Original wird automatisch eingesetzt; eine erneute Dateiauswahl ist nicht erforderlich.
4. Das Script erstellt den Druckbogen bei 300 ppi und setzt das ganze Originalmotiv als eingebettetes Smartobjekt proportional ein. Es gibt keine beschneidende Maske. Nur beim Export einer leeren Vorlage ohne geladenes Bild bleibt die manuelle Motivauswahl verfügbar.
5. Bei 100 % drucken. Drucker und Papier müssen den gewählten Mindestrand unterstützen.

Hilfslinien zeigen Papier-/Printformat und Bildgrösse. Druckbare Schnittmarken werden nur erzeugt, wenn ausserhalb des fertigen Prints tatsächlich Papier zum Abschneiden vorhanden ist. Entspricht das fertige Endmaß dem ganzen Papierbogen, ist kein Zuschnitt nötig; bei einzelnen identischen Seiten dienen die Papierkanten als fertige Kanten. Bei Leinwand bleiben die Hilfslinien für den Umschlag erhalten.

Pixelwerte werden auf ganze Pixel gerundet (bei 300 ppi rund 0,085 mm pro Pixel).

Beispielscripte ohne hochgeladenes Motiv, Verhältnis 3:4:

- `Photoshop Script/Print_A2_1cm_ohne_Beschnitt.jsx`
- `Photoshop Script/Print_A2_2cm_ohne_Beschnitt.jsx`
- `Photoshop Script/Print_30x40_3mm.jsx`: Format für die Papierwahl 30 × 40 cm, A2 mit 3 mm seitlichem Rand; Bildfläche bei Verhältnis 3:4: 41,4 × 55,2 cm.

## Prüfung und Stand

`node tests/print-layout.cjs`

Prüft 3.960 Kombinationen in beiden Print-Modi und für Leinwand aus allen neun Format-Presets, zwei eigenen Formaten (auch > A2), drei Ausrichtungen, vier Motivproportionen, zehn Rand-/Presetvarianten und Print/Leinwand. Vergleicht Papierwahl unabhängig mit den Standardmassen und führt den generierten JSX-Code mit einem Photoshop-DOM-Testersatz aus. Prüft Bildproportionen und Vorschau-/JSX-Koordinaten, A2 mit 1/2/2,75 cm Rand, echte Platzierungslogik mit einem Photoshop-DOM-Testersatz ohne beschneidende Masken, hohe/breite Motive, das Fehlen einer widersprüchlichen Modusauswahl, alle A-Papiere, Ausrichtung, Rahmenschalter, asymmetrische und ungültige Ränder sowie Schnittmarken ausserhalb des Prints. Ergänzende Prüfungen decken manuelle Skalierung, Prozentgrenzen, zentrierte Platzierung, Rücksetzung durch Rand-/Formatwahl, Pointer-Eckgriffe und Tastaturbedienung ab. Die aktuelle UI wurde im bereits geöffneten lokalen Chrome-Tab visuell geprüft, zusätzlich bei 390 px Breite. Upload auf der Vorschau, Mausziehen, Tastatur-Skalierung, Rand-/Passepartout-Auswahl und Rahmenmaterial wurden bedient. Ein tatsächlich aus dem Browser heruntergeladenes Script wurde gegen die sichtbare 95-%-Vorschau geprüft: 38 × 53,2 cm Bildfläche, 2 cm Seitenrand und 3,1 cm oben/unten. V14 wurde zusätzlich mit einem realen, 13.715.920 Byte grossen Original in Photoshop 2026 kontrolliert: automatisch eingesetztes eingebettetes Smartobjekt, vollständiges Motiv und passende Ränder. Das Original im tatsächlich heruntergeladenen Script stimmt bytegenau mit der Quelldatei überein. Ergänzende V14-Tests prüfen Drag & Drop, Bildwechsel, ungültige und mehrere Dateien, Base64-Chunkgrenzen und Padding, unveränderte Originalbytes, automatische Platzierung ohne Bilddialog, temporäre Dateibereinigung und die Export-Momentaufnahme.

## Originalbild im Script

Ein geladenes Original wird unverändert in das heruntergeladene JSX eingebettet. Es wird weder komprimiert noch neu als Bildschirmvorschau gerastert. Die Datei ist dadurch ungefähr ein Drittel grösser als das Original. Die Browser-App lädt keine Bilder zu einem Server hoch. Photoshop rekonstruiert das Bild kurz im lokalen temporären Ordner, platziert es als eingebettetes Smartobjekt und entfernt die temporäre Datei danach. Ein Export ohne geladenes Bild bleibt als leere Vorlage mit optionaler Dateiauswahl möglich.

## Druck-Info

„Druck-Info“ steht neben den berechneten Maßen. Die Übersicht nennt den aktuellen Papierbogen für den Druckdialog, Ausrichtung, fertiges Endmaß, Bildfläche, tatsächliche Ränder und die Originalpixel samt effektiven ppi. Die Angaben werden aus derselben Layoutberechnung wie Vorschau und Export übernommen und beim Öffnen bzw. bei Änderungen aktualisiert. Ohne Bild steht „Vorlage“, bei ungültiger Geometrie ein Korrekturhinweis.

Die Anleitung erläutert die getrennte Papierwahl im Druckertreiber, Maßstab 100 % ohne automatische Anpassung, geeigneten Medientyp, Fotoqualität und einen einzigen Farbmanagement-Weg. Für Photoshop-Farbmanagement ist das passende installierte ICC-Profil für die konkrete Drucker-/Papierkombination erforderlich; Rendering Intent und Tiefenkompensierung richten sich nach deren Herstellerempfehlung. Ohne passendes Profil wird als Alternative das Farbmanagement des Druckers erläutert. Die Übersicht erkennt keine installierten Drucker oder Profile und verändert keine Druckeinstellungen.

Die Druckerwahl bietet Canon PRO-1000 als Beispiel oder allgemeine Hinweise für andere Drucker. Für den PRO-1000 werden insbesondere A5/oberer Einzug, ausgeschlossene Kombinationen mit Medien für den manuellen Einzug und die normale bedruckbare Fläche gezeigt. Diese Angaben ersetzen nicht die aktuelle Treibervorschau. Die offizielle Anleitung zu [Canons Papierzufuhr](https://ij.manual.canon/ij/webmanual/PrinterDriver/M/PRO-1000%20series/1.0/DE/PPG/dg-c_paper.html), [Canons Druckfläche](https://ij.manual.canon/ij/webmanual/Manual/All/PRO-1000%20series/EN/BG/bg-079.html), [Adobe-Maßstab](https://helpx.adobe.com/photoshop/desktop/print/position-and-scale-images-for-printing.html) und [Adobe-Farbmanagement](https://helpx.adobe.com/photoshop/desktop/print/print-with-color-management.html) ist im Dialog verlinkt.

„Info kopieren“ kopiert die aktuellen Maße und die gewählte Druckeranleitung. Ist der Zugriff auf die Zwischenablage nicht verfügbar, bietet derselbe Button ausdrücklich eine Textdatei zum Herunterladen an. Der Dialog ist per Escape und über sichtbare Schliessen-Buttons bedienbar. Prüfungen vergleichen die dynamischen Angaben vor/nach Vorschlagsübernahme, Hoch-/Querformat, A5-Einzug und normale Druckfläche, allgemeine Druckerhinweise, Kopieren/Textdatei sowie Vorlagen-/Fehlerzustände. Die vorherigen Layout- und Exportprüfungen bleiben bestehen. Desktop und 390 × 844 px wurden in Chrome visuell geprüft, inklusive Öffnen, Escape/Fokusrückkehr, Druckerwechsel und verständlicher Fehlermeldung bei fehlendem Zugriff auf die Zwischenablage.

## Build und Veröffentlichung

`npm test` prüft die Berechnungen und Exportlogik. `npm run build` erstellt `dist/index.html` und `dist/version.json`. Ausschliesslich dieser Ordner wird von Vercel ausgeliefert; lokale Fotos, Downloads, Tests und Archive gehören nicht zum Website-Build.

GitHub: [MrM-creates/Mockup-Generator](https://github.com/MrM-creates/Mockup-Generator). Bestehende Produktionsadresse: [Print Studio](https://mockup-generator-sable.vercel.app/). Die installierte Chrome-App verwendet diese Adresse und zeigt neue Versionen nach dem Neuladen.

Der alte unterbrochene Rebase wurde mit gesichertem Arbeitsstand abgebrochen. Der frühere lokale Upload-Commit bleibt im lokalen Zweig `codex/archive-pre-v14-upload` erhalten. Veröffentlichungen erfolgen auf dem bestehenden GitHub-Hauptzweig; veröffentlichte Historie wird nicht überschrieben.

V14.1: Die Auflösungsberechnung wird für alle 2.640 Layoutkombinationen mitgeprüft. Zusätzliche Beispiele prüfen 300/150-ppi-Grenzen, Aufrundung des Pixelbedarfs, Rundung der Anzeige unter 300 ppi, ungültige und fehlende Daten, unveränderte Papierwahl bei anderer Pixelzahl sowie die Auflösungs-Momentaufnahme während des Exports. Im lokalen Chrome wurde ein 600 × 800 px Testbild geladen: 38,1 ppi auf 40 × 53,33 cm; nach Verkleinern auf 10 % korrekt 381 ppi mit unverändertem A2-Papier. Desktop und 390 × 844 px wurden visuell geprüft, inklusive aufklappbarer Pixelangaben; keine Konsolenmeldungen.

V14.4 wurde in Chrome auf Desktop und bei 390 × 844 px visuell geprüft: sichtbare Endmaß-Auswahl, 40 × 50 cm, ohne Rand, A2 sowie getrennte Angaben für Papier/Endmaß/Bildfläche/Ränder. Der echte Browserdownload enthält das synthetische 800 × 1.000 px 4:5-Original bytegenau. Native Photoshop-Prüfung: Dokument `PrintTemplate_400x500_auf_A2`, eingebettetes vollständiges Smartobjekt, 10 mm seitlicher und 47 mm oberer/unterer Papierüberschuss; acht sichtbare schwarze Schnittmarken ausserhalb des Endmaßes. Nicht druckende Hilfslinien wurden für die Sichtprüfung ausgeblendet und danach wiederhergestellt; das eigene Testdokument wurde ohne Speichern geschlossen. Das Download-Dateiformat nennt jetzt das Endmaß und bei ausgeschaltetem Rand korrekt 0 mm.
