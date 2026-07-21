export interface FormState {
  message: string;
  file: File | null;
  submitting: boolean;
  error: string | null;
  audience: "b2b" | "b2c" | "other";
  customAudience: string;
}

export type FormAction =
  | { type: "SET_MESSAGE"; payload: string }
  | { type: "SET_FILE"; payload: File | null }
  | { type: "SET_SUBMITTING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "SET_AUDIENCE"; payload: FormState["audience"] }
  | { type: "SET_CUSTOM_AUDIENCE"; payload: string };
