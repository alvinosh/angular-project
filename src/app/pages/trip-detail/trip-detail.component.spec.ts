import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { TripDetailComponent } from './trip-detail.component';
import { TripsService } from '../../services/trips.service';
import { Trip } from '../../models/trip.model';

describe('TripDetailComponent', () => {
  let component: TripDetailComponent;
  let fixture: ComponentFixture<TripDetailComponent>;
  let mockTripsService: TripsService;
  let mockRouter: Router;

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
    const activatedRouteSpy = {
      snapshot: { paramMap: { get: vi.fn().mockReturnValue('1') } },
    };

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
    mockRouter = TestBed.inject(Router);

    mockTripsService.getTrip = vi.fn().mockReturnValue(of(mockTrip));
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load trip on init', () => {
    component.ngOnInit();
    expect(mockTripsService.getTrip).toHaveBeenCalledWith('1');
    expect(component.trip()).toEqual(mockTrip);
    expect(component.loading()).toBe(false);
  });

  it('should handle error when loading trip', () => {
    mockTripsService.getTrip = vi
      .fn()
      .mockReturnValue(throwError(() => new Error('Network error')));
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    component.ngOnInit();
    expect(component.error()).toBe('Failed to load trip details');
    expect(component.loading()).toBe(false);
  });

  it('should go back to home', () => {
    component.goBack();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/']);
  });

  it('should display trip details', () => {
    component.ngOnInit();
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Test Trip');
    expect(compiled.textContent).toContain('Test Description');
    expect(compiled.textContent).toContain('100');
    expect(compiled.textContent).toContain('4.5');
    expect(compiled.textContent).toContain('adventure');
  });
});
