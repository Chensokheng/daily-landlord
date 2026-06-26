/** Short, collision-unlikely id for client-side records. */
export const makeId = () => Math.random().toString(36).slice(2, 10);
