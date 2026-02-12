import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TripsService } from '../../services/trips.service';
import { Trip } from '../../models/trip.model';

@Component({
  selector: 'app-trip-detail',
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './trip-detail.component.html',
  host: {
    class: 'block',
  },
})
export class TripDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly tripsService = inject(TripsService);

  trip = signal<Trip | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadTrip(id);
    }
  }

  loadTrip(id: string) {
    this.loading.set(true);
    this.error.set(null);
    this.tripsService.getTrip(id).subscribe({
      next: (trip) => {
        this.trip.set(trip);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load trip details');
        this.loading.set(false);
        console.error('Trip detail error:', err);
      },
    });
  }

  goBack() {
    window.history.back();
  }

  getAlt() {
    return this.trip() ? $localize`Image of ${this.trip()!.title}` : '';
  }
}
