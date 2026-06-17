import { google } from "googleapis"

// Cliente do Google Sheets autenticado via Service Account.
// As planilhas precisam ser compartilhadas (somente leitura) com o e-mail
// da service account: GOOGLE_SERVICE_ACCOUNT_EMAIL.
export function getSheetsClient() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
  const key = (process.env.GOOGLE_SERVICE_ACCOUNT_KEY || "").replace(/\\n/g, "\n")

  if (!email || !key) {
    throw new Error(
      "Service account não configurada: defina GOOGLE_SERVICE_ACCOUNT_EMAIL e GOOGLE_SERVICE_ACCOUNT_KEY."
    )
  }

  const auth = new google.auth.JWT({
    email,
    key,
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
  })

  return google.sheets({ version: "v4", auth })
}
