import React from 'react'

/**
 * Minimal, dependency-free tooltip.
 * Usage:
 *   <Tooltip label="Dashboard"><button>Dashboard</button></Tooltip>
 *
 * The tooltip shows on hover and keyboard focus.
 */
export default function Tooltip({ label, children, side = 'top' }) {
  const pos = side === 'bottom'
    ? 'top-full mt-2 left-1/2 -translate-x-1/2'
    : side === 'left'
    ? 'right-full mr-2 top-1/2 -translate-y-1/2'
    : side === 'right'
    ? 'left-full ml-2 top-1/2 -translate-y-1/2'
    : 'bottom-full mb-2 left-1/2 -translate-x-1/2'; // top

  return (
    <span className="group relative inline-flex">
      {children}
      <span
        role="tooltip"
        className={
          'pointer-events-none absolute z-50 ' +
          pos +
          ' whitespace-nowrap rounded-lg border border-neutral-200 bg-white px-2.5 py-1 text-xs text-neutral-800 shadow-lg ring-1 ring-black/5 opacity-0 transition ' +
          'group-hover:opacity-100 group-focus-within:opacity-100'
        }
      >
        {label}
      </span>
    </span>
  );
}