export function isValidTime(startTime,day) {
  // Segunda e quarta tem horário até as 18h
  if (startTime == '18h' && (day === 1 || day === 3)) return true
  // Quarta tem horário até as 19h
  if (startTime == '19h' && (day === 3)) return true

  // Sexta-feira tem horário até as 14h
  if (startTime == '14h' && (day === 5)) return false
  if ((startTime == '19h' || startTime == '18h')) return false
  return true
}

export const horarios = [
    { startTime: '14h', endTime: '14h45' },
    { startTime: '15h', endTime: '15h45' },
    { startTime: '16h15', endTime: '17h' },
    { startTime: '17h15', endTime: '18h' },
    { startTime: '18h', endTime: '18h45' },
    { startTime: '19h', endTime: '19h45' }
];

export const notAllowedTimesStaturday = ['18h', '19h'];

export function getSaturdayStartTime(startTime) {
    switch (startTime) {
      case '14h':
        return '9h';
      case '15h':
        return '10h';
      case '16h15':
        return '11h';
      case '17h15':
        return '12h';
    }
  }
export function getSaturdayEndTime(endTime) {
    switch (endTime) {
        case '14h45':
        return '9h45';
        case '15h45':
        return '10h45'
        case '17h':
        return '11h45'
        case '18h':
        return '12h45'
    }
}