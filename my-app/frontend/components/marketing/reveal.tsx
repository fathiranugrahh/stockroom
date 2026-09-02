import { cn } from "@/lib/utils";

export function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <div
      style={{ transitionDelay: `${delay}ms` }}
      className={cn(
        "marketing-reveal",
        className,
      )}
    >
      {children}
    </div>
  );
}
