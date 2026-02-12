import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pagination',
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './pagination.component.html',
  host: {
    class: 'block',
  },
})
export class PaginationComponent {
  // Inputs
  currentPage = input(1);
  totalPages = input(1);
  goToPageInput = input('');

  // Outputs
  previousPage = output<void>();
  nextPage = output<void>();
  goToPageInputChange = output<string>();
  goToPage = output<void>();

  pageText = computed(() => $localize`Page ${this.currentPage()} of ${this.totalPages()}`);

  onPreviousPage() {
    this.previousPage.emit();
  }

  onNextPage() {
    this.nextPage.emit();
  }

  onGoToPageInputChange(event: Event) {
    const target = event.target as HTMLInputElement;
    this.goToPageInputChange.emit(target.value);
  }

  onGoToPage() {
    this.goToPage.emit();
  }
}