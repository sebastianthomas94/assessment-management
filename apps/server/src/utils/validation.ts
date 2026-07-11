// RFC 5322 simplified — good enough for app-level validation.
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const MIN_PASSWORD_LENGTH = 8;

export function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email.trim());
}

export interface ValidationResult {
  valid: boolean;
  message?: string;
}

export function validateAuthInput(input: {
  email: string;
  password: string;
  name?: string;
}): ValidationResult {
  const email = input.email?.trim() ?? "";
  const password = input.password ?? "";

  if (!email) return { valid: false, message: "Email is required." };
  if (!isValidEmail(email))
    return { valid: false, message: "Please enter a valid email address." };
  if (!password) return { valid: false, message: "Password is required." };
  if (password.length < MIN_PASSWORD_LENGTH)
    return {
      valid: false,
      message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`,
    };

  if (input.name !== undefined && !input.name.trim()) {
    return { valid: false, message: "Name is required." };
  }

  return { valid: true };
}
