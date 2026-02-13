import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TripsService } from '../../services/trips.service';
import { Trip } from '../../models/trip.model';
import { TripCardComponent } from '../../components/trip-card/trip-card.component';
import {
  FiltersComponent,
  SortState,
  FilterState,
  FiltersChangeEvent,
} from '../../components/filters/filters.component';
import { PaginationComponent } from '../../components/pagination/pagination.component';

@Component({
  selector: 'app-home',
  imports: [CommonModule, TripCardComponent, FiltersComponent, PaginationComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './home.component.html',
  host: {
    class: 'block',
  },
})
export class HomeComponent {
  private readonly tripsService = inject(TripsService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  // Expose service for template access
  readonly tripsServicePublic = this.tripsService;

  // Core state signals
  trips = signal<Trip[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  // Sorting signals
  sortBy = signal<'title' | 'price' | 'rating' | 'creationDate'>('title');
  sortOrder = signal<'ASC' | 'DESC'>('ASC');

  // Pagination signals
  currentPage = signal(1);
  total = signal(0);
  limit = signal(12);
  goToPageInput = signal('');

  // Filter signals
  titleFilter = signal('');
  minPrice = signal<number | undefined>(undefined);
  maxPrice = signal<number | undefined>(undefined);
  minRating = signal<number | undefined>(undefined);
  maxRating = signal<number | undefined>(undefined);

  // UI state signals
  showFilters = signal(false);
  tripOfTheDay = signal<Trip | null>(null);
  tagsArray = signal<string[]>([]);

  // Computed signals for derived state
  displayedTrips = computed(() => this.trips());
  totalPages = computed(() => Math.ceil(this.total() / this.limit()));
  tagsFilter = computed(() => this.tagsArray().join(', '));
  hasActiveFilters = computed(() => {
    return !!(
      this.titleFilter() ||
      this.minPrice() !== undefined ||
      this.maxPrice() !== undefined ||
      this.minRating() !== undefined ||
      this.maxRating() !== undefined ||
      this.tagsArray().length > 0
    );
  });

  // Current query params as computed signal
  currentQueryParams = computed(() => ({
    sortBy: this.sortBy(),
    sortOrder: this.sortOrder(),
    page: this.currentPage(),
    titleFilter: this.titleFilter() || undefined,
    minPrice: this.minPrice(),
    maxPrice: this.maxPrice(),
    minRating: this.minRating(),
    maxRating: this.maxRating(),
    tags: this.tagsFilter() || undefined,
  }));

  // Consolidated inputs for filters component
  currentSort = computed<SortState>(() => ({
    by: this.sortBy(),
    order: this.sortOrder(),
  }));

  currentFilters = computed<FilterState>(() => ({
    title: this.titleFilter(),
    minPrice: this.minPrice(),
    maxPrice: this.maxPrice(),
    minRating: this.minRating(),
    maxRating: this.maxRating(),
    tags: this.tagsArray(),
  }));

  constructor() {
    // Initialize state from URL params ONCE (not in an effect to avoid circular dependency)
    const initialParams = this.route.snapshot.queryParams;
    if (initialParams['sortBy']) {
      this.sortBy.set(initialParams['sortBy'] as 'title' | 'price' | 'rating' | 'creationDate');
    }
    if (initialParams['sortOrder']) {
      this.sortOrder.set(initialParams['sortOrder'] as 'ASC' | 'DESC');
    }
    if (initialParams['page']) {
      this.currentPage.set(+initialParams['page']);
    }
    if (initialParams['titleFilter']) {
      this.titleFilter.set(initialParams['titleFilter']);
    }
    if (initialParams['minPrice']) {
      this.minPrice.set(+initialParams['minPrice']);
    }
    if (initialParams['maxPrice']) {
      this.maxPrice.set(+initialParams['maxPrice']);
    }
    if (initialParams['minRating']) {
      this.minRating.set(+initialParams['minRating']);
    }
    if (initialParams['maxRating']) {
      this.maxRating.set(+initialParams['maxRating']);
    }
    if (initialParams['tags']) {
      const tags = initialParams['tags']
        .split(',')
        .map((tag: string) => tag.trim())
        .filter((tag: string) => tag.length > 0);
      this.tagsArray.set(tags);
    }

    // Show filters if there are active filters from URL
    if (this.hasActiveFilters()) {
      this.showFilters.set(true);
    }

    // Single effect to sync state -> URL (one direction only)
    effect(() => {
      const params = this.currentQueryParams();
      const queryParams: Record<string, string | number | null> = {};

      // Always set sortBy and sortOrder (required params)
      queryParams['sortBy'] = params.sortBy;
      queryParams['sortOrder'] = params.sortOrder;
      queryParams['page'] = params.page;

      // Set optional params or null to remove them
      queryParams['titleFilter'] = params.titleFilter || null;
      queryParams['minPrice'] = params.minPrice ?? null;
      queryParams['maxPrice'] = params.maxPrice ?? null;
      queryParams['minRating'] = params.minRating ?? null;
      queryParams['maxRating'] = params.maxRating ?? null;
      queryParams['tags'] = params.tags || null;

      this.router.navigate([], {
        queryParams,
        replaceUrl: true,
      });
    });

    // Initial load
    this.loadTrips();
    this.loadTripOfTheDay();
  }

  loadTrips() {
    this.loading.set(true);
    this.error.set(null);

    const params = this.currentQueryParams();
    this.tripsService.getTrips(params).subscribe({
      next: (response) => {
        this.trips.set(response.items);
        this.total.set(response.total);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load trips');
        this.loading.set(false);
        console.error(err);
      },
    });
  }

  clearCache() {
    this.tripsService.clearAllCache();
    this.loadTrips(); // Reload data after clearing cache
  }

  getTripOfTheDay() {
    if (this.tripOfTheDay()) {
      this.navigateToDetail(this.tripOfTheDay()!.id);
    } else {
      this.loadTripOfTheDay();
    }
  }

  loadTripOfTheDay() {
    const today = new Date().toDateString();
    const stored = localStorage.getItem('tripOfTheDay');
    if (stored) {
      const { date, trip } = JSON.parse(stored);
      if (date === today) {
        this.tripOfTheDay.set(trip);
        return;
      }
    }
    // Load more trips for better selection
    this.tripsService.getTrips({ page: 1, limit: 50 }).subscribe({
      next: (response) => {
        if (response.items.length > 0) {
          const randomTrip = response.items[Math.floor(Math.random() * response.items.length)];
          this.tripOfTheDay.set(randomTrip);
          localStorage.setItem('tripOfTheDay', JSON.stringify({ date: today, trip: randomTrip }));
        }
      },
      error: (err) => {
        console.error('Failed to load trips for trip of the day', err);
      },
    });
  }

  navigateToDetail(id: string) {
    this.router.navigate(['/trip', id], {
      queryParamsHandling: 'preserve',
    });
  }

  // Event handlers for FiltersComponent
  onFiltersChange(event: FiltersChangeEvent) {
    switch (event.type) {
      case 'sort':
        this.sortBy.set(event.value.by);
        this.sortOrder.set(event.value.order);
        this.currentPage.set(1);
        this.loadTrips();
        break;
      case 'title':
        this.titleFilter.set(event.value);
        this.currentPage.set(1);
        this.loadTrips();
        break;
      case 'minPrice':
        this.minPrice.set(event.value);
        this.currentPage.set(1);
        this.loadTrips();
        break;
      case 'maxPrice':
        this.maxPrice.set(event.value);
        this.currentPage.set(1);
        this.loadTrips();
        break;
      case 'minRating':
        this.minRating.set(event.value);
        this.currentPage.set(1);
        this.loadTrips();
        break;
      case 'maxRating':
        this.maxRating.set(event.value);
        this.currentPage.set(1);
        this.loadTrips();
        break;
      case 'tagAdd': {
        const trimmedTag = event.value.trim();
        if (trimmedTag && !this.tagsArray().includes(trimmedTag)) {
          this.tagsArray.update((tags) => [...tags, trimmedTag]);
          this.currentPage.set(1);
          this.loadTrips();
        }
        break;
      }
      case 'tagRemove':
        this.tagsArray.update((tags) => tags.filter((tag) => tag !== event.value));
        this.currentPage.set(1);
        this.loadTrips();
        break;
      case 'clear':
        this.titleFilter.set('');
        this.minPrice.set(undefined);
        this.maxPrice.set(undefined);
        this.minRating.set(undefined);
        this.maxRating.set(undefined);
        this.tagsArray.set([]);
        this.currentPage.set(1);
        this.loadTrips();
        break;
    }
  }

  // Event handler for show filters toggle
  onShowFiltersToggle() {
    this.showFilters.update((show) => !show);
  }

  // Event handlers for PaginationComponent
  onPreviousPage() {
    if (this.currentPage() > 1) {
      this.currentPage.update((p) => p - 1);
      this.loadTrips();
    }
  }

  onNextPage() {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update((p) => p + 1);
      this.loadTrips();
    }
  }

  onGoToPageInputChange(value: string) {
    this.goToPageInput.set(value);
  }

  onGoToPage() {
    const page = parseInt(this.goToPageInput(), 10);
    if (page >= 1 && page <= this.totalPages() && page !== this.currentPage()) {
      this.currentPage.set(page);
      this.goToPageInput.set(''); // Clear input
      this.loadTrips();
    }
  }

  getTripAlt(trip: Trip) {
    return $localize`Image of ${trip.title}`;
  }
}
