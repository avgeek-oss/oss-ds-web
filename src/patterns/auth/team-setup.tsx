"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { AuthForm, type AuthField } from "./auth-form.js";
import { AuthScreen } from "./auth-screen.js";
import {
  browserDateTimePreferences,
  DateTimePreferenceFields,
  type DateTimePreferenceOptions,
  type DateTimePreferences,
} from "../settings/date-time-preference-fields.js";

type TeamDetails = { team: string };
/**
 * The team name and the first admin's display preferences. The admin's
 * identity comes from the identity provider.
 */
export type TeamSetupValues = TeamDetails & DateTimePreferences;

export function TeamSetup({
  brand,
  preferenceOptions,
  initialPreferences,
  maxLength = 120,
  onSubmit,
}: {
  brand: ReactNode;
  preferenceOptions: DateTimePreferenceOptions;
  initialPreferences?: DateTimePreferences;
  /** The team name limit; the common 120 by default. */
  maxLength?: number;
  onSubmit: (values: TeamSetupValues) => Promise<void>;
}) {
  const [step, setStep] = useState<1 | 2>(1);
  const [account, setAccount] = useState<TeamDetails>({ team: "" });
  const [preferences, setPreferences] = useState(
    () => initialPreferences ?? browserDateTimePreferences(preferenceOptions),
  );
  const [submitting, setSubmitting] = useState(false);
  const submissionPending = useRef(false);
  const headingRef = useRef<HTMLDivElement>(null);
  const previousStep = useRef(step);
  useEffect(() => {
    if (previousStep.current !== step) {
      headingRef.current?.focus();
      previousStep.current = step;
    }
  }, [step]);

  const fields: Array<AuthField & { name: keyof TeamDetails }> = [
    { name: "team", label: "Team name", required: true, maxLength },
  ];
  return (
    <AuthScreen
      brand={brand}
      headingRef={headingRef}
      brandEndContent={
        <ol
          className="flex shrink-0 items-center gap-2"
          aria-label="Setup progress"
        >
          {[1, 2].map((number) => (
            <li
              key={number}
              aria-current={step === number ? "step" : undefined}
            >
              <span
                aria-hidden="true"
                className={`block size-2 rounded-full ${step === number ? "bg-accent" : "bg-muted/30"}`}
              />
              <span className="sr-only">
                Step {number} of 2:{" "}
                {number === 1 ? "Team details" : "Preferences"}
              </span>
            </li>
          ))}
        </ol>
      }
      title={step === 1 ? "Set up your team" : "Set your preferences"}
      description={
        step === 1
          ? "Name your team. You'll be its first admin."
          : "Choose how dates and times appear."
      }
    >
      {step === 1 ? (
        <AuthForm
          key="account"
          fields={fields.map((field) => ({
            ...field,
            value: account[field.name],
            onChange: (event) =>
              setAccount((current) => ({
                ...current,
                [field.name]: event.target.value,
              })),
          }))}
          submitLabel="Continue"
          onSubmit={async () => setStep(2)}
        />
      ) : (
        <>
          <AuthForm
            key="preferences"
            fields={[]}
            submitLabel="Complete Setup"
            busyLabel="Completing setup…"
            onSubmit={async () => {
              if (submissionPending.current) return;
              submissionPending.current = true;
              setSubmitting(true);
              try {
                await onSubmit({ ...account, ...preferences });
              } finally {
                submissionPending.current = false;
                setSubmitting(false);
              }
            }}
          >
            <DateTimePreferenceFields
              options={preferenceOptions}
              preferences={preferences}
              onChange={setPreferences}
              disabled={submitting}
            />
          </AuthForm>
          <button
            type="button"
            disabled={submitting}
            className="w-fit text-sm text-muted underline decoration-dashed decoration-muted/50 underline-offset-4 hover:text-foreground focus-visible:outline-2 focus-visible:outline-focus disabled:opacity-50"
            onClick={() => setStep(1)}
          >
            ← Back
          </button>
        </>
      )}
    </AuthScreen>
  );
}
