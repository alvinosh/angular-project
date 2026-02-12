import { TestBed } from '@angular/core/testing';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { TripsService } from './trips.service';
import { API_BASE } from '../app.config';
import { Trip } from '../models/trip.model';

describe('TripsService', () => {
  let service: TripsService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClientTesting(),
        TripsService,
        { provide: API_BASE, useValue: 'https://api.example.com/' }
      ],
    });
    service = TestBed.inject(TripsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get trips', () => {
    const mockResponse = {
      items: [
        {
          id: '1',
          title: 'Trip 1',
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
        },
      ],
      total: 1,
      page: 1,
      limit: 10,
    };

    service.getTrips().subscribe((response) => {
      expect(response.items.length).toBe(1);
      expect(response.items[0].title).toBe('Trip 1');
    });

    const req = httpMock.expectOne('https://api.example.com//v1/trips');
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should get trip by id', () => {
    const mockTrip: Trip = {
      id: '1',
      title: 'Trip 1',
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

    service.getTrip('1').subscribe((trip) => {
      expect(trip.title).toBe('Trip 1');
    });

    const req = httpMock.expectOne('https://api.example.com//v1/trips/1');
    expect(req.request.method).toBe('GET');
    req.flush(mockTrip);
  });
});
