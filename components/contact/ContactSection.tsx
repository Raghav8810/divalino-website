"use client";

import { useLayoutEffect, useRef, useState, useEffect, type FormEvent } from "react";
import Image from "next/image";
import { gsap, ScrollTrigger } from "@/lib/motion/gsap";
import { cn } from "@/lib/utils/cn";
import { EMAIL_REGEX, INDIA_MOBILE_REGEX, FULL_NAME_REGEX } from "@/lib/utils/regex";

/* ------------------------------------------------------------------ */
/* Indian States & Union Territories                                   */
/* ------------------------------------------------------------------ */
const INDIA_STATES = [
  // States
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya",
  "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim",
  "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand",
  "West Bengal",
  // Union Territories
  "Andaman & Nicobar Islands", "Chandigarh",
  "Dadra & Nagar Haveli and Daman & Diu", "Delhi", "Jammu & Kashmir",
  "Ladakh", "Lakshadweep", "Puducherry",
];

const SUMMARY_MAX = 500;

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */
type FormState = { name: string; email: string; mobile: string; state: string; summary: string };
type FormErrors = Partial<Record<keyof FormState, string>>;
type ToastState = { visible: boolean; type: "success" | "error"; message: string };

const INITIAL: FormState = { name: "", email: "", mobile: "", state: "", summary: "" };

/* ------------------------------------------------------------------ */
/* Validation                                                          */
/* ------------------------------------------------------------------ */
function validate(v: FormState): FormErrors {
  const e: FormErrors = {};
  if (!v.name.trim()) e.name = "Full name is required.";
  else if (!FULL_NAME_REGEX.test(v.name)) e.name = "Enter a valid name (letters only).";
  if (!v.email.trim()) e.email = "Email address is required.";
  else if (!EMAIL_REGEX.test(v.email)) e.email = "Enter a valid email address.";
  if (!v.mobile.trim()) e.mobile = "Mobile number is required.";
  else if (!INDIA_MOBILE_REGEX.test(v.mobile)) e.mobile = "Enter a valid 10-digit Indian mobile number.";
  if (!v.state) e.state = "Please select your state.";
  if (!v.summary.trim()) e.summary = "Please write a short summary.";
  return e;
}

/* ------------------------------------------------------------------ */
/* Toast Component                                                     */
/* ------------------------------------------------------------------ */
function Toast({ toast, onDismiss }: { toast: ToastState; onDismiss: () => void }) {
  useEffect(() => {
    if (!toast.visible) return;
    const t = setTimeout(onDismiss, 5000);
    return () => clearTimeout(t);
  }, [toast.visible, onDismiss]);

  return (
    <div
      aria-live="polite"
      style={{ pointerEvents: toast.visible ? "auto" : "none" }}
      className={cn(
        "fixed top-6 left-1/2 z-[9999] -translate-x-1/2",
        "transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
        toast.visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4",
      )}
    >
      <div
        className={cn(
          "flex items-center gap-3 rounded-full px-6 py-3 shadow-lg",
          "text-sm font-medium tracking-wide",
          toast.type === "success"
            ? "bg-[var(--color-foreground)] text-[var(--color-background)]"
            : "bg-red-700 text-white",
        )}
        style={{ fontFamily: "var(--font-satoshi)" }}
      >
        <span aria-hidden>
          {toast.type === "success" ? (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.4" />
              <path d="M4.5 8l2.5 2.5 4.5-4.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.4" />
              <path d="M8 5v3.5M8 11h.01" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
          )}
        </span>
        {toast.message}
        <button
          onClick={onDismiss}
          aria-label="Dismiss"
          className="ml-2 opacity-60 hover:opacity-100 transition-opacity"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* ContactSection                                                      */
/* ------------------------------------------------------------------ */
export function ContactSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [values, setValues] = useState<FormState>(INITIAL);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof FormState, boolean>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [toast, setToast] = useState<ToastState>({ visible: false, type: "success", message: "" });

  const showToast = (type: "success" | "error", message: string) =>
    setToast({ visible: true, type, message });
  const hideToast = () => setToast(t => ({ ...t, visible: false }));

  /* ---- On-scroll reveal (unchanged) ---- */
  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      const eyebrow = section.querySelector<HTMLElement>("[data-contact-eyebrow]");
      const heading = section.querySelector<HTMLElement>("[data-contact-heading]");
      const words = section.querySelectorAll<HTMLElement>("[data-contact-word]");
      const intro = section.querySelector<HTMLElement>("[data-contact-intro]");
      const meta = section.querySelectorAll<HTMLElement>("[data-contact-meta]");
      const fields = section.querySelectorAll<HTMLElement>("[data-contact-field]");
      const submit = section.querySelector<HTMLElement>("[data-contact-submit]");

      gsap.set(eyebrow, { y: 28, opacity: 0 });
      gsap.set(words, { yPercent: 130, opacity: 0, rotate: 4 });

      const headingTl = gsap.timeline({ paused: true, defaults: { ease: "expo.out" } })
        .to(eyebrow, { y: 0, opacity: 1, duration: 0.9 }, 0)
        .to(words, { yPercent: 0, opacity: 1, rotate: 0, duration: 1.4, stagger: 0.12 }, 0.15);

      const ht = ScrollTrigger.create({
        trigger: heading ?? section, start: "top 90%",
        onEnter: () => headingTl.play(),
        onLeaveBack: () => headingTl.progress(0).pause(),
      });
      if (ht.progress > 0) headingTl.play();

      gsap.set(intro, { y: 24, opacity: 0 });
      gsap.set(meta, { y: 20, opacity: 0 });
      gsap.set(fields, { y: 32, opacity: 0 });
      gsap.set(submit, { y: 24, opacity: 0 });

      const formTl = gsap.timeline({ paused: true, defaults: { ease: "expo.out" } })
        .to(intro, { y: 0, opacity: 1, duration: 1.0 }, 0)
        .to(meta, { y: 0, opacity: 1, duration: 0.9, stagger: 0.08 }, 0.1)
        .to(fields, { y: 0, opacity: 1, duration: 1.0, stagger: 0.08, ease: "power3.out" }, 0)
        .to(submit, { y: 0, opacity: 1, duration: 0.9 }, 0.5);

      const ft = ScrollTrigger.create({
        trigger: section.querySelector<HTMLElement>("[data-contact-field]") ?? section,
        start: "top 85%",
        onEnter: () => formTl.play(),
        onLeaveBack: () => formTl.progress(0).pause(),
      });
      if (ft.progress > 0) formTl.play();
    }, section);

    return () => ctx.revert();
  }, []);

  /* ---- Helpers ---- */
  const update = <K extends keyof FormState>(key: K, val: FormState[K]) => {
    setValues(prev => ({ ...prev, [key]: val }));
    // Live-validate only after field has been touched
    if (touched[key]) {
      const next = { ...values, [key]: val };
      const e = validate(next);
      setErrors(prev => ({ ...prev, [key]: e[key] }));
    }
  };

  const touch = (key: keyof FormState) => {
    setTouched(prev => ({ ...prev, [key]: true }));
    const e = validate(values);
    setErrors(prev => ({ ...prev, [key]: e[key] }));
  };

  /* ---- Submit ---- */
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submitting || submitted) return;

    // Mark all fields touched and validate
    const allTouched = Object.fromEntries(
      (Object.keys(INITIAL) as (keyof FormState)[]).map(k => [k, true])
    ) as Record<keyof FormState, boolean>;
    setTouched(allTouched);

    const errs = validate(values);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return; // stop — don't call API

    setSubmitting(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!res.ok) throw new Error("Server error");

      setSubmitting(false);
      setSubmitted(true);
      setValues(INITIAL);
      setErrors({});
      setTouched({});
      showToast("success", "Thank you! Your message has been sent to Divalino. We’ll connect you shortly");
    } catch {
      setSubmitting(false);
      showToast("error", "Something went wrong. Please try again.");
    }
  };

  return (
    <>
      <Toast toast={toast} onDismiss={hideToast} />

      <section
        ref={sectionRef}
        data-navbar-theme="light"
        className="relative bg-[var(--color-background)] pt-1 pb-16 md:pt-4 md:pb-20"
        style={{ fontFamily: "var(--font-satoshi)" }}
        aria-label="Contact the Divalino"
        id="contact"
      >
        <div className="mx-auto max-w-6xl px-6 md:px-10">
          {/* Heading */}
          <header className="mb-6 text-center md:mb-8">
            <p data-contact-eyebrow className="mb-5 text-[0.7rem] uppercase tracking-[0.32em] text-[var(--color-muted-foreground)] will-change-transform" style={{ fontWeight: 500 }}>
              04 / Get in touch
            </p>
            <h2 data-contact-heading className="leading-[0.95] text-[var(--color-foreground)]"
              style={{ fontFamily: "var(--font-humane)", fontWeight: 500, fontSize: "clamp(4rem, 12vw, 12rem)", letterSpacing: "0.005em" }}>
              {"CONTACT US".split(" ").map((word, idx) => (
                <span key={idx} className="inline-block overflow-hidden align-bottom" style={{ marginRight: "0.18em", paddingBottom: "0.06em" }}>
                  <span data-contact-word className="inline-block will-change-transform">{word}</span>
                </span>
              ))}
            </h2>
          </header>

          {/* 2-col grid */}
          <div className="grid grid-cols-1 gap-10 md:grid-cols-12 md:gap-10 lg:gap-16">

            {/* Form */}
            <form onSubmit={handleSubmit} className="md:col-span-8" noValidate>
              <div className="space-y-6 md:space-y-7">

                <SelectField
                  id="contact-state" label="Select state"
                  value={values.state} onChange={v => update("state", v)}
                  onBlur={() => touch("state")}
                  options={INDIA_STATES} error={errors.state}
                />

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-x-10">
                  <Field id="contact-name" label="Full name" type="text" autoComplete="name"
                    value={values.name} onChange={v => update("name", v)} onBlur={() => touch("name")}
                    error={errors.name} />
                  <Field id="contact-mobile" label="Mobile number" type="tel" autoComplete="tel"
                    value={values.mobile} onChange={v => update("mobile", v)} onBlur={() => touch("mobile")}
                    error={errors.mobile} />
                </div>

                <Field id="contact-email" label="Email address" type="email" autoComplete="email"
                  value={values.email} onChange={v => update("email", v)} onBlur={() => touch("email")}
                  error={errors.email} />

                <TextareaField id="contact-summary" label="Summary"
                  value={values.summary} onChange={v => update("summary", v.slice(0, SUMMARY_MAX))}
                  onBlur={() => touch("summary")}
                  max={SUMMARY_MAX} error={errors.summary} />
              </div>

              <p className="mt-6 max-w-md text-xs leading-relaxed text-[var(--color-muted-foreground)]" style={{ fontWeight: 400 }}>
                By clicking the button below you agree to our terms of use and have read and understood our privacy policy.
              </p>

              <div data-contact-submit className="mt-5 will-change-transform">
                <button
                  type="submit"
                  disabled={submitting || submitted}
                  className={cn(
                    "group relative inline-flex items-center gap-4 rounded-full pl-7 pr-3 py-3 md:pl-9 md:pr-4 md:py-3.5",
                    "bg-[var(--color-foreground)] text-[var(--color-background)]",
                    "transition-[background,transform] duration-300",
                    "hover:bg-[var(--color-brand-700)]",
                    "disabled:cursor-not-allowed disabled:opacity-60",
                  )}
                  style={{ fontWeight: 500 }}
                >
                  <span className="text-xs uppercase tracking-[0.28em] md:text-sm">
                    {submitting ? "Sending…" : submitted ? "Sent" : "Confirm"}
                  </span>
                  <span aria-hidden className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-background)]/15 transition-transform duration-300 group-hover:translate-x-1">
                    {submitted ? (
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-[var(--color-background)]">
                        <path d="M2 7l3.5 3.5L12 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    ) : (
                      <svg width="14" height="10" viewBox="0 0 14 10" fill="none" className="text-[var(--color-background)]">
                        <path d="M1 5H13M13 5L9 1M13 5L9 9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </span>
                </button>
              </div>
            </form>

            {/* Image stack */}
            <aside className="md:col-span-4 md:self-stretch" data-contact-meta style={{ willChange: "transform" }}>
              <div className="flex h-full flex-col gap-4">
                <div className="relative aspect-[16/9] flex-[1] overflow-hidden rounded-2xl md:aspect-auto md:rounded-3xl">
                  <Image
                    src="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=1400&q=80"
                    alt="Light-filled Divalino interior with garments and natural daylight."
                    fill sizes="(min-width: 768px) 33vw, 100vw" className="object-cover"
                  />
                </div>
                <div className="relative aspect-[4/3] flex-[2] overflow-hidden rounded-2xl md:aspect-auto md:rounded-3xl">
                  <Image
                    src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1400&q=80"
                    alt="A studio conversation between client and tailor at the Divalino."
                    fill sizes="(min-width: 768px) 33vw, 100vw" className="object-cover"
                  />
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}

/* ================================================================== */
/* Field Primitives                                                    */
/* ================================================================== */

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return (
    <p className="mt-1.5 text-[0.65rem] tracking-[0.1em] text-red-600" style={{ fontWeight: 500 }}>
      {msg}
    </p>
  );
}

function Field({ id, label, type, autoComplete, value, onChange, onBlur, error }: {
  id: string; label: string; type: string; autoComplete?: string;
  value: string; onChange: (v: string) => void; onBlur?: () => void; error?: string;
}) {
  return (
    <div data-contact-field className="relative will-change-transform">
      <div className="relative">
        <input
          id={id} name={id} type={type} autoComplete={autoComplete}
          value={value}
          onChange={e => onChange(e.target.value)}
          onBlur={onBlur}
          placeholder=" "
          className={cn(
            "peer block w-full bg-transparent px-0 pt-6 pb-2",
            "text-base text-[var(--color-foreground)] md:text-lg",
            "border-0 border-b outline-none focus:ring-0 transition-colors duration-300 placeholder:text-transparent",
            error ? "border-red-500" : "border-[var(--color-border)]",
          )}
          style={{ fontWeight: 500 }}
        />
        <label htmlFor={id}
          className={cn(
            "pointer-events-none absolute left-0 top-6 origin-left",
            "text-base md:text-lg transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
            error ? "text-red-500" : "text-[var(--color-muted-foreground)]",
            "peer-focus:top-0 peer-focus:scale-[0.7] peer-focus:tracking-[0.3em] peer-focus:uppercase peer-focus:text-[var(--color-brand-500)]",
            "peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:scale-[0.7] peer-[:not(:placeholder-shown)]:tracking-[0.3em] peer-[:not(:placeholder-shown)]:uppercase",
            !error && "peer-[:not(:placeholder-shown)]:text-[var(--color-muted-foreground)]",
          )}
          style={{ fontWeight: 500 }}
        >
          {label} <span aria-hidden>*</span>
        </label>
        <span aria-hidden className={cn(
          "pointer-events-none absolute bottom-0 left-0 h-px w-full origin-left scale-x-0 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] peer-focus:scale-x-100",
          error ? "bg-red-500" : "bg-[var(--color-foreground)]",
        )} />
      </div>
      <FieldError msg={error} />
    </div>
  );
}

function SelectField({ id, label, value, onChange, onBlur, options, error }: {
  id: string; label: string; value: string; onChange: (v: string) => void;
  onBlur?: () => void; options: string[]; error?: string;
}) {
  const filled = value !== "";
  return (
    <div data-contact-field className="relative will-change-transform">
      <div className="relative">
        <select
          id={id} name={id} value={value}
          onChange={e => onChange(e.target.value)}
          onBlur={onBlur}
          className={cn(
            "peer block w-full appearance-none bg-transparent px-0 pt-6 pb-2 pr-8",
            "text-base text-[var(--color-foreground)] md:text-lg",
            "border-0 border-b outline-none focus:ring-0 transition-colors duration-300",
            error ? "border-red-500" : "border-[var(--color-border)]",
            !filled && "text-transparent",
          )}
          style={{ fontWeight: 500 }}
        >
          <option value="" disabled hidden />
          {options.map(opt => (
            <option key={opt} value={opt} className="bg-[var(--color-background)] text-[var(--color-foreground)]">{opt}</option>
          ))}
        </select>
        <label htmlFor={id}
          className={cn(
            "pointer-events-none absolute left-0 origin-left",
            "text-base md:text-lg transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
            error ? "text-red-500" : "text-[var(--color-muted-foreground)]",
            filled || "peer-focus:top-0 peer-focus:scale-[0.7] peer-focus:tracking-[0.3em] peer-focus:uppercase peer-focus:text-[var(--color-brand-500)]",
            filled ? "top-0 scale-[0.7] uppercase tracking-[0.3em]" : "top-6",
          )}
          style={{ fontWeight: 500 }}
        >
          {label} <span aria-hidden>*</span>
        </label>
        <span aria-hidden className="pointer-events-none absolute bottom-3 right-1 text-[var(--color-muted-foreground)]">
          <svg width="14" height="8" viewBox="0 0 14 8" fill="none">
            <path d="M1 1L7 7L13 1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
        </span>
        <span aria-hidden className={cn(
          "pointer-events-none absolute bottom-0 left-0 h-px w-full origin-left scale-x-0 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] peer-focus:scale-x-100",
          error ? "bg-red-500" : "bg-[var(--color-foreground)]",
        )} />
      </div>
      <FieldError msg={error} />
    </div>
  );
}

function TextareaField({ id, label, value, onChange, onBlur, max, error, className }: {
  id: string; label: string; value: string; onChange: (v: string) => void;
  onBlur?: () => void; max: number; error?: string; className?: string;
}) {
  return (
    <div data-contact-field className={cn("relative will-change-transform", className)}>
      <div className="relative">
        <textarea
          id={id} name={id} rows={3}
          value={value}
          onChange={e => onChange(e.target.value)}
          onBlur={onBlur}
          placeholder=" "
          className={cn(
            "peer block w-full resize-none bg-transparent px-0 pt-6 pb-2",
            "text-base text-[var(--color-foreground)] md:text-lg",
            "border-0 border-b outline-none focus:ring-0 transition-colors duration-300 placeholder:text-transparent",
            error ? "border-red-500" : "border-[var(--color-border)]",
          )}
          style={{ fontWeight: 500, lineHeight: 1.55 }}
        />
        <label htmlFor={id}
          className={cn(
            "pointer-events-none absolute left-0 top-6 origin-left",
            "text-base md:text-lg transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
            error ? "text-red-500" : "text-[var(--color-muted-foreground)]",
            "peer-focus:top-0 peer-focus:scale-[0.7] peer-focus:tracking-[0.3em] peer-focus:uppercase peer-focus:text-[var(--color-brand-500)]",
            "peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:scale-[0.7] peer-[:not(:placeholder-shown)]:tracking-[0.3em] peer-[:not(:placeholder-shown)]:uppercase",
            !error && "peer-[:not(:placeholder-shown)]:text-[var(--color-muted-foreground)]",
          )}
          style={{ fontWeight: 500 }}
        >
          {label} <span aria-hidden>*</span>
        </label>
        <span aria-hidden className={cn(
          "pointer-events-none absolute bottom-0 left-0 h-px w-full origin-left scale-x-0 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] peer-focus:scale-x-100",
          error ? "bg-red-500" : "bg-[var(--color-foreground)]",
        )} />
      </div>
      <div className="flex items-start justify-between mt-1.5">
        <FieldError msg={error} />
        <p className="ml-auto text-right font-mono text-[0.65rem] tracking-[0.18em] text-[var(--color-muted-foreground)]" style={{ fontWeight: 500 }}>
          {value.length.toString().padStart(3, "0")} / {max}
        </p>
      </div>
    </div>
  );
}
