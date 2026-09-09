"use client";

import { useEffect, useRef } from "react";
import { motionIsStill } from "@/lib/use-motion-preference";

/* sl — la locomotora de Unix cruza la página una vez y se va. */

const ENGINE = [
  String.raw`      ====        ________                ___________`,
  String.raw`  _D _|  |_______/        \__I_I_____===__|_________|`,
  String.raw`   |(_)---  |   H\________/ |   |        =|___ ___|  `,
  String.raw`   /     |  |   H  |  |     |   |         ||_| |_||  `,
  String.raw`  |      |  |   H  |__--------------------| [___] |  `,
  String.raw`  | ________|___H__/__|_____/[][]~\_______|       |  `,
  String.raw`  |/ |   |-----------I_____I [][] []  D   |=======|__`,
  String.raw`__/ =| o |=-~~\  /~~\  /~~\  /~~\ ____Y___________|__`,
  String.raw` |/-=|___|=O=====O=====O=====O   |_____/~\___/     `,
  String.raw`  \_/      \__/  \__/  \__/  \__/      \_/         `,
];
const TRAIN_COLS = 52;
const STEP_MS = 42;

export function Train({ onDone, closeLabel }: { onDone: () => void; closeLabel: string }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const rulerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    const ruler = rulerRef.current;
    if (!host || !ruler) return;
    const cellW = ruler.getBoundingClientRect().width / 20;
    let col = Math.ceil(window.innerWidth / cellW) + 2;
    const end = -TRAIN_COLS - 2;
    const paint = () => {
      host.style.transform = `translate3d(${col * cellW}px, 0, 0)`;
    };

    if (motionIsStill()) {
      // Quieto en el centro, tres segundos, y se va.
      col = Math.floor((window.innerWidth / cellW - TRAIN_COLS) / 2);
      paint();
      const stop = setTimeout(onDone, 3000);
      return () => clearTimeout(stop);
    }

    paint();
    const timer = setInterval(() => {
      col -= 1;
      if (col <= end) {
        clearInterval(timer);
        onDone();
        return;
      }
      paint();
    }, STEP_MS);
    return () => clearInterval(timer);
  }, [onDone]);

  return (
    <>
      <span ref={rulerRef} aria-hidden className="pointer-events-none invisible fixed left-0 top-0 whitespace-pre font-mono">
        00000000000000000000
      </span>
      <div className="pointer-events-none fixed bottom-24 left-0 right-0 z-[70] select-none overflow-hidden" aria-hidden>
        <div ref={hostRef} className="w-max whitespace-pre font-mono text-[14px] leading-[21px] text-phosphor will-change-transform">
          {ENGINE.join("\n")}
        </div>
      </div>
      <button type="button" onClick={onDone} className="btn btn-secondary btn-sm glass fixed right-4 top-24 z-[71]">
        {closeLabel}
      </button>
    </>
  );
}
