"use client";

import { useMemo, useState, useEffect } from "react";
import type { ProductVariant } from "@/lib/types";
import { cn } from "@/lib/utils";

interface ProductVariantSelectorsProps {
  variants: ProductVariant[];
  selectedVariant: ProductVariant;
  onVariantChange: (variant: ProductVariant) => void;
}

// Heuristic to parse variant names like "Starlight, 128GB"
const parseVariantName = (name: string) => {
  const parts = name.split(",").map((p) => p.trim());
  return {
    colorName: parts[0],
    otherOption: parts[1] || null,
  };
};

export function ProductVariantSelectors({
  variants,
  selectedVariant,
  onVariantChange,
}: ProductVariantSelectorsProps) {
  const { colorName: selectedColorName, otherOption: selectedOtherOptionName } =
    parseVariantName(selectedVariant.name);

  const colorOptions = useMemo(() => {
    const colors = new Map<string, { name: string; hex: string }>();
    variants.forEach((v) => {
      if (v.color_hex) {
        const { colorName } = parseVariantName(v.name);
        if (!colors.has(colorName)) {
          colors.set(colorName, { name: colorName, hex: v.color_hex });
        }
      }
    });
    return Array.from(colors.values());
  }, [variants]);

  const otherOptions = useMemo(() => {
    const options = new Set<string>();
    variants.forEach((v) => {
      const { otherOption } = parseVariantName(v.name);
      if (otherOption) {
        options.add(otherOption);
      }
    });
    return Array.from(options.values());
  }, [variants]);

  const handleColorSelect = (colorName: string) => {
    // Find the first variant that matches the new color and the current other option
    const newVariant = variants.find((v) => {
      const {
        colorName: vColor,
        otherOption: vOther,
      } = parseVariantName(v.name);
      return vColor === colorName && vOther === selectedOtherOptionName;
    });
    // If no direct match, find the first variant with the new color
    if (newVariant) {
      onVariantChange(newVariant);
    } else {
      const firstAvailable = variants.find(v => parseVariantName(v.name).colorName === colorName);
      if (firstAvailable) onVariantChange(firstAvailable);
    }
  };

  const handleOtherOptionSelect = (otherOption: string) => {
    const newVariant = variants.find((v) => {
       const {
        colorName: vColor,
        otherOption: vOther,
      } = parseVariantName(v.name);
      return vColor === selectedColorName && vOther === otherOption;
    });
    if (newVariant) {
      onVariantChange(newVariant);
    }
  };

  if (variants.length <= 1) return null;

  return (
    <>
      {colorOptions.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold">Color</h3>
          <div className="mt-2 flex flex-wrap gap-2">
            {colorOptions.map(({ name, hex }) => (
              <button
                key={name}
                onClick={() => handleColorSelect(name)}
                title={name}
                className={cn(
                  "h-8 w-8 rounded-full border-2 transition-transform duration-100 ease-in-out hover:scale-110 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                  name === selectedColorName
                    ? "border-primary scale-110"
                    : "border-border"
                )}
                style={{ backgroundColor: hex }}
              />
            ))}
          </div>
        </div>
      )}

      {otherOptions.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold">{otherOptions.some(o => o.includes('GB')) ? 'Storage' : 'Size'}</h3>
          <div className="mt-2 flex flex-wrap gap-2">
            {otherOptions.map((option) => (
              <button
                key={option}
                onClick={() => handleOtherOptionSelect(option)}
                className={cn(
                    "rounded-md border px-4 py-2 text-sm font-medium transition-colors",
                    option === selectedOtherOptionName
                      ? "border-primary bg-primary text-primary-foreground"
                      : "bg-transparent hover:bg-accent hover:text-accent-foreground"
                )}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
