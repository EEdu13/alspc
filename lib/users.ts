// Usuários do dashboard — lidos da env var APP_USERS (JSON).
// Formato: [{"u":"admin","p":"senha","role":"admin"}, {"u":"agentes","p":"senha","role":"user"}]
// Mantido em env var (e não no código) porque o repositório é público.

export interface AppUser {
  username: string
  role: "admin" | "user"
}

interface StoredUser extends AppUser {
  password: string
}

function parseUsers(): StoredUser[] {
  const raw = process.env.APP_USERS
  if (!raw) return []
  try {
    const arr = JSON.parse(raw)
    if (!Array.isArray(arr)) return []
    return arr.map((u: any) => ({
      username: String(u.u ?? u.username ?? "").trim(),
      password: String(u.p ?? u.password ?? ""),
      role: u.role === "admin" ? "admin" : "user",
    }))
  } catch {
    return []
  }
}

export function findUser(username: string, password: string): AppUser | null {
  const u = parseUsers().find(
    (x) =>
      x.username.toLowerCase() === username.trim().toLowerCase() &&
      x.password === password
  )
  return u ? { username: u.username, role: u.role } : null
}
