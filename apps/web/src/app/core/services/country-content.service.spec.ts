import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { CountryStore } from '../state/country.store';
import { CountryContentService } from './country-content.service';

const EMPTY_PAGINATION = { page: 1, pageSize: 100, pageCount: 0, total: 0 };

// `CountryContentService` eagerly wires up a reactive request for form-fields, plans AND
// terms as soon as it's constructed (not only when a consumer calls the matching getter), so
// every country change fires all three at once; tests must drain the ones they don't assert
// on or `HttpTestingController.verify()` fails on leftover requests.
function flushUnassertedRequests(httpMock: HttpTestingController): void {
  for (const req of httpMock.match(() => true)) {
    req.flush({ data: [], meta: { pagination: EMPTY_PAGINATION } });
  }
}

describe('CountryContentService', () => {
  let httpMock: HttpTestingController;
  let countryStore: CountryStore;
  let service: CountryContentService;

  beforeEach(() => {
    sessionStorage.clear();
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    httpMock = TestBed.inject(HttpTestingController);
    countryStore = TestBed.inject(CountryStore);
    service = TestBed.inject(CountryContentService);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('issues no form-fields request while no country is selected', () => {
    service.getFormFields();
    TestBed.tick();

    httpMock.expectNone(`${environment.strapiApiBaseUrl}/form-fields`);
  });

  it('includes the country filter once a country is set', () => {
    service.getFormFields();

    countryStore.setCountry('CO');
    TestBed.tick();

    const req = httpMock.expectOne((request) => request.url === `${environment.strapiApiBaseUrl}/form-fields`);
    expect(req.request.params.get('filters[country][$eq]')).toBe('CO');
    req.flush({ data: [], meta: { pagination: EMPTY_PAGINATION } });

    flushUnassertedRequests(httpMock);
  });

  it('refetchFormFields forces a new request for the same country', () => {
    service.getFormFields();
    countryStore.setCountry('CO');
    TestBed.tick();

    const first = httpMock.expectOne((request) => request.url === `${environment.strapiApiBaseUrl}/form-fields`);
    first.flush({ data: [], meta: { pagination: EMPTY_PAGINATION } });
    flushUnassertedRequests(httpMock);

    service.refetchFormFields();
    TestBed.tick();

    const second = httpMock.expectOne((request) => request.url === `${environment.strapiApiBaseUrl}/form-fields`);
    second.flush({ data: [], meta: { pagination: EMPTY_PAGINATION } });
  });

  it('filters plans by country and active=true', () => {
    service.getPlans();
    countryStore.setCountry('CL');
    TestBed.tick();

    const req = httpMock.expectOne((request) => request.url === `${environment.strapiApiBaseUrl}/plans`);
    expect(req.request.params.get('filters[country][$eq]')).toBe('CL');
    expect(req.request.params.get('filters[active][$eq]')).toBe('true');
    req.flush({ data: [], meta: { pagination: EMPTY_PAGINATION } });

    flushUnassertedRequests(httpMock);
  });

  it('includes the country filter for terms and refetchTerms forces a new request', () => {
    service.getTerms();
    countryStore.setCountry('CO');
    TestBed.tick();

    const first = httpMock.expectOne(
      (request) => request.url === `${environment.strapiApiBaseUrl}/terms-and-conditions`,
    );
    expect(first.request.params.get('filters[country][$eq]')).toBe('CO');
    first.flush({ data: [], meta: { pagination: EMPTY_PAGINATION } });
    flushUnassertedRequests(httpMock);

    service.refetchTerms();
    TestBed.tick();

    const second = httpMock.expectOne(
      (request) => request.url === `${environment.strapiApiBaseUrl}/terms-and-conditions`,
    );
    second.flush({ data: [], meta: { pagination: EMPTY_PAGINATION } });
  });
});
