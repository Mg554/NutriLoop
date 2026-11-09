// Reminder list and defaults (no imports, so the store can use it).
export const REMINDERS = [
  { id: 'morning', tab: 'move', def: '07:00', school: true },
  { id: 'breakfast', tab: 'plate', def: '07:30', meal: 1 },
  { id: 'water1', tab: 'today', def: '10:30', water: true },
  { id: 'lunch', tab: 'plate', def: '14:00', meal: 2 },
  { id: 'water2', tab: 'today', def: '16:00', water: true },
  { id: 'move', tab: 'move', def: '17:30', move: true },
  { id: 'dinner', tab: 'plate', def: '19:30', meal: 3 },
  { id: 'bedtime', tab: 'night', def: '20:00', night: true },
  // Ramadan: times follow fajr / maghrib (offset in minutes), only on Ramadan days
  { id: 'suhoor', tab: 'today', def: '', ramadan: 'fajr', offset: -45 },
  { id: 'iftar', tab: 'today', def: '', ramadan: 'maghrib', offset: -10 },
  { id: 'rwater', tab: 'today', def: '', ramadan: 'maghrib', offset: 150 },
]
export const defaultReminders = () => ({
  on: false,
  schoolDays: [0, 1, 2, 3, 4], // Sun..Thu (Date.getDay)
  items: Object.fromEntries(REMINDERS.map((r) => [r.id, { on: true, t: r.def }])),
})

