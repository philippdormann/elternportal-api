// test-info.js
import { getElternportalClient } from "@philippdormann/elternportal-api";
import config from './config.js';

async function testElternportalInfo() {
  try {
    console.log("Verbinde mit dem Elternportal...");
    
    // Verbindung zum Elternportal herstellen
    const client = await getElternportalClient({
      short: config.short,
      username: config.username,
      password: config.password
    });
    
    console.log("✅ Anmeldung erfolgreich!");
    
    // Teste getKids()
    console.log("\n=== Test: getKids() ===");
    try {
      const kids = await client.getKids();
      console.log("Ergebnis von getKids():");
      console.log(JSON.stringify(kids, null, 2));
      
      if (kids && Array.isArray(kids)) {
        console.log(`Anzahl der Kinder: ${kids.length}`);
        kids.forEach((kid, index) => {
          console.log(`Kind ${index + 1}:`);
          console.log(JSON.stringify(kid, null, 2));
        });
      } else {
        console.log("getKids() hat kein Array zurückgegeben.");
      }
    } catch (error) {
      console.error("❌ Fehler bei getKids():", error.message);
    }
    
    // Teste getSchoolInfos()
    console.log("\n=== Test: getSchoolInfos() ===");
    try {
      const schoolInfo = await client.getSchoolInfos();
      console.log("Ergebnis von getSchoolInfos():");
      console.log(JSON.stringify(schoolInfo, null, 2));
    } catch (error) {
      console.error("❌ Fehler bei getSchoolInfos():", error.message);
    }
    
    // Teste andere verfügbare Methoden, die Informationen liefern könnten
    console.log("\n=== Test: Verfügbare Methoden ===");
    console.log("Verfügbare Methoden des Client-Objekts:");
    const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(client))
      .filter(name => typeof client[name] === 'function' && name !== 'constructor');
    console.log(methods);
    
    // Teste getProfile() falls verfügbar
    if (methods.includes('getProfile')) {
      console.log("\n=== Test: getProfile() ===");
      try {
        const profile = await client.getProfile();
        console.log("Ergebnis von getProfile():");
        console.log(JSON.stringify(profile, null, 2));
      } catch (error) {
        console.error("❌ Fehler bei getProfile():", error.message);
      }
    }
    
  } catch (error) {
    console.error("❌ Fehler bei der Anmeldung:", error);
  }
}

// Skript ausführen
testElternportalInfo();
