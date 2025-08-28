import { useToast } from "@/components/ui/use-toast";
import {
  Toast,
  ToastProvider,
} from "@/components/ui/toast";

export function Toaster() {
  const { toasts } = useToast();

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast key={id} {...props}>
            <div className="grid gap-1">
              {title && <>{title}</>}
              {description && (
                <>{description}</>
              )}  
            </div>
            {action}
          </Toast>
        );
      })}
    </ToastProvider>
  );
} 
