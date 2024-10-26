import React from "react";
import { Button } from "@/components/ui/button";

interface Category {
  id: string;
  name: string;
}

interface CategoryButtonsProps {
  categories: Category[];
  selectedCategories: string[];
  onCategoryChange: (categoryId: string, checked: boolean) => void;
}

const CategoryButtons: React.FC<CategoryButtonsProps> = ({
  categories,
  selectedCategories,
  onCategoryChange,
}) => {
  return (
    <div className="flex flex-wrap gap-2 justify-center mt-4">
      {categories.map((category) => {
        const isSelected = selectedCategories.includes(category.id);
        return (
          <Button
            key={category.id}
            variant={isSelected ? "default" : "outline"}
            onClick={() => onCategoryChange(category.id, !isSelected)}
            className={`
              text-sm transition-all duration-200 ease-in-out rounded-full px-4 py-2
              ${
                isSelected
                  ? "bg-gray-700 text-white hover:bg-gray-600"
                  : "bg-gray-800/70 text-gray-200 hover:bg-gray-700/80 border-gray-600"
              }
            `}
          >
            {category.name}
          </Button>
        );
      })}
    </div>
  );
};

export default CategoryButtons;
