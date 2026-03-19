import React from "react";
import { RecipePhoto } from "@/components/RecipePhoto";

export type RecipeVisualCardProps = {
  title: string;
  category?: string;
  cost?: "economica" | "cotidiana" | "premium" | string;
  timeMinutes?: number;
  imageUrl?: string;
  description?: string;
  tags?: string[];
  onClick?: () => void;
  actionLabel?: string;
  className?: string;
  recipeId?: string;
  recipeFamily?: string;
  hint?: string;
};

function getCostLabel(cost?: string) {
  if (!cost) return "Cotidiana";
  const normalized = cost.toLowerCase();

  if (normalized.includes("econ")) return "Econômica";
  if (normalized.includes("prem")) return "Premium";
  return "Cotidiana";
}

function getCostClasses(cost?: string) {
  const normalized = (cost || "").toLowerCase();

  if (normalized.includes("econ")) {
    return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200";
  }

  if (normalized.includes("prem")) {
    return "bg-amber-50 text-amber-700 ring-1 ring-amber-200";
  }

  return "bg-sky-50 text-sky-700 ring-1 ring-sky-200";
}

function normalizeMealType(category?: string) {
  const normalized = (category || "").toLowerCase().trim();

  if (
    normalized.includes("cafe") ||
    normalized.includes("café") ||
    normalized.includes("manha") ||
    normalized.includes("manhã")
  ) {
    return "cafe";
  }

  if (normalized.includes("janta")) {
    return "jantar";
  }

  return "almoco";
}

export default function RecipeVisualCard({
  title,
  category = "Almoço",
  cost = "cotidiana",
  timeMinutes = 25,
  imageUrl,
  description = "Receita saborosa, equilibrada e prática para o dia a dia.",
  tags = [],
  onClick,
  actionLabel = "Ver receita",
  className = "",
  recipeId,
  recipeFamily,
  hint,
}: RecipeVisualCardProps) {
  const mealType = normalizeMealType(category);
  const stableRecipeId =
    recipeId ||
    title
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/\s+/g, "-");

  return (
    <article
      className={[
        "group overflow-hidden rounded-[28px] border border-white/70 bg-white/90 shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(15,23,42,0.12)]",
        className,
      ].join(" ")}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-emerald-100 via-lime-50 to-orange-100">
        <RecipePhoto
          recipeId={stableRecipeId}
          recipeName={title}
          mealType={mealType as any}
          hint={hint || title}
          imageUrl={imageUrl}
          recipeFamily={recipeFamily}
          className="h-full w-full"
        />

        <div className="absolute left-4 top-4 z-10 flex items-center gap-2">
          <span className="rounded-full bg-white/85 px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm backdrop-blur">
            {category}
          </span>
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold shadow-sm ${getCostClasses(cost)}`}
          >
            {getCostLabel(cost)}
          </span>
        </div>
      </div>

      <div className="space-y-4 p-5 sm:p-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <h3 className="line-clamp-2 text-lg font-bold tracking-tight text-slate-900 sm:text-xl">
              {title}
            </h3>
            <span className="shrink-0 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
              {timeMinutes} min
            </span>
          </div>

          <p className="line-clamp-2 text-sm leading-6 text-slate-600">
            {description}
          </p>
        </div>

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <button
          type="button"
          onClick={onClick}
          className="inline-flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 px-4 py-3 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(34,197,94,0.28)] transition hover:brightness-105 focus:outline-none focus:ring-2 focus:ring-emerald-300"
        >
          {actionLabel}
        </button>
      </div>
    </article>
  );
}
