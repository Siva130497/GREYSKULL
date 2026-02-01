import { useEffect, useState } from "react";

export default function RotateOverlay() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const check = () => {
      const portrait = window.matchMedia("(orientation: portrait)").matches;
      const small = window.innerWidth < 1024;
      setShow(portrait && small);
    };

    check();
    window.addEventListener("resize", check);
    window.addEventListener("orientationchange", check);
    return () => {
      window.removeEventListener("resize", check);
      window.removeEventListener("orientationchange", check);
    };
  }, []);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 text-white flex items-center justify-center">
      <div className="text-center">
        <p className="text-xl font-semibold">Rotate to Landscape</p>
        <p className="text-sm opacity-80 mt-2">Best experience on iPad</p>
      </div>
    </div>
  );
}