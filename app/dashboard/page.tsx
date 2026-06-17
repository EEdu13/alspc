import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { google } from "googleapis"
import { buildModel, type RawSpreadsheet } from "@/lib/parse"
import PoliceDashboard from "@/components/dash/PoliceDashboard"

export const dynamic = "force-dynamic"

const SPREADSHEET_IDS = (process.env.SPREADSHEET_IDS || "")
  .split(",")
  .map((id) => id.trim())
  .filter(Boolean)

async function getSpreadsheetData(accessToken: string): Promise<RawSpreadsheet[]> {
  const oauth2Client = new google.auth.OAuth2()
  oauth2Client.setCredentials({ access_token: accessToken })
  const sheets = google.sheets({ version: "v4", auth: oauth2Client })

  return Promise.all(
    SPREADSHEET_IDS.map(async (spreadsheetId) => {
      const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId })
      const title = spreadsheet.data.properties?.title || "Sem título"
      const sheetTitles = (spreadsheet.data.sheets || [])
        .map((s) => s.properties?.title)
        .filter(Boolean) as string[]

      const sheetsData = await Promise.all(
        sheetTitles.map(async (sheetTitle) => {
          try {
            const response = await sheets.spreadsheets.values.get({
              spreadsheetId,
              range: sheetTitle,
            })
            return {
              title: sheetTitle,
              values: (response.data.values || []) as string[][],
            }
          } catch {
            return { title: sheetTitle, values: [] as string[][] }
          }
        })
      )

      return { id: spreadsheetId, title, sheets: sheetsData }
    })
  )
}

export default async function DashboardPage() {
  const session = await auth()
  if (!session) redirect("/")
  if (session.error === "RefreshAccessTokenError") redirect("/api/auth/signin?prompt=consent")
  if (!session.accessToken) redirect("/denied")

  let raw: RawSpreadsheet[]
  try {
    raw = await getSpreadsheetData(session.accessToken)
  } catch (error: any) {
    const status = error.code || error.response?.status
    if (status === 401) redirect("/api/auth/signin?prompt=consent")
    if (status === 403) redirect("/denied")
    throw error
  }

  const model = buildModel(raw)

  return (
    <PoliceDashboard
      model={model}
      userEmail={session.user?.email || ""}
      userImage={session.user?.image || null}
    />
  )
}
