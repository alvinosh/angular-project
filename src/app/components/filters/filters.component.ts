import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface SortState {
  by: 'title' | 'price' | 'rating' | 'creationDate';
  order: 'ASC' | 'DESC';
}

export interface FilterState {
  title: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  maxRating?: number;
  tags: string[];
}

export type FiltersChangeEvent =
  | { type: 'sort'; value: SortState }
  | { type: 'title'; value: string }
  | { type: 'minPrice'; value: number | undefined }
  | { type: 'maxPrice'; value: number | undefined }
  | { type: 'minRating'; value: number | undefined }
  | { type: 'maxRating'; value: number | undefined }
  | { type: 'tagAdd'; value: string }
  | { type: 'tagRemove'; value: string }
  | { type: 'clear' };

@Component({
  selector: 'app-filters',
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './filters.component.html',
  host: {
    class: 'block',
  },
})
export class FiltersComponent {
  // Consolidated inputs
  sort = input<SortState>({ by: 'title', order: 'ASC' });
  filters = input<FilterState>({ title: '', tags: [] });
  showFilters = input(false);

  // Consolidated outputs
  filtersChange = output<FiltersChangeEvent>();
  showFiltersToggle = output<void>();

  onSortChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    const newSort: SortState = {
      by: target.value as 'title' | 'price' | 'rating' | 'creationDate',
      order: this.sort().order,
    };
    this.filtersChange.emit({ type: 'sort', value: newSort });
  }

  onSortOrderToggle() {
    const currentSort = this.sort();
    const newSort: SortState = {
      by: currentSort.by,
      order: currentSort.order === 'ASC' ? 'DESC' : 'ASC',
    };
    this.filtersChange.emit({ type: 'sort', value: newSort });
  }

  onShowFiltersToggle() {
    this.showFiltersToggle.emit();
  }

  onTitleFilterChange(event: Event) {
    const target = event.target as HTMLInputElement;
    this.filtersChange.emit({ type: 'title', value: target.value });
  }

  onMinPriceChange(event: Event) {
    const target = event.target as HTMLInputElement;
    const value = target.value;
    const numValue = parseInt(value, 10);
    if (value === '' || (Number.isInteger(numValue) && numValue > 0)) {
      this.filtersChange.emit({ type: 'minPrice', value: value === '' ? undefined : numValue });
    } else {
      // Invalid input: clear the filter and reset the input
      this.filtersChange.emit({ type: 'minPrice', value: undefined });
      target.value = '';
    }
  }

  onMaxPriceChange(event: Event) {
    const target = event.target as HTMLInputElement;
    const value = target.value;
    const numValue = parseInt(value, 10);
    if (value === '' || (Number.isInteger(numValue) && numValue > 0)) {
      this.filtersChange.emit({ type: 'maxPrice', value: value === '' ? undefined : numValue });
    } else {
      // Invalid input: clear the filter and reset the input
      this.filtersChange.emit({ type: 'maxPrice', value: undefined });
      target.value = '';
    }
  }

  onMinRatingChange(event: Event) {
    const target = event.target as HTMLInputElement;
    const value = target.value;
    const numValue = parseFloat(value);
    if (value === '' || (!isNaN(numValue) && numValue >= 0 && numValue <= 5)) {
      this.filtersChange.emit({ type: 'minRating', value: value === '' ? undefined : numValue });
    } else {
      // Invalid input: clear the filter and reset the input
      this.filtersChange.emit({ type: 'minRating', value: undefined });
      target.value = '';
    }
  }

  onMaxRatingChange(event: Event) {
    const target = event.target as HTMLInputElement;
    const value = target.value;
    const numValue = parseFloat(value);
    if (value === '' || (!isNaN(numValue) && numValue >= 0 && numValue <= 5)) {
      this.filtersChange.emit({ type: 'maxRating', value: value === '' ? undefined : numValue });
    } else {
      // Invalid input: clear the filter and reset the input
      this.filtersChange.emit({ type: 'maxRating', value: undefined });
      target.value = '';
    }
  }

  onTagInput(event: Event) {
    const target = event.target as HTMLInputElement;
    const value = target.value;

    // If user types comma or enters, add the tag
    if (value.includes(',')) {
      const parts = value.split(',');
      const newTag = parts[0].trim();
      if (newTag) {
        this.filtersChange.emit({ type: 'tagAdd', value: newTag });
      }
      target.value = parts.slice(1).join(',').trim();
    }
  }

  onTagKeydown(event: KeyboardEvent) {
    const target = event.target as HTMLInputElement;

    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      const value = target.value.trim();
      if (value) {
        this.filtersChange.emit({ type: 'tagAdd', value });
        target.value = '';
      }
    } else if (event.key === 'Backspace' && !target.value) {
      // Remove last tag when backspacing on empty input
      const currentTags = this.filters().tags;
      if (currentTags.length > 0) {
        this.filtersChange.emit({ type: 'tagRemove', value: currentTags[currentTags.length - 1] });
      }
    }
  }

  onFilterKeydown(event: KeyboardEvent, _filterType: string) {
    void _filterType; // Unused parameter, can be used for specific filter handling if needed

    // Allow normal typing and navigation
    if (
      event.key.length === 1 || // Regular characters
      event.key === 'Backspace' ||
      event.key === 'Delete' ||
      event.key === 'ArrowLeft' ||
      event.key === 'ArrowRight' ||
      event.key === 'ArrowUp' ||
      event.key === 'ArrowDown' ||
      event.key === 'Home' ||
      event.key === 'End' ||
      event.key === 'Tab' ||
      (event.ctrlKey && (event.key === 'a' || event.key === 'A')) || // Ctrl+A
      (event.ctrlKey && (event.key === 'c' || event.key === 'C')) || // Ctrl+C
      (event.ctrlKey && (event.key === 'v' || event.key === 'V')) || // Ctrl+V
      (event.ctrlKey && (event.key === 'x' || event.key === 'X'))
    ) {
      // Ctrl+X
      return; // Allow these keys
    }

    // Handle Escape key to clear all filters
    if (event.key === 'Escape') {
      event.preventDefault();
      this.filtersChange.emit({ type: 'clear' });
      return;
    }
  }

  onClearFilters() {
    this.filtersChange.emit({ type: 'clear' });
  }

  onRemoveTag(tag: string) {
    this.filtersChange.emit({ type: 'tagRemove', value: tag });
  }

  getSortAriaLabel() {
    return this.sort().order === 'ASC' ? $localize`Sort ascending` : $localize`Sort descending`;
  }

  getShowFiltersAriaLabel() {
    return this.showFilters() ? $localize`Hide filters` : $localize`Show filters`;
  }

  getShowFiltersText() {
    return this.showFilters() ? $localize`Hide Filters` : $localize`Show Filters`;
  }

  getRemoveTagAriaLabel(tag: string) {
    return $localize`Remove ${tag} tag`;
  }
}
