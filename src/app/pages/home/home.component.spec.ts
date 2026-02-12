import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { HomeComponent } from './home.component';
import { TripsService } from '../../services/trips.service';
import { Trip } from '../../models/trip.model';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let mockTripsService: TripsService;
  let mockRouter: Router;

  const mockTrips: Trip[] = [
    {
      id: '1',
      title: 'Trip 1',
      description: 'Description 1',
      price: 100,
      rating: 4.5,
      nrOfRatings: 10,
      verticalType: 'adventure',
      tags: ['tag1'],
      co2: 50,
      thumbnailUrl: 'thumb1.jpg',
      imageUrl: 'image1.jpg',
      creationDate: '2023-01-01',
    },
    {
      id: '2',
      title: 'Trip 2',
      description: 'Description 2',
      price: 200,
      rating: 4.0,
      nrOfRatings: 5,
      verticalType: 'relaxation',
      tags: ['tag2'],
      co2: 30,
      thumbnailUrl: 'thumb2.jpg',
      imageUrl: 'image2.jpg',
      creationDate: '2023-01-02',
    },
  ];

  beforeEach(async () => {
    const tripsServiceSpy = { getTrips: vi.fn() };
    const routerSpy = { navigate: vi.fn() };
    const activatedRouteSpy = { queryParams: of({}) };

    // Set up mocks before component creation
    tripsServiceSpy.getTrips.mockReturnValue(
      of({
        items: mockTrips,
        total: 25,
        page: 1,
        limit: 12,
      }),
    );

    await TestBed.configureTestingModule({
      imports: [HomeComponent],
      providers: [
        { provide: TripsService, useValue: tripsServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: activatedRouteSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    mockTripsService = TestBed.inject(TripsService);
    mockRouter = TestBed.inject(Router);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load trips on init', () => {
    component.loadTrips();
    expect(mockTripsService.getTrips).toHaveBeenCalledWith({
      sortBy: 'title',
      sortOrder: 'ASC',
      page: 1,
      titleFilter: undefined,
      minPrice: undefined,
      maxPrice: undefined,
      minRating: undefined,
      maxRating: undefined,
      tags: undefined,
    });
    expect(component.trips()).toEqual(mockTrips);
    expect(component.total()).toBe(25);
  });

  it('should update sort and reload trips', () => {
    component.onFiltersChange({ type: 'sort', value: { by: 'price', order: 'ASC' } });
    expect(component.sortBy()).toBe('price');
    expect(component.currentPage()).toBe(1);
    expect(mockTripsService.getTrips).toHaveBeenCalledWith({
      sortBy: 'price',
      sortOrder: 'ASC',
      page: 1,
      titleFilter: undefined,
      minPrice: undefined,
      maxPrice: undefined,
      minRating: undefined,
      maxRating: undefined,
      tags: undefined,
    });
  });

  it('should toggle sort order and reload trips', () => {
    component.onFiltersChange({ type: 'sort', value: { by: 'title', order: 'DESC' } });
    expect(component.sortOrder()).toBe('DESC');
    expect(component.currentPage()).toBe(1);
    expect(mockTripsService.getTrips).toHaveBeenCalledWith({
      sortBy: 'title',
      sortOrder: 'DESC',
      page: 1,
      titleFilter: undefined,
      minPrice: undefined,
      maxPrice: undefined,
      minRating: undefined,
      maxRating: undefined,
      tags: undefined,
    });
  });

  it('should navigate to next page', () => {
    component.currentPage.set(1);
    component.total.set(25);
    component.limit.set(12);
    component.onNextPage();
    expect(component.currentPage()).toBe(2);
    expect(mockTripsService.getTrips).toHaveBeenCalledWith({
      sortBy: 'title',
      sortOrder: 'ASC',
      page: 2,
      titleFilter: undefined,
      minPrice: undefined,
      maxPrice: undefined,
      minRating: undefined,
      maxRating: undefined,
      tags: undefined,
    });
  });

  it('should not navigate beyond last page', () => {
    component.currentPage.set(3);
    component.total.set(25);
    component.limit.set(12);
    component.onNextPage();
    expect(component.currentPage()).toBe(3);
    expect(mockTripsService.getTrips).not.toHaveBeenCalled();
  });

  it('should navigate to previous page', () => {
    component.currentPage.set(2);
    component.onPreviousPage();
    expect(component.currentPage()).toBe(1);
    expect(mockTripsService.getTrips).toHaveBeenCalledWith({
      sortBy: 'title',
      sortOrder: 'ASC',
      page: 1,
      titleFilter: undefined,
      minPrice: undefined,
      maxPrice: undefined,
      minRating: undefined,
      maxRating: undefined,
      tags: undefined,
    });
  });

  it('should not navigate before first page', () => {
    component.currentPage.set(1);
    component.onPreviousPage();
    expect(component.currentPage()).toBe(1);
    expect(mockTripsService.getTrips).not.toHaveBeenCalled();
  });

  it('should navigate to trip detail', () => {
    component.navigateToDetail('1');
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/trip', '1'], {
      queryParamsHandling: 'preserve',
    });
  });

  it('should navigate to specific page', () => {
    component.currentPage.set(1);
    component.total.set(25);
    component.limit.set(12);
    component.goToPageInput.set('3');
    component.onGoToPage();
    expect(component.currentPage()).toBe(3);
    expect(mockTripsService.getTrips).toHaveBeenCalledWith({
      sortBy: 'title',
      sortOrder: 'ASC',
      page: 3,
      titleFilter: undefined,
      minPrice: undefined,
      maxPrice: undefined,
      minRating: undefined,
      maxRating: undefined,
      tags: undefined,
    });
    expect(component.goToPageInput()).toBe('');
  });

  it('should not navigate to invalid page', () => {
    component.currentPage.set(1);
    component.total.set(25);
    component.limit.set(12);
    component.goToPageInput.set('10'); // Beyond total pages
    component.onGoToPage();
    expect(component.currentPage()).toBe(1); // Should remain the same
    expect(mockTripsService.getTrips).not.toHaveBeenCalled();
  });

  it('should display trips including trip of the day', () => {
    component.trips.set(mockTrips);
    component.tripOfTheDay.set(mockTrips[0]);
    const displayed = component.displayedTrips();
    expect(displayed).toEqual(mockTrips); // Now just returns all trips
  });
});
