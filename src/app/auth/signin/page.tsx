import { signIn } from "@/auth"

export default function SignInPage({
  searchParams,
}: {
  searchParams: { callbackUrl?: string }
}) {
  const callbackUrl = searchParams.callbackUrl ?? "/en/dashboard"

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-xl border bg-white p-6 space-y-4">
        <h1 className="text-2xl font-bold">Sign in</h1>

        <form
          action={async (formData: FormData) => {
            "use server"
            await signIn("credentials", {
              email: String(formData.get("email") ?? ""),
              password: String(formData.get("password") ?? ""),
              redirectTo: callbackUrl,
            })
          }}
          className="space-y-4"
        >
          <div className="space-y-2">
            <label className="text-sm font-medium">Email</label>
            <input name="email" type="email" required className="w-full rounded-md border px-3 py-2" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Password</label>
            <input name="password" type="password" required className="w-full rounded-md border px-3 py-2" />
          </div>

          <button className="w-full rounded-md bg-slate-900 text-white py-2 hover:bg-slate-800">
            Sign in
          </button>
        </form>
      </div>
    </div>
  )
}
