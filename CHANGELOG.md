# Änderungen

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
