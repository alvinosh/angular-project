import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PaginationComponent } from './pagination.component';
import { vi } from 'vitest';

describe('PaginationComponent', () => {
  let component: PaginationComponent;
  let fixture: ComponentFixture<PaginationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaginationComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PaginationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default input values', () => {
    expect(component.currentPage()).toBe(1);
    expect(component.totalPages()).toBe(1);
    expect(component.goToPageInput()).toBe('');
  });

  it('should not display pagination when totalPages is 1', () => {
    fixture.componentRef.setInput('totalPages', 1);
    fixture.detectChanges();

    const paginationDiv = fixture.nativeElement.querySelector('div[role="navigation"]');
    expect(paginationDiv).toBeNull();
  });

  it('should display pagination when totalPages is greater than 1', () => {
    fixture.componentRef.setInput('totalPages', 5);
    fixture.detectChanges();

    const paginationDiv = fixture.nativeElement.querySelector('div[role="navigation"]');
    expect(paginationDiv).toBeTruthy();
  });

  it('should emit previousPage on previous button click', () => {
    fixture.componentRef.setInput('totalPages', 5);
    fixture.componentRef.setInput('currentPage', 3);
    fixture.detectChanges();

    const spy = vi.fn();
    component.previousPage.subscribe(spy);

    const button = fixture.nativeElement.querySelector(
      'button[aria-label="Previous page"]',
    ) as HTMLButtonElement;
    button.click();

    expect(spy).toHaveBeenCalled();
  });

  it('should emit nextPage on next button click', () => {
    fixture.componentRef.setInput('totalPages', 5);
    fixture.componentRef.setInput('currentPage', 3);
    fixture.detectChanges();

    const spy = vi.fn();
    component.nextPage.subscribe(spy);

    const button = fixture.nativeElement.querySelector(
      'button[aria-label="Next page"]',
    ) as HTMLButtonElement;
    button.click();

    expect(spy).toHaveBeenCalled();
  });

  it('should emit goToPageInputChange on input change', () => {
    fixture.componentRef.setInput('totalPages', 5);
    fixture.detectChanges();

    const spy = vi.fn();
    component.goToPageInputChange.subscribe(spy);

    const input = fixture.nativeElement.querySelector('#go-to-page') as HTMLInputElement;
    input.value = '3';
    input.dispatchEvent(new Event('input'));

    expect(spy).toHaveBeenCalledWith('3');
  });

  it('should emit goToPage on go button click', () => {
    fixture.componentRef.setInput('totalPages', 5);
    fixture.detectChanges();

    const spy = vi.fn();
    component.goToPage.subscribe(spy);

    const button = fixture.nativeElement.querySelector(
      'button[aria-label="Go to page"]',
    ) as HTMLButtonElement;
    button.click();

    expect(spy).toHaveBeenCalled();
  });

  it('should emit goToPage on enter key press', () => {
    fixture.componentRef.setInput('totalPages', 5);
    fixture.detectChanges();

    const spy = vi.fn();
    component.goToPage.subscribe(spy);

    const input = fixture.nativeElement.querySelector('#go-to-page') as HTMLInputElement;
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));

    expect(spy).toHaveBeenCalled();
  });

  it('should disable previous button on first page', () => {
    fixture.componentRef.setInput('totalPages', 5);
    fixture.componentRef.setInput('currentPage', 1);
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector(
      'button[aria-label="Previous page"]',
    ) as HTMLButtonElement;
    expect(button.disabled).toBe(true);
  });

  it('should disable next button on last page', () => {
    fixture.componentRef.setInput('totalPages', 5);
    fixture.componentRef.setInput('currentPage', 5);
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector(
      'button[aria-label="Next page"]',
    ) as HTMLButtonElement;
    expect(button.disabled).toBe(true);
  });

  it('should display correct page information', () => {
    fixture.componentRef.setInput('totalPages', 10);
    fixture.componentRef.setInput('currentPage', 3);
    fixture.detectChanges();

    const pageInfo = fixture.nativeElement.querySelector('span.font-bold');
    expect(pageInfo.textContent).toContain('Page 3 of 10');
  });

  it('should handle non-numeric goto input', () => {
    fixture.componentRef.setInput('totalPages', 5);
    fixture.componentRef.setInput('goToPageInput', 'abc');
    fixture.detectChanges();

    const spy = vi.fn();
    component.goToPage.subscribe(spy);

    const button = fixture.nativeElement.querySelector(
      'button[aria-label="Go to page"]',
    ) as HTMLButtonElement;
    button.click();

    // Component emits regardless, validation in parent
    expect(spy).toHaveBeenCalled();
  });

  it('should handle out-of-range goto input', () => {
    fixture.componentRef.setInput('totalPages', 5);
    fixture.componentRef.setInput('goToPageInput', '10');
    fixture.detectChanges();

    const spy = vi.fn();
    component.goToPage.subscribe(spy);

    const button = fixture.nativeElement.querySelector(
      'button[aria-label="Go to page"]',
    ) as HTMLButtonElement;
    button.click();

    // Component emits regardless, validation in parent
    expect(spy).toHaveBeenCalled();
  });

  it('should not display pagination when totalPages is 0', () => {
    fixture.componentRef.setInput('totalPages', 0);
    fixture.detectChanges();

    const paginationDiv = fixture.nativeElement.querySelector('div[role="navigation"]');
    expect(paginationDiv).toBeNull();
  });

  it('should handle currentPage greater than totalPages', () => {
    fixture.componentRef.setInput('totalPages', 3);
    fixture.componentRef.setInput('currentPage', 5);
    fixture.detectChanges();

    // Since the component doesn't handle currentPage > totalPages, next is not disabled
    const nextButton = fixture.nativeElement.querySelector(
      'button[aria-label="Next page"]',
    ) as HTMLButtonElement;
    expect(nextButton.disabled).toBe(false);
  });
});
