import * as React from 'react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

interface WaterTankProps {
  currentWaterLevel?: number | null;
  minWaterLevel?: number | null;
  maxWaterLevel?: number | null;
  size?: 'sm' | 'lg';
  className?: string;
}

export function WaterTank({
  currentWaterLevel,
  minWaterLevel,
  maxWaterLevel,
  size = 'sm',
  className,
}: WaterTankProps) {
  const curr = Number(currentWaterLevel ?? 0);
  const hasMin = minWaterLevel !== undefined && minWaterLevel !== null;
  const hasMax = maxWaterLevel !== undefined && maxWaterLevel !== null;
  const minVal = hasMin ? Number(minWaterLevel) : 0;
  const maxVal = hasMax ? Number(maxWaterLevel) : 100;

  // Compute tank fill percentage (supports 0-100 percentage values directly, and scales if > 100)
  const fillPct =
    maxVal > 100
      ? Math.min(100, Math.max(0, (curr / maxVal) * 100))
      : Math.min(100, Math.max(0, curr));

  const roundedPct = Math.round(fillPct * 10) / 10;
  const isEmpty = curr <= 0;
  const isLow = !isEmpty && hasMin && (maxVal > 100 ? curr < minVal : fillPct < minVal);
  const isFull = (hasMax && maxVal > 0 && curr >= maxVal) || fillPct >= 100;

  const statusLabel = isEmpty
    ? 'Water tank is empty'
    : isLow
    ? 'Water tank level is low'
    : isFull
    ? 'Water tank is full'
    : 'Water tank level is normal';

  const tankDimensions = size === 'lg' ? 'w-24 h-36' : 'w-16 h-20';
  const labelHeight = size === 'lg' ? 'h-36' : 'h-20';

  const minLinePct =
    maxVal > 100
      ? Math.min(100, Math.max(0, (minVal / maxVal) * 100))
      : Math.min(100, Math.max(0, minVal));
  const maxLinePct =
    maxVal > 100 ? 100 : Math.min(100, Math.max(0, maxVal));

  return (
    <div className={cn('w-full flex items-center justify-between gap-3', className)}>
      {/* Left summary readout */}
      <div className="flex flex-col justify-center min-w-0">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Water Level
        </span>
        <div className="flex items-baseline gap-1.5 mt-0.5">
          <span
            className={cn(
              'font-mono font-bold tracking-tight',
              size === 'lg' ? 'text-2xl' : 'text-lg',
              isEmpty
                ? 'text-rose-500'
                : isLow
                ? 'text-amber-500'
                : isFull
                ? 'text-cyan-500'
                : 'text-sky-600 dark:text-sky-400'
            )}
          >
            {roundedPct}%
          </span>
        </div>
        <span
          className={cn(
            'text-[10px] font-medium mt-0.5',
            isEmpty
              ? 'text-rose-600 dark:text-rose-400'
              : isLow
              ? 'text-amber-600 dark:text-amber-400'
              : isFull
              ? 'text-emerald-600 dark:text-emerald-400'
              : 'text-muted-foreground'
          )}
        >
          {statusLabel}
        </span>
      </div>

      {/* Right-aligned animated water tank with Max at top and Min at bottom */}
      <div className="ml-auto flex items-stretch justify-end gap-2 shrink-0">
        {/* Top (Max%) & Bottom (Min%) labels aligned with top and bottom of tank */}
        <div className={cn('flex flex-col justify-between items-end py-0.5 text-right', labelHeight)}>
          <div className="flex flex-col items-end leading-none">
            <span className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold">
              Max
            </span>
            <span className="text-[11px] font-mono font-semibold text-sky-600 dark:text-sky-400">
              {maxVal}%
            </span>
          </div>
          <div className="flex flex-col items-end leading-none">
            <span className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold">
              Min
            </span>
            <span
              className={cn(
                'text-[11px] font-mono font-semibold',
                isLow ? 'text-amber-500' : 'text-muted-foreground'
              )}
            >
              {minVal}%
            </span>
          </div>
        </div>

        {/* Animated Water Tank */}
        <div
          className={cn(
            'relative overflow-hidden rounded-xl border-2 bg-slate-100/80 dark:bg-zinc-900/90 shadow-inner',
            isLow
              ? 'border-amber-400/70 dark:border-amber-500/50'
              : 'border-sky-400/50 dark:border-sky-500/40',
            tankDimensions
          )}
        >
          {/* Subtle glass gauge ticks on tank side */}
          <div className="absolute inset-y-2 left-1 z-20 flex flex-col justify-between pointer-events-none opacity-45">
            <div className="w-1.5 h-px bg-slate-500 dark:bg-zinc-400" />
            <div className="w-1 h-px bg-slate-500 dark:bg-zinc-400" />
            <div className="w-1.5 h-px bg-slate-500 dark:bg-zinc-400" />
            <div className="w-1 h-px bg-slate-500 dark:bg-zinc-400" />
            <div className="w-1.5 h-px bg-slate-500 dark:bg-zinc-400" />
          </div>

          {/* Max threshold marker line */}
          {hasMax && maxLinePct < 100 && maxLinePct > 0 && (
            <div
              className="absolute inset-x-0 z-20 border-t border-dashed border-sky-500/60 pointer-events-none"
              style={{ bottom: `${maxLinePct}%` }}
            />
          )}

          {/* Min threshold marker line */}
          {hasMin && minLinePct > 0 && minLinePct < 100 && (
            <div
              className="absolute inset-x-0 z-20 border-t border-dashed border-amber-500/70 pointer-events-none"
              style={{ bottom: `${minLinePct}%` }}
            />
          )}

          {/* Animated water column */}
          <motion.div
            initial={false}
            animate={{ height: `${fillPct}%` }}
            transition={{ duration: 0.85, ease: 'easeOut' }}
            className={cn(
              'absolute bottom-0 inset-x-0 z-10 overflow-visible',
              isLow
                ? 'bg-gradient-to-t from-amber-600 via-amber-500 to-orange-400'
                : 'bg-gradient-to-t from-sky-600 via-sky-500 to-cyan-400'
            )}
          >
            {/* Animated front & back liquid waves when water is present */}
            {fillPct > 0 && (
              <div className="absolute -top-2.5 left-0 w-full h-3 overflow-hidden pointer-events-none">
                <motion.svg
                  viewBox="0 0 200 20"
                  preserveAspectRatio="none"
                  className="w-[200%] h-full"
                  animate={{ x: ['0%', '-50%'] }}
                  transition={{ duration: 3.2, repeat: Infinity, ease: 'linear' }}
                >
                  <path
                    d="M0,10 C25,0 50,20 75,10 C100,0 125,20 150,10 C175,0 200,20 200,10 L200,20 L0,20 Z"
                    className={cn(
                      isLow ? 'fill-orange-400/90' : 'fill-cyan-400/95'
                    )}
                  />
                </motion.svg>
                <motion.svg
                  viewBox="0 0 200 20"
                  preserveAspectRatio="none"
                  className="w-[200%] h-full absolute top-0 left-0 opacity-50"
                  animate={{ x: ['-50%', '0%'] }}
                  transition={{ duration: 4.5, repeat: Infinity, ease: 'linear' }}
                >
                  <path
                    d="M0,12 C25,20 50,2 75,12 C100,20 125,2 150,12 C175,20 200,2 200,12 L200,20 L0,20 Z"
                    className={cn(
                      isLow ? 'fill-amber-300/70' : 'fill-sky-300/70'
                    )}
                  />
                </motion.svg>
              </div>
            )}

            {/* Soft rising bubbles inside the water */}
            {fillPct > 15 && (
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.span
                  className="absolute left-1/4 bottom-0 h-1.5 w-1.5 rounded-full bg-white/45"
                  animate={{ y: [0, size === 'lg' ? -90 : -45], opacity: [0, 0.7, 0] }}
                  transition={{ duration: 2.6, repeat: Infinity, ease: 'easeOut', delay: 0.2 }}
                />
                <motion.span
                  className="absolute left-2/3 bottom-0 h-1 w-1 rounded-full bg-white/50"
                  animate={{ y: [0, size === 'lg' ? -80 : -40], opacity: [0, 0.8, 0] }}
                  transition={{ duration: 2.1, repeat: Infinity, ease: 'easeOut', delay: 1.1 }}
                />
              </div>
            )}
          </motion.div>

          {/* Centered percentage badge inside tank */}
          <div className="relative z-20 h-full w-full flex items-center justify-center pointer-events-none">
            <span
              className={cn(
                'font-mono font-bold drop-shadow-sm px-1.5 py-0.5 rounded bg-black/20 backdrop-blur-[1px] text-white',
                size === 'lg' ? 'text-xs' : 'text-[10px]'
              )}
            >
              {Math.round(fillPct)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
