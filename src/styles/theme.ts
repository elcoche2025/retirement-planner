/**
 * Resolve a CSS custom property to its computed value.
 * Useful for Recharts props that require actual color strings.
 */
export function cssVar(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

/**
 * Return a snapshot of the current theme's chart-relevant colors.
 * Call inside a render (or useMemo) so it picks up light/dark changes.
 */
export function chartColors() {
  return {
    tickFill: cssVar('--color-text-tertiary'),
    axisStroke: cssVar('--color-bg-tertiary'),
    labelFill: cssVar('--color-text-secondary'),
    tooltipBg: cssVar('--color-bg-secondary'),
    tooltipBorder: cssVar('--color-bg-tertiary'),
    tooltipText: cssVar('--color-text-primary'),
    gridStroke: cssVar('--color-bg-tertiary'),
    refLineStroke: cssVar('--color-text-tertiary'),
    accentDc: cssVar('--color-accent-dc'),
  };
}
