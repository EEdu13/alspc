import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { getSheetsClient } from "@/lib/sheets"
import { buildModel, type RawSpreadsheet } from "@/lib/parse"
import PoliceDashboard from "@/components/dash/PoliceDashboard"

export const dynamic = "force-dynamic"

const SPREADSHEET_IDS = (process.env.SPREADSHEET_IDS || "")
  .split(",")
  .map((id) => id.trim())
  .filter(Boolean)

async function getSpreadsheetData(): Promise<RawSpreadsheet[]> {
  const sheets = getSheetsClient()

  const results = await Promise.all(
    SPREADSHEET_IDS.map(async (spreadsheetId): Promise<RawSpreadsheet | null> => {
      try {
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
      } catch (err: any) {
        // uma planilha sem acesso/inexistente não derruba o dashboard inteiro
        console.error(
          `Falha ao ler planilha ${spreadsheetId}:`,
          err?.code || err?.response?.status,
          err?.message
        )
        return null
      }
    })
  )

  return results.filter((r): r is RawSpreadsheet => r !== null)
}

export default async function DashboardPage() {
  const session = await auth()
  if (!session) redirect("/")

  const raw = await getSpreadsheetData()
  const model = buildModel(raw)

  return (
    <PoliceDashboard
      model={model}
      userEmail={session.user?.name || "usuário"}
      userImage={null}
    />
  )
}
