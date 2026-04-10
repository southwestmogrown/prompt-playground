export type DiffPart = { text: string; type: "same" | "added" | "removed" };

// LCS-based word diff. Splits on whitespace boundaries, preserving the tokens.
// Returns parallel left/right DiffPart arrays for side-by-side rendering.
export function wordDiff(a: string, b: string): { left: DiffPart[]; right: DiffPart[] } {
  const aWords = a.trim().split(/\s+/);
  const bWords = b.trim().split(/\s+/);
  const m = aWords.length;
  const n = bWords.length;

  // Build LCS table
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = aWords[i - 1] === bWords[j - 1]
        ? dp[i - 1][j - 1] + 1
        : Math.max(dp[i - 1][j], dp[i][j - 1]);
    }
  }

  // Backtrack to build diff
  const left: DiffPart[] = [];
  const right: DiffPart[] = [];
  let i = m, j = n;

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && aWords[i - 1] === bWords[j - 1]) {
      left.unshift({ text: aWords[i - 1], type: "same" });
      right.unshift({ text: bWords[j - 1], type: "same" });
      i--; j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      right.unshift({ text: bWords[j - 1], type: "added" });
      j--;
    } else {
      left.unshift({ text: aWords[i - 1], type: "removed" });
      i--;
    }
  }

  return { left, right };
}
