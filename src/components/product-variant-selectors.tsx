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

export function ProductVariantSelectors({
  product,
  selectedVariant,
  onVariantChange,
}: ProductVariantSelectorsProps) {

  const { variants, optionGroups: optionGroupsJSON } = product;
  const optionGroupNames: string[] = useMemo(() => {
    try {
      return optionGroupsJSON ? JSON.parse(optionGroupsJSON) : [];
    } catch (e) {
      console.error("Failed to parse optionGroups JSON:", optionGroupsJSON);
      return [];
    }
  }, [optionGroupsJSON]);

  const getOptionsFromVariant = useCallback((variant: ProductVariant) => {
    const options: Record<string, string> = {};
    const values = variant.name.split(",").map(v => v.trim());
    optionGroupNames.forEach((groupName, index) => {
      if (values[index]) {
        options[groupName] = values[index];
      }
    });
    return options;
  }, [optionGroupNames]);

  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(() => getOptionsFromVariant(selectedVariant));

  useEffect(() => {
    setSelectedOptions(getOptionsFromVariant(selectedVariant));
  }, [selectedVariant, getOptionsFromVariant]);

  const allOptions = useMemo(() => {
    if (optionGroupNames.length === 0) return [];
    
    const groups = new Map<string, { name: string; values: Set<string> }>();
    optionGroupNames.forEach(groupName => {
      groups.set(groupName, { name: groupName, values: new Set() });
    });

    variants.forEach(variant => {
      const variantOptions = getOptionsFromVariant(variant);
      optionGroupNames.forEach((groupName) => {
        if (variantOptions[groupName]) {
          groups.get(groupName)?.values.add(variantOptions[groupName]);
        }
      });
    });

    return Array.from(groups.values()).map(g => ({ ...g, values: Array.from(g.values) }));
  }, [variants, optionGroupNames, getOptionsFromVariant]);


  const handleOptionSelect = (groupName: string, value: string) => {
    const newSelectedOptions = { ...selectedOptions, [groupName]: value };
    
    // Find a variant that is the best match for the new selection
    let bestMatch: ProductVariant | undefined;
    let maxMatchCount = -1;

    for (const variant of variants) {
        const variantOptions = getOptionsFromVariant(variant);
        let currentMatchCount = 0;
        for (const group of optionGroupNames) {
            if (variantOptions[group] === newSelectedOptions[group]) {
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
  
  if (variants.length <= 1 || allOptions.length === 0) return null;

  return (
    <>
      {allOptions.map((group) => (
        <div key={group.name}>
          <h3 className="text-lg font-semibold">{group.name}</h3>
          <div className="mt-2">
            {group.name.toLowerCase() === 'color' ? (
              <div className="flex flex-wrap gap-2">
                {group.values.map((value) => {
                  const isSelected = selectedOptions[group.name] === value;
                  const variantForColor = variants.find(
                    v => getOptionsFromVariant(v)[group.name] === value && v.color_hex
                  );
                  const hex = variantForColor?.color_hex;

                  if (hex) {
                    return (
                      <button
                        key={value}
                        onClick={() => handleOptionSelect(group.name, value)}
                        title={value}
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

                  // Default button for other option types
                  return (
                    <button
                      key={value}
                      onClick={() => handleOptionSelect(group.name, value)}
                      className={cn(
                        "rounded-md border px-4 py-2 text-sm font-medium transition-colors",
                        isSelected
                          ? "border-primary bg-primary text-primary-foreground"
                          : "bg-transparent hover:bg-accent hover:text-accent-foreground"
                      )}
                    >
                      {value}
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
                  {group.values.map((value) => (
                    <SelectItem key={value} value={value}>
                      {value}
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
