# Sponsor Components

This directory contains all the components needed to build sponsor pages and manage different sponsor plans.

## Components

### Core Components

- **`SponsorPage`** - Main page component that orchestrates the entire sponsor flow
- **`SponsorHeader`** - Displays the plan title and pricing
- **`SponsorStartupSelector`** - Allows users to select which startup to feature
- **`SponsorPlanCard`** - Shows plan details and call-to-action button
- **`SponsorLoadingState`** - Loading state while fetching data
- **`SponsorEmptyState`** - State when user has no startups
- **`SponsorPlanSelector`** - Grid of all available plans for comparison

## Usage

### Basic Usage

```tsx
import { SponsorPage } from "@/components/sponsor";
import { getSponsorPlan } from "@/lib/sponsor-plans";

function MySponsorPage() {
  const plan = getSponsorPlan("monthly");
  return <SponsorPage plan={plan} />;
}
```

### Plan Selection

```tsx
import { SponsorPlanSelector } from "@/components/sponsor";

function PlanComparison() {
  return <SponsorPlanSelector showAllPlans={true} />;
}
```

## Plan Configuration

Plans are configured in `src/lib/sponsor-plans.ts`:

```tsx
export const SPONSOR_PLANS = {
  monthly: {
    id: "monthly",
    name: "Startup Sponsor",
    price: 9,
    // ... other config
  },
  // ... other plans
};
```

## Adding New Sponsor Types

1. **Add plan configuration** in `src/lib/sponsor-plans.ts`
2. **Create new page** at `src/app/(feed)/sponsor/[planId]/page.tsx`
3. **Update components** as needed for new plan features
4. **Add new icons** to the iconMap in `SponsorPlanSelector`

## File Structure

```
src/components/sponsor/
├── README.md
├── index.ts                    # Exports all components
├── sponsor-page.tsx           # Main page component
├── sponsor-header.tsx         # Page header
├── sponsor-startup-selector.tsx # Startup selection
├── sponsor-plan-card.tsx      # Plan details card
├── sponsor-loading-state.tsx  # Loading state
├── sponsor-empty-state.tsx    # Empty state
└── sponsor-plan-selector.tsx  # Plan comparison grid
```

## Props Interfaces

### SponsorPageProps

```tsx
interface SponsorPageProps {
  plan: {
    id: string;
    name: string;
    description: string;
    price: number;
    currency: string;
    type: string;
    trialDays: number;
    polarProductId: string;
  };
}
```

### SponsorStartupSelectorProps

```tsx
interface SponsorStartupSelectorProps {
  startups: StartupWithDetails[];
  selectedStartup: string | null;
  onSelectStartup: (startupId: string) => void;
}
```

## Future Enhancements

- **Plan comparison modal**
- **Custom plan builder**
- **Bulk sponsor management**
- **Analytics dashboard**
- **Sponsor tier management**
