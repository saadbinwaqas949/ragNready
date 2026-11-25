import { z } from "zod";
import { isWhatsAppNumber } from "./phone";

/** Shared by the checkout form and the order endpoint so both agree on what is valid. */
export const checkoutSchema = z.object({
  name: z.string().trim().min(2, "Enter your full name.").max(120),
  phone: z.string().trim().max(60).refine(isWhatsAppNumber, "Enter a full WhatsApp number, like 0300 1234567."),
  email: z.string().trim().max(254).email("Enter a valid email address, like name@gmail.com."),
  address: z.string().trim().min(5, "Enter your house, street and area.").max(500),
  city: z.string().trim().min(2, "Enter your city.").max(120),
  notes: z.string().trim().max(1000).default(""),
});

export type CheckoutDetails = z.infer<typeof checkoutSchema>;
