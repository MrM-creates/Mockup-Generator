# Änderungen

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
