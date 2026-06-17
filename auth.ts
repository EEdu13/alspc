import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { findUser } from "@/lib/users"

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  secret: process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET,
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      credentials: {
        username: { label: "Usuário" },
        password: { label: "Senha", type: "password" },
      },
      authorize: async (creds) => {
        const username = String(creds?.username ?? "")
        const password = String(creds?.password ?? "")
        const user = findUser(username, password)
        if (!user) return null
        return { id: user.username, name: user.username, role: user.role }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role
        token.username = user.name ?? undefined
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.name = (token.username as string) ?? session.user.name
        ;(session.user as any).role = token.role
      }
      return session
    },
  },
  pages: {
    signIn: "/",
  },
})
