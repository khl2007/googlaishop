
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { Button } from "./ui/button";


interface ProductVariantSelectorsProps {
  product: Product;
  selectedVariant: ProductVariant;
  onVariantChange: (variant: ProductVariant) => void;
}

interface Option {
  value: string;
  image?: string;
  color_hex?: string;
}

interface OptionGroup {
  type: 'default' | 'color' | 'gender';
  name: string;
  options: Option[];
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
    
    let bestMatch: ProductVariant | undefined;
    let maxMatchCount = -1;

    for (const variant of variants) {
        const variantOptions = getOptionsFromVariant(variant);
        let currentMatchCount = 0;
        
        if (variantOptions[groupName] !== value) continue;

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

  const isOptionAvailable = useCallback((groupName: string, optionValue: string) => {
    return variants.some(variant => {
      const vOptions = getOptionsFromVariant(variant);
      if (vOptions[groupName] !== optionValue) {
        return false;
      }
      return optionGroups.every(otherGroup => {
        if (otherGroup.name === groupName) return true;
        const otherSelectedValue = selectedOptions[otherGroup.name];
        return !otherSelectedValue || otherSelectedValue === vOptions[otherGroup.name];
      });
    });
  }, [variants, optionGroups, selectedOptions, getOptionsFromVariant]);
  
  if (variants.length <= 1 || optionGroups.length === 0) return null;

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {optionGroups.map((group) => (
          <div key={group.name} className="space-y-2">
            <h3 className="text-lg font-semibold">{group.name}</h3>
            <div>
              {group.type === 'color' ? (
                <div className="flex flex-wrap items-center gap-2">
                  {group.options.map((option) => {
                    if (!option.value) return null;
                    const isSelected = selectedOptions[group.name] === option.value;
                    const hex = option.color_hex;
                    const available = isOptionAvailable(group.name, option.value);

                    const button = (
                      <button
                          key={option.value}
                          type="button"
                          onClick={() => handleOptionSelect(group.name, option.value)}
                          disabled={!available}
                          className={cn(
                            "relative h-8 w-8 rounded-full border-2 transition-transform duration-100 ease-in-out focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                            isSelected
                              ? "border-primary scale-110"
                              : "border-border",
                            available ? "hover:scale-110 cursor-pointer" : "opacity-50 cursor-not-allowed",
                            !available && "after:absolute after:inset-0 after:block after:h-full after:w-px after:rotate-45 after:transform after:bg-muted-foreground after:content-[''] after:[transform-origin:center] after:left-1/2 after:-translate-x-1/2"
                          )}
                          style={hex ? { backgroundColor: hex } : {}}
                        />
                    );

                    return (
                      <Tooltip key={option.value} delayDuration={100}>
                          <TooltipTrigger asChild>{button}</TooltipTrigger>
                          <TooltipContent>
                            <p>{option.value}</p>
                          </TooltipContent>
                        </Tooltip>
                    );
                  })}
                </div>
              ) : group.type === 'gender' ? (
                 <div className="flex flex-wrap items-center gap-2">
                  {group.options.map((option) => {
                    if (!option.value) return null;
                    const isSelected = selectedOptions[group.name] === option.value;
                    const available = isOptionAvailable(group.name, option.value);
                    return (
                       <Button
                        key={option.value}
                        variant={isSelected ? 'default' : 'outline'}
                        onClick={() => handleOptionSelect(group.name, option.value)}
                        disabled={!available}
                       >
                         {option.value}
                       </Button>
                    )
                  })}
                 </div>
              ) : ( // Default type
                <Select
                  onValueChange={(value) => handleOptionSelect(group.name, value)}
                  value={selectedOptions[group.name]}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={`Select a ${group.name.toLowerCase()}`} />
                  </SelectTrigger>
                  <SelectContent>
                    {group.options.map((option) => {
                      if (!option.value) return null;
                      return (
                          <SelectItem key={option.value} value={option.value} disabled={!isOptionAvailable(group.name, option.value)}>
                            {option.value}
                          </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
        ))}
      </div>
    </TooltipProvider>
  );
}
