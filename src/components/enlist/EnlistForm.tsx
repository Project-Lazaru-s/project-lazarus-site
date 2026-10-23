"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useTransition } from "react";
import { enlist, type EnlistResult } from "@/app/servidor/actions";
import { ART } from "@/lib/enlist/art";
import { EXPERIENCE, type EnlistInput, type Field, PLAYTIMES, REGIONS, SIDES, validate } from "@/lib/enlist/enlist";
import { RadioDial } from "./RadioDial";

// Etapa 0 é o rádio; as outras são a ficha de papel.
const STEPS: { title: string; fields: Field[] }[] = [
  { title: "Sintonia", fields: ["side"] },
  { title: "Indicativo", fields: ["nick", "email", "whatsapp", "discord"] },
  { title: "Relatório de campo", fields: ["experience", "region", "playtime"] },
  { title: "Transmitir", fields: ["consent"] },
];

const empty: EnlistInput = {
  nick: "",
  email: "",
  whatsapp: "",
  discord: "",
  side: "",
  experience: "",
  region: "",
  playtime: "",
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

/** Selo da facção escolhida: emblema (ou a cena, para o lobo solitário) e a frequência. */
function SideBadge({ side }: { side: (typeof SIDES)[number] }) {
  const art = ART[side.id];
  return (
    <div className="flex items-center gap-3">
      <Image
        src={art.emblem ?? art.scene}
        alt=""
        width={56}
        height={56}
        className={`size-14 shrink-0 ${art.emblem ? "" : "rounded-full object-cover"}`}
      />
      <div>
        <p className="font-stencil text-xl" style={{ color: art.color }}>
          {side.name}
        </p>
        <p className="text-sm text-asphalt-deep/70">{side.line}</p>
      </div>
    </div>
  );
}

/** Alistamento: achar a facção no rádio e depois preencher a ficha no papel das fichas da lore. */
export function EnlistForm() {
  const [form, setForm] = useState(empty);
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<Errors>({});
  const [message, setMessage] = useState("");
  const [done, setDone] = useState<Extract<EnlistResult, { ok: true }> | null>(null);
  const [pending, startTransition] = useTransition();
  const side = SIDES.find((s) => s.id === form.side);

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
        setMessage("O rádio caiu no meio da transmissão. Tente de novo.");
      }
    });
  };

  if (done && side) {
    return (
      <div className="lore-paper relative rounded-sm p-6 text-asphalt-deep shadow-2xl sm:p-10" role="status">
        <p className={label}>Carta de convocação · Recruta nº {done.number || "—"}</p>
        <p className="mt-3 font-stencil text-4xl break-all">{form.nick.trim()}</p>
        <div className="mt-4">
          <SideBadge side={side} />
        </div>
        <p className="lore-stamp-hit absolute top-6 right-6 rotate-[-8deg] rounded-sm border-4 border-lazarus px-3 py-1 font-stencil text-2xl text-lazarus">
          {done.updated ? "ATUALIZADA" : "ALISTADO"}
        </p>
        <p className="mt-6">
          {done.updated
            ? "Sua ficha foi atualizada. Mesmo e-mail, mesma ficha."
            : `O nick ${form.nick.trim()} está reservado no servidor. Você recebe a convocação quando a fronteira abrir.`}
        </p>
        {done.code && (
          <Link
            href={`/servidor/ficha/${done.code}`}
            className="mt-6 inline-block rounded bg-lazarus px-5 py-3 font-semibold text-plate hover:bg-lazarus/85"
          >
            Ver e compartilhar a carta
          </Link>
        )}
      </div>
    );
  }

  const progress = (
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
  );

  if (step === 0 || !side) {
    return (
      <RadioDial
        onAnswer={(id) => {
          set("side", id);
          setStep(1);
        }}
      />
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
      {progress}
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-sm border border-asphalt-deep/20 p-3">
        <SideBadge side={side} />
        <button
          type="button"
          onClick={() => setStep(0)}
          className="font-mono text-xs tracking-widest text-rust uppercase underline"
        >
          Trocar frequência
        </button>
      </div>
      <h2 className="mt-6 font-stencil text-3xl">{STEPS[step].title}</h2>

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
        {step === 1 && (
          <>
            <div className="flex items-end gap-4">
              <div className="grow">
                {text("nick", "Nick do Minecraft (seu indicativo)", { autoComplete: "username", maxLength: 16 })}
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
            <p className="-mt-3 text-sm text-asphalt-deep/70">
              Quem se alista agora fica com o nick reservado no servidor.
            </p>
            {text("email", "E-mail para a convocação", { type: "email", autoComplete: "email" })}
            {text("whatsapp", "WhatsApp (opcional)", {
              type: "tel",
              autoComplete: "tel",
              placeholder: "(11) 98765-4321",
            })}
            {text("discord", "Discord (opcional)", { placeholder: "seu_usuario" })}
          </>
        )}

        {step === 2 && (
          <>
            {choice("experience", "Experiência em PvP", EXPERIENCE)}
            {choice("region", "Região", REGIONS)}
            {choice("playtime", "Quando costuma jogar", PLAYTIMES)}
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
        <button
          type="button"
          onClick={() => setStep(step - 1)}
          className="rounded border border-asphalt-deep/40 px-5 py-3 hover:bg-asphalt-deep/10"
        >
          Voltar
        </button>
        <button
          type="submit"
          disabled={pending}
          className="rounded bg-lazarus px-6 py-3 font-semibold text-plate hover:bg-lazarus/85 disabled:opacity-60"
        >
          {step < STEPS.length - 1 ? "Próximo" : pending ? "Transmitindo…" : "Transmitir e alistar"}
        </button>
      </div>
    </form>
  );
}
