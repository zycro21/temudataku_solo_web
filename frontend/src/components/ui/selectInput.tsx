import { Select, SelectContent, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import * as React from "react";

interface SelectInputProps extends React.ComponentProps<typeof Select> {
  children: React.ReactNode;
  className?: string;
  placeholder?: string;
}

function SelectInput({ children, className, placeholder = "Pilih opsi", ...props }: SelectInputProps) {
  return (
    <Select {...props}>
      <SelectTrigger
        className={cn(
          "flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none",
          "focus-visible:border-green-500 focus-visible:ring-green-500/50 focus-visible:ring-[1px]",
          "aria-invalid:ring-red-500/20 aria-invalid:border-red-500",
          "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        )}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>{children}</SelectContent>
    </Select>
  );
}

export { SelectInput };
