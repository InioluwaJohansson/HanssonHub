import * as React from 'react';
import { cn } from '@/lib/utils';

interface PullToRefreshProps {
  onRefresh: () => Promise<any> | void;
  pullingContent?: React.ReactNode;
  refreshingContent?: React.ReactNode;
  children: React.ReactNode;
  isPullable?: boolean;
  pullDownThreshold?: number;
  maxPullDownDistance?: number;
  resistance?: number;
  className?: string;
}

const isElementScrollableAtRest = (el: HTMLElement): boolean => {
  const style = getComputedStyle(el);
  const overflowY = style.overflowY;
  if (overflowY !== 'auto' && overflowY !== 'scroll' && overflowY !== 'overlay') {
    return false;
  }
  return el.scrollHeight > el.clientHeight + 1;
};

const isTargetAtScrollTop = (target: EventTarget | null, boundaryEl: HTMLElement | null): boolean => {
  if (window.scrollY > 2) return false;
  let cur: HTMLElement | null = target instanceof HTMLElement ? target : boundaryEl;
  while (cur && cur !== document.body && cur !== document.documentElement) {
    if (isElementScrollableAtRest(cur) && cur.scrollTop > 2) {
      return false;
    }
    cur = cur.parentElement;
  }
  if (document.scrollingElement && document.scrollingElement.scrollTop > 2) {
    return false;
  }
  return true;
};

const isInteractiveInputTarget = (target: EventTarget | null, allowButtons: boolean): boolean => {
  if (!(target instanceof Element)) return false;
  const selector = allowButtons
    ? 'input, textarea, select, option, [role="slider"], [contenteditable="true"], video, [data-no-ptr="true"]'
    : 'input, textarea, select, option, button, a, label, [role="slider"], [role="button"], [role="menuitem"], [contenteditable="true"], video, [data-no-ptr="true"]';
  return Boolean(target.closest(selector));
};

export function PullToRefresh({
  onRefresh,
  pullingContent,
  refreshingContent,
  children,
  isPullable = true,
  pullDownThreshold = 56,
  maxPullDownDistance = 96,
  resistance = 1.6,
  className,
}: PullToRefreshProps) {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const onRefreshRef = React.useRef(onRefresh);
  onRefreshRef.current = onRefresh;

  const isTrackingRef = React.useRef(false);
  const isPullingActiveRef = React.useRef(false);
  const isMouseDragRef = React.useRef(false);
  const startYRef = React.useRef(0);
  const startXRef = React.useRef(0);
  const pullDistanceRef = React.useRef(0);
  const isRefreshingRef = React.useRef(false);

  const [pullDistance, setPullDistance] = React.useState(0);
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [isActivelyDragging, setIsActivelyDragging] = React.useState(false);

  const resetGesture = React.useCallback(() => {
    isTrackingRef.current = false;
    isPullingActiveRef.current = false;
    isMouseDragRef.current = false;
    pullDistanceRef.current = 0;
    setIsActivelyDragging(false);
    if (!isRefreshingRef.current) {
      setPullDistance(0);
    }
  }, []);

  const triggerRefresh = React.useCallback(async () => {
    if (isRefreshingRef.current) return;
    isRefreshingRef.current = true;
    setIsRefreshing(true);
    setPullDistance(pullDownThreshold);
    const startMs = Date.now();
    try {
      await Promise.resolve(onRefreshRef.current?.());
    } catch (err) {
      console.error('PullToRefresh onRefresh error:', err);
    } finally {
      const elapsed = Date.now() - startMs;
      if (elapsed < 300) {
        await new Promise((r) => setTimeout(r, 300 - elapsed));
      }
      isRefreshingRef.current = false;
      pullDistanceRef.current = 0;
      setIsRefreshing(false);
      setPullDistance(0);
    }
  }, [pullDownThreshold]);

  React.useEffect(() => {
    const el = containerRef.current;
    if (!el || !isPullable) return;

    const handleMove = (clientX: number, clientY: number, cancelable: boolean, preventDefault: () => void) => {
      if (!isTrackingRef.current || isRefreshingRef.current) return;

      const deltaY = clientY - startYRef.current;
      const deltaX = clientX - startXRef.current;

      if (!isPullingActiveRef.current) {
        if (deltaY < -6 || Math.abs(deltaX) > Math.max(10, Math.abs(deltaY) * 1.15)) {
          resetGesture();
          return;
        }
        if (deltaY > 8 && Math.abs(deltaY) > Math.abs(deltaX) * 1.15) {
          isPullingActiveRef.current = true;
          setIsActivelyDragging(true);
        } else {
          return;
        }
      }

      if (deltaY <= 0) {
        pullDistanceRef.current = 0;
        setPullDistance(0);
        return;
      }

      if (cancelable) {
        preventDefault();
      }

      const damped = Math.min(maxPullDownDistance, Math.max(0, (deltaY - 8) / resistance));
      pullDistanceRef.current = damped;
      setPullDistance(damped);
    };

    const handleEnd = () => {
      if (!isTrackingRef.current) return;
      const reachedThreshold =
        isPullingActiveRef.current && pullDistanceRef.current >= pullDownThreshold;
      isTrackingRef.current = false;
      isPullingActiveRef.current = false;
      isMouseDragRef.current = false;
      setIsActivelyDragging(false);

      if (reachedThreshold) {
        void triggerRefresh();
      } else {
        pullDistanceRef.current = 0;
        setPullDistance(0);
      }
    };

    const onTouchStart = (e: TouchEvent) => {
      if (isRefreshingRef.current || e.touches.length !== 1) return;
      if (isInteractiveInputTarget(e.target, true)) return;
      if (!isTargetAtScrollTop(e.target, el)) return;
      isTrackingRef.current = true;
      isPullingActiveRef.current = false;
      isMouseDragRef.current = false;
      startYRef.current = e.touches[0].clientY;
      startXRef.current = e.touches[0].clientX;
      pullDistanceRef.current = 0;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!isTrackingRef.current || e.touches.length !== 1) return;
      handleMove(e.touches[0].clientX, e.touches[0].clientY, e.cancelable, () => e.preventDefault());
    };

    const onMouseDown = (e: MouseEvent) => {
      if (e.button !== 0 || isRefreshingRef.current) return;
      if (isInteractiveInputTarget(e.target, false)) return;
      if (!isTargetAtScrollTop(e.target, el)) return;
      isTrackingRef.current = true;
      isPullingActiveRef.current = false;
      isMouseDragRef.current = true;
      startYRef.current = e.clientY;
      startXRef.current = e.clientX;
      pullDistanceRef.current = 0;
    };

    const onWindowMouseMove = (e: MouseEvent) => {
      if (!isTrackingRef.current || !isMouseDragRef.current) return;
      if ((e.buttons & 1) === 0) {
        handleEnd();
        return;
      }
      handleMove(e.clientX, e.clientY, e.cancelable, () => e.preventDefault());
    };

    const onWindowMouseUp = () => {
      if (!isTrackingRef.current || !isMouseDragRef.current) return;
      handleEnd();
    };

    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchmove', onTouchMove, { passive: false });
    el.addEventListener('touchend', handleEnd);
    el.addEventListener('touchcancel', resetGesture);
    el.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onWindowMouseMove);
    window.addEventListener('mouseup', onWindowMouseUp);

    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
      el.removeEventListener('touchend', handleEnd);
      el.removeEventListener('touchcancel', resetGesture);
      el.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onWindowMouseMove);
      window.removeEventListener('mouseup', onWindowMouseUp);
    };
  }, [isPullable, maxPullDownDistance, pullDownThreshold, resistance, resetGesture, triggerRefresh]);

  const activeHeight = isRefreshing ? pullDownThreshold : pullDistance;
  const thresholdMet = isRefreshing || pullDistance >= pullDownThreshold;
  const progressOpacity = isRefreshing
    ? 1
    : Math.min(1, Math.max(0, pullDistance / Math.max(24, pullDownThreshold * 0.75)));

  return (
    <div
      ref={containerRef}
      className={cn('relative w-full', isActivelyDragging && 'select-none', className)}
    >
      <div
        aria-live="polite"
        style={{
          height: `${activeHeight}px`,
          opacity: progressOpacity,
          transition: isActivelyDragging ? 'none' : 'height 220ms cubic-bezier(0.22, 1, 0.36, 1), opacity 180ms ease',
        }}
        className="w-full overflow-hidden flex items-center justify-center pointer-events-none"
      >
        {thresholdMet ? refreshingContent : pullingContent}
      </div>
      {children}
    </div>
  );
}

export default PullToRefresh;
