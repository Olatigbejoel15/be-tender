// Talks to the contact and newsletter endpoints.
import { call } from "@/lib/authApi";

// What the contact form sends. "website" is the hidden bot trap: people leave it empty.
export type ContactInput = {
  name: string;
  email: string;
  phone?: string;
  topic: string;
  message: string;
  website?: string;
};

export const sendContactMessage = (input: ContactInput) =>
  call<{ message: string }>("/contact", "POST", null, input);

export const subscribeToNewsletter = (email: string, website = "") =>
  call<{ message: string }>("/newsletter", "POST", null, { email, website });