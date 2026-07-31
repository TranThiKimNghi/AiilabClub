import * as React from "react"
import { AnimatePresence, motion } from "framer-motion"
import { X } from "lucide-react"
import { cn } from "../../lib/utils"

const Dialog = ({ isOpen, onClose, children }) => {
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isOpen])

  return (
    <AnimatePresence>
      {isOpen && (
        // Trên điện thoại hộp thoại cao hơn màn hình -> cho cuộn, không cắt mất nút bên dưới
        <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center overflow-y-auto overscroll-contain p-4">
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/30 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className={cn(
              "relative z-10 my-auto w-full max-w-md max-h-[calc(100dvh-2rem)] overflow-y-auto overscroll-contain rounded-custom bg-white p-6 sm:p-8 shadow-2xl border border-slate-100/50"
            )}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute right-4 top-4 rounded-full p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors focus:outline-none"
            >
              <X className="h-5 w-5" />
            </button>
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

export { Dialog }
