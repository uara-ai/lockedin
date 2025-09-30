import BuildersPageContent from "./builders-page";

// Revalidate once per day for efficient caching
export const revalidate = 86400; // 24 hours

export const metadata = {
  title: "All Builders | LockedIn",
  description:
    "Meet the builders, makers, and founders shipping on LockedIn. Join the community of people building in public.",
  openGraph: {
    title: "All Builders | LockedIn",
    description:
      "Meet the builders, makers, and founders shipping on LockedIn. Join the community of people building in public.",
  },
};

interface BuildersPageProps {
  searchParams?: {
    page?: string;
    search?: string;
    filter?: string;
  };
}

export default function BuildersPage({ searchParams }: BuildersPageProps) {
  return <BuildersPageContent searchParams={searchParams} />;
}

// Cursor rules applied correctly.
