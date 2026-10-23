"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { enlist, type EnlistResult } from "@/app/servidor/actions";
import { EXPERIENCE, type EnlistInput, type Field, PLAYTIMES, REGIONS, SIDES, validate } from "@/lib/enlist/enlist";

const STEPS: { title: string; fields: Field[] }[] = [
  { title: "Identificação", fields: ["nick", "email", "whatsapp", "discord"] },
  { title: "Lado da guerra", fields: ["side"] },
  { title: "Perfil", fields: ["experience", "region", "playtime", "groupSize"] },
  { title: "Assinatura", fields: ["consent"] },
];

const SIDE_IMAGES: Partial<Record<string, string>> = {
  haven: "/images/factions/haven-skins.png",
  rovers: "/images/factions/rovers-skins.png",
  wardens: "/images/factions/wardens-skins.png",
};

const empty: EnlistInput = {
  nick: "",
  email: "",
  whatsapp: "",
  discord: "",
  side: "",
  experience: "",
  region: "",
  playtime: "",
  groupSize: "",
  consent: false,
  website: "",
};

type Errors = Partial<Record<Field, string>>;
const stepOf = (errors: Errors) => STEPS.findIndex((s) => s.fields.some((f) => errors[f]));

const input =
  "mt-1 w-full rounded-sm border border-asphalt-deep/30 bg-white/60 px-3 py-2 text-asphalt-deep outline-none focus:border-rust";
const label = "font-mono text-xs tracking-[0.2em] uppercase text-asphalt-deep/70";

function FieldError({ id, text }: { id: string; text?: string }) {
  return text ? (
    <p id={id} className="mt-1 text-sm font-semibold text-lazarus">
      {text}
    </p>
  ) : null;
}

/** Ficha de alistamento em 4 etapas, no papel das fichas da lore. */
export function EnlistForm() {
  const [form, setForm] = useState(empty);
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<Errors>({});
  const [message, setMessage] = useState("");
  const [done, setDone] = useState<Extract<EnlistResult, { ok: true }> | null>(null);
  const [pending, startTransition] = useTransition();

  const set = (field: keyof EnlistInput, value: string | boolean) => {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: undefined }));
  };

  const text = (field: Field, title: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <label className="block">
      <span className={label}>{title}</span>
      <input
        name={field}
        value={form[field] as string}
        onChange={(e) => set(field, e.target.value)}
        aria-invalid={!!errors[field]}
        aria-describedby={errors[field] ? `${field}-erro` : undefined}
        className={input}
        {...props}
      />
      <FieldError id={`${field}-erro`} text={errors[field]} />
    </label>
  );

  const choice = (field: Field, title: string, options: readonly { id: string; label: string }[]) => (
    <fieldset>
      <legend className={label}>{title}</legend>
      <div className="mt-2 flex flex-wrap gap-2">
        {options.map((o) => (
          <label
            key={o.id}
            className="cursor-pointer rounded-sm border border-asphalt-deep/30 px-3 py-2 text-sm text-asphalt-deep has-checked:border-rust has-checked:bg-rust has-checked:text-plate has-focus-visible:outline-2 has-focus-visible:outline-rust pointer-coarse:min-h-11"
          >
            <input
              type="radio"
              name={field}
              value={o.id}
              checked={form[field] === o.id}
              onChange={() => set(field, o.id)}
              className="sr-only"
            />
            {o.label}
          </label>
        ))}
      </div>
      <FieldError id={`${field}-erro`} text={errors[field]} />
    </fieldset>
  );

  const next = () => {
    const result = validate({ ...form, consent: true });
    const found: Errors = {};
    if (!result.ok) for (const f of STEPS[step].fields) if (result.errors[f]) found[f] = result.errors[f];
    setErrors(found);
    if (Object.keys(found).length === 0) setStep(step + 1);
  };

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (step < STEPS.length - 1) return next();
    const checked = validate(form);
    if (!checked.ok && !checked.bot) {
      setErrors(checked.errors);
      return setStep(stepOf(checked.errors));
    }
    setMessage("");
    startTransition(async () => {
      try {
        const result = await enlist(form);
        if (result.ok) return setDone(result);
        if (result.errors) {
          setErrors(result.errors);
          setStep(stepOf(result.errors));
        }
        setMessage(result.message ?? "");
      } catch {
        setMessage("O rádio caiu no meio do envio. Tente de novo.");
      }
    });
  };

  if (done) {
    const side = SIDES.find((s) => s.id === form.side)!;
    return (
      <div className="lore-paper relative rounded-sm p-6 text-asphalt-deep shadow-2xl sm:p-10" role="status">
        <p className={label}>Ficha nº {done.number || "—"}</p>
        <p className="mt-2 font-stencil text-4xl">{form.nick.trim()}</p>
        <p className="mt-1 text-asphalt-deep/80">Lado: {side.name}</p>
        <p className="lore-stamp-hit absolute top-6 right-6 rotate-[-8deg] rounded-sm border-4 border-lazarus px-3 py-1 font-stencil text-2xl text-lazarus">
          {done.updated ? "ATUALIZADA" : "ALISTADO"}
        </p>
        <p className="mt-6">
          {done.updated
            ? "Sua ficha foi atualizada. Mesmo e-mail, mesma ficha."
            : "Ficha guardada. Você recebe o aviso quando a fronteira abrir."}
        </p>
        {done.code && (
          <Link
            href={`/servidor/ficha/${done.code}`}
            className="mt-6 inline-block rounded bg-lazarus px-5 py-3 font-semibold text-plate hover:bg-lazarus/85"
          >
            Ver meu cartão de alistamento
          </Link>
        )}
      </div>
    );
  }

  const nickOk = /^[A-Za-z0-9_]{3,16}$/.test(form.nick.trim());

  return (
    <form
      onSubmit={submit}
      noValidate
      aria-label="Ficha de alistamento"
      className="lore-paper relative rounded-sm p-6 text-asphalt-deep shadow-2xl sm:p-10"
    >
      <ol className="flex flex-wrap gap-x-4 gap-y-1 font-mono text-xs tracking-[0.15em] uppercase">
        {STEPS.map((s, i) => (
          <li
            key={s.title}
            aria-current={i === step ? "step" : undefined}
            className={i === step ? "text-rust" : "text-asphalt-deep/45"}
          >
            {i + 1}. {s.title}
          </li>
        ))}
      </ol>
      <h2 className="mt-4 font-stencil text-3xl">{STEPS[step].title}</h2>

      {/* Só robôs veem e preenchem. */}
      <input
        name="website"
        value={form.website}
        onChange={(e) => set("website", e.target.value)}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden
        className="absolute -left-[9999px] h-px w-px"
      />

      <div className="mt-6 space-y-5">
        {step === 0 && (
          <>
            <div className="flex items-end gap-4">
              <div className="grow">
                {text("nick", "Nick do Minecraft", { autoComplete: "username", maxLength: 16 })}
              </div>
              {nickOk && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={`https://mc-heads.net/avatar/${form.nick.trim()}/48`}
                  alt={`Cabeça da skin de ${form.nick.trim()}`}
                  width={48}
                  height={48}
                  className="mb-1 rounded-sm [image-rendering:pixelated]"
                />
              )}
            </div>
            {text("email", "E-mail", { type: "email", autoComplete: "email" })}
            {text("whatsapp", "WhatsApp (opcional)", {
              type: "tel",
              autoComplete: "tel",
              placeholder: "(11) 98765-4321",
            })}
            {text("discord", "Discord (opcional)", { placeholder: "seu_usuario" })}
          </>
        )}

        {step === 1 && (
          <fieldset>
            <legend className="sr-only">Lado da guerra</legend>
            <div className="grid gap-3 sm:grid-cols-2">
              {SIDES.map((s) => (
                <label
                  key={s.id}
                  className="flex cursor-pointer flex-col rounded-sm border-2 border-asphalt-deep/20 bg-asphalt p-4 text-plate transition has-checked:border-lazarus has-checked:shadow-[0_0_0_3px_var(--color-lazarus)] has-focus-visible:outline-2 has-focus-visible:outline-sunset"
                >
                  <input
                    type="radio"
                    name="side"
                    value={s.id}
                    checked={form.side === s.id}
                    onChange={() => set("side", s.id)}
                    className="sr-only"
                  />
                  <span className="font-stencil text-2xl text-lazarus">{s.name}</span>
                  {SIDE_IMAGES[s.id] && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={SIDE_IMAGES[s.id]}
                      alt=""
                      className="mt-2 h-20 w-full object-contain [image-rendering:pixelated]"
                    />
                  )}
                  <span className="mt-2 text-sm text-plate/80">{s.line}</span>
                </label>
              ))}
            </div>
            <FieldError id="side-erro" text={errors.side} />
          </fieldset>
        )}

        {step === 2 && (
          <>
            {choice("experience", "Experiência em PvP", EXPERIENCE)}
            {choice("region", "Região", REGIONS)}
            {choice("playtime", "Quando costuma jogar", PLAYTIMES)}
            {form.side === "fundar" &&
              text("groupSize", "Quantas pessoas no seu grupo", {
                type: "number",
                min: 2,
                max: 50,
                inputMode: "numeric",
              })}
          </>
        )}

        {step === 3 && (
          <div>
            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                name="consent"
                checked={form.consent}
                onChange={(e) => set("consent", e.target.checked)}
                aria-invalid={!!errors.consent}
                className="mt-1 size-5 accent-rust"
              />
              <span>
                Autorizo o Project Lazarus a guardar esta ficha e a me avisar do servidor pelo e-mail
                {form.whatsapp.trim() ? " e pelo WhatsApp" : ""} informados. Posso pedir para apagar a qualquer momento.
              </span>
            </label>
            <FieldError id="consent-erro" text={errors.consent} />
          </div>
        )}
      </div>

      {message && (
        <p role="alert" className="mt-6 rounded-sm border-2 border-lazarus px-3 py-2 font-semibold text-lazarus">
          {message}
        </p>
      )}

      <div className="mt-8 flex flex-wrap justify-between gap-3">
        {step > 0 ? (
          <button
            type="button"
            onClick={() => setStep(step - 1)}
            className="rounded border border-asphalt-deep/40 px-5 py-3 hover:bg-asphalt-deep/10"
          >
            Voltar
          </button>
        ) : (
          <span />
        )}
        <button
          type="submit"
          disabled={pending}
          className="rounded bg-lazarus px-6 py-3 font-semibold text-plate hover:bg-lazarus/85 disabled:opacity-60"
        >
          {step < STEPS.length - 1 ? "Próximo" : pending ? "Carimbando…" : "Assinar e alistar"}
        </button>
      </div>
    </form>
  );
}
