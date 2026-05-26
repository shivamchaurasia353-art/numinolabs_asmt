"use client";

import { useEffect, useState, useCallback } from "react";
import { loansApi, booksApi, membersApi, type Loan, type Book, type Member } from "@/lib/api";
import { Plus, Search, RotateCcw, X } from "lucide-react";

type FormData = {
  book: string;
  member: string;
  due_at: string;
  notes: string;
};

const empty: FormData = { book: "", member: "", due_at: "", notes: "" };

function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// Default due date = today + 14 days
function defaultDueDate() {
  const d = new Date();
  d.setDate(d.getDate() + 14);
  return d.toISOString().slice(0, 16); // yyyy-MM-ddTHH:mm
}

export default function LoansPage() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [count, setCount] = useState(0);
  const [search, setSearch] = useState("");
  const [filterActive, setFilterActive] = useState<"all" | "active" | "returned">("all");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormData>({ ...empty, due_at: defaultDueDate() });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [returnTarget, setReturnTarget] = useState<Loan | null>(null);

  // Dropdowns for create form
  const [books, setBooks] = useState<Book[]>([]);
  const [members, setMembers] = useState<Member[]>([]);

  const PAGE_SIZE = 10;

  const load = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (filterActive === "active") params.set("returned_at", "null");
    if (filterActive === "returned") params.set("returned_at__isnull", "false");
    params.set("page", String(page));
    loansApi
      .list(`?${params}`)
      .then((res) => {
        setLoans(res.results);
        setCount(res.count);
        setError(null);
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [search, filterActive, page]);

  useEffect(() => {
    load();
  }, [load]);

  function openCreate() {
    setForm({ ...empty, due_at: defaultDueDate() });
    setFormError(null);
    setShowForm(true);
    // Load books & members for selects
    booksApi.list("?page_size=200").then((r) => setBooks(r.results)).catch(() => {});
    membersApi.list("?page_size=200").then((r) => setMembers(r.results)).catch(() => {});
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setFormError(null);
    try {
      await loansApi.create({
        book: parseInt(form.book),
        member: parseInt(form.member),
        due_at: new Date(form.due_at).toISOString(),
        notes: form.notes,
      });
      setShowForm(false);
      load();
    } catch (e: unknown) {
      setFormError(e instanceof Error ? e.message : "An error occurred");
    } finally {
      setSaving(false);
    }
  }

  async function handleReturn() {
    if (!returnTarget) return;
    try {
      await loansApi.returnLoan(returnTarget.id);
      setReturnTarget(null);
      load();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Failed to process return");
    }
  }

  const totalPages = Math.ceil(count / PAGE_SIZE);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Loans</h1>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          <Plus size={16} /> New Loan
        </button>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search book, member…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 w-64"
          />
        </div>
        <div className="flex rounded-lg border border-gray-200 overflow-hidden text-sm">
          {(["all", "active", "returned"] as const).map((f) => (
            <button
              key={f}
              onClick={() => { setFilterActive(f); setPage(1); }}
              className={`px-4 py-2 capitalize ${
                filterActive === f
                  ? "bg-indigo-600 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="text-red-600 bg-red-50 border border-red-200 rounded-lg p-3 text-sm">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-gray-400 animate-pulse">Loading…</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
              <tr>
                <th className="px-4 py-3 text-left">Book</th>
                <th className="px-4 py-3 text-left">Member</th>
                <th className="px-4 py-3 text-left">Borrowed</th>
                <th className="px-4 py-3 text-left">Due</th>
                <th className="px-4 py-3 text-left">Returned</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loans.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400">
                    No loans found
                  </td>
                </tr>
              )}
              {loans.map((loan) => (
                <tr key={loan.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{loan.book_title}</td>
                  <td className="px-4 py-3 text-gray-600">{loan.member_name}</td>
                  <td className="px-4 py-3 text-gray-500">{formatDate(loan.borrowed_at)}</td>
                  <td className="px-4 py-3 text-gray-500">{formatDate(loan.due_at)}</td>
                  <td className="px-4 py-3 text-gray-500">
                    {loan.returned_at ? formatDate(loan.returned_at) : "—"}
                  </td>
                  <td className="px-4 py-3">
                    {loan.returned_at ? (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-medium">
                        Returned
                      </span>
                    ) : loan.is_overdue ? (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-medium">
                        Overdue
                      </span>
                    ) : (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium">
                        Active
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {!loan.returned_at && (
                      <button
                        onClick={() => setReturnTarget(loan)}
                        title="Mark as returned"
                        className="text-gray-400 hover:text-emerald-600"
                      >
                        <RotateCcw size={15} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center gap-2 justify-end text-sm">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-3 py-1.5 rounded-lg border disabled:opacity-40 hover:bg-gray-100"
          >
            ← Prev
          </button>
          <span className="text-gray-500">
            {page} / {totalPages}
          </span>
          <button
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-1.5 rounded-lg border disabled:opacity-40 hover:bg-gray-100"
          >
            Next →
          </button>
        </div>
      )}

      {/* New Loan modal */}
      {showForm && (
        <Modal title="New Loan" onClose={() => setShowForm(false)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            {formError && (
              <div className="text-red-600 bg-red-50 border border-red-200 rounded-lg p-3 text-sm">
                {formError}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Book</label>
              <select
                required
                value={form.book}
                onChange={(e) => setForm((f) => ({ ...f, book: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              >
                <option value="">— Select a book —</option>
                {books
                  .filter((b) => b.copies_available > 0)
                  .map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.title} ({b.copies_available} available)
                    </option>
                  ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Member</label>
              <select
                required
                value={form.member}
                onChange={(e) => setForm((f) => ({ ...f, member: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              >
                <option value="">— Select a member —</option>
                {members
                  .filter((m) => m.is_active)
                  .map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
              <input
                type="datetime-local"
                required
                value={form.due_at}
                onChange={(e) => setForm((f) => ({ ...f, due_at: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea
                rows={3}
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 text-sm rounded-lg border hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 text-sm rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                {saving ? "Saving…" : "Create Loan"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Return confirm */}
      {returnTarget && (
        <Modal title="Return Book" onClose={() => setReturnTarget(null)}>
          <p className="text-gray-600 mb-6">
            Mark <strong>{returnTarget.book_title}</strong> borrowed by{" "}
            <strong>{returnTarget.member_name}</strong> as returned?
          </p>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setReturnTarget(null)}
              className="px-4 py-2 text-sm rounded-lg border hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleReturn}
              className="px-4 py-2 text-sm rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
            >
              Confirm Return
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
