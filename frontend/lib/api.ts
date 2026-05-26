const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...init?.headers },
    ...init,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || res.statusText);
  }
  // 204 No Content
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

// ── Types ──────────────────────────────────────────────────────────────────

export interface Book {
  id: number;
  title: string;
  author: string;
  isbn: string;
  publication_year: number | null;
  copies_total: number;
  copies_available: number;
  borrowed_count: number;
  status_label: string;
  created_at: string;
  updated_at: string;
}

export interface Member {
  id: number;
  name: string;
  email: string;
  phone: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Loan {
  id: number;
  book: number;
  book_title: string;
  member: number;
  member_name: string;
  borrowed_at: string;
  due_at: string;
  returned_at: string | null;
  notes: string;
  is_overdue: boolean;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface DashboardStats {
  book_count: number;
  member_count: number;
  active_loan_count: number;
  overdue_count: number;
  recent_loans: Loan[];
  recent_books: Book[];
  recent_members: Member[];
}

// ── Books ──────────────────────────────────────────────────────────────────

export const booksApi = {
  list: (params = "") =>
    request<PaginatedResponse<Book>>(`/books/${params}`),
  get: (id: number) => request<Book>(`/books/${id}/`),
  create: (data: Partial<Book>) =>
    request<Book>("/books/", { method: "POST", body: JSON.stringify(data) }),
  update: (id: number, data: Partial<Book>) =>
    request<Book>(`/books/${id}/`, { method: "PUT", body: JSON.stringify(data) }),
  remove: (id: number) => request<void>(`/books/${id}/`, { method: "DELETE" }),
};

// ── Members ────────────────────────────────────────────────────────────────

export const membersApi = {
  list: (params = "") =>
    request<PaginatedResponse<Member>>(`/members/${params}`),
  get: (id: number) => request<Member>(`/members/${id}/`),
  create: (data: Partial<Member>) =>
    request<Member>("/members/", { method: "POST", body: JSON.stringify(data) }),
  update: (id: number, data: Partial<Member>) =>
    request<Member>(`/members/${id}/`, { method: "PUT", body: JSON.stringify(data) }),
  remove: (id: number) => request<void>(`/members/${id}/`, { method: "DELETE" }),
};

// ── Loans ──────────────────────────────────────────────────────────────────

export const loansApi = {
  list: (params = "") =>
    request<PaginatedResponse<Loan>>(`/loans/${params}`),
  create: (data: Partial<Loan>) =>
    request<Loan>("/loans/", { method: "POST", body: JSON.stringify(data) }),
  returnLoan: (id: number) =>
    request<Loan>(`/loans/${id}/return_loan/`, { method: "POST" }),
};

// ── Dashboard ──────────────────────────────────────────────────────────────

export const dashboardApi = {
  stats: () => request<DashboardStats>("/dashboard/"),
};
