import { TestBed } from '@angular/core/testing';

import { DalService } from './dal.service';

describe('DalService', () => {
  let service: DalService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DalService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
