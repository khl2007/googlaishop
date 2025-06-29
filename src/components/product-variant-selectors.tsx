
"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import type { Product, ProductVariant } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ProductVariantSelectorsProps {
  product: Product;
  selectedVariant: ProductVariant;
  onVariantChange: (variant: ProductVariant) => void;
}

interface OptionGroup {
  name: string;
  options: {
    value: string;
    image?: string;
    color_hex?: string;
  }[];
}

export function ProductVariantSelectors({
  product,
  selectedVariant,
  onVariantChange,
}: ProductVariantSelectorsProps) {

  const { variants, optionGroups: optionGroupsJSON } = product;
  const optionGroups: OptionGroup[] = useMemo(() => {
    try {
      return optionGroupsJSON ? JSON.parse(optionGroupsJSON) : [];
    } catch (e) {
      console.error("Failed to parse optionGroups JSON:", optionGroupsJSON);
      return [];
    }
  }, [optionGroupsJSON]);

  const getOptionsFromVariant = useCallback((variant: ProductVariant) => {
    try {
      if (typeof variant.options === 'string') {
        return JSON.parse(variant.options);
      }
      return variant.options || {};
    } catch {
      return {};
    }
  }, []);

  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(() => getOptionsFromVariant(selectedVariant));

  useEffect(() => {
    setSelectedOptions(getOptionsFromVariant(selectedVariant));
  }, [selectedVariant, getOptionsFromVariant]);

  const handleOptionSelect = (groupName: string, value: string) => {
    const newSelectedOptions = { ...selectedOptions, [groupName]: value };
    
    // Find a variant that is the best match for the new selection
    let bestMatch: ProductVariant | undefined;
    let maxMatchCount = -1;

    for (const variant of variants) {
        const variantOptions = getOptionsFromVariant(variant);
        let currentMatchCount = 0;
        
        for (const group of optionGroups) {
            if (variantOptions[group.name] === newSelectedOptions[group.name]) {
                currentMatchCount++;
            }
        }

        if (currentMatchCount > maxMatchCount) {
            maxMatchCount = currentMatchCount;
            bestMatch = variant;
        }
    }

    if (bestMatch) {
      onVariantChange(bestMatch);
    }
  };
  
  if (variants.length <= 1 || optionGroups.length === 0) return null;

  return (
    <>
      {optionGroups.map((group) => (
        <div key={group.name}>
          <h3 className="text-lg font-semibold">{group.name}</h3>
          <div className="mt-2">
            {group.name.toLowerCase() === 'color' ? (
              <div className="flex flex-wrap gap-2">
                {group.options.map((option) => {
                  const isSelected = selectedOptions[group.name] === option.value;
                  const hex = option.color_hex;

                  if (hex) {
                    return (
                      <button
                        key={option.value}
                        onClick={() => handleOptionSelect(group.name, option.value)}
                        title={option.value}
                        className={cn(
                          "h-8 w-8 rounded-full border-2 transition-transform duration-100 ease-in-out hover:scale-110 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                          isSelected
                            ? "border-primary scale-110"
                            : "border-border"
                        )}
                        style={{ backgroundColor: hex }}
                      />
                    );
                  }

                  // Fallback for non-hex colors
                  return (
                    <button
                      key={option.value}
                      onClick={() => handleOptionSelect(group.name, option.value)}
                      className={cn(
                        "rounded-md border px-4 py-2 text-sm font-medium transition-colors",
                        isSelected
                          ? "border-primary bg-primary text-primary-foreground"
                          : "bg-transparent hover:bg-accent hover:text-accent-foreground"
                      )}
                    >
                      {option.value}
                    </button>
                  );
                })}
              </div>
            ) : (
              <Select
                onValueChange={(value) => handleOptionSelect(group.name, value)}
                value={selectedOptions[group.name]}
              >
                <SelectTrigger>
                  <SelectValue placeholder={`Select a ${group.name.toLowerCase()}`} />
                </SelectTrigger>
                <SelectContent>
                  {group.options.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>
      ))}
    </>
  );
}
