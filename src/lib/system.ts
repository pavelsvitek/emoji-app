export function isMac() {
  return (
    typeof window !== 'undefined' &&
    /Mac|iPhone|iPod|iPad/.test(window.navigator.userAgent)
  );
}
