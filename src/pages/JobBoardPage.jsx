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
 */
const seedJobs = [
  {
    id: "job-1",
    title: "React Developer",
    company: "StartupXYZ",
    link: "https://startupxyz.com/careers",
    salary: "$90,000 - $130,000",
    notes: "Early stage startup, equity options",
    updatedAt: "2025-08-22",
    status: STATUSES.WISHLIST,
  },
  {
    id: "job-2",
    title: "Frontend Developer",
    company: "Tech Corp",
    link: "https://techcorp.example/jobs/fe",
    salary: "$80,000 - $120,000",
    notes: "Great team culture, remote-friendly",
    updatedAt: "2024-01-14",
    status: STATUSES.APPLIED,
  },
  {
    id: "job-3",
    title: "Full Stack Engineer",
    company: "Acme, Inc.",
    link: "https://acme.example/careers/fse",
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
  } catch {}
};

/**
 * Edit Job Modal
 */
function EditJobModal({ job, onClose, onSave }) {
  const [title, setTitle] = useState(job.title || "");
  const [company, setCompany] = useState(job.company || "");
  const [link, setLink] = useState(job.link || "");
  const [salary, setSalary] = useState(job.salary || "");
  const [status, setStatus] = useState(job.status || STATUSES.WISHLIST);
  const [notes, setNotes] = useState(job.notes || "");

  useEffect(() => {
    // lock scroll while modal is open
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    const onEsc = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onEsc);
    return () => {
      document.body.style.overflow = overflow;
      window.removeEventListener("keydown", onEsc);
    };
  }, [onClose]);

  const submit = (e) => {
    e.preventDefault();
    onSave({
      ...job,
      title: title.trim(),
      company: company.trim(),
      link: link.trim(),
      salary: salary.trim(),
      status,
      notes,
      updatedAt: new Date().toISOString().slice(0, 10),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50">
      {/* overlay */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      {/* sheet */}
      <div className="absolute inset-0 grid place-items-center p-4">
        <div className="w-full max-w-2xl rounded-2xl bg-white shadow-xl">
          <div className="flex items-start justify-between px-6 pt-5">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Edit Job</h2>
              <p className="text-sm text-gray-500">
                Update the job details below.
              </p>
            </div>
            <button
              aria-label="Close"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-1"
            >
              ×
            </button>
          </div>

          <form onSubmit={submit} className="px-6 pb-6 pt-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Job Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="mt-1 w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm outline-none focus:border-gray-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Company *
              </label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                required
                className="mt-1 w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm outline-none focus:border-gray-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Job Link
              </label>
              <input
                type="url"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder="https://example.com/careers"
                className="mt-1 w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm outline-none focus:border-gray-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Salary
              </label>
              <input
                type="text"
                value={salary}
                onChange={(e) => setSalary(e.target.value)}
                placeholder="$90,000 - $130,000"
                className="mt-1 w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm outline-none focus:border-gray-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm outline-none focus:border-gray-400"
              >
                {Object.values(STATUSES).map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Notes
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm outline-none focus:border-gray-400"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-xl bg-gray-900 px-4 py-2 text-sm text-white hover:bg-gray-800"
              >
                Update Job
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

/**
 * Individual Job Card (draggable) with 2-click delete confirmation.
 * First click shows the red “Click again to delete” message (bottom-right),
 * second click confirms and deletes. The message auto-hides after 3s.
 */
function JobCard({ job, onEdit, onDelete }) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [timerId, setTimerId] = useState(null);

  const onDragStart = (e) => {
    e.dataTransfer.setData("text/plain", job.id);
    e.dataTransfer.setData("application/x-job-id", job.id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDeleteClick = () => {
    if (confirmDelete) {
      if (timerId) clearTimeout(timerId);
      onDelete?.(job.id);
      setConfirmDelete(false);
      setTimerId(null);
      return;
    }
    setConfirmDelete(true);
    const id = setTimeout(() => setConfirmDelete(false), 3000);
    setTimerId(id);
  };

  const badgeClasses =
    "text-xs px-2 py-1 rounded-full " +
    (STATUS_STYLES[job.status]?.accent ?? "bg-gray-200 text-gray-700");

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
          <button
            title="Open"
            className="p-1 hover:text-gray-700"
            onClick={() => job.link && window.open(job.link, "_blank")}
          >
            ↗
          </button>
          <button
            title="Edit"
            className="p-1 hover:text-gray-700"
            onClick={() => onEdit?.(job)}
          >
            ✎
          </button>
          <button
            title="Delete"
            className={`p-1 ${confirmDelete ? "text-rose-600" : "text-gray-500"} hover:text-rose-600`}
            onClick={handleDeleteClick}
          >
            🗑
          </button>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <span className={badgeClasses}>{job.status}</span>
        {job.salary && (
          <span className="text-xs bg-gray-100 text-gray-800 rounded-full px-2 py-1">
            {job.salary}
          </span>
        )}
      </div>

      {job.notes && <p className="mt-3 text-sm text-gray-700">{job.notes}</p>}

      {/* Bottom row with divider: left “Updated …” and right warning */}
      <div className="mt-4 border-t border-gray-200 pt-3 flex items-center justify-between">
        {job.updatedAt ? (
          <div className="text-xs text-gray-500">Updated {job.updatedAt}</div>
        ) : (
          <div />
        )}
        {confirmDelete && (
          <div className="text-xs font-medium text-rose-600 select-none text-right">
            Click again to delete
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Column component (drop zone)
 */
function BoardColumn({
  title,
  status,
  jobs,
  onDropJob,
  onDeleteJob,
  onEditJob,
}) {
  const [isOver, setIsOver] = useState(false);
  const styles = STATUS_STYLES[status];

  const onDragOver = (e) => {
    e.preventDefault();
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
    <section className={`rounded-3xl bg-white ring-1 ${styles.ring} transition-shadow`}>
      <header
        className={`flex items-center justify-between px-4 py-3 rounded-t-3xl ${styles.header}`}
      >
        <span className="uppercase tracking-wide text-xs font-semibold">
          {title}
        </span>
        <span className="text-xs bg-white/80 rounded-full px-2 py-0.5">
          {jobs.length}
        </span>
      </header>

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
          jobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              onEdit={onEditJob}
              onDelete={onDeleteJob}
            />
          ))
        )}
      </div>
    </section>
  );
}

/**
 * Page: Job Board with drag & drop + edit modal
 */
export default function JobBoardPage() {
  const initialJobs = useMemo(() => readStore() ?? seedJobs, []);
  const [jobs, setJobs] = useState(initialJobs);
  const [editingJob, setEditingJob] = useState(null);

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

  const openEdit = (job) => setEditingJob(job);
  const saveJob = (updated) => {
    setJobs((prev) => prev.map((j) => (j.id === updated.id ? updated : j)));
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
                link: "",
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
          onDeleteJob={deleteJob}
          onEditJob={openEdit}
        />
        <BoardColumn
          title="APPLIED"
          status={STATUSES.APPLIED}
          jobs={byStatus(STATUSES.APPLIED)}
          onDropJob={moveJob}
          onDeleteJob={deleteJob}
          onEditJob={openEdit}
        />

        {/* Row 2 */}
        <BoardColumn
          title="INTERVIEWING"
          status={STATUSES.INTERVIEWING}
          jobs={byStatus(STATUSES.INTERVIEWING)}
          onDropJob={moveJob}
          onDeleteJob={deleteJob}
          onEditJob={openEdit}
        />
        <BoardColumn
          title="OFFER"
          status={STATUSES.OFFER}
          jobs={byStatus(STATUSES.OFFER)}
          onDropJob={moveJob}
          onDeleteJob={deleteJob}
          onEditJob={openEdit}
        />

        {/* Row 3 (Rejected full width) */}
        <div className="lg:col-span-2">
          <BoardColumn
            title="REJECTED"
            status={STATUSES.REJECTED}
            jobs={byStatus(STATUSES.REJECTED)}
            onDropJob={moveJob}
            onDeleteJob={deleteJob}
            onEditJob={openEdit}
          />
        </div>
      </div>

      {/* Optional: simple footer actions */}
      <div className="mt-8 text-xs text-gray-500">
        Tip: drag a card onto a column to change its status. Your board auto-saves.
      </div>

      {editingJob && (
        <EditJobModal
          job={editingJob}
          onClose={() => setEditingJob(null)}
          onSave={saveJob}
        />
      )}
    </div>
  );
}