import { inject, Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, shareReplay, tap } from 'rxjs';
import { Trip, TripsListQueryParams, TripsListResponse } from '../models/trip.model';
import { API_BASE } from '../app.config';

@Injectable({
  providedIn: 'root',
})
export class TripsService {
  private readonly http = inject(HttpClient);
  private readonly apiBase = inject(API_BASE);

  // Caching signals
  private readonly tripsCache = signal<Map<string, TripsListResponse>>(new Map());
  private readonly tripDetailsCache = signal<Map<string, Trip>>(new Map());

  // Computed cache size for monitoring
  readonly cacheSize = computed(() => this.tripsCache().size + this.tripDetailsCache().size);

  getTrips(params?: Partial<TripsListQueryParams>): Observable<TripsListResponse> {
    // Create cache key from params
    const cacheKey = this.createCacheKey(params);

    // Check cache first
    const cached = this.tripsCache().get(cacheKey);
    if (cached) {
      return new Observable((subscriber) => {
        subscriber.next(cached);
        subscriber.complete();
      });
    }

    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.set(key, value.toString());
        }
      });
    }
    const queryString = queryParams.toString();
    const url = queryString
      ? `${this.apiBase}/v1/trips?${queryString}`
      : `${this.apiBase}/v1/trips`;

    return this.http.get<TripsListResponse>(url).pipe(
      tap((response) => {
        // Cache the response
        const newCache = new Map(this.tripsCache());
        newCache.set(cacheKey, response);
        this.tripsCache.set(newCache);
      }),
      shareReplay(1),
    );
  }

  getTrip(id: string): Observable<Trip> {
    // Check cache first
    const cached = this.tripDetailsCache().get(id);
    if (cached) {
      return new Observable((subscriber) => {
        subscriber.next(cached);
        subscriber.complete();
      });
    }

    return this.http.get<Trip>(`${this.apiBase}/v1/trips/${id}`).pipe(
      tap((trip) => {
        // Cache the trip
        const newCache = new Map(this.tripDetailsCache());
        newCache.set(id, trip);
        this.tripDetailsCache.set(newCache);
      }),
      shareReplay(1),
    );
  }

  // Clear cache methods
  clearTripsCache() {
    this.tripsCache.set(new Map());
  }

  clearTripDetailsCache() {
    this.tripDetailsCache.set(new Map());
  }

  clearAllCache() {
    this.clearTripsCache();
    this.clearTripDetailsCache();
  }

  // Helper method to create cache keys
  private createCacheKey(params?: Partial<TripsListQueryParams>): string {
    if (!params) return 'default';
    return JSON.stringify(params, Object.keys(params).sort());
  }
}
