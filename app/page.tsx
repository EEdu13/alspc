import { auth, signIn } from "@/auth"
import { redirect } from "next/navigation"
import Image from "next/image"

export default async function Home() {
  const session = await auth()
  if (session) redirect("/dashboard")

  return (
    <main className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
      <div className="bg-[#111111] border border-[#272727] rounded-2xl shadow-2xl max-w-md w-full p-8">

        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <Image src="/pc_thumb.png" alt="PCPR" width={80} height={80} className="drop-shadow-xl mb-4" />
          <h1 className="text-xl font-bold text-[#E8C547] tracking-wide">POLÍCIA CIVIL DO PARANÁ</h1>
          <p className="text-[#4a4038] text-xs tracking-widest mt-1 uppercase">Delegacia de Telêmaco Borba</p>
          <div className="mt-4 w-24 h-px bg-gradient-to-r from-transparent via-[#D4A820] to-transparent" />
          <p className="text-[#6a6058] text-sm mt-4">Painel de Gestão Operacional</p>
        </div>

        <form
          action={async () => {
            "use server"
            await signIn("google", { redirectTo: "/dashboard" })
          }}
        >
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-3 bg-[#1a1a1a] border border-[#D4A820]/40 hover:border-[#D4A820] hover:bg-[#D4A820]/10 text-[#E8C547] font-medium py-3 px-6 rounded-xl transition-all cursor-pointer"
          >
            <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Entrar com Google
          </button>
        </form>

        <p className="text-center text-[#3a3028] text-xs mt-5">
          Acesso restrito a usuários autorizados
        </p>
      </div>
    </main>
  )
}
