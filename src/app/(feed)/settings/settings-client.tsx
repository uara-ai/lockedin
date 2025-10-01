"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  IconSettings,
  IconCreditCard,
  IconUser,
  IconBell,
  IconShield,
  IconExternalLink,
} from "@tabler/icons-react";
import Link from "next/link";

interface User {
  id: string;
  email: string;
  name?: string;
}

interface SubscriptionData {
  id: string;
  planType: string;
  status: string;
  customBadge?: string;
  createdAt: string;
  startup?: {
    name: string;
    slug: string;
  };
}

interface SettingsClientProps {
  user: User;
  subscriptions: SubscriptionData[];
}

export function SettingsClient({ user, subscriptions }: SettingsClientProps) {
  const [portalLoading, setPortalLoading] = useState(false);

  const handleManageSubscription = async () => {
    // Check if user has active subscriptions
    if (subscriptions.length === 0) {
      // Redirect to sponsor page instead
      window.location.href = "/sponsor";
      return;
    }

    setPortalLoading(true);
    try {
      // Redirect to customer portal
      window.location.href = "/api/portal";
    } catch (error) {
      console.error("Failed to open customer portal:", error);
    } finally {
      setPortalLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      case "past_due":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-2">
          <IconSettings className="h-6 w-6" />
          <h1 className="text-3xl font-bold">Settings</h1>
        </div>

        {/* Account Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <IconUser className="h-5 w-5" />
              <span>Account</span>
            </CardTitle>
            <CardDescription>
              Manage your account information and preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{user?.name}</p>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/profile/edit">Edit Profile</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Subscription Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <IconCreditCard className="h-5 w-5" />
              <span>Subscriptions</span>
            </CardTitle>
            <CardDescription>
              Manage your sponsor subscriptions and billing
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {subscriptions.length > 0 ? (
              <div className="space-y-3">
                {subscriptions.map((subscription) => (
                  <div
                    key={subscription.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">
                          {subscription.startup?.name || "Sponsor Plan"}
                        </span>
                        <Badge className={getStatusColor(subscription.status)}>
                          {subscription.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {subscription.planType} •{" "}
                        {subscription.customBadge || "Standard"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Created:{" "}
                        {new Date(subscription.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link href="/api/portal">Manage</Link>
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <IconCreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">
                  No Active Subscriptions
                </h3>
                <p className="text-muted-foreground mb-4">
                  You don&apos;t have any active sponsor subscriptions yet.
                </p>
                <Button asChild>
                  <Link href="/sponsor">Become a Sponsor</Link>
                </Button>
              </div>
            )}

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Billing & Invoices</h4>
                <p className="text-sm text-muted-foreground">
                  {subscriptions.length > 0
                    ? "View invoices, update payment methods, and manage billing"
                    : "Subscribe to access billing management and customer portal"}
                </p>
              </div>
              <Button
                onClick={handleManageSubscription}
                disabled={portalLoading}
                className="flex items-center space-x-2"
                variant={subscriptions.length === 0 ? "default" : "outline"}
              >
                {portalLoading ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    <span>Loading...</span>
                  </>
                ) : (
                  <>
                    <IconExternalLink className="h-4 w-4" />
                    <span>
                      {subscriptions.length > 0
                        ? "Customer Portal"
                        : "Subscribe Now"}
                    </span>
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
