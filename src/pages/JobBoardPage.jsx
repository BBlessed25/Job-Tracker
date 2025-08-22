// src/pages/JobBoardPage.jsx
import React, { useEffect, useMemo, useState } from "react";

/**
 * Status constants
 */
const STATUSES = {
  WISHLIST: "Wishlist",
  APPLIED: "Applied",
  INTERVIEWING: "Interviewing",
  OFFER: "Offer",
  REJECTED: "Rejected",
};

/**
 * Color styles per column (Tailwind)
 */
const STATUS_STYLES = {
  [STATUSES.WISHLIST]: {
    ring: "ring-gray-300",
    hover: "ring-gray-400",
    header: "bg-gray-100 text-gray-700",
    accent: "bg-gray-200 text-gray-700",
  },
  [STATUSES.APPLIED]: {
    ring: "ring-blue-300",
    hover: "ring-blue-400",
    header: "bg-blue-100 text-blue-700",
    accent: "bg-blue-600 text-white",
  },
  [STATUSES.INTERVIEWING]: {
    ring: "ring-amber-300",
    hover: "ring-amber-400",
    header: "bg-amber-100 text-amber-700",
    accent: "bg-amber-500 text-white",
  },
  [STATUSES.OFFER]: {
    ring: "ring-green-300",
    hover: "ring-green-400",
    header: "bg-green-100 text-green-700",
    accent: "bg-green-600 text-white",
  },
  [STATUSES.REJECTED]: {
    ring: "ring-rose-300",
    hover: "ring-rose-400",
    header: "bg-rose-100 text-rose-700",
    accent: "bg-rose-500 text-white",
  },
};

/**
 * Seed data (used if nothing found in localStorage).
 * Replace this with your real jobs data or context hook if you have one.
 */
const seedJobs = [
  {
    id: "job-1",
    title: "React Developer",
    company: "StartupXYZ",
    salary: "$90,000 - $130,000",
    notes: "Early stage startup, equity options",
    updatedAt: "2025-08-22",
    status: STATUSES.WISHLIST,
  },
  {
    id: "job-2",
    title: "Frontend Developer",
    company: "Tech Corp",
    salary: "$80,000 - $120,000",
    notes: "Great team culture, remote-friendly",
    updatedAt: "2024-01-14",
    status: STATUSES.APPLIED,
  },
  {
    id: "job-3",
    title: "Full Stack Engineer",
    company: "Acme, Inc.",
    salary: "$110,000 - $150,000",
    notes: "Node + React stack",
    updatedAt: "2025-08-10",
    status: STATUSES.INTERVIEWING,
  },
];

const STORAGE_KEY = "jobtracker.board";

/**
 * Utilities
 */
const readStore = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const writeStore = (jobs) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(jobs));
  } catch {
    // ignore
  }
};

/**
 * Individual Job Card (draggable)
 */
function JobCard({ job, onEdit, onDelete }) {
  const onDragStart = (e) => {
    // Provide multiple types for broad browser support
    e.dataTransfer.setData("text/plain", job.id);
    e.dataTransfer.setData("application/x-job-id", job.id);
    e.dataTransfer.effectAllowed = "move";
  };

  const badgeClasses =
    "text-xs px-2 py-1 rounded-full " + (STATUS_STYLES[job.status]?.accent ?? "bg-gray-200 text-gray-700");

  return (
    <div
      draggable
      onDragStart={onDragStart}
      className="bg-white border border-gray-200 rounded-2xl shadow-sm p-4 mb-4 cursor-grab active:cursor-grabbing"
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="font-semibold text-gray-900">{job.title}</div>
          <div className="text-sm text-gray-600">{job.company}</div>
        </div>
        <div className="flex items-center gap-2 text-gray-500">
          {/* You can wire these up to real actions later */}
          <button
            title="Open"
            className="p-1 hover:text-gray-700"
            onClick={() => window.open("#", "_blank")}
          >
            ↗
          </button>
          <button title="Edit" className="p-1 hover:text-gray-700" onClick={() => onEdit?.(job)}>
            ✎
          </button>
          <button title="Delete" className="p-1 hover:text-rose-600" onClick={() => onDelete?.(job.id)}>
            🗑
          </button>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <span className={badgeClasses}>{job.status}</span>
        {job.salary && (
          <span className="text-xs bg-gray-100 text-gray-800 rounded-full px-2 py-1">{job.salary}</span>
        )}
      </div>

      {job.notes && <p className="mt-3 text-sm text-gray-700">{job.notes}</p>}

      {job.updatedAt && (
        <div className="mt-3 text-xs text-gray-500">Updated {job.updatedAt}</div>
      )}
    </div>
  );
}

/**
 * Column component (drop zone)
 */
function BoardColumn({ title, status, jobs, onDropJob }) {
  const [isOver, setIsOver] = useState(false);
  const styles = STATUS_STYLES[status];

  const onDragOver = (e) => {
    e.preventDefault(); // allow drop
    e.dataTransfer.dropEffect = "move";
    if (!isOver) setIsOver(true);
  };

  const onDragLeave = () => setIsOver(false);

  const onDrop = (e) => {
    e.preventDefault();
    setIsOver(false);

    const id =
      e.dataTransfer.getData("application/x-job-id") ||
      e.dataTransfer.getData("text/plain");

    if (id) onDropJob(id, status);
  };

  return (
    <section
      className={`rounded-3xl bg-white ring-1 ${styles.ring} transition-shadow`}
    >
      {/* Column header */}
      <header
        className={`flex items-center justify-between px-4 py-3 rounded-t-3xl ${styles.header}`}
      >
        <span className="uppercase tracking-wide text-xs font-semibold">{title}</span>
        <span className="text-xs bg-white/80 rounded-full px-2 py-0.5">
          {jobs.length}
        </span>
      </header>

      {/* Drop area */}
      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={`p-4 min-h-[160px] rounded-b-3xl border-2 border-dashed ${
          isOver ? styles.hover : "border-transparent"
        }`}
      >
        {jobs.length === 0 ? (
          <div className="h-[112px] grid place-items-center text-sm text-gray-400 select-none">
            <div className="text-center">
              <div>No jobs yet</div>
              <div className="mt-1">Drag a card here</div>
            </div>
          </div>
        ) : (
          jobs.map((job) => <JobCard key={job.id} job={job} />)
        )}
      </div>
    </section>
  );
}

/**
 * Page: Job Board with drag & drop
 */
export default function JobBoardPage() {
  const initialJobs = useMemo(() => readStore() ?? seedJobs, []);
  const [jobs, setJobs] = useState(initialJobs);

  useEffect(() => {
    writeStore(jobs);
  }, [jobs]);

  const moveJob = (jobId, toStatus) => {
    setJobs((prev) =>
      prev.map((j) => (j.id === jobId ? { ...j, status: toStatus } : j))
    );
  };

  const deleteJob = (jobId) => {
    setJobs((prev) => prev.filter((j) => j.id !== jobId));
  };

  const editJob = (job) => {
    // Example placeholder edit—replace with your modal or route
    const title = window.prompt("Edit job title:", job.title);
    if (title?.trim()) {
      setJobs((prev) => prev.map((j) => (j.id === job.id ? { ...j, title } : j)));
    }
  };

  const byStatus = (s) => jobs.filter((j) => j.status === s);

  return (
    <div className="px-4 md:px-6 lg:px-8 py-6">
      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Job Board</h1>
          <p className="text-sm text-gray-600">
            Track and manage your job applications
          </p>
        </div>
        <button
          className="rounded-xl px-4 py-2 bg-gray-900 text-white text-sm hover:bg-gray-800"
          onClick={() => {
            const id = "job-" + Math.random().toString(36).slice(2, 9);
            setJobs((prev) => [
              ...prev,
              {
                id,
                title: "New Role",
                company: "Company",
                salary: "",
                notes: "",
                updatedAt: new Date().toISOString().slice(0, 10),
                status: STATUSES.WISHLIST,
              },
            ]);
          }}
        >
          + Add Job
        </button>
      </div>

      {/* Two-cards-per-row layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Row 1 */}
        <BoardColumn
          title="WISHLIST"
          status={STATUSES.WISHLIST}
          jobs={byStatus(STATUSES.WISHLIST)}
          onDropJob={moveJob}
        />
        <BoardColumn
          title="APPLIED"
          status={STATUSES.APPLIED}
          jobs={byStatus(STATUSES.APPLIED)}
          onDropJob={moveJob}
        />

        {/* Row 2 */}
        <BoardColumn
          title="INTERVIEWING"
          status={STATUSES.INTERVIEWING}
          jobs={byStatus(STATUSES.INTERVIEWING)}
          onDropJob={moveJob}
        />
        <BoardColumn
          title="OFFER"
          status={STATUSES.OFFER}
          jobs={byStatus(STATUSES.OFFER)}
          onDropJob={moveJob}
        />

        {/* Row 3 (Rejected full width) */}
        <div className="lg:col-span-2">
          <BoardColumn
            title="REJECTED"
            status={STATUSES.REJECTED}
            jobs={byStatus(STATUSES.REJECTED)}
            onDropJob={moveJob}
          />
        </div>
      </div>

      {/* Optional: simple footer actions */}
      <div className="mt-8 text-xs text-gray-500">
        Tip: drag a card onto a column to change its status. Your board auto-saves.
      </div>
    </div>
  );
}