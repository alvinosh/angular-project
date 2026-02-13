import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { vi } from 'vitest';
import { ThemeService } from '../../services/theme';

import { Header } from './header';

describe('Header', () => {
  let component: Header;
  let fixture: ComponentFixture<Header>;
  let mockThemeService: { isDarkMode: () => boolean; toggleDarkMode: () => void };

  beforeEach(async () => {
    mockThemeService = {
      isDarkMode: vi.fn(),
      toggleDarkMode: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [Header, RouterTestingModule],
      providers: [{ provide: ThemeService, useValue: mockThemeService }],
    }).compileComponents();

    fixture = TestBed.createComponent(Header);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should return correct aria label for light mode', () => {
    mockThemeService.isDarkMode = vi.fn().mockReturnValue(false);
    expect(component.ariaLabel).toBe('Switch to dark mode');
  });

  it('should call toggleDarkMode on button click', () => {
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelector('button');
    button.click();
    expect(mockThemeService.toggleDarkMode).toHaveBeenCalled();
  });

  it('should display correct aria label on button', () => {
    mockThemeService.isDarkMode = vi.fn().mockReturnValue(false);
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelector('button');
    expect(button.getAttribute('aria-label')).toBe('Switch to dark mode');
  });
});
