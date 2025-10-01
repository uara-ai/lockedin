// checkout/route.ts

/*
Query Params
Pass query params to this route.

products ?products=123
customerId (optional) ?products=123&customerId=xxx
customerExternalId (optional) ?products=123&customerExternalId=xxx
customerEmail (optional) ?products=123&customerEmail=janedoe@gmail.com
customerName (optional) ?products=123&customerName=Jane
metadata (optional) URL-Encoded JSON string
*/
import { Checkout } from "@polar-sh/nextjs";

export const GET = Checkout({
  accessToken: process.env.POLAR_ACCESS_TOKEN,
  successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/sponsor/success`,
  server: "sandbox", // Use sandbox if you're testing Polar - omit the parameter or pass 'production' otherwise
  theme: "dark", // Enforces the theme - System-preferred theme will be set if left omitted
});
