export const scheduled = []
export const LocalNotifications = {
  checkPermissions: async () => ({ display: 'granted' }),
  requestPermissions: async () => ({ display: 'granted' }),
  getPending: async () => ({ notifications: scheduled.map((n) => ({ id: n.id })) }),
  cancel: async ({ notifications }) => { for (const n of notifications) { const i = scheduled.findIndex((x) => x.id === n.id); if (i >= 0) scheduled.splice(i, 1) } },
  createChannel: async () => {},
  schedule: async ({ notifications }) => { scheduled.push(...notifications) },
  addListener: async () => ({ remove() {} }),
}
