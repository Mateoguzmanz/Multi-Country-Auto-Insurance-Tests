import { maskDocumentNumber } from './mask-document-number';

describe('maskDocumentNumber', () => {
  it('masks a Colombian cedula keeping the first 2 and last 2 digits visible', () => {
    expect(maskDocumentNumber('1012345632', 'CO')).toBe('10••••••32');
  });

  it('masks a Chilean RUT keeping the grouping separators and first/last 2 characters', () => {
    expect(maskDocumentNumber('12.345.678-9', 'CL')).toBe('12.•••.•••-9');
  });

  it('masks everything but the last character for a CO value of 4 characters or fewer', () => {
    expect(maskDocumentNumber('1234', 'CO')).toBe('•••4');
  });

  it('masks everything but the last character for a CL value of 4 characters or fewer', () => {
    expect(maskDocumentNumber('123-4', 'CL')).toBe('•••-4');
  });

  it('returns an empty string for an empty input', () => {
    expect(maskDocumentNumber('', 'CO')).toBe('');
  });
});
