"use client";
import { useEffect, useRef } from "react";

export function AnimatedPointer() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    let frame = 0, x = -40, y = -40, rx = -40, ry = -40;
    const interactive = "a,button,input,textarea,select,[role='button']";
    const move = (event: PointerEvent) => {
      x = event.clientX; y = event.clientY;
      if (dot.current) dot.current.style.transform = `translate3d(${x - 3}px,${y - 3}px,0)`;
      ring.current?.classList.toggle("pointer-active", Boolean((event.target as Element)?.closest?.(interactive)));
    };
    const leave = () => ring.current?.classList.add("pointer-hidden");
    const enter = () => ring.current?.classList.remove("pointer-hidden");
    const animate = () => {
      rx += (x-rx)*.16; ry += (y-ry)*.16;
      if (ring.current) ring.current.style.transform = `translate3d(${rx-15}px,${ry-15}px,0)`;
      frame=requestAnimationFrame(animate);
    };
    window.addEventListener("pointermove", move);
    document.documentElement.addEventListener("mouseleave", leave);
    document.documentElement.addEventListener("mouseenter", enter);
    frame=requestAnimationFrame(animate);
    return () => {
      window.removeEventListener("pointermove", move);
      document.documentElement.removeEventListener("mouseleave", leave);
      document.documentElement.removeEventListener("mouseenter", enter);
      cancelAnimationFrame(frame);
    };
  }, []);

  return <><div ref={ring} className="global-pointer-ring"/><div ref={dot} className="global-pointer-dot"/></>;
}
