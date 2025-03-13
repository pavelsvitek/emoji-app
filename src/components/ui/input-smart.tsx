import * as React from 'react';

import { useDebouncedCallback } from '@/lib/hooks';
import { cn } from '@/lib/utils';
import { CircleXIcon } from 'lucide-react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  delay?: number;
  clearable?: boolean;
}

const InputSmart = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, delay, type, clearable, ...props }, ref) => {
    const [localValue, setLocalValue] = React.useState(props.value);
    const [hovered, setHovered] = React.useState(false);

    React.useEffect(() => {
      setLocalValue(props.value);
    }, [props.value]);

    const onChange = useDebouncedCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      props.onChange?.(e);
    }, delay);

    return (
      <div className="relative" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
        <input
          type={type}
          className={cn(
            'border-input file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
            'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
            'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
            className,
          )}
          ref={ref}
          {...props}
          value={localValue}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setLocalValue(e.target.value);
            if (onChange) {
              onChange(e);
            }
          }}
        />
        {clearable && hovered && localValue && (
          <CircleXIcon
            onClick={(e) => {
              setLocalValue('');
              // @ts-expect-error because we know that e.target is an HTMLInputElement
              e.target.value = '';
              // @ts-expect-error because we know that e.target is an HTMLInputElement
              props.onChange?.(e);
            }}
            className="absolute right-2 top-3 size-4 cursor-pointer text-secondary-foreground"
          />
        )}
      </div>
    );
  },
);
InputSmart.displayName = 'InputSmart';

export { InputSmart };
