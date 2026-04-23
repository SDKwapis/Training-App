import { useState, useEffect, useRef } from 'react';
import { Timer, Square } from 'lucide-react';

export default function TutTimer({ onComplete }) {
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [running]);

  function start() {
    setElapsed(0);
    setRunning(true);
  }

  function stop() {
    setRunning(false);
    onComplete(elapsed);
  }

  const m = Math.floor(elapsed / 60);
  const s = elapsed % 60;
  const display = `${m > 0 ? `${m}:` : ''}${String(s).padStart(2, '0')}`;

  if (!running && elapsed === 0) {
    return (
      <button
        type="button"
        onClick={start}
        className="flex items-center gap-2 justify-center w-full py-3 rounded-lg border border-zinc-700 text-zinc-300 hover:border-amber-400 hover:text-amber-400 transition-colors"
      >
        <Timer size={18} />
        <span className="text-sm font-medium">Start TUT Timer</span>
      </button>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <div className={`flex-1 text-center text-3xl font-bold tabular-nums ${running ? 'text-amber-400' : 'text-zinc-300'}`}>
        {display}
        {running && <span className="ml-2 inline-block w-2 h-2 bg-amber-400 rounded-full animate-pulse" />}
      </div>
      {running ? (
        <button
          type="button"
          onClick={stop}
          className="flex items-center gap-1 py-2 px-4 bg-amber-400 text-zinc-950 rounded-lg font-bold text-sm active:scale-95 transition-transform"
        >
          <Square size={14} fill="currentColor" />
          STOP
        </button>
      ) : (
        <button
          type="button"
          onClick={start}
          className="py-2 px-4 border border-zinc-700 text-zinc-400 rounded-lg text-sm active:scale-95 transition-transform"
        >
          Reset
        </button>
      )}
    </div>
  );
}
