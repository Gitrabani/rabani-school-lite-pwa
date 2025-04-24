
// Direct import from Radix UI
import { useToast as useToastPrimitive, toast as toastPrimitive } from "@/components/ui/toast"

// Re-export with our own names
export const useToast = useToastPrimitive
export const toast = toastPrimitive
