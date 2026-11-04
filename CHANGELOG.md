# Änderungen

## V14.10.2 · 04.11.2026

- Durchgehende Schnittlinien bis an die Papierränder statt kurzer, versetzter Schnittmarken. Nach dem Abschneiden einer oder zweier Seiten bleiben die Linien für die übrigen Schnitte erhalten.
- Gleiche Geometrie in Druckbogen-Vorschau, PNG und Photoshop-Script. Strichbreite 0,2 mm vollständig auf dem Papierrest; die Innenkante entspricht dem fertigen Endmass. Bereits passende Kanten bleiben unmarkiert. Bildfläche, Ränder, Papierwahl und Originalbytes bleiben unverändert.
- Geprüft mit 149 Schnittreihenfolgen für A5–A2, Ausrichtungen, nur zwei zu schneidende Kanten, volle Papierfläche und sehr schmale Papierstreifen sowie dem bestehenden Vorschau-/JSX-Vergleich.

## V14.10.1 · 04.11.2026

- Ein gemeinsames, beschriftetes Datei-Menü in Print und Mockup: Öffnen, Speichern, Speichern unter sowie Als PNG exportieren. Icons unterstützen die Begriffe; die Dateifunktionen und gespeicherten Dateien bleiben unverändert.
- «Photoshop-Script erstellen» bleibt der sichtbare blaue Hauptbutton der Druck-App. Im Mockup steht «Mockup als PNG exportieren» im Kopf; bei einem vorhandenen virtuellen Zimmer wird dieser Export ebenfalls zur Hauptaktion.
- Menüs schliessen nach Auswahl, Aussenklick oder Escape; Escape gibt den Fokus an Datei zurück und erhält den offenen Mockup-Dialog. Mobile Anordnung ohne Überlauf. Druckberechnung, Originalbytes und Schnittmarken bleiben unverändert.

## V14.10.0 · 04.11.2026

- Einheitlicher Dateiablauf für Prints und Mockups: sichtbares Öffnen/Speichern, Speichern unter im Menü und Dateiname mit Änderungsstatus. Erstes Speichern fragt nach Ordner/Name, weiteres Speichern aktualisiert in Chrome dieselbe Datei. Kein automatisches Öffnen des Verlaufs.
- Nur gespeicherte oder aus einem Ordner geöffnete Dateien in «Zuletzt gespeichert». Keine automatische Speicherung bei Photoshop-/PNG-Export oder Zimmererzeugung. Neue lokale Liste enthält nur Dateiverweise, Thumbnails und Metadaten. Dateien bleiben im gewählten Ordner.
- Speichern unter erstellt unabhängige Varianten. Öffnen liest aktuelle Dateidaten; Zugriff verweigert, fehlende Dateien, Abbruch und Schreibfehler erhalten die laufende Bearbeitung. Rückfrage vor dem Verwerfen ungespeicherter Änderungen. Tastaturbefehle für Öffnen/Speichern/Speichern unter.
- Browser ohne Dateizugriff erhalten einen benannten Download mit klarer Erklärung und erneuter Dateiauswahl beim Öffnen. Kein vorgetäuschter Eintrag für einen nicht bestätigten Download. Alte V14.9-Dateien bleiben kompatibel, frühere lokale Stände separat übernehmbar.
- Getestet: Originalbytes/JSX, Parameter, Raumfoto und Wandreferenz, Save/Save As, Berechtigungen und Fehler, parallele Änderungen, Download-Fallback, Listenpersistenz und Verwerfungsdialog. Native Chrome-Prüfung mit realen Dateien, Aktualisierung ohne erneute Ordnerwahl, zwei Mockup-Dateien und Wiederöffnen nach Reload; mobile Print-/Mockup-Bedienung.

## V14.9.0 · 04.11.2026

- Lokaler Verlauf mit getrennten Prints/Mockups, Vorschaubildern, Namen, Datum, Umbenennen und Löschen. Originaldateien werden mit ausdrücklicher Zustimmung lokal in IndexedDB gespeichert; gemeinsame Bilddateien werden dedupliziert.
- Entwürfe manuell sichern; Photoshop-/PNG-Exporte sichern Momentaufnahmen, virtuelle Zimmer werden direkt nach Erzeugung gesichert. Wiederöffnen übernimmt Original, gesamte Druckgestaltung und bei Mockups Zimmer/Position/Wandmasse ohne neue KI-Erzeugung.
- Portable `.printstudio`-Projektdateien mit Originalbytes exportieren und importieren. Chrome bietet eine Ordnerwahl; sonst normaler Download. Dateiprüfung und vorbereitendes Bildladen schützen den bisherigen Stand bei defekten Projekten. Keine Originalbilder, Raumfotos oder Zugangscodes werden dafür an einen Server gesendet.
- Tests für Persistenz, Deduplizierung, parallele Speicherung, gemeinsam verwendete Dateien, Originalbytes im erneuten JSX, sämtliche Gestaltungsoptionen, eigene/generierte Räume, Projekt-Rundreise und Fehler. Browserprüfung mit Neuladen, Chrome-Ordnerwahl/Import und mobiler Ansicht.

## V14.8.0 · 04.11.2026

- Objektentfernung vorerst vollständig aus Oberfläche und API entfernt. Auch die KI-Platzierungssuche für eigene Fotos entfällt. Bestehende Foto-KI-Aufrufe aus alten Clients werden vor Quotenreservierung oder Anbieteraufruf zurückgewiesen.
- Klare Aufteilung: virtuelle Zimmer weiterhin mit KI erzeugen; eigene Fotos ausschliesslich lokal zum Platzieren des Prints verwenden. Im eigenen Modus sind Zugangscode, KI-Zustimmung und Serverstatus ausgeblendet.
- Einfache Bedienung: Zimmerfoto laden/ziehen/einfügen, Print verschieben, Ansichtsgrösse einstellen, optional Wandmassstab festlegen und PNG sichern. Der PNG-Export ist im eigenen Foto die Hauptaktion. «Print zentrieren» verändert nur die Position.
- HEIC-Vorbereitung, lokale Dateidaten, Originalmotiv, Druckgeometrie und Photoshop-Export bleiben erhalten. Desktop/Mobil, lokale Bedienung ohne Netzwerk, virtuelle Erzeugung und serverseitige Ablehnung der früheren Foto-Modi werden geprüft.

## V14.7.0 · 04.11.2026

- Optionale Objektentfernung im eigenen Raum: gezielt bis zu acht Bereiche markieren, per Maus/Touch oder mit Tastaturhilfe. Bestehende Bilder bleiben standardmässig erhalten. Eigene Einwilligung und Zugangscode vor jedem bewusst gestarteten KI-Aufruf.
- Nur ausgewählte Bereiche aus der KI-Ausgabe werden lokal übernommen. Original/Bearbeitet-Vergleich und Rücksetzung behalten Wandmasse und Printposition. Der Originalprint bleibt lokal und wird nicht mitgesendet; keine Fotoablage auf dem Server.
- Geführte Wandmasse: fehlende oder ungeeignete Werte direkt an Breite/Höhe erklären; «Massstab anwenden» erst mit zwei gültigen Messwerten aktiv. Gespeicherte Referenzmasse klar kennzeichnen.
- Raumvorschau bleibt auf Desktop beim Scrollen durch die Einstellungen sichtbar. Mobile nutzt weiterhin die gestapelte Ansicht.
- API-Prüfung für Auswahl und JPEG-Grösse, serverseitig erzeugte PNG-Alphamaske, dieselbe atomische Tagesquote wie bisher. Tests für Zustimmung, Auswahl, Vergleich, Fehler und veraltete Antworten. Echte KI-Bearbeitung eines synthetischen Zimmers: erstes Bild entfernt, zweites erhalten; ausserhalb der Auswahl pixelidentische Browser-Exporte.

## V14.6.2 · 04.11.2026

- HEIC-/HEIF-Zimmerfotos werden bei fehlender Browserunterstützung automatisch lokal konvertiert und anschliessend direkt in der Raumvorschau angezeigt. Kein JPEG-Export durch den Benutzer nötig.
- Eingebetteter Decoder ohne CDN oder Bildversand; separater, nach dem Vorgang beendeter Web Worker. Die Raumkopie bleibt vollständig und proportional, mit maximal 4.096 Pixeln an der langen Seite. Das Originalmotiv und der Photoshop-Export werden nicht verändert.
- Sichtbarer Vorbereitungsstatus, Zeit-/Datei-/Pixelgrenzen, Abbruch bei Bildwechsel, Moduswechsel und Schliessen. Fehler behalten den bisherigen Raum bei.
- Reproduzierbare Einbettung des fest versionierten LGPL-Decoders, Quellcode-/Lizenzhinweise und Tests für Konvertierung, Fehler und veraltete Ergebnisse. Mit echter HEIC-Beispieldatei im Browser geprüft.

## V14.6.1 · 04.11.2026

- Zimmerfotos können im ganzen Mockup-Dialog abgelegt werden. Auch macOS-Dateiversprechen ohne vorab gemeldeten Dateityp werden angenommen; Dateien werden zusätzlich aus den Transfer-Items gelesen.
- Eigene Zimmerfotos lassen sich per Kopieren und Einfügen (⌘V) laden. Texteingaben und der virtuelle Modus werden nicht abgefangen.
- HEIC/HEIF und Bilddateien ohne MIME-Typ werden lokal zur Decodierung angenommen. Nicht unterstützte HEIC-Fotos, leere Übergaben und fehlende Bilddaten erhalten konkrete Hinweise zum JPEG-Export aus Apple Fotos. Kein automatischer Bildversand.
- Regressionstests für Dateiablage, Apple-Fotos-Übergaben, Zwischenablage und unveränderte Druckgeometrie.

## V14.6.0 · 04.11.2026

- Neuer Bereich „Mockup im Raum“: virtuelles Zimmer mit Sol 6.1 und GPT Image 2.5 Sunburst erzeugen oder ein eigenes Zimmerfoto lokal verwenden.
- Das Originalmotiv wird lokal mit den aktuellen Print-, Rand- und Rahmenmassen eingesetzt und nie an die KI übertragen. Beim eigenen Zimmerfoto analysiert Sol 6.1 nach ausdrücklicher Zustimmung nur eine verkleinerte, neu codierte Kopie und schlägt eine freie Wandfläche vor.
- Print im Raum ziehen, per Pfeiltasten verschieben, die geschätzte Ansichtsgrösse ändern oder eine Wandfläche mit vier Punkten und bekannten Massen für die perspektivische Darstellung festlegen. PNG-Export ohne Bedienhilfen.
- Separater Zugangscode für kostenpflichtige Aufrufe, atomarer Tageszähler in kostenlosem Upstash Redis, standardmässig zehn Versuche pro Zürcher Kalendertag. Doppelte oder parallele Aufrufe werden abgefangen; bei fehlender Einrichtung startet keine KI-Anfrage. Automatische Tarif-Upgrades sind ausgeschaltet.
- Keine Bildablage im Backend oder Zähler, keine API-Schlüssel im Browser. Druckberechnung und Photoshop-Platzierung bleiben unverändert. Öffnen, Skalieren und Gestaltungsänderungen starten keine KI-Anfragen.
- Lokaler Entwicklungsserver, API-/Projektions-/Datenschutztests, echte Zimmergenerierung und Wandflächenanalyse sowie verteilte Quotenprüfung mit zwölf parallelen Anfragen.

## V14.5.0 · 04.11.2026

- Neue Vorschauauswahl direkt über dem Motiv: „Fertiger Print“ oder „Druckbogen“ mit ganzem Papier und schwarzen Schnittmarken.
- Dezente Schraffur zeigt den Papierrest; sie dient nur der Vorschau und wird weder gedruckt noch als PNG exportiert. Das PNG enthält die gewählte Ansicht.
- Rahmen wird nur am fertigen Print simuliert. Rahmenwahl, Formatmodus, Ränder, Bildskalierung, Qualität und Photoshop-Geometrie bleiben beim Umschalten erhalten.
- Vorschau und Photoshop-Script verwenden dieselben berechneten Schnittmarken; Leinwand behält ihre bisherige Darstellung.
- Zusätzliche Prüfungen für den vollständigen A2-Bogen bei 40 × 30 cm, Ansichtwechsel, Live-Skalierung, Papier ohne Rest und ungültige Ränder; beide Ansichten in der bestehenden Formatmatrix.

## V14.4.2 · 04.11.2026

- Kurze Entscheidungshilfe direkt unter der Druckgrössen-Auswahl: „Fertiges Endmass“ für vorhandene Rahmen/feste Grössen, „Papier ausnutzen“ für möglichst grosse Prints ohne feste Zielgrösse.
- Beide Erklärungen bleiben sichtbar; die Buttons verweisen für Screenreader auf die Hilfe. Berechnung und Photoshop-Platzierung bleiben unverändert.

## V14.4.1 · 04.11.2026

- Schweizer Schreibweise mit ss in der aktuellen App, Druck-Info und Dokumentation: Endmass, Masse und Massstab. Als dauerhafte Projektvorgabe festgehalten.
- Berechnung, Schnittmarken und Bildplatzierung entsprechen V14.4.

## V14.4 · 04.11.2026

- Sichtbare Auswahl „Fertiges Endmaß“ (Voreinstellung) oder „Papier ausnutzen“ direkt bei der Formatwahl, für alle Vorlagen und eigene Maße.
- Das fertige Endmaß enthält den gewünschten Rand; Papier, Endmaß, Bildfläche und tatsächliche Ränder werden getrennt angezeigt. Die Vorschau zeigt den fertigen Print.
- 40 × 50 cm mit einem 4:5-Motiv, ohne Rand und bei 100 % ergibt genau 40 × 50 cm Bildfläche auf A2, zentriert mit acht druckbaren Schnittmarken ausserhalb des Prints.
- Bildskalierung zurücksetzen behält den gewählten Modus. Auch Format-/Randänderungen und der Wechsel zur Leinwand ändern die gespeicherte Print-Auswahl nicht.
- Der Download-Dateiname nennt das Endmaß, das Druckpapier und bei „Ohne“ korrekt 0 mm Rand.
- Sichtprüfung in Chrome (Desktop/Mobil) und Photoshop mit vollständigem 4:5-Testmotiv und acht Schnittmarken.
- Zusätzliche Endmaß- und Modusprüfungen; insgesamt 3.960 Layoutkombinationen mit vollständigem Original, Papierwahl und Vorschau-/Photoshop-Abgleich.

## V14.3 · 03.11.2026

- Sichtbarer „Druck-Info“-Button direkt an den berechneten Druckmaßen. Native Dialogansicht mit aktuellen Papier-/End-/Bildmaßen, tatsächlichen Rändern und Originalpixeln samt effektiven ppi.
- Kurze Anleitung für das Papierformat im Druckdialog, 100-%-Maßstab ohne automatische Anpassung, Medientyp, Fotoqualität, ICC-Profil/Farbmanagement und Kontrolle der bedruckbaren Fläche.
- Wählbare Hinweise für Canon PRO-1000 oder andere Drucker. Canon-Angaben zu A5/oberem Einzug, medienabhängigen Einschränkungen und normaler bedruckbarer Fläche; offizielle Herstellerlinks im Dialog.
- „Info kopieren“ übernimmt die aktuelle Zusammenfassung und Anleitung. Ohne geladenes Bild klar als Vorlage gekennzeichnet; ungültige Ränder führen zu einem Korrekturhinweis.
- Der Dialog setzt keine Druckeinstellungen und löst keinen Druckauftrag aus. Layout, Originaldatei und Photoshop-Platzierung bleiben unverändert.
- Ergänzende Prüfungen für aktuelle Maße nach Vorschlagsübernahme, Ausrichtung, Druckerwechsel, Kopieren/Fehler und Vorlagen-/Fehlerzustände.

## V14.2 · 03.11.2026

- Bei niedriger Auflösung zwei Wege: aktuelle Grösse beibehalten und das Original extern aufbereiten oder ein passendes Format übernehmen. Originalpixel, Zielpixel und erforderlicher Vergrösserungsfaktor stehen direkt am Vorschlag. Keine integrierte Hochskalierung oder Bildübertragung.
- Grösster geeigneter Rahmen aus der vorhandenen Liste mit mindestens 300 ppi, unveränderten Mindesträndern und passendem A-Papier. Das aktuelle Rahmenformat wird berücksichtigt, wenn sein exaktes Endmaß bereits ausreicht.
- Wenn kein Standardrahmen passt: konservativ auf ganze Millimeter abgerundetes benutzerdefiniertes Endmaß mit ausdrücklicher Kennzeichnung.
- Übernommene Rahmenvorschläge sind exakte Endmaße inklusive Rand, zentriert auf dem Druckbogen, mit Schnittmarken im Photoshop-Script. Vorschau, Maße und Script verwenden dieselbe Berechnung. „Papier optimal nutzen“ kehrt zur ganzen Papierfläche zurück.
- Vorschläge aktualisieren sich mit Bild, Format, Ausrichtung und Rändern; beim Übernehmen wird nochmals neu berechnet. Vor dem Übernehmen bleibt die Gestaltung unverändert.
- Zusätzlich 112 übernommene Vorschläge für Print/Leinwand, Ausrichtungen, Bildproportionen, Ränder/Passepartout sowie Tests für grössten Rahmen, Custom-Fallback, ungültige Fälle, Schnittmarken und Vorschau-/Script-Gleichheit.

## V14.1 · 03.11.2026

- Live-Anzeige der effektiven Bildauflösung auf der tatsächlichen Bildfläche, unabhängig von der Papiergrösse und den 300 ppi des Photoshop-Dokuments.
- Verständliche Hinweise bei weniger als 300 ppi, verstärkte Warnung unter 150 ppi. Papierwahl und Export werden dadurch nicht automatisch geändert oder gesperrt.
- Konkrete empfohlene Original-Pixelmaße für 300 ppi, auf ganze Pixel aufgerundet; aufklappbar vorhandene Pixel und maximale Bildfläche bei 300 ppi.
- Erläuterung der Papierwahl und der Rolle des Betrachtungsabstands. Skalierung, Rand, Format und Bildwechsel aktualisieren die Anzeige unmittelbar.
- Photoshop-Script enthält dieselbe Auflösungsbewertung als Kommentar und den Hinweis, bei 100 % zu drucken. Originaldaten, Platzierung und druckbare Elemente bleiben unverändert.
- Zusätzliche Prüfungen für Auflösungsgrenzen, Rundung, fehlende/ungültige Daten, Live-Aktualisierung, unveränderte Papierwahl und die Export-Momentaufnahme.

## V14 · 03.11.2026

- Neue helle Oberfläche mit grosser Arbeitsfläche und zusammenhängendem Inspektor für Format, Rand und Rahmen.
- Bildauswahl direkt an der Vorschau, Drag & Drop auch zum Ersetzen des Motivs; Schutz vor versehentlicher Browsernavigation beim Ablegen daneben.
- Proportionale Skalierung über Eckgriffe, Tastatur und Prozentregler, mit live berechneten Bild- und Randmaßen.
- Vollständiges Motiv ohne Beschnitt; automatische Papierwahl für A5, A4, A3 und A2 sowie eigene Formate.
- Frei einstellbare Mindestränder und Passepartout-Vorlagen. Rahmenmaterial und Breite beeinflussen nur die Simulation.
- Photoshop-Script mit unverändert eingebetteter Originaldatei: keine erneute Bildauswahl bei einem geladenen Motiv. Das temporär rekonstruierte Bild wird nach der Platzierung entfernt.
- Einstellungen werden beim Export als Momentaufnahme übernommen, auch wenn sich die Bedienung während der Dateiaufbereitung ändert.
- V13 als Originalarchiv erhalten; V14-Archiv identisch mit der aktuellen Anwendung.
- 2.640 Berechnungskombinationen und ergänzende Tests für Skalierung, Drag & Drop, eingebettete Bilddaten und Fehlerfälle. Produktionsbuild enthält nur die App und die Versionsdatei.
