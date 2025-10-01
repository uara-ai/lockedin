interface SponsorHeaderProps {
  plan: {
    name: string;
    price: number;
    currency: string;
    trialDays: number;
  };
}

export function SponsorHeader({ plan }: SponsorHeaderProps) {
  return (
    <div className="text-center mb-8">
      <h1 className="text-3xl font-bold mb-2">Become a Sponsor</h1>
    </div>
  );
}
