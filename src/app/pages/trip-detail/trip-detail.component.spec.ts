import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, ParamMap } from '@angular/router';
import { of, throwError, BehaviorSubject } from 'rxjs';
import { vi } from 'vitest';
import { TripDetailComponent } from './trip-detail.component';
import { TripsService } from '../../services/trips.service';
import { Trip } from '../../models/trip.model';

describe('TripDetailComponent', () => {
  let component: TripDetailComponent;
  let fixture: ComponentFixture<TripDetailComponent>;
  let mockTripsService: TripsService;
  let mockHistory: { back: () => void };

  let mockParamMap: BehaviorSubject<ParamMap>;

  const mockTrip: Trip = {
    id: '1',
    title: 'Test Trip',
    description: 'Test Description',
    price: 100,
    rating: 4.5,
    nrOfRatings: 10,
    verticalType: 'adventure',
    tags: ['tag1', 'tag2'],
    co2: 50,
    thumbnailUrl: 'thumb.jpg',
    imageUrl: 'image.jpg',
    creationDate: '2023-01-01',
  };

  beforeEach(async () => {
    const tripsServiceSpy = { getTrip: vi.fn() };
    const routerSpy = { navigate: vi.fn() };
    mockParamMap = new BehaviorSubject<ParamMap>({
      get: vi.fn().mockReturnValue('1'),
      getAll: vi.fn().mockReturnValue(['1']),
      has: vi.fn().mockReturnValue(true),
      keys: [],
    });

    const activatedRouteSpy = {
      paramMap: mockParamMap.asObservable(),
    };

    mockHistory = { back: vi.fn() };
    Object.defineProperty(window, 'history', { value: mockHistory, writable: true });

    await TestBed.configureTestingModule({
      imports: [TripDetailComponent],
      providers: [
        { provide: TripsService, useValue: tripsServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: activatedRouteSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TripDetailComponent);
    component = fixture.componentInstance;
    mockTripsService = TestBed.inject(TripsService);

    mockTripsService.getTrip = vi.fn().mockReturnValue(of(mockTrip));
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load trip on init', async () => {
    // Component automatically loads trip when paramMap changes
    await new Promise((resolve) => setTimeout(resolve, 0)); // Wait for effect
    expect(mockTripsService.getTrip).toHaveBeenCalledWith('1');
    expect(component.trip()).toEqual(mockTrip);
    expect(component.loading()).toBe(false);
  });

  it('should handle error when loading trip', async () => {
    mockTripsService.getTrip = vi
      .fn()
      .mockReturnValue(throwError(() => new Error('Network error')));
    vi.spyOn(console, 'error').mockImplementation(() => undefined);

    // Trigger component creation again to test error handling
    fixture = TestBed.createComponent(TripDetailComponent);
    component = fixture.componentInstance;

    await new Promise((resolve) => setTimeout(resolve, 0)); // Wait for effect
    expect(component.error()).toBe('Failed to load trip details');
    expect(component.loading()).toBe(false);
  });

  it('should go back to home', () => {
    component.goBack();
    expect(mockHistory.back).toHaveBeenCalled();
  });

  it('should display trip details', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Test Trip');
    expect(compiled.textContent).toContain('Test Description');
    expect(compiled.textContent).toContain('100');
    expect(compiled.textContent).toContain('4.5');
    expect(compiled.textContent).toContain('adventure');
  });

  it('should handle invalid trip ID', async () => {
    mockTripsService.getTrip = vi
      .fn()
      .mockReturnValue(throwError(() => new Error('Trip not found')));
    vi.spyOn(console, 'error').mockImplementation(() => undefined);

    // Trigger component creation again to test error handling
    fixture = TestBed.createComponent(TripDetailComponent);
    component = fixture.componentInstance;

    await new Promise((resolve) => setTimeout(resolve, 0)); // Wait for effect
    expect(component.error()).toBe('Failed to load trip details');
  });

  it('should have correct alt text for image', () => {
    fixture.detectChanges();
    const img = fixture.nativeElement.querySelector('img');
    expect(img.getAttribute('alt')).toBe('Image of Test Trip');
  });

  it('should have correct aria label for back button', () => {
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelector('button[aria-label]');
    expect(button.getAttribute('aria-label')).toBe('Go back to home');
  });
});
