"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { toast } from "sonner";
import { useApi } from "@/hooks/use-api";
import { useAuth } from "@/hooks/use-auth";
import { apiFetch } from "@/lib/api";
import type { Review } from "@/lib/types";
import { Textarea } from "@/components/ui/textarea";
import { formatDate } from "@/lib/utils";
import { LoadingState } from "@/components/ui/states";

export function ReviewSection({ itemId }: { itemId: string }) {
  const { user } = useAuth();
  const canReview = user?.role === "customer" && !user.isBlocked;
  const { data, loading, reload } = useApi<Review[]>(`/menu-items/${itemId}/reviews`);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [sending, setSending] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (comment.trim().length < 2) {
      toast.error("Please write a short review");
      return;
    }
    setSending(true);
    try {
      await apiFetch(`/menu-items/${itemId}/reviews`, {
        method: "POST",
        body: JSON.stringify({ rating, comment }),
      });
      toast.success("Thanks for your review!");
      setComment("");
      await reload();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save review");
    } finally {
      setSending(false);
    }
  };

  return (
    <section className="mt-12">
      <h2 className="text-2xl font-black text-gray-900 dark:text-white">Customer reviews</h2>

      {canReview && (
        <form onSubmit={submit} className="mt-4 rounded-2xl border border-orange-100 bg-white p-5 dark:border-white/10 dark:bg-slate-900">
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">Rate this pizza</p>
          <div className="mt-2 flex gap-1">
            {[1, 2, 3, 4, 5].map((value) => (
              <button key={value} type="button" onClick={() => setRating(value)} aria-label={`${value} stars`}>
                <Star className={`size-7 ${value <= rating ? "fill-amber-400 text-amber-400" : "text-gray-300"}`} />
              </button>
            ))}
          </div>
          <Textarea
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            placeholder="What did you think?"
            className="mt-3"
          />
          <button
            type="submit"
            disabled={sending}
            className="mt-3 rounded-xl bg-[#E5484D] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#d43b40] disabled:opacity-60"
          >
            {sending ? "Posting..." : "Post review"}
          </button>
        </form>
      )}

      <div className="mt-6 space-y-3">
        {loading && <LoadingState label="Loading reviews..." />}
        {!loading && (!data || data.length === 0) && (
          <p className="rounded-2xl bg-orange-50 p-5 text-sm text-gray-500 dark:bg-white/5">
            No reviews yet. Be the first to share your thoughts!
          </p>
        )}
        {data?.map((review) => (
          <div key={review._id} className="rounded-2xl border border-orange-100 bg-white p-5 dark:border-white/10 dark:bg-slate-900">
            <div className="flex items-center justify-between gap-3">
              <p className="font-bold text-gray-900 dark:text-white">{review.userName}</p>
              <p className="text-xs text-gray-400">{formatDate(review.createdAt)}</p>
            </div>
            <div className="mt-1 flex gap-0.5">
              {Array.from({ length: review.rating }).map((_, index) => (
                <Star key={index} className="size-4 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{review.comment}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
