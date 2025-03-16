// elternbriefe-download.js
import { getElternportalClient } from "@philippdormann/elternportal-api";
import fs from "fs/promises";
import path from "path";
import config from './config.js';

async function downloadElternbriefe() {
  try {
    console.log("Verbinde mit dem Elternportal...");
    
    const client = await getElternportalClient({
      short: config.short,
      username: config.username,
      password: config.password
    });
    
    console.log("✅ Anmeldung erfolgreich!");
    console.log("Rufe Elternbriefe ab...");
    const letters = await client.getElternbriefe();
    
    console.log(`${letters.length} Elternbriefe gefunden.`);
    
    const downloadDir = "./elternbriefe";
    await fs.mkdir(downloadDir, { recursive: true });
    
    // Lade bereits heruntergeladene Elternbriefe
    let downloadedLetters = [];
    try {
      const downloadedData = await fs.readFile(path.join(downloadDir, "heruntergeladene-elternbriefe.json"), 'utf8');
      downloadedLetters = JSON.parse(downloadedData);
      console.log(`${downloadedLetters.length} bereits heruntergeladene Elternbriefe gefunden.`);
    } catch (error) {
      console.log("Keine Liste heruntergeladener Elternbriefe gefunden. Erstelle neue Liste.");
    }
    
    // Aktualisiere die Liste aller Elternbriefe
    await fs.writeFile(
      path.join(downloadDir, "elternbriefe-liste.json"), 
      JSON.stringify(letters, null, 2), 
      'utf8'
    );
    console.log(`✅ Liste der Elternbriefe gespeichert.`);
    
    // Filtere neue Elternbriefe
    const newLetters = letters.filter(letter => 
      !downloadedLetters.some(downloaded => downloaded.id === letter.id)
    );
    
    console.log(`${newLetters.length} neue Elternbriefe zum Herunterladen gefunden.`);
    
    if (newLetters.length === 0) {
      console.log("Keine neuen Elternbriefe zum Herunterladen vorhanden.");
      return;
    }
    
    console.log("Beginne mit dem Download der neuen Elternbriefe...");
    
    let successCount = 0;
    let errorCount = 0;
    let skippedCount = 0;
    
    for (let i = 0; i < newLetters.length; i++) {
      const letter = newLetters[i];
      const title = letter.title || 'Ohne_Titel';
      console.log(`Verarbeite Elternbrief ${i + 1}/${newLetters.length}: ${title}`);
      
      try {
        // Erstelle einen sicheren Dateinamen
        const safeTitle = title
          .replace(/[^a-zA-Z0-9äöüÄÖÜß]/g, '_')
          .replace(/_+/g, '_');
        
        // Sicheres Datumsformat für deutsches Format (DD.MM.YYYY HH:MM:SS)
        let formattedDate = "undatiert";
        try {
          if (letter.date) {
            // Deutsches Datumsformat parsen
            const parts = letter.date.split(' ');
            if (parts.length >= 1) {
              const dateParts = parts[0].split('.');
              if (dateParts.length === 3) {
                const day = dateParts[0];
                const month = dateParts[1];
                const year = dateParts[2];
                
                // ISO-Format erstellen (YYYY-MM-DD)
                formattedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
              }
            }
          }
        } catch (error) {
          console.log(`  ⚠️ Ungültiges Datum: ${error.message}`);
        }
        
        // Basisname für Dateien
        const baseName = `${formattedDate}_ID${letter.id}_${safeTitle}`;
        
        // Speichere immer den messageText als TXT-Datei
        const txtFilename = `${baseName}.txt`;
        const txtFilePath = path.join(downloadDir, txtFilename);
        await fs.writeFile(txtFilePath, letter.messageText, 'utf8');
        console.log(`  ✅ Nachrichtentext gespeichert: ${txtFilename}`);
        
        // Wenn ein Link vorhanden ist, lade auch die PDF herunter
        if (letter.link && letter.link.trim() !== "") {
          const pdfFilename = `${baseName}.pdf`;
          const pdfFilePath = path.join(downloadDir, pdfFilename);
          
          console.log(`  Lade PDF herunter: ${pdfFilename}`);
          
          try {
            const fileData = await client.getElternbrief(letter.id);
            
            // Verarbeite je nach Datentyp
            if (Buffer.isBuffer(fileData)) {
              await fs.writeFile(pdfFilePath, fileData);
              console.log(`  ✅ PDF gespeichert: ${pdfFilename}`);
              successCount++;
            } else if (typeof fileData === 'object') {
              // Versuche, den PDF-Inhalt zu extrahieren (falls vorhanden)
              if (fileData.pdf && Buffer.isBuffer(fileData.pdf)) {
                await fs.writeFile(pdfFilePath, fileData.pdf);
                console.log(`  ✅ PDF aus Objekt gespeichert: ${pdfFilename}`);
                successCount++;
              } else if (fileData.content && Buffer.isBuffer(fileData.content)) {
                await fs.writeFile(pdfFilePath, fileData.content);
                console.log(`  ✅ PDF-Content gespeichert: ${pdfFilename}`);
                successCount++;
              } else if (fileData.buffer && Buffer.isBuffer(fileData.buffer)) {
                await fs.writeFile(pdfFilePath, fileData.buffer);
                console.log(`  ✅ PDF-Buffer gespeichert: ${pdfFilename}`);
                successCount++;
              } else {
                console.log(`  ⚠️ Kein PDF-Inhalt gefunden für: ${pdfFilename}`);
                errorCount++;
              }
            } else {
              console.log(`  ❌ Unerwarteter Datentyp: ${typeof fileData}`);
              errorCount++;
            }
          } catch (error) {
            if (error.message === "Elternbrief not found") {
              console.log(`  ⚠️ Elternbrief nicht gefunden (ID: ${letter.id})`);
            } else {
              console.error(`  ❌ Fehler beim Herunterladen: ${error.message}`);
            }
            errorCount++;
          }
        } else {
          console.log(`  ℹ️ Kein Anhang vorhanden für: ${title}`);
          skippedCount++;
        }
        
        // Füge den Brief zur Liste der heruntergeladenen Briefe hinzu
        downloadedLetters.push(letter);
        
      } catch (error) {
        console.error(`  ❌ Fehler bei Elternbrief ${title}:`, error.message);
        errorCount++;
      }
    }
    
    // Speichere die aktualisierte Liste der heruntergeladenen Briefe
    await fs.writeFile(
      path.join(downloadDir, "heruntergeladene-elternbriefe.json"), 
      JSON.stringify(downloadedLetters, null, 2), 
      'utf8'
    );
    
    console.log(`✅ Download abgeschlossen. ${successCount} PDFs erfolgreich, ${errorCount} fehlgeschlagen, ${skippedCount} ohne Anhänge.`);
    console.log(`Alle neuen Elternbriefe wurden im Ordner "${downloadDir}" gespeichert.`);
    
  } catch (error) {
    console.error("❌ Fehler beim Herunterladen der Elternbriefe:", error);
    console.error("Details:", error.message);
  }
}

// Skript ausführen
downloadElternbriefe();
