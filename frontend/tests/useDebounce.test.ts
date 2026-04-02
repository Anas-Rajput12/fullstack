import { renderHook, act } from '@testing-library/react';
import { useDebounce, useDebounceCallback } from './useDebounce';

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should return initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('test', 300));
    expect(result.current).toBe('test');
  });

  it('should update value after delay', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 300 } }
    );

    rerender({ value: 'updated', delay: 300 });
    
    // Value should still be initial before delay
    expect(result.current).toBe('initial');

    // Fast-forward time
    act(() => {
      vi.advanceTimersByTime(300);
    });

    // Value should now be updated
    expect(result.current).toBe('updated');
  });

  it('should cancel previous timer when value changes quickly', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'first', delay: 300 } }
    );

    rerender({ value: 'second', delay: 300 });
    rerender({ value: 'third', delay: 300 });

    // Fast-forward time
    act(() => {
      vi.advanceTimersByTime(300);
    });

    // Should only update to the last value
    expect(result.current).toBe('third');
  });

  it('should use default delay of 300ms', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value),
      { initialProps: { value: 'initial' } }
    );

    rerender({ value: 'updated' });

    act(() => {
      vi.advanceTimersByTime(299);
    });
    expect(result.current).toBe('initial');

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(result.current).toBe('updated');
  });
});

describe('useDebounceCallback', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should debounce callback execution', () => {
    const mockCallback = vi.fn();
    const { result } = renderHook(() =>
      useDebounceCallback(mockCallback, 300)
    );

    result.current('test');

    // Should not be called immediately
    expect(mockCallback).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(300);
    });

    // Should be called after delay
    expect(mockCallback).toHaveBeenCalledTimes(1);
    expect(mockCallback).toHaveBeenCalledWith('test');
  });

  it('should cancel previous callback when called multiple times', () => {
    const mockCallback = vi.fn();
    const { result } = renderHook(() =>
      useDebounceCallback(mockCallback, 300)
    );

    result.current('first');
    result.current('second');
    result.current('third');

    act(() => {
      vi.advanceTimersByTime(300);
    });

    // Should only execute the last call
    expect(mockCallback).toHaveBeenCalledTimes(1);
    expect(mockCallback).toHaveBeenCalledWith('third');
  });
});
