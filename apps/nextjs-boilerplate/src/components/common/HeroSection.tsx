function HeroSection() {
  return (
    <section className="flex flex-1 flex-col items-center justify-center px-4 py-16 text-center">
      <div className="fade-in slide-in-from-bottom-4 animate-in space-y-6 duration-500">
        <h1 className="h-20 bg-linear-to-r from-primary to-primary/60 bg-clip-text font-extrabold text-4xl text-transparent tracking-tight lg:text-6xl">
          Welcome to My Blog
        </h1>
        <p className="text-muted-foreground text-xl leading-relaxed">
          A simple Next.js 16 Boilerplate project exploring the new features and
          best practices.
        </p>
      </div>
    </section>
  )
}

export { HeroSection }
