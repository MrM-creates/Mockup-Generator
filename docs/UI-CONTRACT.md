# Print Studio: UI-Vertrag

## Zweck und Zielgruppe
Ein lokales Werkzeug für Fotografen und Bildgestalter: vollständige Motive auf dem automatisch empfohlenen Papier mit freiem Rand simulieren und identisch für Photoshop vorbereiten. Kernaufgabe: Bild laden, Gestaltung am Bild beurteilen, Script herunterladen.

## Struktur und Layout
Eine Arbeitsfläche ohne Navigation: Vorschau mit Upload und direkter Bildskalierung; Inspektor mit Format, Rand, optionalem Rahmen; Export. Der stabile Kopf enthält Marke und genau eine primäre Aktion „Photoshop-Script laden“. PNG, Anleitung und Mockup-Prompt sind sekundär. Der Fuss enthält Herkunft und keinen weiteren Aufruf.

Desktop: grosse Vorschau links, 336 px breiter Inspektor rechts. Tablet: schmalerer Inspektor, weiterhin Sichtkontakt zur Vorschau. Unter 800 px: Vorschau zuerst, danach Einstellungen, kompakter stabiler Kopf. Keine verschachtelten Karten. Vorschau bleibt auf grossen Bildschirmen beim Einstellen sichtbar.

## Copy und Bedienung
Kurze deutsche Begriffe: „Format“, „Rand“, „Rahmen“, „Bild wechseln“. Direkt unter dem Produkt steht die Auswahl „Fertiges Endmass“ (Voreinstellung) oder „Papier ausnutzen“. Das gewählte Format ist im ersten Fall die fertige Fläche inklusive Rand, im zweiten Fall die Referenz für die Papierwahl. Papier, fertiges Endmass, tatsächliche Bildfläche und Ränder stehen getrennt am Bild. Rahmen verändert nur die Simulation. „Ohne Rand“ bedeutet kein erzwungener Mindestrand; das ganze Bild bleibt erhalten. Fehler nennen Ursache und Lösung, z. B. „Der Rand lässt keinen Platz für das Bild. Bitte verkleinern.“

Ein Bild wird direkt auf die Vorschau gezogen oder dort per Klick ausgewählt. Ein geladener Print hat Eckgriffe zum proportionalen Skalieren um die Bildmitte; weder Bildinhalt noch Seitenverhältnis werden geändert. Ein Regler ist die zugängliche Alternative. 100 % entspricht der maximalen unbeschnittenen Einpassung innerhalb der Mindestränder; 10–100 % ist die zulässige Skala. „Bild maximal einpassen“ setzt im Endmass-Modus auf 100 % zurück; „Papier optimal nutzen“ tut dasselbe im Papier-Modus. Die Rücksetzung wechselt nie den Modus. Änderungen an Papierformat oder Rand setzen die manuelle Skala zurück; Rahmendarstellung verändert sie nicht.

## Design
Basis: Flider `modern/D-04` (Hintergrund #F5F5F7, Text #1D1D1F) mit dem Blau aus `modern/D-01` (#007AFF), Radius 8/12/16 px und Flider-Abständen 8/12/16/24/40 px. Systemschrift `-apple-system, BlinkMacSystemFont, ...` entspricht dem gewünschten Apple-Stil. Weiss für Arbeitsflächen, neutrales Grau für die Bühne, feine Trennlinien, geringe Schatten nur zur räumlichen Orientierung. Bestehende Rahmenmaterialien bleiben erhalten. Keine dekorativen Hero-Bereiche oder Illustrationen; das eigene Motiv ist der visuelle Schwerpunkt.

## Interaktion und Zugänglichkeit
Zwei funktionale Bewegungen: direkte proportionale Skalierung mit Live-Massen; kurze Zustandswechsel bei Schaltern und Fokus/Hover. Kein zeitverzögertes Nachlaufen während des Ziehens. Reduced-motion wird respektiert. Native Inputs, beschriftete Felder, Tastatur-Upload, sichtbarer Fokus, `aria-pressed` für Auswahlbuttons, Live-Status für Datei- und Eingabefehler. Eckgriffe sind per Pfeiltasten bedienbar; Prozentregler bietet dieselbe Funktion. Mindesttrefferfläche 40–44 px für Hauptbedienelemente. Zahlen nutzen tabellarische Ziffern und deutsche Dezimalkommas.

## Ergänzung: Druckauflösung

Zweck: vor dem Export erkennen, ob die vorhandenen Bildpixel für die tatsächliche Bildfläche reichen. Papierwahl und Motiv bleiben bewusst unverändert; geringe Auflösung ist ein Hinweis, keine automatische Formatänderung und keine Exportsperre.

Die bestehende Struktur bleibt bestehen. Unter den Druckmassen folgt ein kompakter Bereich „Druckauflösung“ mit Status, effektiven ppi und konkretem Bedarf für 300 ppi. Weitere Angaben stehen aufklappbar unter „Pixel und Druckgrösse“: vorhandene Pixel, benötigte Pixel, maximale Bildfläche bei 300 ppi und Erklärung der Papierwahl. Der bestehende Export bleibt die einzige primäre Aktion.

300 ppi sind eine Empfehlung für detailreiche Drucke aus der Nähe, keine Qualitätsgarantie. Eigene Hinweisstufen: ab 300 ppi „Auflösung ausreichend“, 150 bis unter 300 ppi „Unter der Empfehlung“, unter 150 ppi „Auflösung niedrig“. Die Bewertung betrifft nur Pixelauflösung, nicht Schärfe oder Bildinhalt. Kein Upload und kein gültiges Layout: neutrale Anzeige ohne Warnung. Meldungen erklären die Alternative: Bild verkleinern, kleineres Format wählen oder höher aufgelöstes Original laden.

Flider-Abstände, Schrift und Trennlinien werden weiterverwendet. Statusfarben haben jeweils einen ausgeschriebenen Zustand; kein Farbcode allein. Text darf auf Mobilgeräten umbrechen, Aufklappen ist per Tastatur möglich. Bei Skalierung, Rand-, Format- und Bildwechsel aktualisiert sich alles unmittelbar aus derselben Druckgeometrie; Frame-Umschalten ändert die Auflösung nicht. Die Berechnung ist unabhängig von Dateimetadaten und der 300-ppi-Auflösung des Photoshop-Dokuments. Der Export enthält dieselben Werte als Kommentar, keine zusätzlichen druckbaren Elemente.

Prüfung: bekannte Pixel-/Millimeter-Beispiele, Grenzwerte, Rundung nach oben beim Pixelbedarf, ungültige/fehlende Daten, Querformat/Leinwand, Live-Aktualisierung, Export-Momentaufnahme und unveränderte Papierwahl. Desktop- und Mobilansicht visuell prüfen.
## Ergänzung: passende Rahmenformate

Zweck: bei weniger als 300 ppi zwischen externer Bildaufbereitung für die aktuelle Grösse und einem mit den Originalpixeln passenden Format entscheiden. Keine eingebaute Hochskalierung, kein Bildversand. Der bestehende Auflösungsbereich erhält zwei ruhige, untereinander angeordnete Wege; Export bleibt die primäre Aktion. Beim Beibehalten stehen Originalpixel, Zielpixel und notwendiger Vergrösserungsfaktor. Ein Vorschlag nennt Rahmen-Endmass inklusive Rand, benötigtes A-Papier, tatsächliche Bildfläche und effektive Auflösung. Passt kein vorhandener Rahmen, folgt ein benutzerdefiniertes Endmass mit Hinweis „Kein Standardrahmen“.

Vorschläge verwenden dieselbe Layoutberechnung wie die Vorschau. Sie prüfen die in der Auswahlliste vorhandenen Rahmen in der aktuellen Ausrichtung und mit unveränderten Mindesträndern, maximal so gross wie das aktuelle Referenzformat. Unter den geeigneten Rahmen wird die grösste Fläche empfohlen. Das aktuelle Rahmenformat darf vorgeschlagen werden, wenn das Einpassen in dessen Endmass bereits ausreicht. Benutzerdefinierte Masse werden konservativ auf ganze Millimeter abgerundet und auf die Eingabegrenzen geprüft. Kein passender Vorschlag: Ursache und mögliche Abhilfe anzeigen.

Erst „Vorschlag übernehmen“ verändert Format und Papier. Ein übernommenes Rahmenformat ist ein exaktes Endmass inklusive Rand, auf dem kleinsten passenden A-Papier zentriert, mit Schnittmarken im Photoshop-Script. Der vorhandene Modus zum Ausnutzen des ganzen Papierbogens bleibt erhalten. Die sichtbare Auswahl „Papier ausnutzen“ führt wieder zur ganzen Papierfläche. Eine Skalierungsrücksetzung und Formatänderungen behalten den gewählten Modus bei; eine neue Verkleinerung bleibt innerhalb des übernommenen Endmasses. Format-, Rand- und Bildänderungen berechnen die Vorschläge neu. Die Quelle bleibt vollständig und unbeschnitten.

Flider-Typografie, Abstände und Trennlinien werden weitergenutzt, ohne neue Navigation oder dekorative Karten. Sekundärer Übernahme-Button, klare Überschriften, mobile Umbrüche, native Tastaturbedienung und ausgeschriebene Statusmeldungen bleiben verbindlich. Tests prüfen die grösste geeignete Auswahl, den Custom-Fallback, Ausrichtungen, Ränder/Passepartout, unveränderte Einstellungen vor Übernahme, Aktualisierung nach Änderungen und die identische Übernahme samt Schnittmarken ins Script.

## Ergänzung: Druck-Info

Zweck: den berechneten Druckbogen mit den Einstellungen in Photoshop und dem Druckertreiber abgleichen. Ein sichtbarer sekundärer Button „Druck-Info“ steht direkt bei den berechneten Druckmassen; der Photoshop-Export bleibt die Hauptaktion. Ein natives modales Dialogfenster bündelt aktuelle Bogen-/End-/Bildmasse und Bildauflösung sowie kurze Schritte für Papierformat, 100-%-Massstab, Medientyp, Qualität und Farbmanagement. Die App liest keine installierten Drucker oder ICC-Profile aus und verändert keine Druckeinstellungen.

Flider-Tokens, ruhige Trennlinien, Systemschrift, keine zusätzlichen Karten oder Hauptnavigation. Die Zusammenfassung ist dynamisch aus `getPrintLayout()`, beim Öffnen und bei Neuberechnungen aktuell. Ohne Bild ist sie als Vorlage gekennzeichnet; ungültige Ränder zeigen keine scheinbar gültigen Bild-/Endmasse. Druckerwahl im Dialog: Canon PRO-1000 als ausdrücklich bezeichnetes Beispiel, alternativ allgemeine Hinweise. Papierabhängige Medientypen, ICC-Profile, Rendering Intent und Tiefenkompensierung werden nicht pauschal vorgegeben. Canon-Hinweise nennen A5/oberen Einzug, die normale bedruckbare Fläche und verlinken die Quellen. Ein anderer Drucker erhält keine Canon-spezifischen Vorgaben.

Das Dialogfenster ist innen scrollbar, auf Mobilgeräten auf die Viewportbreite begrenzt, mit sichtbarer Schliessen-Aktion, Escape und nativem Fokusmanagement. „Info kopieren“ ist eine sekundäre Hilfsaktion mit Erfolg-/Fehlermeldung. Der Text umfasst die aktuellen Masse und die ausgewählten Druckerhinweise. Es wird weder gedruckt noch eine Anwendungseinstellung automatisch geändert. Offizielle Adobe- und Canon-Links stehen im Dialog. Prüfung: dynamische Papier-/Endmasse inklusive übernommener Vorschläge, Vorlagen-/Fehlerzustände, Druckerwechsel, Kopiertext und unveränderte Layout-/Exportgeometrie; Desktop und Mobile visuell bedienen.

## Prüfung

Die bestehende geometrische Prüfung bleibt verbindlich. Ergänzungen prüfen Skalierung, zentrierte Bildplatzierung, Randrücksetzung und Exportgleichheit. Sichtprüfung am bereits vom Nutzer geöffneten lokalen Chrome-Tab, inklusive Upload, Rand, Rahmen und manueller Bildgrösse. V14 wird auf ausdrücklichen Nutzerauftrag über den bestehenden GitHub-Hauptzweig und das bestehende Vercel-Projekt veröffentlicht. Originalbilder bleiben ausschliesslich lokal und im persönlichen JSX-Download.

## Ergänzung: frei wählbares fertiges Endmass

Zweck: z. B. einen 40 × 50 cm Print passend zum vorhandenen Rahmen herstellen. Im Format-Abschnitt steht nach dem Produkt eine beschriftete Zweierauswahl „Fertiges Endmass“ / „Papier ausnutzen“. Endmass ist die Voreinstellung für neue Sitzungen. Darunter folgen vorhandene Formatvorlagen oder eigene Zentimeterwerte und die Ausrichtung. Leinwand blendet die Zweierauswahl aus und behält ihre bisherige Geometrie. Beim Produktwechsel bleibt die Print-Auswahl gespeichert.

Das Endmass enthält den gewünschten Rand. Das vollständige Original wird proportional darin eingepasst; abweichende Bildproportionen lassen zusätzliche freie Fläche. 40 × 50 cm, 4:5-Motiv, ohne Rand, 100 % ergibt exakt 40 × 50 cm Bildfläche auf A2. Ein 1-cm-Rand ergibt 38 × 47,5 cm Bildfläche innerhalb desselben Endmasses. Das Papier wird weiterhin automatisch gewählt. Vorschau zeigt den fertigen Print; die separate Papierangabe beschreibt den Druckbogen. Alle Masse, Qualitätsangaben, Photoshop-Platzierung und Schnittmarken stammen aus getPrintLayout(). Markierungen liegen im überschüssigen Papier ausserhalb des Endmasses, mit Hinweis auf Papierkanten, falls eine Seite bereits auf dem Papierformat liegt.

Layout und Design bleiben beim Flider-System. Keine weitere Navigation oder Hauptaktion. Papier, fertiges Endmass, Bildfläche und tatsächliche Ränder erhalten je eine beschriftete Angabe; unter 1000 px stehen sie als 2 × 2 Raster. Native Buttons mit aria-pressed, klare Modus-Hilfe direkt am Format, bestehende Fokuszustände und mobile Umbrüche. Die Skalierungsrücksetzung verändert nur die Bildgrösse und behält den Modus.

Prüfung: exakte Endmasse für alle Formate/Ausrichtungen, freier und asymmetrischer Rand, abweichende Motivproportionen, Modus-/Produktwechsel und Skalierung. Für 40 × 50 cm auf A2 liegen Schnittkanten bei x=10/410 mm und y=47/547 mm; acht druckbare Marken müssen ausserhalb liegen. Native Photoshop-Sichtprüfung und Vergleich mit der Browser-Vorschau.
