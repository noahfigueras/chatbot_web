export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-grid">
      <div className="absolute w-[600px] h-[600px] rounded-full bg-neon-cyan opacity-10 blur-[120px] pointer-events-none top-[-200px] right-[-100px] animate-float" />
      <div className="absolute w-[600px] h-[600px] rounded-full bg-neon-purple opacity-10 blur-[120px] pointer-events-none bottom-[-200px] left-[-100px] animate-float" style={{ animationDelay: "-3s" }} />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 sm:py-40">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="space-y-8 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-neon-cyan/10 border border-neon-cyan/20 text-neon-cyan text-sm font-medium">
              <span className="w-2 h-2 rounded-full bg-neon-cyan animate-pulse" />
              AI-Powered Chatbots
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight">
              Turn your business into an{" "}
              <span className="gradient-text">AI chatbot</span>
            </h1>

            <p className="text-lg sm:text-xl text-text-muted max-w-xl leading-relaxed">
              Train a custom AI chatbot with your files, links, and social media.
              Deploy anywhere — your website, WhatsApp, or Slack — with one click.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="/signup"
                className="group relative px-8 py-4 rounded-xl bg-gradient-to-r from-neon-cyan to-neon-purple text-white font-semibold text-lg overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-neon-cyan/25"
              >
                <span className="relative z-10">Create Your Chatbot</span>
                <div className="absolute inset-0 bg-gradient-to-r from-neon-purple to-neon-pink opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </a>
              <a
                href="#features"
                className="px-8 py-4 rounded-xl border border-border-cyan hover:border-neon-cyan/50 text-white font-semibold text-lg transition-all duration-300 text-center"
              >
                See How It Works
              </a>
            </div>

            {/*<div className="flex items-center gap-6 text-sm text-text-muted">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full bg-gradient-to-br from-neon-cyan/30 to-neon-purple/30 border border-neon-cyan/20 flex items-center justify-center text-xs font-medium text-neon-cyan"
                  >
                    {String.fromCharCode(64 + i)}
                  </div>
                ))}
              </div>
              <span>Trusted by <strong className="text-white">500+</strong> businesses</span>
            </div>*/}
          </div>

          <div className="hidden lg:flex justify-center animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            <div className="relative w-full max-w-md">
              <div className="absolute inset-0 bg-gradient-to-br from-neon-cyan/20 to-neon-purple/20 rounded-2xl blur-3xl" />
              <div className="relative glass-card rounded-2xl p-6 space-y-4">
                <div className="flex items-center gap-3 pb-4 border-b border-border-cyan">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-neon-cyan to-neon-purple flex items-center justify-center text-white font-bold text-sm">
                    CB
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">ChatBot Pro</p>
                    <p className="text-xs text-text-muted">Online</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-start">
                    <div className="bg-surface-2 rounded-2xl rounded-bl-sm px-4 py-3 max-w-[80%]">
                      <p className="text-sm text-text-primary">
                        Hi! How can I help you today?
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <div className="bg-neon-cyan/10 border border-neon-cyan/20 rounded-2xl rounded-br-sm px-4 py-3 max-w-[80%]">
                      <p className="text-sm text-text-primary">
                        What are your business hours?
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-start">
                    <div className="bg-surface-2 rounded-2xl rounded-bl-sm px-4 py-3 max-w-[80%]">
                      <p className="text-sm text-text-primary">
                        We&apos;re open Mon-Fri, 9 AM to 6 PM EST. We also have
                        24/7 support for Pro plans!
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <div className="bg-neon-cyan/10 border border-neon-cyan/20 rounded-2xl rounded-br-sm px-4 py-3 max-w-[80%]">
                      <p className="text-sm text-text-primary">
                        Can I book an appointment?
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-4 border-t border-border-cyan">
                  <div className="flex-1 px-4 py-2.5 rounded-lg bg-surface-2 border border-border-cyan text-sm text-text-muted">
                    Type your message...
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-neon-cyan flex items-center justify-center">
                    <svg className="w-5 h-5 text-background" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
