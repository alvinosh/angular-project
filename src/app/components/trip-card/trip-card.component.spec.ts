import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TripCardComponent } from './trip-card.component';
import { vi } from 'vitest';
import { Trip } from '../../models/trip.model';

describe('TripCardComponent', () => {
  let component: TripCardComponent;
  let fixture: ComponentFixture<TripCardComponent>;

  const mockTrip: Trip = {
    id: '1',
    title: 'Test Trip',
    description: 'Description',
    price: 100,
    rating: 4.5,
    nrOfRatings: 10,
    verticalType: 'adventure',
    tags: ['tag1'],
    co2: 50,
    thumbnailUrl: 'thumb.jpg',
    imageUrl: 'image.jpg',
    creationDate: '2023-01-01',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TripCardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TripCardComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('trip', mockTrip);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display trip information', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Test Trip');
    expect(compiled.textContent).toContain('100');
    expect(compiled.textContent).toContain('4.5');
    expect(compiled.textContent).toContain('adventure');
  });

  it('should calculate score correctly', () => {
    // score = rating + (nrOfRatings / 100) - (co2 / 1000)
    // 4.5 + (10 / 100) - (50 / 1000) = 4.5 + 0.1 - 0.05 = 4.55
    expect(component.score()).toBe(4.55);
  });

  it('should determine score tier', () => {
    expect(component.scoreTier()).toBe('awesome');
  });

  it('should emit cardClick on click', () => {
    const spy = vi.fn();
    component.cardClick.subscribe(spy);
    const card = fixture.nativeElement.querySelector('div');
    card.click();
    expect(spy).toHaveBeenCalled();
  });

  it('should calculate score for average tier', () => {
    const lowTrip: Trip = { ...mockTrip, rating: 1.5, nrOfRatings: 5, co2: 100 };
    fixture.componentRef.setInput('trip', lowTrip);
    fixture.detectChanges();
    expect(component.score()).toBeCloseTo(1.5 + 0.05 - 0.1, 2); // 1.45
    expect(component.scoreTier()).toBe('average');
  });

  it('should calculate score for good tier', () => {
    const medTrip: Trip = { ...mockTrip, rating: 3.0, nrOfRatings: 20, co2: 50 };
    fixture.componentRef.setInput('trip', medTrip);
    fixture.detectChanges();
    expect(component.score()).toBeCloseTo(3.0 + 0.2 - 0.05, 2); // 3.15
    expect(component.scoreTier()).toBe('good');
  });

  it('should calculate score for awesome tier', () => {
    expect(component.score()).toBe(4.55); // As calculated
    expect(component.scoreTier()).toBe('awesome');
  });

  it('should handle edge case with zero ratings', () => {
    const edgeTrip: Trip = { ...mockTrip, nrOfRatings: 0 };
    fixture.componentRef.setInput('trip', edgeTrip);
    fixture.detectChanges();
    expect(component.score()).toBe(4.5 - 0.05); // 4.45
  });

  it('should have correct alt text for image', () => {
    const img = fixture.nativeElement.querySelector('img');
    expect(img.getAttribute('alt')).toBe('Image of Test Trip');
  });

  it('should have correct aria label for card', () => {
    const card = fixture.nativeElement.querySelector('div[role="button"]');
    expect(card.getAttribute('aria-label')).toBe('View details for Test Trip');
  });

  it('should have correct aria label for score badge', () => {
    const badge = fixture.nativeElement.querySelector('span[aria-label]');
    expect(badge.getAttribute('aria-label')).toBe('Score: AWESOME');
  });
});
