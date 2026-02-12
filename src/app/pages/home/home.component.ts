import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TripsService } from '../../services/trips.service';
import { Trip } from '../../models/trip.model';
import { TripCardComponent } from '../../components/trip-card/trip-card.component';
import { FiltersComponent, SortState, FilterState, FiltersChangeEvent } from '../../components/filters/filters.component';
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
export class HomeComponent implements OnInit {
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
    order: this.sortOrder()
  }));

  currentFilters = computed<FilterState>(() => ({
    title: this.titleFilter(),
    minPrice: this.minPrice(),
    maxPrice: this.maxPrice(),
    minRating: this.minRating(),
    maxRating: this.maxRating(),
    tags: this.tagsArray()
  }));

  constructor() {
    // Effect to update URL when state changes
    effect(() => {
      const params = this.currentQueryParams();
      const queryParams: Record<string, string | number | boolean | undefined> = {
        sortBy: params.sortBy,
        sortOrder: params.sortOrder,
        page: params.page,
        titleFilter: params.titleFilter,
        minPrice: params.minPrice,
        maxPrice: params.maxPrice,
        minRating: params.minRating,
        maxRating: params.maxRating,
        tags: params.tags,
      };

      this.router.navigate([], {
        queryParams,
        queryParamsHandling: 'merge',
      });
    });
  }

  ngOnInit() {
    // Initialize state from URL params
    this.route.queryParams.subscribe((params) => {
      if (params['sortBy']) {
        this.sortBy.set(params['sortBy']);
      }
      if (params['sortOrder']) {
        this.sortOrder.set(params['sortOrder']);
      }
      if (params['page']) {
        this.currentPage.set(+params['page']);
      }
      if (params['titleFilter']) {
        this.titleFilter.set(params['titleFilter']);
      }
      if (params['minPrice']) {
        this.minPrice.set(+params['minPrice']);
      }
      if (params['maxPrice']) {
        this.maxPrice.set(+params['maxPrice']);
      }
      if (params['minRating']) {
        this.minRating.set(+params['minRating']);
      }
      if (params['maxRating']) {
        this.maxRating.set(+params['maxRating']);
      }
      if (params['tags']) {
        this.tagsArray.set(params['tags'].split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag.length > 0));
      }

      // Show filters if there are active filters
      if (this.hasActiveFilters()) {
        this.showFilters.set(true);
      }
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
          this.tagsArray.update(tags => [...tags, trimmedTag]);
          this.currentPage.set(1);
          this.loadTrips();
        }
        break;
      }
      case 'tagRemove':
        this.tagsArray.update(tags => tags.filter(tag => tag !== event.value));
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