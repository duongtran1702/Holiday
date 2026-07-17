import { Star } from "lucide-react";

export function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => <Star key={i} size={11} className={i <= Math.round(rating) ? "fill-accent text-accent" : "text-muted-foreground"} />)}
    </div>
  );
}