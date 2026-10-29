// Containers that take an AuthClient from @avgeek-oss/auth-client and do the
// data work for the auth patterns. The client is an optional peer used for
// types only, so apps that do not import this subpath do not need it.
export {
  ConnectedSignIn,
  type ConnectedSignInProps,
} from "./connected/sign-in.js";
export {
  ConnectedMcpConsent,
  type ConnectedMcpConsentProps,
  type ConnectedMcpConsentWorkspaces,
} from "./connected/mcp-consent.js";
export {
  ConnectedAccountSettings,
  type ConnectedAccountSettingsProps,
} from "./connected/account-settings.js";
export {
  ConnectedApiKeysSettings,
  type ConnectedApiKeysSettingsProps,
} from "./connected/api-keys-settings.js";
export {
  ConnectedMcpConnections,
  type ConnectedMcpConnectionsProps,
} from "./connected/mcp-connections.js";
export type { ConnectedAuthClient, Navigate } from "./connected/shared.js";
