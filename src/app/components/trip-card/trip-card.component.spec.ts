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
});
