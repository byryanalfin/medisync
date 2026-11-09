import { useEffect, useRef, useState } from "react";
import FeedbackContext from "./feedbackContext";

export default function FeedbackProvider({ children }) {
  const [notice, setNotice] = useState(null);
  const dialogRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (notice && !dialog.open) dialog.showModal();
  }, [notice]);

  function showFeedback(message, title = "Pemberitahuan") {
    setNotice({ message, title });
  }

  return (
    <FeedbackContext.Provider value={showFeedback}>
      {children}
      <dialog
        ref={dialogRef}
        onClose={() => setNotice(null)}
        aria-labelledby="feedback-title"
        aria-describedby="feedback-message"
        className="w-[calc(100%-2rem)] max-w-[420px] max-h-[calc(100dvh-2rem)] overflow-y-auto break-words rounded-xl border border-[#dce7ef] bg-white p-0 text-[#17324d] shadow-xl backdrop:bg-[#102f4e]/45"
      >
        {notice && (
          <>
            <div className="border-b border-[#dce7ef] px-6 py-4">
              <h2 id="feedback-title" className="text-lg font-semibold">{notice.title}</h2>
            </div>
            <p id="feedback-message" className="px-6 py-5 text-sm leading-relaxed">{notice.message}</p>
            <form method="dialog" className="flex justify-end px-6 pb-5">
              <button autoFocus className="rounded-lg bg-[#1269d3] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#0958b5] focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-[#1269d3]">
                Tutup
              </button>
            </form>
          </>
        )}
      </dialog>
    </FeedbackContext.Provider>
  );
}
