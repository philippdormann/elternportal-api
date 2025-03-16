// schulaufgaben-ical.js
import { getElternportalClient } from "@philippdormann/elternportal-api";
import fs from "fs/promises";
import config from './config.js';
import crypto from 'crypto';

// Funktion zum Erstellen einer iCal-Datei aus Schulaufgaben
async function createSchulaufgabenICS() {
  try {
    console.log("Verbinde mit dem Elternportal...");
    
    // Verbindung zum Elternportal herstellen
    const client = await getElternportalClient({
      short: config.short,
      username: config.username,
      password: config.password
    });
    
    console.log("✅ Anmeldung erfolgreich!");
    
    // Kinderinformationen abrufen
    const kids = await client.getKids();
    if (!kids || kids.length === 0) {
      throw new Error("Keine Kinderinformationen gefunden");
    }
    
    // Verwende das erste Kind (oder lass den Benutzer wählen, wenn mehrere vorhanden sind)
    const kid = kids[0];
    const childName = kid.firstName; // Nur Vorname verwenden
    const className = kid.className;
    
    console.log(`Kind: ${childName}, Klasse: ${className}`);
    
    // Schulaufgabenplan abrufen
    const schulaufgaben = await client.getSchulaufgabenplan();
    console.log(`${schulaufgaben.length} Schulaufgaben gefunden.`);
    
    // Bekannte Schulaufgaben laden
    let knownExams = [];
    try {
      const data = await fs.readFile('bekannte-schulaufgaben.json', 'utf8');
      knownExams = JSON.parse(data);
      console.log(`${knownExams.length} bekannte Schulaufgaben geladen.`);
    } catch (error) {
      console.log("Keine bekannten Schulaufgaben gefunden, erstelle neue Datei.");
    }
    
    // Neue Schulaufgaben filtern
    const newExams = schulaufgaben.filter(exam => 
      !knownExams.some(known => known.id === exam.id)
    );
    
    console.log(`${newExams.length} neue Schulaufgaben gefunden.`);
    
    if (newExams.length > 0) {
      // iCal-Datei erstellen mit Kindernamen und Klassenbezeichnung
      let icsContent = 
        "BEGIN:VCALENDAR\r\n" +
        "VERSION:2.0\r\n" +
        "PRODID:-//Elternportal//Schulaufgaben//DE\r\n" +
        "METHOD:PUBLISH\r\n" +
        `X-WR-CALNAME:Schulaufgaben ${childName} (${className})\r\n` +
        "X-APPLE-CALENDAR-COLOR:#FF9500\r\n";
      
      // Jeden neuen Termin hinzufügen
      for (let i = 0; i < newExams.length; i++) {
        const exam = newExams[i];
        console.log(`Verarbeite Schulaufgabe ${i + 1}/${newExams.length}: ${exam.title}`);
        
        try {
          // Datum aus der API nehmen, aber Zeit auf 9:00 Uhr setzen
          const examDate = new Date(exam.date);
          examDate.setHours(9, 0, 0, 0);
          
          // Formatiere Datum im iCal-Format (YYYYMMDDTHHMMSSZ)
          const startDate = formatDateForICS(examDate);
          
          // Erstelle ein Enddatum (1 Stunde später)
          const endDate = formatDateForICS(new Date(examDate.getTime() + 60*60*1000));
          
          // Erstelle Zeitstempel für jetzt
          const now = formatDateForICS(new Date());
          
          // Erstelle eine eindeutige UID basierend auf Datum und Titel
          const uniqueString = `${exam.date}-${exam.title}-${kid.id}`;
          const hash = crypto.createHash('md5').update(uniqueString).digest('hex');
          const uid = `${hash}@${config.short}.elternportal`;
          
          icsContent += "BEGIN:VEVENT\r\n";
          icsContent += `UID:${uid}\r\n`;
          icsContent += `DTSTAMP:${now}\r\n`;
          icsContent += `DTSTART;VALUE=DATE-TIME:${startDate}\r\n`;
          icsContent += `DTEND;VALUE=DATE-TIME:${endDate}\r\n`;
          icsContent += `SUMMARY:${exam.title} (${className})\r\n`;
          icsContent += `DESCRIPTION:Schulaufgabe für ${childName}, Klasse ${className}. Automatisch erstellt aus dem Elternportal.\r\n`;
          icsContent += "TRANSP:OPAQUE\r\n";
          icsContent += "STATUS:CONFIRMED\r\n";
          
          // Erinnerung 1 Woche vorher
          icsContent += "BEGIN:VALARM\r\n";
          icsContent += "ACTION:DISPLAY\r\n";
          icsContent += `DESCRIPTION:Erinnerung: ${childName} hat in einer Woche eine Schulaufgabe\r\n`;
          icsContent += "TRIGGER:-P7D\r\n";
          icsContent += "END:VALARM\r\n";
          
          // Erinnerung 2 Tage vorher
          icsContent += "BEGIN:VALARM\r\n";
          icsContent += "ACTION:DISPLAY\r\n";
          icsContent += `DESCRIPTION:Erinnerung: ${childName} hat in 2 Tagen eine Schulaufgabe\r\n`;
          icsContent += "TRIGGER:-P2D\r\n";
          icsContent += "END:VALARM\r\n";
          
          icsContent += "END:VEVENT\r\n";
          
          console.log(`✅ Schulaufgabe ${i + 1} erfolgreich zur ICS hinzugefügt mit UID: ${uid}`);
        } catch (error) {
          console.error(`❌ Fehler beim Verarbeiten von Schulaufgabe ${i + 1}:`, error);
        }
      }
      
      icsContent += "END:VCALENDAR";
      
      // iCal-Datei speichern mit Kindernamen im Dateinamen
      const filename = `schulaufgaben_${childName}_${className}_${new Date().toISOString().slice(0,10)}.ics`;
      await fs.writeFile(filename, icsContent, 'utf8');
      console.log(`✅ iCal-Datei "${filename}" erstellt mit ${newExams.length} neuen Schulaufgaben für ${childName}.`);
      
      // Alle Schulaufgaben als bekannt speichern
      await fs.writeFile('bekannte-schulaufgaben.json', JSON.stringify(schulaufgaben), 'utf8');
    } else {
      console.log("Keine neuen Schulaufgaben zum Exportieren vorhanden.");
    }
    
  } catch (error) {
    console.error("❌ Fehler beim Erstellen der iCal-Datei:", error);
    console.error("Details:", error.message);
  }
}

// Hilfsfunktion zum Formatieren eines Datums für ICS
function formatDateForICS(date) {
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

// Skript ausführen
createSchulaufgabenICS();
