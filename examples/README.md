# Elternportal API Beispiele

Dieses Verzeichnis enthält Beispiele für die Verwendung der Elternportal-API.

## Voraussetzungen

- Node.js (Version 14 oder höher)
- npm

## Installation

1. Klone dieses Repository oder kopiere die Dateien in ein Verzeichnis
2. Installiere die benötigten Pakete:
   ```
   npm install
   ```
3. Kopiere `config.example.js` zu `config.js` und passe die Werte an:
   ```
   cp config.example.js config.js
   ```
4. Bearbeite `config.js` und trage deine Zugangsdaten ein.

## Verfügbare Beispiele

### Anzeige von Kind- und Schulinformationen

Zeigt Informationen über dein Kind und die Schule an.

```
npm run info
```

oder

```
node anzeige-kind-schule.js
```

### Schulaufgaben als iCal-Datei exportieren

Erstellt eine iCal-Datei (ICS) mit allen Schulaufgaben, die im Elternportal eingetragen sind.

```
npm run export-schulaufgaben-ical
```

oder

```
node schulaufgaben-ical.js
```

Die generierte ICS-Datei kann in Apple Kalender, Google Kalender oder andere Kalender-Apps importiert werden.

## Funktionen des iCal-Exports

- Abrufen aller Schulaufgaben aus dem Elternportal
- Erstellung einer ICS-Datei mit eindeutigen UIDs
- Erinnerungen 1 Woche und 2 Tage vor jeder Schulaufgabe
- Vermeidung von Duplikaten durch Speichern bereits bekannter Schulaufgaben

## Tipps für Apple-Geräte

Um den Kalender mit der Familie zu teilen:
1. Importiere die ICS-Datei in die Kalender-App
2. Wähle den importierten Kalender aus
3. Tippe auf "i" (Info)
4. Wähle "Teilen mit" und füge Familienmitglieder hinzu

## Hinweis zu Erinnerungen

Wenn du den Kalender mit deiner Familie teilst, werden die Erinnerungen möglicherweise nicht korrekt übertragen. In diesem Fall sollte jedes Familienmitglied die ICS-Datei direkt in seinen eigenen Kalender importieren.
