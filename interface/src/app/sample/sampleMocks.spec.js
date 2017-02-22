angular.module('adage.mocks.sample', [])

.factory('SampleMocks', [function() {
  return {
    sample1: {
      'annotations': {
        'additional_notes': '9.5 h biofilms',
        'biotic_int_lv_1': 'Human',
        'biotic_int_lv_2': 'Lung epithelial cells (CFBE41o- cells)',
        'description':
          'Pseudomonas aeruginosa 9.5 hour static coculture with human blah…',
        'genotype': 'WT',
        'growth_setting_1': 'Biofilm',
        'growth_setting_2': 'Static',
        'medium': 'MEM, 0.4% arginine',
        'nucleic_acid': 'RNA',
        'od': '9.5 hours',
        'strain': 'PA14',
        'temperature': '37'
      },
      'id': 1,
      'ml_data_source': 'GSM252496.CEL',
      'name': 'GSE9989GSM252496',
      'resource_uri': '/api/v0/sample/1/'
    },
    sample1GetExperiments: [
      {
        'accession': 'E-GEOD-9989',
        'description':
          'We grew Pseudomonas aeruginosa biofilms on CFBE41o- bla…',
        'name':
          'Transcription profiling of P. aeruginosa biofilms treated blah…',
        'resource_uri': '/api/v0/experiment/E-GEOD-9989/',
        'sample_set': [
          '/api/v0/sample/1/',
          '/api/v0/sample/2/',
          '/api/v0/sample/3/',
          '/api/v0/sample/4/',
          '/api/v0/sample/5/',
          '/api/v0/sample/6/'
        ]
      },
      {
        'accession': 'E-GEOD-10030',
        'description': 'This SuperSeries is composed of the following blah…',
        'name':
          'Transcription profiling of Pseudomonas aeruginosa treated blah…',
        'resource_uri': '/api/v0/experiment/E-GEOD-10030/',
        'sample_set': [
          '/api/v0/sample/1/',
          '/api/v0/sample/2/',
          '/api/v0/sample/3/',
          '/api/v0/sample/4/',
          '/api/v0/sample/5/',
          '/api/v0/sample/6/',
          '/api/v0/sample/7/',
          '/api/v0/sample/8/',
          '/api/v0/sample/9/',
          '/api/v0/sample/10/'
        ]
      }
    ]
  };
}])
;
