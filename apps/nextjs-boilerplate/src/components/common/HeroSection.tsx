function HeroSection() {
  return (
    <section className="flex flex-1 flex-col items-center justify-center px-4 py-16 text-center">
      <div className="motion-safe:fade-in motion-safe:slide-in-from-bottom-4 space-y-6 motion-safe:animate-in motion-safe:duration-500">
        <h1 className="font-semibold text-4xl text-foreground tracking-tight lg:text-6xl">
          A full-stack boilerplate, proven end-to-end
        </h1>
        <p className="mx-auto max-w-2xl text-muted-foreground text-xl leading-relaxed">
          Next.js BFF, Elysia API, Cognito auth, and Neon Postgres — wired
          together and demonstrated below, ready to rename into your own
          product.
        </p>
      </div>
    </section>
  )
}

export { HeroSection }
