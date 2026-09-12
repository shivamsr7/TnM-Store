import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Clock3,
  Eye,
  Image as ImageIcon,
  MessageSquare,
  Search,
  X,
} from "lucide-react";

import PageHeader from "@/components/shared/PageHeader";
import LoadingSpinner from "@/shared/components/LoadingSpinner";
import { supabase } from "@/shared/lib/supabase";

type QueryStatus = "new" | "in_progress" | "resolved" | "closed";

interface CustomerQuery {
  id: string;
  customer_id: string | null;
  name: string;
  email: string;
  category: string;
  order_number: string | null;
  message: string;
  status: QueryStatus;
  admin_note: string | null;
  attachments: Array<{
    path?: string;
    publicUrl?: string;
    name?: string;
    type?: string;
    size?: number;
  }> | null;
  ticket_number: string | null;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
}

const STATUS_OPTIONS: Array<{
  value: QueryStatus;
  label: string;
}> = [
  { value: "new", label: "New" },
  { value: "in_progress", label: "In Progress" },
  { value: "resolved", label: "Resolved" },
  { value: "closed", label: "Closed" },
];

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function statusLabel(status: QueryStatus) {
  return STATUS_OPTIONS.find((item) => item.value === status)?.label ?? status;
}

function statusClasses(status: QueryStatus) {
  switch (status) {
    case "new":
      return "border-blue-200 bg-blue-50 text-blue-700";
    case "in_progress":
      return "border-amber-200 bg-amber-50 text-amber-700";
    case "resolved":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "closed":
      return "border-gray-200 bg-gray-100 text-gray-600";
  }
}

export default function CustomerQueriesPage() {
  const [queries, setQueries] = useState<CustomerQuery[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | QueryStatus>("all");
  const [selected, setSelected] = useState<CustomerQuery | null>(null);
  const [status, setStatus] = useState<QueryStatus>("new");
  const [adminNote, setAdminNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadQueries = async () => {
    setLoading(true);
    setError("");

    const { data, error: queryError } = await supabase
      .from("customer_queries")
      .select(
        "id, customer_id, name, email, category, order_number, message, status, admin_note, attachments, ticket_number, created_at, updated_at, resolved_at"
      )
      .order("created_at", { ascending: false });

    if (queryError) {
      console.error("Failed to load customer queries:", queryError);
      setError("Unable to load customer queries.");
      setQueries([]);
    } else {
      setQueries((data ?? []) as CustomerQuery[]);
    }

    setLoading(false);
  };

  useEffect(() => {
    void loadQueries();
  }, []);

  const filteredQueries = useMemo(() => {
    const value = search.trim().toLowerCase();

    return queries.filter((query) => {
      const matchesStatus =
        statusFilter === "all" || query.status === statusFilter;

      if (!matchesStatus) return false;
      if (!value) return true;

      return [
        query.ticket_number,
        query.name,
        query.email,
        query.category,
        query.order_number,
        query.message,
      ]
        .filter(Boolean)
        .some((field) => String(field).toLowerCase().includes(value));
    });
  }, [queries, search, statusFilter]);

  const counts = useMemo(() => {
    return {
      new: queries.filter((query) => query.status === "new").length,
      in_progress: queries.filter((query) => query.status === "in_progress").length,
      resolved: queries.filter((query) => query.status === "resolved").length,
      closed: queries.filter((query) => query.status === "closed").length,
    };
  }, [queries]);

  const openDetails = (query: CustomerQuery) => {
    setSelected(query);
    setStatus(query.status);
    setAdminNote(query.admin_note ?? "");
    setError("");
  };

  const closeDetails = () => {
    if (saving) return;
    setSelected(null);
    setError("");
  };

  const saveChanges = async () => {
    if (!selected || saving) return;

    setSaving(true);
    setError("");

    const isResolved = status === "resolved";
    const shouldSetResolvedAt =
      isResolved && selected.status !== "resolved";

    const updatePayload = {
      status,
      admin_note: adminNote.trim() || null,
      updated_at: new Date().toISOString(),
      ...(shouldSetResolvedAt
        ? { resolved_at: new Date().toISOString() }
        : {}),
    };

    const { data, error: updateError } = await supabase
      .from("customer_queries")
      .update(updatePayload)
      .eq("id", selected.id)
      .select(
        "id, customer_id, name, email, category, order_number, message, status, admin_note, attachments, ticket_number, created_at, updated_at, resolved_at"
      )
      .single();

    if (updateError) {
      console.error("Failed to update customer query:", updateError);
      setError(
        "Unable to save changes. Check your admin permissions/RLS policy."
      );
      setSaving(false);
      return;
    }

    const updated = data as CustomerQuery;

    setQueries((previous) =>
      previous.map((query) =>
        query.id === updated.id ? updated : query
      )
    );
    setSelected(updated);
    setStatus(updated.status);
    setAdminNote(updated.admin_note ?? "");
    setSaving(false);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Customer Queries"
        subtitle="Manage customer enquiries and support tickets"
      />

      {/* Status summary */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {STATUS_OPTIONS.map((item) => {
          const count = counts[item.value];

          return (
            <button
              key={item.value}
              type="button"
              onClick={() =>
                setStatusFilter((current) =>
                  current === item.value ? "all" : item.value
                )
              }
              className={`rounded-2xl border bg-white p-4 text-left transition hover:shadow-sm ${
                statusFilter === item.value
                  ? "border-black ring-1 ring-black"
                  : "border-gray-200"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-500">
                  {item.label}
                </span>
                {item.value === "new" ? (
                  <MessageSquare size={17} className="text-blue-600" />
                ) : item.value === "in_progress" ? (
                  <Clock3 size={17} className="text-amber-600" />
                ) : (
                  <CheckCircle2 size={17} className="text-emerald-600" />
                )}
              </div>

              <p className="mt-2 text-2xl font-semibold text-gray-900">
                {count}
              </p>
            </button>
          );
        })}
      </div>

      {/* Search / filter */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative max-w-md flex-1">
          <Search
            size={17}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search ticket, customer, email, order..."
            className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-10 pr-4 text-sm outline-none transition focus:border-black"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(event) =>
            setStatusFilter(event.target.value as "all" | QueryStatus)
          }
          className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-black"
        >
          <option value="all">All statuses</option>
          {STATUS_OPTIONS.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
      </div>

      {error && !selected && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Query list */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
        <div className="hidden grid-cols-[1.2fr_1.2fr_1fr_1fr_0.8fr_auto] gap-4 border-b bg-gray-50 px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-gray-500 lg:grid">
          <span>Ticket</span>
          <span>Customer</span>
          <span>Category</span>
          <span>Order</span>
          <span>Status</span>
          <span />
        </div>

        {filteredQueries.length === 0 ? (
          <div className="px-5 py-16 text-center">
            <MessageSquare className="mx-auto text-gray-300" size={30} />
            <p className="mt-3 text-sm font-medium text-gray-700">
              No customer queries found
            </p>
            <p className="mt-1 text-xs text-gray-400">
              Try changing your search or status filter.
            </p>
          </div>
        ) : (
          filteredQueries.map((query) => (
            <button
              key={query.id}
              type="button"
              onClick={() => openDetails(query)}
              className="grid w-full gap-3 border-b border-gray-100 px-5 py-4 text-left transition hover:bg-gray-50 lg:grid-cols-[1.2fr_1.2fr_1fr_1fr_0.8fr_auto] lg:items-center"
            >
              <div>
                <p className="font-mono text-sm font-semibold text-gray-900">
                  {query.ticket_number ?? "—"}
                </p>
                <p className="mt-1 text-[11px] text-gray-400">
                  {formatDate(query.created_at)}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-800">
                  {query.name}
                </p>
                <p className="mt-0.5 truncate text-xs text-gray-400">
                  {query.email}
                </p>
              </div>

              <p className="text-sm text-gray-600">{query.category}</p>

              <p className="text-sm text-gray-600">
                {query.order_number || "—"}
              </p>

              <span
                className={`inline-flex w-fit rounded-full border px-2.5 py-1 text-[11px] font-medium ${statusClasses(
                  query.status
                )}`}
              >
                {statusLabel(query.status)}
              </span>

              <span className="hidden justify-end lg:flex">
                <Eye size={17} className="text-gray-400" />
              </span>
            </button>
          ))
        )}
      </div>

      {/* Details modal */}
      {selected && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-0 backdrop-blur-sm sm:p-5"
          role="dialog"
          aria-modal="true"
          aria-labelledby="customer-query-title"
        >
          <div className="flex h-full w-full flex-col overflow-hidden bg-white sm:h-auto sm:max-h-[calc(100vh-2.5rem)] sm:max-w-2xl sm:rounded-2xl sm:shadow-2xl">
            <div className="flex shrink-0 items-center justify-between border-b px-5 py-4 sm:px-6">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                  Customer Query
                </p>
                <h2
                  id="customer-query-title"
                  className="mt-1 font-mono text-lg font-semibold text-gray-900"
                >
                  {selected.ticket_number ?? "Ticket"}
                </h2>
              </div>

              <button
                type="button"
                onClick={closeDetails}
                disabled={saving}
                className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 disabled:opacity-50"
                aria-label="Close"
              >
                <X size={19} />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-5 sm:p-6">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl bg-gray-50 p-4">
                  <p className="text-[10px] uppercase tracking-wider text-gray-400">
                    Customer
                  </p>
                  <p className="mt-1 text-sm font-medium text-gray-900">
                    {selected.name}
                  </p>
                  <p className="mt-1 break-all text-xs text-gray-500">
                    {selected.email}
                  </p>
                </div>

                <div className="rounded-xl bg-gray-50 p-4">
                  <p className="text-[10px] uppercase tracking-wider text-gray-400">
                    Query
                  </p>
                  <p className="mt-1 text-sm text-gray-800">
                    {selected.category}
                  </p>
                  {selected.order_number && (
                    <p className="mt-1 text-xs text-gray-500">
                      Order: {selected.order_number}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-4 rounded-xl border border-gray-200 p-4">
                <p className="text-[10px] uppercase tracking-wider text-gray-400">
                  Customer Message
                </p>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-gray-700">
                  {selected.message}
                </p>
              </div>

              {selected.attachments?.length ? (
                <div className="mt-4">
                  <div className="mb-2 flex items-center gap-2">
                    <ImageIcon size={15} className="text-gray-500" />
                    <p className="text-xs font-semibold text-gray-700">
                      Attachments ({selected.attachments.length})
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    {selected.attachments.map((attachment, index) => (
                      <a
                        key={`${attachment.path ?? attachment.publicUrl}-${index}`}
                        href={attachment.publicUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group aspect-square overflow-hidden rounded-xl border border-gray-200 bg-gray-50"
                      >
                        {attachment.publicUrl ? (
                          <img
                            src={attachment.publicUrl}
                            alt={attachment.name ?? `Attachment ${index + 1}`}
                            className="h-full w-full object-cover transition group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-xs text-gray-400">
                            Attachment
                          </div>
                        )}
                      </a>
                    ))}
                  </div>
                </div>
              ) : null}

              <div className="mt-5 border-t pt-5">
                <label className="block text-xs font-semibold text-gray-700">
                  Ticket Status
                </label>

                <select
                  value={status}
                  onChange={(event) =>
                    setStatus(event.target.value as QueryStatus)
                  }
                  className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-black"
                >
                  {STATUS_OPTIONS.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>

                <label className="mt-5 block text-xs font-semibold text-gray-700">
                  Support Response
                </label>

                <textarea
                  value={adminNote}
                  onChange={(event) => setAdminNote(event.target.value)}
                  rows={5}
                  placeholder="Write the response the customer will see..."
                  className="mt-2 w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-black"
                />

                {selected.resolved_at && (
                  <p className="mt-2 text-[11px] text-gray-400">
                    Resolved: {formatDate(selected.resolved_at)}
                  </p>
                )}

                {error && (
                  <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
                    {error}
                  </div>
                )}
              </div>
            </div>

            <div className="flex shrink-0 gap-3 border-t bg-white p-4 sm:px-6">
              <button
                type="button"
                onClick={closeDetails}
                disabled={saving}
                className="flex-1 rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={saveChanges}
                disabled={saving}
                className="flex-1 rounded-xl bg-black px-4 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
