import React from 'react';
import { FoodCategory, FoodDietaryType } from '../../types';
import { Search, Filter, SlidersHorizontal, LayoutGrid, List, Map, X, RotateCcw } from 'lucide-react';
import { LocationPicker } from '../map/LocationPicker';

export interface FilterState {
  searchQuery: string;
  category: string;
  foodType: string;
  quantityRange: 'all' | 'small' | 'medium' | 'large';
  sortBy: 'distance' | 'newest' | 'deadline';
  statusFilter: string;
}

interface FilterPanelProps {
  filters: FilterState;
  onFilterChange: (newFilters: FilterState) => void;
  viewMode: 'grid' | 'list' | 'map';
  onViewModeChange: (mode: 'grid' | 'list' | 'map') => void;
  totalResults: number;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  onFilterChange,
  viewMode,
  onViewModeChange,
  totalResults,
}) => {
  const categories: (FoodCategory | 'All')[] = [
    'All',
    'Cooked Meals',
    'Fresh Fruits',
    'Vegetables',
    'Bakery',
    'Packaged Food',
    'Dairy & Refrigerated',
  ];

  const dietaryTypes: ('All' | FoodDietaryType)[] = [
    'All',
    'Vegetarian',
    'Non-Vegetarian',
    'Vegan',
  ];

  const handleReset = () => {
    onFilterChange({
      searchQuery: '',
      category: 'All',
      foodType: 'All',
      quantityRange: 'all',
      sortBy: 'distance',
      statusFilter: 'all',
    });
  };

  const hasActiveFilters =
    filters.searchQuery ||
    filters.category !== 'All' ||
    filters.foodType !== 'All' ||
    filters.quantityRange !== 'all' ||
    filters.sortBy !== 'distance';

  return (
    <div className="bg-white rounded-2xl border border-[#E5EAE7] p-4 sm:p-5 shadow-xs space-y-4">
      {/* Top Search & View Switcher Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#8E9F96] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={filters.searchQuery}
            onChange={(e) => onFilterChange({ ...filters, searchQuery: e.target.value })}
            placeholder="Search by food name, description, or ingredient..."
            className="w-full pl-10 pr-9 py-2.5 bg-[#F8F8F2] border border-[#E5EAE7] rounded-xl text-xs sm:text-sm text-[#25312B] placeholder-[#8E9F96] focus:outline-none focus:ring-2 focus:ring-[#245C45]/20 focus:border-[#245C45]"
          />
          {filters.searchQuery && (
            <button
              onClick={() => onFilterChange({ ...filters, searchQuery: '' })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8E9F96] hover:text-[#25312B]"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* View Mode Toggle & Sort */}
        <div className="flex items-center gap-2 shrink-0">
          <select
            value={filters.sortBy}
            onChange={(e) => onFilterChange({ ...filters, sortBy: e.target.value as any })}
            className="px-3 py-2.5 bg-[#F8F8F2] border border-[#E5EAE7] rounded-xl text-xs font-semibold text-[#25312B] focus:outline-none focus:ring-2 focus:ring-[#245C45]/20 cursor-pointer"
          >
            <option value="distance">Sort by: Nearest Distance</option>
            <option value="newest">Sort by: Newest Listings</option>
            <option value="deadline">Sort by: Pickup Deadline</option>
          </select>

          {/* Grid / List / Map switch */}
          <div className="flex items-center bg-[#F8F8F2] border border-[#E5EAE7] rounded-xl p-1">
            <button
              onClick={() => onViewModeChange('grid')}
              className={`p-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'grid'
                  ? 'bg-white text-[#245C45] shadow-xs'
                  : 'text-[#8E9F96] hover:text-[#25312B]'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => onViewModeChange('list')}
              className={`p-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'list'
                  ? 'bg-white text-[#245C45] shadow-xs'
                  : 'text-[#8E9F96] hover:text-[#25312B]'
              }`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => onViewModeChange('map')}
              className={`p-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'map'
                  ? 'bg-white text-[#245C45] shadow-xs'
                  : 'text-[#8E9F96] hover:text-[#25312B]'
              }`}
              title="Map View"
            >
              <Map className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Categories & Dietary Pills */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2 border-t border-[#F8F8F2]">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 w-full sm:w-auto">
          <span className="text-[11px] font-bold text-[#8E9F96] uppercase tracking-wider mr-1 shrink-0">
            Category:
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => onFilterChange({ ...filters, category: cat })}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                filters.category === cat
                  ? 'bg-[#245C45] text-white shadow-xs'
                  : 'bg-[#F8F8F2] text-[#53645B] hover:text-[#25312B] hover:bg-[#EBF5ED]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Dietary Type */}
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-[11px] font-bold text-[#8E9F96] uppercase tracking-wider mr-1">
            Diet:
          </span>
          {dietaryTypes.map((type) => (
            <button
              key={type}
              onClick={() => onFilterChange({ ...filters, foodType: type })}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                filters.foodType === type
                  ? 'bg-[#6FAF78] text-white'
                  : 'bg-[#F8F8F2] text-[#53645B] hover:text-[#25312B]'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Status & Results Summary Bar */}
      <div className="flex items-center justify-between text-xs text-[#53645B] pt-2 border-t border-[#F8F8F2]">
        <div className="flex items-center gap-2">
          <span>
            Found <strong className="text-[#25312B]">{totalResults}</strong> donation listings
          </span>
          {hasActiveFilters && (
            <button
              onClick={handleReset}
              className="text-[#245C45] font-semibold hover:underline flex items-center gap-1 ml-2"
            >
              <RotateCcw className="w-3 h-3" /> Reset Filters
            </button>
          )}
        </div>

        <div className="hidden sm:flex items-center gap-2">
          <span className="text-[#8E9F96]">Quantity:</span>
          {(['all', 'small', 'medium', 'large'] as const).map((q) => (
            <button
              key={q}
              onClick={() => onFilterChange({ ...filters, quantityRange: q })}
              className={`capitalize px-2 py-0.5 rounded text-[11px] font-semibold ${
                filters.quantityRange === q ? 'bg-[#245C45] text-white' : 'hover:text-[#25312B]'
              }`}
            >
              {q === 'all' ? 'All' : q === 'small' ? '<25 meals' : q === 'medium' ? '25-50' : '50+ meals'}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
