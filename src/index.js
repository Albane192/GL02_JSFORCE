const { parseCRUFile, displayCourses } = require('./utils/parser');
const path = require('path');

/**
 * Point d'entrée du programme
 */
function main() {
  console.log('🎓 Système de Réservation Universitaire - SRU');
  console.log('================================================\n');

  // Utiliser le fichier de test simplifié
  const testFile = path.join(__dirname, '../data/test-simple.cru');
  
  try {
    console.log(`📂 Chargement de: ${testFile}\n`);
    
    // Parser le fichier
    const courses = parseCRUFile(testFile);
    
    // Afficher les résultats
    displayCourses(courses);
    
    // Quelques statistiques
    console.log('📊 STATISTIQUES:');
    console.log(`   - Nombre de cours: ${courses.length}`);
    
    const totalSlots = courses.reduce((sum, c) => sum + c.slots.length, 0);
    console.log(`   - Nombre de créneaux: ${totalSlots}`);
    
    const uniqueRooms = new Set();
    courses.forEach(c => c.slots.forEach(s => uniqueRooms.add(s.room)));
    console.log(`   - Salles différentes: ${uniqueRooms.size}`);
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    console.error(error.stack);
  }
}

// Lancer le programme
main();