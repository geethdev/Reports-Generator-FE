export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-svh">
      <div className="flex w-full flex-col justify-center bg-white px-8 py-12 text-neutral-950 sm:px-16 lg:w-[43%]">
        <div className="mx-auto w-full max-w-sm">{children}</div>
      </div>
      <div className="relative hidden overflow-hidden bg-black lg:flex lg:w-[57%] lg:items-center lg:justify-center">
        <div className="relative z-10 max-w-md px-10 text-center text-white">
          <h1 className="text-4xl leading-tight font-bold text-balance sm:text-5xl">
            Weekly Report Generator
            <span className="block text-2xl font-medium text-white/80 sm:text-3xl">
              &amp; Team Dashboard
            </span>
          </h1>
          <p className="mt-6 text-lg text-white/80">
            Track submissions, reviews, and team progress in one place.
          </p>
        </div>
      </div>
    </div>
  )
}
