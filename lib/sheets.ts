import { google } from "googleapis"

// Cliente do Google Sheets autenticado com o refresh token de uma conta que
// já tem acesso às planilhas (ex: a conta do administrador). O servidor lê
// sempre como essa conta — os usuários do dashboard não autenticam no Google.
export function getSheetsClient() {
  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error(
      "Faltam GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET ou GOOGLE_REFRESH_TOKEN."
    )
  }

  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret)
  oauth2Client.setCredentials({ refresh_token: refreshToken })

  return google.sheets({ version: "v4", auth: oauth2Client })
}
