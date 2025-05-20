
import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"
import { AlertCircle, CheckCircle, Info } from "lucide-react"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, variant, ...props }) {
        return (
          <Toast key={id} variant={variant} {...props} className="animate-in fade-in-50 slide-in-from-top-full data-[state=closed]:animate-out data-[state=closed]:fade-out-50 data-[state=closed]:slide-out-to-right-full data-[swipe=end]:animate-out data-[swipe=end]:fade-out">
            <div className="grid gap-1">
              <div className="flex items-center gap-2">
                {variant === "success" && <CheckCircle className="h-4 w-4" />}
                {variant === "warning" && <AlertCircle className="h-4 w-4" />}
                {variant === "info" && <Info className="h-4 w-4" />}
                {variant === "destructive" && <AlertCircle className="h-4 w-4" />}
                {title && <ToastTitle>{title}</ToastTitle>}
              </div>
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
