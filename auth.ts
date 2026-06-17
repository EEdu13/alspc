import NextAuth from "next-auth"
import Google from "next-auth/providers/google"

async function refreshGoogleAccessToken(refreshToken: string) {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error_description || data.error || "refresh failed")
  return {
    accessToken: data.access_token as string,
    expiresAt: Math.floor(Date.now() / 1000) + (data.expires_in as number),
    refreshToken: (data.refresh_token as string | undefined) ?? refreshToken,
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope:
            "openid email profile https://www.googleapis.com/auth/spreadsheets.readonly https://www.googleapis.com/auth/drive.metadata.readonly",
          access_type: "offline",
          prompt: "consent",
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token as string
        token.refreshToken = account.refresh_token as string | undefined
        token.expiresAt = account.expires_at as number | undefined
        return token
      }

      if (token.expiresAt && Date.now() / 1000 < (token.expiresAt as number) - 60) {
        return token
      }

      if (!token.refreshToken) {
        token.error = "RefreshAccessTokenError"
        return token
      }

      try {
        const refreshed = await refreshGoogleAccessToken(token.refreshToken as string)
        token.accessToken = refreshed.accessToken
        token.expiresAt = refreshed.expiresAt
        token.refreshToken = refreshed.refreshToken
        delete token.error
      } catch {
        token.error = "RefreshAccessTokenError"
      }
      return token
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string
      session.error = token.error as string | undefined
      return session
    },
  },
  pages: {
    signIn: "/",
    error: "/denied",
  },
})
