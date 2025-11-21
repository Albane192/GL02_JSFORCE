const { parseCRUContent } = require('../src/utils/parser');

describe('Parser CRU', () => {
  
  test('devrait parser un cours simple avec un CM', () => {
    const input = `+MATH01
1,C1,P=100,H=L 8:00-10:00,F1,S=A001//`;
    
    const result = parseCRUContent(input);
    
    expect(result).toHaveLength(1);
    expect(result[0].code).toBe('MATH01');
    expect(result[0].slots).toHaveLength(1);
    expect(result[0].slots[0].type).toBe('CM');
    expect(result[0].slots[0].capacity).toBe(100);
    expect(result[0].slots[0].room).toBe('A001');
  });

  test('devrait parser plusieurs créneaux pour un même cours', () => {
    const input = `+MATH01
1,C1,P=100,H=L 8:00-10:00,F1,S=A001//
1,T1,P=24,H=MA 14:00-16:00,F1,S=B201//`;
    
    const result = parseCRUContent(input);
    
    expect(result).toHaveLength(1);
    expect(result[0].slots).toHaveLength(2);
    expect(result[0].slots[0].type).toBe('CM');
    expect(result[0].slots[1].type).toBe('TD');
  });

  test('devrait parser plusieurs cours', () => {
    const input = `+MATH01
1,C1,P=100,H=L 8:00-10:00,F1,S=A001//
+PHYS02
1,C1,P=150,H=L 10:00-12:00,F1,S=AMPHI1//`;
    
    const result = parseCRUContent(input);
    
    expect(result).toHaveLength(2);
    expect(result[0].code).toBe('MATH01');
    expect(result[1].code).toBe('PHYS02');
  });

  test('devrait ignorer les lignes de commentaire', () => {
    const input = `EDT.CRU - Test
V rifier ce qui se passe
+MATH01
1,C1,P=100,H=L 8:00-10:00,F1,S=A001//`;
    
    const result = parseCRUContent(input);
    
    expect(result).toHaveLength(1);
    expect(result[0].code).toBe('MATH01');
  });

  test('devrait convertir correctement les codes jours', () => {
    const input = `+TEST01
1,C1,P=50,H=L 8:00-10:00,F1,S=A001//`;
    
    const result = parseCRUContent(input);
    
    expect(result[0].slots[0].day).toBe('Lundi');
    expect(result[0].slots[0].dayCode).toBe('L');
  });

  test('devrait parser correctement les horaires', () => {
    const input = `+TEST01
1,C1,P=50,H=L 8:00-10:00,F1,S=A001//`;
    
    const result = parseCRUContent(input);
    
    expect(result[0].slots[0].startTime).toBe('8:00');
    expect(result[0].slots[0].endTime).toBe('10:00');
  });

  test('devrait parser les TD correctement', () => {
    const input = `+MATH01
1,T1,P=24,H=MA 14:00-16:00,F1,S=B201//`;
    
    const result = parseCRUContent(input);
    
    expect(result[0].slots[0].type).toBe('TD');
    expect(result[0].slots[0].typeCode).toBe('T1');
  });

  test('devrait parser les TP correctement', () => {
    const input = `+MATH01
1,D1,P=24,H=ME 10:00-12:00,F1,S=C101//`;
    
    const result = parseCRUContent(input);
    
    expect(result[0].slots[0].type).toBe('TP');
    expect(result[0].slots[0].typeCode).toBe('D1');
  });

  test('devrait gérer les capacités à 0', () => {
    const input = `+CL07
1,D2,P=0,H=MA 14:00-16:00,F1,S=S104//`;
    
    const result = parseCRUContent(input);
    
    expect(result[0].slots[0].capacity).toBe(0);
  });

});