"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import type { DirectoryUser, UserStatus } from "@avgeek-oss/auth-client";
import { Input } from "../../../forms/input.js";
import { Label } from "../../../forms/label.js";
import { Pagination } from "../../../navigation/pagination.js";
import { ChoiceField, type ChoiceOption } from "../../choice-field.js";
import { QueryError, QueryLoading } from "../../feedback/query-state.js";
import {
  PeopleDirectory,
  type DirectoryPerson,
} from "../../team-settings/people-directory.js";
import {
  authErrorCode,
  errorMessage,
  useConnectedSession,
  useNavigate,
  type ConnectedBaseProps,
} from "./shared.js";

export type ConnectedPeopleDirectoryProps = ConnectedBaseProps & {
  /** The organisation's identity provider, such as "authentik". */
  providerName: string;
  formatDate: (value: string) => ReactNode;
  /** Where admins manage access in the provider, opened in a new tab. */
  manageUrl?: string;
  /** Row actions, such as opening someone's keys through `client.admin`. */
  actions?: (user: DirectoryUser) => ReactNode;
  /** People per page, 1 to 100. Default 50. */
  pageSize?: number;
};

type StatusFilter = UserStatus | "all";

const statusOptions: readonly ChoiceOption<StatusFilter>[] = [
  { id: "all", label: "Everyone" },
  { id: "active", label: "Active" },
  { id: "suspended", label: "Suspended" },
  { id: "deactivated", label: "Deactivated" },
  { id: "deleted", label: "Deleted" },
];

// Long enough to skip the requests for a word still being typed.
const SEARCH_DELAY_MS = 300;

type Query = { q: string; status: StatusFilter; page: number };

type PageState =
  | { status: "loading" }
  | {
      status: "ready";
      users: DirectoryUser[];
      nextCursor: string | null;
      refreshing: boolean;
    }
  | { status: "error"; message: string; forbidden: boolean };

type Person = DirectoryPerson & { user: DirectoryUser };

/** Keeps the rows on screen while the next ones load. */
function refreshing(previous: PageState): PageState {
  if (previous.status === "ready") return { ...previous, refreshing: true };
  return previous.status === "error" ? { status: "loading" } : previous;
}

function toPerson(user: DirectoryUser): Person {
  return {
    id: user.id,
    name: user.displayName,
    email: user.email,
    role: user.role,
    roleSource: user.roleSource,
    status: user.status,
    lastSignInAt: user.lastSignInAt,
    user,
  };
}

/**
 * Everyone the app knows, for admins: search by name or email, filter by
 * status and page through the directory. Read-only: roles and access are
 * managed in the provider, and workspace membership stays with the app.
 */
export function ConnectedPeopleDirectory({
  client,
  navigate: navigateProp,
  providerName,
  formatDate,
  manageUrl,
  actions,
  pageSize,
}: ConnectedPeopleDirectoryProps) {
  const navigate = useNavigate(navigateProp);
  const session = useConnectedSession(client, navigate);
  const searchId = useId();
  const [draft, setDraft] = useState("");
  const [query, setQuery] = useState<Query>({
    q: "",
    status: "all",
    page: 1,
  });
  const [page, setPage] = useState<PageState>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);
  // The cursor that loads each page: page n starts at cursors[n - 1].
  const cursors = useRef<(string | null)[]>([null]);

  const change = (next: Partial<Query>) => {
    // A new search or filter starts again from the first page.
    if (next.page === undefined) cursors.current = [null];
    setPage(refreshing);
    setQuery((previous) => ({ ...previous, page: 1, ...next }));
  };

  const search = draft.trim();
  useEffect(() => {
    if (search === query.q) return;
    const timer = setTimeout(() => {
      cursors.current = [null];
      setPage(refreshing);
      setQuery((previous) => ({ ...previous, q: search, page: 1 }));
    }, SEARCH_DELAY_MS);
    return () => clearTimeout(timer);
  }, [query.q, search]);

  useEffect(() => {
    let current = true;
    client.admin.users
      .list({
        q: query.q || null,
        status: query.status === "all" ? null : query.status,
        cursor: cursors.current[query.page - 1] ?? null,
        limit: pageSize,
      })
      .then(
        (result) => {
          if (!current) return;
          cursors.current[query.page] = result.nextCursor;
          setPage({
            status: "ready",
            users: result.users,
            nextCursor: result.nextCursor,
            refreshing: false,
          });
        },
        (error: unknown) => {
          if (!current) return;
          setPage({
            status: "error",
            message: errorMessage(error, "Could not load the directory."),
            forbidden: authErrorCode(error) === "forbidden",
          });
        },
      );
    return () => {
      current = false;
    };
  }, [attempt, client, pageSize, query]);

  if (session.state.status === "error")
    return (
      <QueryError
        message={session.state.message}
        onRetry={() => void session.reload()}
      />
    );
  if (page.status === "error" && page.forbidden)
    return <QueryError message="Only admins can see the people directory." />;
  if (session.state.status === "loading")
    return <QueryLoading>Loading people…</QueryLoading>;
  const currentUserId = session.state.session.user.id;
  const filtered = query.q !== "" || query.status !== "all";
  const isRefreshing = page.status === "ready" && page.refreshing;
  return (
    <div
      className="grid gap-4"
      aria-busy={page.status === "loading" || isRefreshing}
    >
      <div className="flex flex-wrap items-end gap-3">
        <div className="grid min-w-0 flex-1 basis-64 gap-1">
          <Label htmlFor={searchId}>Search</Label>
          <Input
            id={searchId}
            type="search"
            placeholder="Name or email"
            value={draft}
            maxLength={200}
            autoComplete="off"
            onChange={(event) => setDraft(event.target.value)}
          />
        </div>
        <ChoiceField
          className="w-full sm:w-48"
          label="Status"
          value={query.status}
          options={statusOptions}
          onChange={(status) => change({ status })}
        />
      </div>
      {page.status === "loading" ? (
        <QueryLoading>Loading people…</QueryLoading>
      ) : page.status === "error" ? (
        <QueryError
          message={page.message}
          onRetry={() => {
            setPage({ status: "loading" });
            setAttempt((count) => count + 1);
          }}
        />
      ) : (
        <>
          <PeopleDirectory
            items={page.users.map(toPerson)}
            providerName={providerName}
            formatDate={formatDate}
            currentUserId={currentUserId}
            manageUrl={manageUrl}
            actions={actions ? (person) => actions(person.user) : undefined}
            emptyDescription={
              filtered
                ? "Try a different search or change the status."
                : undefined
            }
          />
          {query.page > 1 || page.nextCursor !== null ? (
            <Pagination
              aria-label="People pages"
              page={query.page}
              totalPages={null}
              hasNextPage={page.nextCursor !== null && !isRefreshing}
              onPageChange={(next) => {
                if (!isRefreshing) change({ page: next });
              }}
            />
          ) : null}
        </>
      )}
    </div>
  );
}
