import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center p-8 sm:p-12",
        "bg-white dark:bg-[#1E1B18] rounded-2xl border border-[#EADBCE] dark:border-[#38332E]",
        className
      )}
    >
      <div className="w-14 h-14 rounded-2xl bg-[#FDF4F0] dark:bg-[#2C1F1B] flex items-center justify-center mb-3">
        <Icon className="w-7 h-7 text-[#C25E40]" />
      </div>
      <h3 className="text-base font-semibold text-[#2D2926] dark:text-[#FAF7F2]">
        {title}
      </h3>
      {description && (
        <p className="text-sm text-[#78716A] dark:text-[#A8A199] mt-1 max-w-sm">
          {description}
        </p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
