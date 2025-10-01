// api/webhook/polar/route.ts
import { Webhooks } from "@polar-sh/nextjs";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

/*
Payload Handlers
The Webhook handler also supports granular handlers for easy integration.

onPayload - Catch-all handler for any incoming Webhook event
onCheckoutCreated - Triggered when a checkout is created
onCheckoutUpdated - Triggered when a checkout is updated
onOrderCreated - Triggered when an order is created
onOrderPaid - Triggered when an order is paid
onOrderRefunded - Triggered when an order is refunded
onRefundCreated - Triggered when a refund is created
onRefundUpdated - Triggered when a refund is updated
onSubscriptionCreated - Triggered when a subscription is created
onSubscriptionUpdated - Triggered when a subscription is updated
onSubscriptionActive - Triggered when a subscription becomes active
onSubscriptionCanceled - Triggered when a subscription is canceled
onSubscriptionRevoked - Triggered when a subscription is revoked
onSubscriptionUncanceled - Triggered when a subscription cancellation is reversed
onProductCreated - Triggered when a product is created
onProductUpdated - Triggered when a product is updated
onOrganizationUpdated - Triggered when an organization is updated
onBenefitCreated - Triggered when a benefit is created
onBenefitUpdated - Triggered when a benefit is updated
onBenefitGrantCreated - Triggered when a benefit grant is created
onBenefitGrantUpdated - Triggered when a benefit grant is updated
onBenefitGrantRevoked - Triggered when a benefit grant is revoked
onCustomerCreated - Triggered when a customer is created
onCustomerUpdated - Triggered when a customer is updated
onCustomerDeleted - Triggered when a customer is deleted
onCustomerStateChanged - Triggered when a customer state changes
*/

export const POST = Webhooks({
  webhookSecret: process.env.POLAR_WEBHOOK_SECRET!,
  onOrderPaid: async (payload) => {
    try {
      console.log("=== ORDER PAID WEBHOOK RECEIVED ===");
      console.log("Full payload:", JSON.stringify(payload, null, 2));

      const order = payload.data;
      const customer = order.customer;
      const product = order.product;

      console.log("Order details:", {
        orderId: order.id,
        customerEmail: customer.email,
        customerName: customer.name,
        amount: order.fromBalanceAmount,
        currency: order.currency,
        productId: product?.id,
      });

      // Extract metadata to determine plan type
      const metadata = order.metadata || {};
      const planType = metadata.planType || "monthly";
      const planId = metadata.planId || "monthly";
      const startupId = metadata.startupId;

      console.log("Metadata:", { planType, planId, startupId });

      // Find or create user by email
      let user = await prisma.user.findUnique({
        where: { email: customer.email },
      });

      console.log("User found:", user ? "Yes" : "No");

      if (!user) {
        console.log("Creating new user...");
        // Create user if they don&apos;t exist
        user = await prisma.user.create({
          data: {
            email: customer.email,
            name: customer.name || customer.email.split("@")[0],
            username: customer.email.split("@")[0],
          },
        });
        console.log("User created:", user.id);
      }

      // Create sponsor subscription
      console.log("Creating sponsor subscription...");
      const sponsorSubscription = await prisma.sponsorSubscription.create({
        data: {
          userId: user.id,
          startupId: (startupId as string) || null,
          polarCustomerId: customer.id,
          polarOrderId: order.id,
          planType: (planType as string).toUpperCase() as
            | "MONTHLY"
            | "ANNUAL"
            | "LIFETIME",
          status: "ACTIVE",
          amount: order.fromBalanceAmount || 0,
          currency: order.currency || "USD",
          billingInterval:
            planType === "lifetime"
              ? "lifetime"
              : planType === "monthly"
              ? "month"
              : "year",
          nextBillingDate:
            planType === "lifetime"
              ? null
              : new Date(
                  Date.now() +
                    (planType === "monthly" ? 30 : 365) * 24 * 60 * 60 * 1000
                ),
          isFeatured: true,
          priorityOrder: 0,
          customBadge:
            planType === "lifetime"
              ? "Lifetime Sponsor"
              : planType === "monthly"
              ? "Monthly Sponsor"
              : "Annual Sponsor",
        },
      });

      console.log("✅ Sponsor subscription created successfully:", {
        id: sponsorSubscription.id,
        userId: sponsorSubscription.userId,
        startupId: sponsorSubscription.startupId,
        planType: sponsorSubscription.planType,
        status: sponsorSubscription.status,
      });
    } catch (error) {
      console.error("❌ Error processing order paid webhook:", error);
      console.error("Error details:", {
        message: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      });
    }
  },

  onSubscriptionCreated: async (payload) => {
    try {
      console.log("Subscription created webhook received:", payload);

      const subscription = payload.data;
      const customer = subscription.customer;

      // Find user by email
      const user = await prisma.user.findUnique({
        where: { email: customer.email },
      });

      if (user) {
        // Update existing sponsor subscription with subscription ID
        await prisma.sponsorSubscription.updateMany({
          where: {
            userId: user.id,
            polarCustomerId: customer.id,
          },
          data: {
            polarSubscriptionId: subscription.id,
            status: "ACTIVE",
          },
        });
      }
    } catch (error) {
      console.error("Error processing subscription created webhook:", error);
    }
  },

  onSubscriptionCanceled: async (payload) => {
    try {
      console.log("Subscription canceled webhook received:", payload);

      const subscription = payload.data;

      // Update sponsor subscription status
      await prisma.sponsorSubscription.updateMany({
        where: {
          polarSubscriptionId: subscription.id,
        },
        data: {
          status: "CANCELLED",
        },
      });
    } catch (error) {
      console.error("Error processing subscription canceled webhook:", error);
    }
  },

  onPayload: async (payload) => {
    // Handle any other webhook events
    console.log("Webhook received:", payload.type, payload.data);
  },
});
