import { AnimatePresence, motion } from 'framer-motion'

export default function Modal({ open, onClose, title, subtitle='Fill in the details for your new job application.', children, footer }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="absolute inset-0 bg-black/40" onClick={onClose} />
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 10, opacity: 0 }}
            className="relative z-10 w-full max-w-xl rounded-2xl bg-white p-6 shadow-xl"
          >
            <div className="mb-4">
              <h2 className="text-2xl font-semibold">{title}</h2>
              {subtitle && <p className="text-neutral-500">{subtitle}</p>}
            </div>
            <div>{children}</div>
            <div className="mt-6 flex justify-end gap-3">{footer}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
