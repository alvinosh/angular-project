import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FiltersComponent } from './filters.component';
import { vi } from 'vitest';

describe('FiltersComponent', () => {
  let component: FiltersComponent;
  let fixture: ComponentFixture<FiltersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FiltersComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FiltersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default input values', () => {
    expect(component.sort()).toEqual({ by: 'title', order: 'ASC' });
    expect(component.filters()).toEqual({ title: '', tags: [] });
    expect(component.showFilters()).toBe(false);
  });

  it('should emit filtersChange on sort change', () => {
    const spy = vi.fn();
    component.filtersChange.subscribe(spy);

    const select = fixture.nativeElement.querySelector('#sort-select') as HTMLSelectElement;
    select.value = 'price';
    select.dispatchEvent(new Event('change'));

    expect(spy).toHaveBeenCalledWith({
      type: 'sort',
      value: { by: 'price', order: 'ASC' },
    });
  });

  it('should emit filtersChange on sort order button click', () => {
    const spy = vi.fn();
    component.filtersChange.subscribe(spy);

    const button = fixture.nativeElement.querySelector(
      'button[aria-label*="Sort"]',
    ) as HTMLButtonElement;
    button.click();

    expect(spy).toHaveBeenCalledWith({
      type: 'sort',
      value: { by: 'title', order: 'DESC' },
    });
  });

  it('should emit showFiltersToggle on filters toggle button click', () => {
    const spy = vi.fn();
    component.showFiltersToggle.subscribe(spy);

    const button = fixture.nativeElement.querySelector(
      'button[aria-label*="filters"]',
    ) as HTMLButtonElement;
    button.click();

    expect(spy).toHaveBeenCalled();
  });

  it('should emit filtersChange on title input', () => {
    // First show filters
    fixture.componentRef.setInput('showFilters', true);
    fixture.detectChanges();

    const spy = vi.fn();
    component.filtersChange.subscribe(spy);

    const input = fixture.nativeElement.querySelector('#title-filter') as HTMLInputElement;
    input.value = 'test';
    input.dispatchEvent(new Event('input'));

    expect(spy).toHaveBeenCalledWith({
      type: 'title',
      value: 'test',
    });
  });

  it('should emit filtersChange on min price input', () => {
    // First show filters
    fixture.componentRef.setInput('showFilters', true);
    fixture.detectChanges();

    const spy = vi.fn();
    component.filtersChange.subscribe(spy);

    const input = fixture.nativeElement.querySelector('#min-price') as HTMLInputElement;
    input.value = '100';
    input.dispatchEvent(new Event('input'));

    expect(spy).toHaveBeenCalledWith({
      type: 'minPrice',
      value: 100,
    });
  });

  it('should reject negative max price input', () => {
    fixture.componentRef.setInput('showFilters', true);
    fixture.detectChanges();

    const spy = vi.fn();
    component.filtersChange.subscribe(spy);

    const input = fixture.nativeElement.querySelector('#max-price') as HTMLInputElement;
    input.value = '-500';
    input.dispatchEvent(new Event('input'));

    expect(spy).toHaveBeenCalledWith({ type: 'maxPrice', value: undefined });
    expect(input.value).toBe('');
  });

  it('should reject min rating below 0', () => {
    fixture.componentRef.setInput('showFilters', true);
    fixture.detectChanges();

    const spy = vi.fn();
    component.filtersChange.subscribe(spy);

    const input = fixture.nativeElement.querySelector('#min-rating') as HTMLInputElement;
    input.value = '-1';
    input.dispatchEvent(new Event('input'));

    expect(spy).toHaveBeenCalledWith({ type: 'minRating', value: undefined });
    expect(input.value).toBe('');
  });

  it('should reject min rating above 5', () => {
    fixture.componentRef.setInput('showFilters', true);
    fixture.detectChanges();

    const spy = vi.fn();
    component.filtersChange.subscribe(spy);

    const input = fixture.nativeElement.querySelector('#min-rating') as HTMLInputElement;
    input.value = '6';
    input.dispatchEvent(new Event('input'));

    expect(spy).toHaveBeenCalledWith({ type: 'minRating', value: undefined });
    expect(input.value).toBe('');
  });

  it('should reject max rating below 0', () => {
    fixture.componentRef.setInput('showFilters', true);
    fixture.detectChanges();

    const spy = vi.fn();
    component.filtersChange.subscribe(spy);

    const input = fixture.nativeElement.querySelector('#max-rating') as HTMLInputElement;
    input.value = '-1';
    input.dispatchEvent(new Event('input'));

    expect(spy).toHaveBeenCalledWith({ type: 'maxRating', value: undefined });
    expect(input.value).toBe('');
  });

  it('should reject max rating above 5', () => {
    fixture.componentRef.setInput('showFilters', true);
    fixture.detectChanges();

    const spy = vi.fn();
    component.filtersChange.subscribe(spy);

    const input = fixture.nativeElement.querySelector('#max-rating') as HTMLInputElement;
    input.value = '6';
    input.dispatchEvent(new Event('input'));

    expect(spy).toHaveBeenCalledWith({ type: 'maxRating', value: undefined });
    expect(input.value).toBe('');
  });

  it('should emit filtersChange on clear filters button click', () => {
    // First show filters
    fixture.componentRef.setInput('showFilters', true);
    fixture.detectChanges();

    const spy = vi.fn();
    component.filtersChange.subscribe(spy);

    const button = fixture.nativeElement.querySelector(
      'button[aria-label="Clear all filters"]',
    ) as HTMLButtonElement;
    button.click();

    expect(spy).toHaveBeenCalledWith({
      type: 'clear',
    });
  });

  it('should display tags when filters has values', () => {
    fixture.componentRef.setInput('showFilters', true);
    fixture.componentRef.setInput('filters', { title: '', tags: ['tag1', 'tag2'] });
    fixture.detectChanges();

    const tags = fixture.nativeElement.querySelectorAll('span.filter-tag');
    expect(tags.length).toBe(2);
    expect(tags[0].textContent).toContain('tag1');
    expect(tags[1].textContent).toContain('tag2');
  });

  it('should emit filtersChange when tag remove button is clicked', () => {
    fixture.componentRef.setInput('showFilters', true);
    fixture.componentRef.setInput('filters', { title: '', tags: ['tag1'] });
    fixture.detectChanges();

    const spy = vi.fn();
    component.filtersChange.subscribe(spy);

    const removeButton = fixture.nativeElement.querySelector(
      'button[aria-label="Remove tag1 tag"]',
    ) as HTMLButtonElement;
    removeButton.click();

    expect(spy).toHaveBeenCalledWith({
      type: 'tagRemove',
      value: 'tag1',
    });
  });

  it('should reject negative min price', () => {
    fixture.componentRef.setInput('showFilters', true);
    fixture.detectChanges();

    const spy = vi.fn();
    component.filtersChange.subscribe(spy);

    const input = fixture.nativeElement.querySelector('#min-price') as HTMLInputElement;
    input.value = '-100';
    input.dispatchEvent(new Event('input'));

    expect(spy).toHaveBeenCalledWith({ type: 'minPrice', value: undefined });
    expect(input.value).toBe('');
  });

  it('should reject negative max price', () => {
    fixture.componentRef.setInput('showFilters', true);
    fixture.detectChanges();

    const spy = vi.fn();
    component.filtersChange.subscribe(spy);

    const input = fixture.nativeElement.querySelector('#max-price') as HTMLInputElement;
    input.value = '-50';
    input.dispatchEvent(new Event('input'));

    expect(spy).toHaveBeenCalledWith({ type: 'maxPrice', value: undefined });
    expect(input.value).toBe('');
  });
});
