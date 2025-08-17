import { motion } from 'framer-motion'

const variants = {
  primary: 'bg-neutral-900 text-white hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-neutral-300',
  secondary: 'border border-neutral-300 bg-white text-neutral-800 hover:bg-neutral-50',
  danger: 'bg-rose-600 text-white hover:bg-rose-700',
  ghost: 'text-neutral-800 hover:bg-neutral-100'
}

const sizes = {
  sm: 'px-3 py-1.5 text-sm rounded-xl',
  md: 'px-4 py-2 rounded-2xl',
  lg: 'px-5 py-3 text-base rounded-2xl'
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  className = '',
  ...props
}){
  const base = 'inline-flex items-center justify-center font-medium transition-colors disabled:opacity-60 disabled:pointer-events-none'

  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
      {...props}
    >
      {loading && <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />}
      {children}
    </motion.button>
  )
}