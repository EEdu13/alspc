import { auth, signIn } from "@/auth"
import { redirect } from "next/navigation"
import { AuthError } from "next-auth"
import Image from "next/image"

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const session = await auth()
  if (session) redirect("/dashboard")

  const { error } = await searchParams

  return (
    <main className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
      <div className="bg-[#111111] border border-[#272727] rounded-2xl shadow-2xl max-w-sm w-full p-8">

        {/* Logo */}
        <div className="flex flex-col items-center mb-7">
          <Image src="/pc_thumb.png" alt="PCPR" width={80} height={80} className="drop-shadow-xl mb-4" />
          <h1 className="text-lg font-bold text-[#E8C547] tracking-wide text-center">POLÍCIA CIVIL DO PARANÁ</h1>
          <p className="text-[#4a4038] text-xs tracking-widest mt-1 uppercase">Delegacia de Telêmaco Borba</p>
          <div className="mt-4 w-24 h-px bg-gradient-to-r from-transparent via-[#D4A820] to-transparent" />
          <p className="text-[#6a6058] text-sm mt-4">Painel de Gestão Operacional</p>
        </div>

        {error && (
          <div className="mb-4 bg-[#FF3B3B]/10 border border-[#FF3B3B]/30 rounded-lg px-3 py-2 text-[#FF3B3B] text-sm text-center">
            Usuário ou senha incorretos
          </div>
        )}

        <form
          action={async (formData: FormData) => {
            "use server"
            try {
              await signIn("credentials", {
                username: formData.get("username"),
                password: formData.get("password"),
                redirectTo: "/dashboard",
              })
            } catch (err) {
              if (err instanceof AuthError) {
                redirect("/?error=1")
              }
              throw err
            }
          }}
          className="space-y-3"
        >
          <div>
            <label className="block text-[#6a6058] text-xs mb-1.5 uppercase tracking-wide">Usuário</label>
            <input
              name="username"
              type="text"
              required
              autoComplete="username"
              className="w-full bg-[#0a0a0a] border border-[#272727] rounded-lg px-3 py-2.5 text-sm text-[#f0ede4] placeholder-[#3a3028] focus:outline-none focus:border-[#D4A820]/60"
              placeholder="Digite seu usuário"
            />
          </div>

          <div>
            <label className="block text-[#6a6058] text-xs mb-1.5 uppercase tracking-wide">Senha</label>
            <input
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="w-full bg-[#0a0a0a] border border-[#272727] rounded-lg px-3 py-2.5 text-sm text-[#f0ede4] placeholder-[#3a3028] focus:outline-none focus:border-[#D4A820]/60"
              placeholder="Digite sua senha"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#D4A820] hover:bg-[#E8C547] text-black font-semibold py-2.5 px-6 rounded-lg transition-colors cursor-pointer mt-2"
          >
            Entrar
          </button>
        </form>

        <p className="text-center text-[#3a3028] text-xs mt-5">
          Acesso restrito a usuários autorizados
        </p>
      </div>
    </main>
  )
}
