import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { IconBrandX, IconPlus, IconQuote } from "@tabler/icons-react";

type Testimonial = {
  name: string;
  role: string;
  image: string;
  quote: string;
};

const testimonials: Testimonial[] = [
  {
    name: "Jack Hendrix",
    role: "Founder",
    image: "/testimonials/jack.jpg",
    quote:
      "Initial UI is great and the concept is super clear. It's obvious that it's focused on builders. Really hope this gains traction - love the idea. Nice job!",
  },
];

const chunkArray = (
  array: Testimonial[],
  chunkSize: number
): Testimonial[][] => {
  const result: Testimonial[][] = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    result.push(array.slice(i, i + chunkSize));
  }
  return result;
};

// Call-to-action card component
const FeedbackCard = () => (
  <Card className="border-2 border-dashed border-muted-foreground/30 hover:border-muted-foreground/50 transition-colors relative">
    <CardContent className="flex flex-col items-center justify-center p-6 text-center space-y-4">
      {/* X Brand Icon in top-right corner */}
      <div className="absolute top-3 right-3">
        <div className="w-6 h-6 rounded-full bg-black dark:bg-white flex items-center justify-center">
          <IconBrandX className="h-3 w-3 text-white dark:text-black" />
        </div>
      </div>

      <div className="size-10 rounded-full border-2 border-dashed border-muted-foreground/30 flex items-center justify-center">
        <IconPlus className="h-5 w-5 text-muted-foreground/50" />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-center gap-2">
          <h3 className="font-semibold text-foreground">Maybe you?</h3>
          <IconQuote className="h-4 w-4 text-muted-foreground/60" />
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Share your experience with Commodo on{" "}
          <span className="font-semibold">𝕏</span> and tag{" "}
          <a
            href="https://x.com/locked_fed"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline font-medium"
          >
            @locked_fed
          </a>{" "}
          to be featured here!
        </p>
      </div>

      <Button
        variant="outline"
        size="sm"
        className="gap-2 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors"
        asChild
      >
        <a
          href="https://x.com/intent/tweet?text=Just%20tried%Commodo%20.bio%20-%20amazing%20platform%20for%20builders!%20%40locked_fed"
          target="_blank"
          rel="noopener noreferrer"
        >
          <IconBrandX className="h-4 w-4" />
          Tweet NOW!
        </a>
      </Button>
    </CardContent>
  </Card>
);

const testimonialChunks = chunkArray(
  testimonials,
  Math.ceil(testimonials.length / 3)
);

export default function WallOfLoveSection() {
  return (
    <section>
      <div className="py-16 md:py-32">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center">
            <h2 className="text-3xl font-semibold">Loved by the Community</h2>
            <p className="mt-6">You have no excuses not to try it</p>
          </div>
          <div className="mt-8 grid gap-3 sm:grid-cols-2 md:mt-12 lg:grid-cols-3">
            {/* All testimonial columns */}
            {testimonialChunks.map((chunk, chunkIndex) => (
              <div key={chunkIndex} className="flex flex-col gap-3">
                {chunk.map(({ name, role, quote, image }, index) => (
                  <Card key={index}>
                    <CardContent className="grid grid-cols-[auto_1fr] gap-3 pt-6">
                      <Avatar className="size-9">
                        <AvatarImage
                          alt={name}
                          src={image}
                          width={36}
                          height={36}
                        />
                        <AvatarFallback className="text-white font-semibold">
                          {name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>

                      <div className="relative">
                        <div className="absolute top-3 right-3">
                          <div className="w-6 h-6 rounded-full flex items-center justify-center">
                            <IconBrandX className="size-4" />
                          </div>
                        </div>

                        <h3 className="font-medium">{name}</h3>

                        <span className="text-muted-foreground block text-sm tracking-wide">
                          {role}
                        </span>

                        <blockquote className="mt-3">
                          <p className="text-gray-700 dark:text-gray-300">
                            {quote}
                          </p>
                        </blockquote>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ))}

            {/* Add feedback card at the end of the last column */}
            <FeedbackCard />

            {/* If no testimonials exist, show feedback card in its own column */}
            {testimonialChunks.length === 0 && (
              <div className="flex flex-col gap-3">
                <FeedbackCard />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

// Cursor rules applied correctly.
