# StepUpDialog

Explains why an action needs a fresh sign-in and sends the person back through the identity provider.

**Use for** an action that failed with `step_up_required`, such as creating an admin API key. The person signs in again with MFA and returns to finish.

**Provide** `isOpen`, `onOpenChange`, `providerName`, `reason`, `onContinue` (navigate to `stepUpUrl(currentPath)`), `isPending`.

**Don't** ask for a password or passkey; the provider confirms the person.
