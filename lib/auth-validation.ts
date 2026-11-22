export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_HINT =
  "At least 8 characters, including an uppercase letter, a lowercase letter and a number.";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateName(value: string): string | null {
  const name = value.trim();
  if (!name) return "Please enter your full name.";
  if (name.length < 2) return "Your name must be at least 2 characters.";
  return null;
}

export function validateEmail(value: string): string | null {
  const email = value.trim();
  if (!email) return "Email address is required.";
  if (!EMAIL_PATTERN.test(email)) return "Enter a valid email address.";
  return null;
}

/**
 * Sign-up password rules. Better Auth enforces the minimum length on the API;
 * these extra checks give users immediate, specific feedback in the browser.
 */
export function validatePassword(value: string): string | null {
  if (!value) return "Password is required.";
  if (value.length < PASSWORD_MIN_LENGTH) {
    return `Password must be at least ${PASSWORD_MIN_LENGTH} characters.`;
  }
  if (!/[a-z]/.test(value) || !/[A-Z]/.test(value) || !/\d/.test(value)) {
    return PASSWORD_HINT;
  }
  return null;
}

export function validateConfirmPassword(password: string, confirmPassword: string): string | null {
  if (!confirmPassword) return "Please confirm your password.";
  if (password !== confirmPassword) return "Passwords do not match.";
  return null;
}

/** Turn Better Auth / network errors into messages that are safe to display. */
export function getAuthErrorMessage(value: unknown, fallback: string): string {
  const raw =
    typeof value === "string"
      ? value
      : value && typeof value === "object" && "message" in value
        ? String((value as { message?: unknown }).message ?? "")
        : "";

  const message = raw.trim() || fallback;
  const lower = message.toLowerCase();

  if (/(already|exist|duplicate|another email)/.test(lower)) {
    return "An account with this email already exists. Try signing in instead.";
  }
  if (/(invalid email or password|incorrect email or password|invalid credentials|unauthorized)/.test(lower)) {
    return "Incorrect email or password. Please try again.";
  }
  if (/(network|failed to fetch|no response from server|econnrefused)/.test(lower)) {
    return "Unable to reach the server. Check your connection and try again.";
  }

  return message;
}
