import { z } from "zod";

/** The three roles, lowest first, as auth-core and auth-client use them. */
export const teamRoleSchema = z.enum(["viewer", "member", "admin"]);

// Common identity and team names use 120; domain-specific forms may set a limit.
export const createNameSchema = (maxLength = 120) =>
  z.string().trim().min(1, "Enter a name").max(maxLength);
export const emailSchema = z.email().max(320);
export const createTeamSchema = (maxLength = 120) =>
  z.object({ name: createNameSchema(maxLength) }).strict();
