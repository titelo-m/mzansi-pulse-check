import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, XCircle, AlertTriangle, Brain, Eye, Users } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/learn")({
  head: () => ({
    meta: [
      { title: "Learn the Signs — MzansiPulse" },
      {
        name: "description",
        content:
          "Plain-language guides on the early warning signs of substance abuse, myth-vs-fact cards, and tips for South African families and educators.",
      },
    ],
  }),
  component: Learn,
});

// Sign groups and myths are built from translations so the whole page can switch language

function Learn() {
  const { t } = useI18n();
  const SIGN_GROUPS = [
    {
      icon: Eye,
      title: t("learn.physical"),
      items: Array.from({ length: 5 }, (_, i) => t(`learn.signs.physical.${i + 1}`)),
    },
    {
      icon: Brain,
      title: t("learn.behavioural"),
      items: Array.from({ length: 5 }, (_, i) => t(`learn.signs.behavioural.${i + 1}`)),
    },
    {
      icon: Users,
      title: t("learn.emotional"),
      items: Array.from({ length: 5 }, (_, i) => t(`learn.signs.emotional.${i + 1}`)),
    },
  ];

  const MYTHS = Array.from({ length: 4 }, (_, i) => ({
    myth: t(`learn.myths.${i + 1}.myth`),
    fact: t(`learn.myths.${i + 1}.fact`),
  }));
  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <header className="max-w-2xl">
        <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">{t("learn.title")}</h1>
        <p className="mt-2 text-muted-foreground">{t("learn.subtitle")}</p>
      </header>

      <section className="mt-10">
        <h2 className="text-xl font-semibold tracking-tight">{t("learn.whatToLookFor")}</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {SIGN_GROUPS.map((g) => {
            const Icon = g.icon;
            return (
              <div key={g.title} className="rounded-xl border border-border bg-surface p-5">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15 text-primary">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 font-semibold text-foreground">{g.title}</h3>
                <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                  {g.items.map((it) => (
                    <li key={it} className="flex gap-2">
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary" />
                      {it}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mt-14">
        <h2 className="text-xl font-semibold tracking-tight">{t("learn.mythVsFact")}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{t("learn.mythVsFactSub")}</p>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {MYTHS.map((m) => (
            <div key={m.myth} className="overflow-hidden rounded-xl border border-border bg-surface">
              <div className="flex items-start gap-3 border-b border-border bg-destructive/10 p-5">
                <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-destructive">
                    Myth
                  </div>
                  <p className="mt-1 text-foreground">{m.myth}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-5">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success" />
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-success">
                    Fact
                  </div>
                  <p className="mt-1 text-foreground">{m.fact}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-14 rounded-2xl border border-border bg-gradient-to-br from-surface to-surface-elevated p-6 md:p-8">
        <div className="flex items-start gap-4">
          <AlertTriangle className="mt-1 h-6 w-6 shrink-0 text-warning" />
          <div>
            <h2 className="text-xl font-semibold tracking-tight">{t("learn.cta")}</h2>
            <p className="mt-2 text-muted-foreground">{t("learn.ctaSub")}</p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                to="/pulse-check"
                className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
              >
                {t("learn.ctaButton")}
              </Link>
              <Link
                to="/find-help"
                className="inline-flex items-center gap-2 rounded-md border border-border bg-surface px-4 py-2.5 text-sm font-medium text-foreground hover:bg-surface-elevated"
              >
                {t("learn.ctaHelp")}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
