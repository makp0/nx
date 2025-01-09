import { signalToCode } from './exit-codes';

const cleanupFns: Set<(signal: NodeJS.Signals) => void> = new Set();

export function registerCleanupFn(
  fn: (signal: NodeJS.Signals) => void
): () => void {
  cleanupFns.add(fn);

  return () => {
    cleanupFns.delete(fn);
  };
}

function cleanup(signal: NodeJS.Signals, code?: number) {
  cleanupFns.forEach((fn) => fn(signal));
  process.exit(code ?? signalToCode(signal));
}

process.on('SIGINT', () => {
  cleanup('SIGINT');
});

process.on('SIGTERM', () => {
  cleanup('SIGTERM');
});

process.on('SIGHUP', () => {
  cleanup('SIGHUP');
});

process.on('exit', (code) => {
  cleanup(null, code);
});
