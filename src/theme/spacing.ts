export const spacing = {
  /** 4pt — tight icon/text gaps */
  base: 4,
  xs: 4,
  /** 8pt — control padding, small gaps */
  sm: 8,
  /** 12pt — card internal / list item gaps */
  ms: 12,
  /** 16pt — screen horizontal gutter, card padding */
  md: 16,
  /** 24pt — section gaps */
  lg: 24,
  /** 32pt — large section separation (8pt grid) */
  section: 32,
  /** 40pt — large padding (existing screens) */
  xl: 40,
  /** 64pt — hero / splash breathing room */
  xxl: 64,
  gutter: 16,
  containerMax: 1280,
} as const;

export const layout = {
  /** Rural accessibility floor — 48×48dp */
  buttonHeight: 48,
  minTapTarget: 44,
  listRowMinHeight: 56,
  mobileMaxWidth: 767,
  /** Consistent card padding (8pt grid) */
  cardPadding: 16,
  /** Consistent gap between cards */
  cardGap: 12,
} as const;
