export const fmtDate = (d) => new Date(d).toISOString().slice(0,10)
export const uid = () => Math.random().toString(36).slice(2, 10)
