import { TestBed } from '@angular/core/testing';
import { DOCUMENT } from '@angular/common';
import { ThemeService } from './theme';
import { vi } from 'vitest';

describe('ThemeService', () => {
  let service: ThemeService;
  let documentMock: Document;

  beforeEach(() => {
    const mockDocument = {
      documentElement: {
        classList: {
          add: vi.fn(),
          remove: vi.fn(),
        },
      },
    };

    TestBed.configureTestingModule({
      providers: [ThemeService, { provide: DOCUMENT, useValue: mockDocument }],
    });

    service = TestBed.inject(ThemeService);
    documentMock = TestBed.inject(DOCUMENT);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize with light mode', () => {
    expect(service.isDarkMode()).toBe(false);
  });

  it('should toggle to dark mode', async () => {
    service.toggleDarkMode();
    await new Promise((resolve) => setTimeout(resolve, 0)); // Wait for effect
    expect(service.isDarkMode()).toBe(true);
    expect(localStorage.getItem('theme')).toBe('dark');
    expect(documentMock.documentElement.classList.add).toHaveBeenCalledWith('dark');
  });

  it('should toggle back to light mode', async () => {
    service.toggleDarkMode(); // to dark
    await new Promise((resolve) => setTimeout(resolve, 0)); // Wait for effect
    service.toggleDarkMode(); // back to light
    await new Promise((resolve) => setTimeout(resolve, 0)); // Wait for effect
    expect(service.isDarkMode()).toBe(false);
    expect(localStorage.getItem('theme')).toBe('light');
    expect(documentMock.documentElement.classList.remove).toHaveBeenCalledWith('dark');
  });

  it('should apply dark theme when isDarkMode is true', async () => {
    service.isDarkMode.set(true);
    await new Promise((resolve) => setTimeout(resolve, 0)); // Wait for effect
    expect(documentMock.documentElement.classList.add).toHaveBeenCalledWith('dark');
  });

  it('should remove dark theme when isDarkMode is false', async () => {
    service.isDarkMode.set(false);
    await new Promise((resolve) => setTimeout(resolve, 0)); // Wait for effect
    expect(documentMock.documentElement.classList.remove).toHaveBeenCalledWith('dark');
  });
});
