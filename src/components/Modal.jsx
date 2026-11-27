import { useEffect } from "react";

// Centered dialog; closes on Escape or a click outside the card.
export default function Modal({ title, onClose, narrow = false, children }) {
  useEffect(() => {
    const onKey = (event) => event.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="modal-backdrop-custom" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div className={`modal-card ${narrow ? "narrow" : ""}`} role="dialog" aria-modal="true" aria-label={title}>
        <div className="modal-head">
          <h2>{title}</h2>
          <button className="modal-close" type="button" aria-label="Close" onClick={onClose}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}
