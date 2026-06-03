export default function RightPanel() {
  return (
    <div className="max-lg:hidden relative overflow-hidden lg:sticky lg:top-0 lg:h-screen">
      <div className="absolute inset-0 bg-gradient-to-br from-[#0d1635] via-[#0a1628] to-[#060c1a]" />
      <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-blue-600/25 rounded-full blur-3xl" />
      <div className="absolute -bottom-32 -left-16 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-500/10 rounded-full blur-2xl" />
      <img
        src="/auth-illustration.svg"
        alt=""
        className="absolute inset-0 w-full h-full object-cover z-10 pl-16 opacity-95"
      />
      <div
        className="absolute inset-y-0 left-0 w-2/3 z-20"
        style={{
          background:
            "linear-gradient(to right, #0f1117 0%, #0f1117 8%, rgba(15,17,23,0.65) 28%, rgba(15,17,23,0.25) 50%, rgba(15,17,23,0.05) 70%, transparent 100%)",
        }}
      />
    </div>
  )
}
