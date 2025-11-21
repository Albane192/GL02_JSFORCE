const fs = require('fs');

/**
 * Parse un fichier au format CRU
 * @param {string} filePath - Chemin vers le fichier .cru
 * @returns {Array} Tableau de cours avec leurs créneaux
 */
function parseCRUFile(filePath) {
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  return parseCRUContent(fileContent);
}

/**
 * Parse le contenu d'un fichier CRU
 * @param {string} content - Contenu du fichier
 * @returns {Array} Tableau de cours structurés
 */
function parseCRUContent(content) {
  const lines = content.split('\n');
  const courses = [];
  let currentCourse = null;

  for (let line of lines) {
    line = line.trim();
    
    // Ignorer les lignes vides et commentaires
    if (!line || line.startsWith('EDT.CRU') || line.startsWith('V ') || 
        line.startsWith('Seance') || line.startsWith('Comportement') ||
        line.startsWith('Page g')) {
      continue;
    }

    if (line.startsWith('+')) {
      // Nouveau cours : +MATH01
      currentCourse = {
        code: line.substring(1).trim(),
        slots: []
      };
      courses.push(currentCourse);
      
    } else if (line.startsWith('1,') && currentCourse) {
      // Créneau : 1,C1,P=100,H=L 8:00-10:00,F1,S=A001//
      try {
        const slot = parseSlotLine(line, currentCourse.code);
        if (slot) {
          currentCourse.slots.push(slot);
        }
      } catch (error) {
        console.warn(`Erreur parsing ligne "${line}": ${error.message}`);
      }
    }
  }

  return courses;
}

/**
 * Parse une ligne de créneau
 * @param {string} line - Ligne au format "1,C1,P=100,H=L 8:00-10:00,F1,S=A001//"
 * @param {string} courseCode - Code du cours
 * @returns {Object} Objet créneau structuré
 */
function parseSlotLine(line, courseCode) {
  // Retirer le "1," du début et les "//" de fin
  line = line.substring(2).replace(/\/+$/, '');
  
  const parts = line.split(',');
  
  // Type de cours : C1, T2, D3
  const typeMatch = parts[0].match(/^([CTD])(\d+)$/);
  if (!typeMatch) return null;
  
  const type = typeMatch[1]; // "C", "T" ou "D"
  const groupNumber = typeMatch[1] + typeMatch[2]; // "C1", "T2", etc.
  
  // Capacité : P=100
  const capacityMatch = parts[1].match(/P=(\d+)/);
  const capacity = capacityMatch ? parseInt(capacityMatch[1]) : 0;
  
  // Horaires : H=L 8:00-10:00
  const scheduleStr = parts.slice(2).join(',');
  const schedules = parseSchedules(scheduleStr);
  
  // Retourner un objet par horaire
  return schedules.map(sched => ({
    courseCode,
    type: getTypeLabel(type),
    typeCode: groupNumber,
    capacity,
    day: sched.day,
    dayCode: sched.dayCode,
    startTime: sched.startTime,
    endTime: sched.endTime,
    group: sched.group,
    room: sched.room
  }))[0]; // Pour l'instant on prend juste le premier horaire
}

/**
 * Parse les horaires d'un créneau
 * @param {string} scheduleStr - Ex: "H=L 8:00-10:00,F1,S=A001"
 * @returns {Array} Tableau d'objets horaires
 */
function parseSchedules(scheduleStr) {
  const schedules = [];
  
  // Séparer par "/" pour les créneaux multiples
  const parts = scheduleStr.split('/').filter(s => s.trim());
  
  for (let part of parts) {
    const elements = part.split(',').map(e => e.trim());
    
    let dayAndTime = null;
    let group = null;
    let room = null;
    
    for (let elem of elements) {
      if (elem.startsWith('H=')) {
        // H=L 8:00-10:00
        dayAndTime = elem.substring(2).trim();
      } else if (elem.startsWith('F')) {
        // F1, F2, FA, FB
        group = elem;
      } else if (elem.startsWith('S=')) {
        // S=A001
        room = elem.substring(2);
      }
    }
    
    if (dayAndTime && room) {
      const [dayCode, hours] = dayAndTime.split(' ');
      const [startTime, endTime] = hours.split('-');
      
      schedules.push({
        dayCode,
        day: parseDayCode(dayCode),
        startTime,
        endTime,
        group: group || 'F1',
        room
      });
    }
  }
  
  return schedules;
}

/**
 * Convertit un code jour en nom complet
 * @param {string} code - L, MA, ME, J, V, S
 * @returns {string} Nom du jour
 */
function parseDayCode(code) {
  const days = {
    'L': 'Lundi',
    'MA': 'Mardi',
    'ME': 'Mercredi',
    'J': 'Jeudi',
    'V': 'Vendredi',
    'S': 'Samedi'
  };
  return days[code] || code;
}

/**
 * Convertit le code type en label
 * @param {string} code - C, T ou D
 * @returns {string} CM, TD ou TP
 */
function getTypeLabel(code) {
  const types = {
    'C': 'CM',
    'T': 'TD',
    'D': 'TP'
  };
  return types[code] || code;
}

/**
 * Affiche les cours de manière formatée
 * @param {Array} courses - Tableau de cours
 */
function displayCourses(courses) {
  console.log('\n📚 COURS PARSÉS\n');
  
  for (let course of courses) {
    console.log(`\n✏️  ${course.code}`);
    
    for (let slot of course.slots) {
      console.log(`   ${slot.type} - ${slot.day} ${slot.startTime}-${slot.endTime}`);
      console.log(`   📍 Salle: ${slot.room} | 👥 Capacité: ${slot.capacity} | Groupe: ${slot.group}`);
    }
  }
  
  console.log(`\n✅ Total: ${courses.length} cours parsés\n`);
}

module.exports = {
  parseCRUFile,
  parseCRUContent,
  displayCourses
};