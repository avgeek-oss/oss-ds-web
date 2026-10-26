# RecoveryCodesScreen

Shows newly generated one-use recovery codes with copy, download and continue actions.

The preview's brand mark is a stand-in: a 32px `accent` tile with an 8px radius beside the name "Avgeek". Apps pass their own `BrandLockup`.

## When to use

Immediately after codes are generated during sign-in or setup. Use `RecoveryCodes` inside settings modals instead.

## What the consumer provides

`brand`, the new `codes`, an `onContinue` action and an optional download filename. The app generates the codes.

## Key behavior

- Copy codes blocks repeat presses during a clipboard write and reports one toast per write.

## Do / Don't

- Never reconstruct old codes from stored hashes; show codes only when newly generated.
- Keep the title **Save your recovery codes** and its description.
