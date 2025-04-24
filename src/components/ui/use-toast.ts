
// Import directly from the toast component file
import { type ToastActionElement, type ToastProps } from "@/components/ui/toast"

// Re-export types that might be needed
export type { ToastProps, ToastActionElement }

// Export the hooks from our central location
export { useToast, toast } from "@/hooks/use-toast"
