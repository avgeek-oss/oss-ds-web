# TeamSetup

Two-step first-run onboarding: the team name, then date and time preferences.

**Use for** the first admin setting up the app. Their identity comes from the identity provider; gate the page on the admin role.

**Provide** `brand`, `preferenceOptions`, optional `initialPreferences` and `maxLength`, and one awaited `onSubmit({ team, ...preferences })`. Preview mark is a stand-in.

**Don't** collect names, emails, passwords or setup secrets.
