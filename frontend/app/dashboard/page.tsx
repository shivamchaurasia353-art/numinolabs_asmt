"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { dashboardApi, type DashboardStats } from "@/lib/api";
import { BookOpen, Users, ClipboardList, AlertTriangle } from "lucide-react";

function StatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center gap-4">
      <div className={`p-3 rounded-lg ${color}`}>
        <Icon size={22} className="text-white" />
      </div>
      <div>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-sm text-gray-500">{label}</p>
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

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    dashboardApi
      .stats()
      .then(setStats)
      .catch((e: Error) => setError(e.message));
  }, []);

  if (error)
    return (
      <div className="text-red-600 p-4 rounded-lg bg-red-50 border border-red-200">
        Failed to load dashboard: {error}
      </div>
    );

  if (!stats)
    return (
      <div className="flex items-center justify-center h-64 text-gray-400 animate-pulse">
        Loading…
      </div>
    );

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Books" value={stats.book_count} icon={BookOpen} color="bg-indigo-500" />
        <StatCard label="Members" value={stats.member_count} icon={Users} color="bg-emerald-500" />
        <StatCard label="Active Loans" value={stats.active_loan_count} icon={ClipboardList} color="bg-amber-500" />
        <StatCard label="Overdue" value={stats.overdue_count} icon={AlertTriangle} color="bg-red-500" />
      </div>

      {/* Recent active loans */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-700">Active Loans</h2>
          <Link href="/loans" className="text-sm text-indigo-600 hover:underline">
            View all →
          </Link>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
              <tr>
                <th className="px-4 py-3 text-left">Book</th>
                <th className="px-4 py-3 text-left">Member</th>
                <th className="px-4 py-3 text-left">Due</th>
                <th className="px-4 py-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {stats.recent_loans.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-gray-400">
                    No active loans
                  </td>
                </tr>
              )}
              {stats.recent_loans.map((loan) => (
                <tr key={loan.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{loan.book_title}</td>
                  <td className="px-4 py-3 text-gray-600">{loan.member_name}</td>
                  <td className="px-4 py-3 text-gray-600">{formatDate(loan.due_at)}</td>
                  <td className="px-4 py-3">
                    {loan.is_overdue ? (
                      <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-xs font-medium">
                        Overdue
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-xs font-medium">
                        Active
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent books */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-700">Recent Books</h2>
            <Link href="/books" className="text-sm text-indigo-600 hover:underline">
              View all →
            </Link>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 divide-y divide-gray-50">
            {stats.recent_books.length === 0 && (
              <p className="px-4 py-6 text-center text-gray-400 text-sm">No books yet</p>
            )}
            {stats.recent_books.map((book) => (
              <div key={book.id} className="px-4 py-3 flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">{book.title}</p>
                  <p className="text-xs text-gray-500">{book.author}</p>
                </div>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    book.copies_available === 0
                      ? "bg-red-100 text-red-700"
                      : book.copies_available < book.copies_total
                      ? "bg-amber-100 text-amber-700"
                      : "bg-green-100 text-green-700"
                  }`}
                >
                  {book.status_label}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Recent members */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-700">Recent Members</h2>
            <Link href="/members" className="text-sm text-indigo-600 hover:underline">
              View all →
            </Link>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 divide-y divide-gray-50">
            {stats.recent_members.length === 0 && (
              <p className="px-4 py-6 text-center text-gray-400 text-sm">No members yet</p>
            )}
            {stats.recent_members.map((m) => (
              <div key={m.id} className="px-4 py-3 flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">{m.name}</p>
                  <p className="text-xs text-gray-500">{m.email}</p>
                </div>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    m.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {m.is_active ? "Active" : "Inactive"}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
