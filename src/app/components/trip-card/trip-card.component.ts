import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Trip } from '../../models/trip.model';

@Component({
  selector: 'app-trip-card',
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './trip-card.component.html',
  host: {
    class: 'block',
  },
})
export class TripCardComponent {
  trip = input.required<Trip>();
  cardClick = output<void>();

  score = computed(() => {
    const t = this.trip();
    // Simple score calculation: rating + (nrOfRatings / 100) - (co2 / 1000)
    return t.rating + t.nrOfRatings / 100 - t.co2 / 1000;
  });

  scoreTier = computed(() => {
    const s = this.score();
    if (s < 2) return 'average';
    if (s < 4) return 'good';
    return 'awesome';
  });

  scoreBadgeText = computed(() => this.scoreTier().toUpperCase());

  scoreBadgeClass = computed(() => {
    const tier = this.scoreTier();
    switch (tier) {
      case 'average':
        return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200';
      case 'good':
        return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200';
      case 'awesome':
        return 'bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200';
    }
  });

  getAriaLabel() {
    return $localize`View details for ${this.trip().title}`;
  }

  getAlt() {
    return $localize`Image of ${this.trip().title}`;
  }

  getScoreAriaLabel() {
    return $localize`Score: ${this.scoreBadgeText()}`;
  }
}
