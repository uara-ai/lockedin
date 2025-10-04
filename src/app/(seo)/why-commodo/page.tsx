import React from "react";
import SmallCTA from "@/components/landing/cta";
import WhyCommodo from "@/components/why-commodo";

export default function WhyCommodoPage() {
  return (
    <>
      <main className="overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 isolate hidden opacity-65 contain-strict lg:block"
        >
          <div className="w-140 h-320 -translate-y-87.5 absolute left-0 top-0 -rotate-45 rounded-full bg-[radial-gradient(68.54%_68.72%_at_55.02%_31.46%,hsla(0,0%,85%,.08)_0,hsla(0,0%,55%,.02)_50%,hsla(0,0%,45%,0)_80%)]" />
          <div className="h-320 absolute left-0 top-0 w-60 -rotate-45 rounded-full bg-[radial-gradient(50%_50%_at_50%_50%,hsla(0,0%,85%,.06)_0,hsla(0,0%,45%,.02)_80%,transparent_100%)] [translate:5%_-50%]" />
          <div className="h-320 -translate-y-87.5 absolute left-0 top-0 w-60 -rotate-45 bg-[radial-gradient(50%_50%_at_50%_50%,hsla(0,0%,85%,.04)_0,hsla(0,0%,45%,.02)_80%,transparent_100%)]" />
        </div>

        <section className="relative pt-24 md:pt-40">
          <div
            aria-hidden
            className="absolute inset-0 -z-10 size-full [background:radial-gradient(125%_125%_at_50%_100%,transparent_0%,var(--color-background)_75%)]"
          />

          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="text-center space-y-6 mb-16">
              <h1 className="text-5xl leading-tight">
                Why{" "}
                <span className="font-instrument-serif italic text-primary">
                  Commodo
                </span>
              </h1>
              <h2 className="text-lg text-muted-foreground max-w-2xl mx-auto">
                The story behind our brand name and how it shapes the future of
                professional accountability
              </h2>
            </div>
            <div className="mb-8">
              <WhyCommodo />
            </div>

            <div className="space-y-16">
              {/* Origin Section - Dictionary Style */}
              <div className="border-l-4 border-primary/20 pl-8">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-3xl font-bold text-primary mb-2">
                      com·mo·do
                    </h3>
                    <p className="text-sm text-muted-foreground italic">
                      /kəˈmōdō/
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="text-lg font-semibold mb-2">Etymology</h4>
                      <p className="text-muted-foreground">
                        From Latin <em>&quot;commodus&quot;</em>, meaning
                        &quot;convenient, suitable, beneficial.&quot;
                      </p>
                    </div>

                    <div>
                      <h4 className="text-lg font-semibold mb-2">Definition</h4>
                      <p className="text-lg leading-relaxed">
                        A mode of operation where professionals show proof of
                        work, creating a frictionless environment for
                        accountability, connection, and growth.
                      </p>
                    </div>

                    <div className="bg-muted/30 p-6 rounded-lg border">
                      <p className="font-medium text-foreground">
                        In English, &quot;commodo&quot; evokes comfort, balance,
                        and flow. In Italian and Spanish, it echoes
                        &quot;comodo&quot; (comfortable, easy).
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Conceptual Fit - Dictionary Style */}
              <div className="border-l-4 border-primary/20 pl-8">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-3xl font-bold text-primary mb-2">
                      con·cep·tu·al fit
                    </h3>
                    <p className="text-sm text-muted-foreground italic">
                      /kənˈsep(t)SH(o͞o)əl fit/
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="text-lg font-semibold mb-2">Formula</h4>
                      <p className="text-2xl font-mono text-primary">
                        Commodo = Commit + Mode
                      </p>
                    </div>

                    <div>
                      <h4 className="text-lg font-semibold mb-2">
                        Explanation
                      </h4>
                      <p className="text-muted-foreground leading-relaxed">
                        A sleek blend that supports our core mechanic
                        (commitment / lock-in mode) but extends beyond
                        accountability into a full professional ecosystem.
                      </p>
                    </div>

                    <div className="bg-primary/5 p-6 rounded-lg border border-primary/10">
                      <p className="font-medium text-primary text-lg">
                        &quot;The professional mode for the new internet.&quot;
                      </p>
                      <p className="text-sm text-muted-foreground mt-2">
                        It&apos;s not just about goals; it&apos;s about
                        operating in a new professional mode.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Category Applications - Dictionary Style */}
              <div className="border-l-4 border-primary/20 pl-8">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-3xl font-bold text-primary mb-2">
                      ap·pli·ca·tions
                    </h3>
                    <p className="text-sm text-muted-foreground italic">
                      /ˌapləˈkāSH(ə)nz/
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="text-lg font-semibold mb-4">
                        Usage Examples
                      </h4>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <div className="flex items-start gap-3">
                            <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                            <div>
                              <p className="font-medium">Accountability</p>
                              <p className="text-sm text-muted-foreground">
                                &quot;Switch on Commodo mode&quot; → lock-in
                                your goals publicly.
                              </p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                            <div>
                              <p className="font-medium">Startup Discovery</p>
                              <p className="text-sm text-muted-foreground">
                                &quot;Discover startups building in Commodo
                                mode.&quot;
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div className="flex items-start gap-3">
                            <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                            <div>
                              <p className="font-medium">
                                Professional Services
                              </p>
                              <p className="text-sm text-muted-foreground">
                                &quot;Hire through proof, not resumes.&quot;
                              </p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                            <div>
                              <p className="font-medium">Builder Community</p>
                              <p className="text-sm text-muted-foreground">
                                &quot;Where serious builders operate.&quot;
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-muted/30 p-6 rounded-lg border">
                      <p className="text-sm leading-relaxed">
                        <strong>Scalable Design:</strong> Modular and expandable
                        — we can start with accountability and later expand into
                        startup profiles, professional directories, service
                        listings, public job boards, and community feeds without
                        ever changing the brand.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Brand Characteristics - Dictionary Style */}
              <div className="border-l-4 border-primary/20 pl-8">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-3xl font-bold text-primary mb-2">
                      brand char·ac·ter·is·tics
                    </h3>
                    <p className="text-sm text-muted-foreground italic">
                      /brand ˌkerəktəˈristiks/
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="text-lg font-semibold mb-4">
                        Personality Traits
                      </h4>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                            <span className="font-medium">
                              Techy yet elegant
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                            <span className="font-medium">International</span>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                            <span className="font-medium">Modern</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                            <span className="font-medium">Neutral</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-muted/30 p-6 rounded-lg border">
                      <p className="text-sm leading-relaxed">
                        <strong>Brand Voice:</strong> It doesn&apos;t scream
                        &quot;accountability app&quot; — it whispers modern
                        infrastructure for professionals. Fits alongside Vercel,
                        Framer, and Linear.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Strategic Positioning - Dictionary Style */}
              <div className="border-l-4 border-primary/20 pl-8">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-3xl font-bold text-primary mb-2">
                      stra·te·gic po·si·tion·ing
                    </h3>
                    <p className="text-sm text-muted-foreground italic">
                      /strəˈtējik pəˈziSH(ə)niNG/
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-lg font-semibold text-primary mb-2">
                            Core Meaning
                          </h4>
                          <p className="text-muted-foreground">
                            A mode of operation where professionals show proof
                            of work.
                          </p>
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold text-primary mb-2">
                            Emotional Hook
                          </h4>
                          <p className="text-muted-foreground">
                            Calm confidence. You&apos;re &quot;in Commodo&quot;
                            — aligned, visible, accountable.
                          </p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-lg font-semibold text-primary mb-2">
                            Future Expansion
                          </h4>
                          <p className="text-muted-foreground">
                            Flexible to evolve into a network, marketplace, or
                            productivity layer.
                          </p>
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold text-primary mb-2">
                            Brandability
                          </h4>
                          <p className="text-muted-foreground">
                            Unique word, globally ownable, low competition.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* CTA Section */}
              <div className="text-center py-12">
                <h3 className="text-2xl font-semibold mb-4">
                  Ready to join the Commodo movement?
                </h3>
                <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                  Start building in public, prove your work, and connect with
                  other serious builders who are operating in Commodo mode.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <SmallCTA />
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
