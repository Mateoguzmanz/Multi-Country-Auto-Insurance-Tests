type CountryCode = 'CO' | 'CL';

interface TermsAndConditionSeed {
  country: CountryCode;
  version: string;
  body: string;
}

export const TERMS_SEEDS: TermsAndConditionSeed[] = [
  {
    country: 'CO',
    version: 'v1.0-CO',
    body: [
      '# Terms and conditions (fictitious test copy)',
      '',
      'This document is illustrative text for technical-assessment purposes only and does ' +
        'not constitute a real policy or legal advice.',
      '',
      'By accepting these terms, the person requesting the quote declares that the information ' +
        "provided about their vehicle and personal details is accurate as of the quote's date.",
      '',
      'The simulated payment on this platform does not represent a real financial transaction, ' +
        'and the generated quote number is for reference only, for this assessment.',
    ].join('\n'),
  },
  {
    country: 'CL',
    version: 'v1.0-CL',
    body: [
      '# Terms and conditions (fictitious test copy)',
      '',
      'This document is illustrative text for technical-assessment purposes only and does ' +
        'not constitute a real policy or legal advice.',
      '',
      'By accepting these terms, the person requesting the quote declares that the information ' +
        "provided about their vehicle and personal details is accurate as of the quote's date.",
      '',
      'The simulated payment on this platform does not represent a real financial transaction, ' +
        'and the generated quote number is for reference only, for this assessment.',
    ].join('\n'),
  },
];
