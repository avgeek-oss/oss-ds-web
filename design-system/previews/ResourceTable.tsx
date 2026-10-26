// @dsCard group="Data display" height=456
import * as A from "../namespace.js";
import { mount } from "./mount.js";
type ApiKey = { id: string; name: string; description: string; status: string };
const records: ApiKey[] = [
  {
    id: "ops-dashboard",
    name: "Ops dashboard",
    description: "Read-only access",
    status: "Active",
  },
  {
    id: "ci-deploy",
    name: "CI deploy",
    description: "Write access",
    status: "Expiring soon",
  },
];
const columns = [
  {
    key: "name",
    header: "Name",
    cell: (r: ApiKey) => (
      <A.ResourceName name={r.name} description={r.description} />
    ),
  },
  {
    key: "status",
    header: "Status",
    cell: (r: ApiKey) => (
      <A.Chip color={r.status === "Active" ? "success" : "warning"}>
        {r.status}
      </A.Chip>
    ),
  },
  {
    key: "actions",
    header: "Actions",
    headerClassName: "text-right",
    className: "text-right",
    cell: (r: ApiKey) => (
      <A.Button variant="secondary" size="sm" aria-label={`Revoke ${r.name}`}>
        Revoke
      </A.Button>
    ),
  },
];
mount(
  <div style={{ display: "grid", gap: 16, padding: 16 }}>
    <A.ResourceTable
      ariaLabel="API keys"
      columns={columns}
      items={records}
      getRowKey={(r: ApiKey) => r.id}
      getRowHref={(r: ApiKey) => `/api-keys/${r.id}`}
      emptyTitle="No API keys"
      emptyDescription="Create an API key for your scripts or apps."
      footer="2 keys"
    />
    <A.ResourceTable
      ariaLabel="New API keys"
      columns={columns.slice(0, 2)}
      items={[] as ApiKey[]}
      getRowKey={(r: ApiKey) => r.id}
      emptyTitle="No API keys"
      emptyDescription="Create an API key for your scripts or apps."
      emptyAction={<A.Button>Create API key</A.Button>}
    />
  </div>,
);
