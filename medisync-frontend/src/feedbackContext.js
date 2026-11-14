import { createContext, useContext } from "react";

const FeedbackContext = createContext(null);

export function useFeedback() {
  return useContext(FeedbackContext);
}

export default FeedbackContext;
