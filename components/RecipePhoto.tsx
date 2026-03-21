'use client';

import Image from 'next/image';
import { useMemo } from 'react';
import { MealType } from '@/lib/types';
import {
  getMealTypeFallback,
  resolveFamilyFromText,
} from '@/lib/family-normalizer';

interface Props {
  recipeId: string;
  recipeName: string;
  mealType: MealType;
  hint?: string;
  className?: string;
  imageUrl?: string;
  recipeFamily?: string;

  /** usado quando a imagem está acima da dobra (LCP) */
  priority?: boolean;
}

function getFamilyImage(recipeId: string, family: string) {
  const variations = [
    `${family}.webp`,
    `${family}-1.webp`,
    `${family}-2.webp`,
    `${family}-3.webp`,
    `${family}-4.webp`,
  ];

  const numeric = recipeId
    .split('')
    .reduce((acc, c) => acc + c.charCodeAt(0), 0);

  const index = numeric % variations.length;

  return `/recipes/families/${variations[index]}`;
}

export function RecipePhoto({
  recipeId,
  recipeName,
  mealType,
  hint,
  className,
  imageUrl,
  recipeFamily,
  priority = false,
}: Props) {

  const src = useMemo(() => {

    if (imageUrl) return imageUrl;

    const resolvedFamily =
      resolveFamilyFromText(recipeFamily, recipeName);

    if (resolvedFamily) {
      return getFamilyImage(recipeId, resolvedFamily);
    }

    const fallback = getMealTypeFallback(mealType);

    return getFamilyImage(recipeId, fallback);

  }, [recipeId, recipeName, recipeFamily, mealType, imageUrl]);

  const alt =
    hint?.trim() ||
    recipeName?.trim() ||
    `Imagem da receita ${recipeId}`;

  const wrapperClass = [
    'relative overflow-hidden',
    className ?? 'h-64 w-full rounded-xl bg-neutral-100',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={wrapperClass}>
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        sizes="(max-width:768px) 100vw, (max-width:1200px) 50vw, 33vw"
        className="object-cover"
        unoptimized
      />
    </div>
  );
}