// eslint-disable-next-line no-unused-vars
import Consumer from 'fusion:consumer'
const resolver = require('./feeds-content-api')

it('validate schemaName', () => {
  expect(resolver.default.schemaName).toBe('feeds')
})

it('validate params', () => {
  expect(resolver.default.params).toStrictEqual({
    Section: 'text',
    Author: 'text',
    Keywords: 'text',
    'Tags-Text': 'text',
    'Tags-Slug': 'text',
    'Include-Terms': 'text',
    'Exclude-Terms': 'text',
    'Feed-Size': 'text',
    'Feed-Offset': 'text',
    'Source-Exclude': 'text',
    Sort: 'text',
  })
})

it('returns query with default values', () => {
  const query = resolver.default.resolve({
    Section: '',
    Author: '',
    Keywords: '',
    'Tags-Text': '',
    'Tags-Slug': '',
    'arc-site': 'demo',
    'Include-Terms': '',
    'Exclude-Terms': '',
    'Feed-Size': '',
    'Feed-Offset': '',
    'Source-Exclude': '',
    Sort: '',
  })
  expect(query).toBe(
    'undefined/content/v4/search/published?body=%7B%22query%22:%7B%22bool%22:%7B%22must%22:%5B%7B%22term%22:%7B%22type%22:%22story%22%7D%7D,%7B%22term%22:%7B%22revision.published%22:true%7D%7D%5D%7D%7D%7D&website=demo&size=100&from=0&_sourceExclude=related_content&sort=publish_date:desc',
  )
})

it('returns query by section', () => {
  const query = resolver.default.resolve({
    Section: 'sports',
    Author: '',
    Keywords: '',
    'Tags-Text': '',
    'Tags-Slug': '',
    'arc-site': 'demo',
    'Include-Terms': '',
    'Exclude-Terms': '',
    'Feed-Size': '',
    'Feed-Offset': '',
    'Source-Exclude': '',
    Sort: '',
  })
  expect(query).toBe(
    'undefined/content/v4/search/published?body=%7B%22query%22:%7B%22bool%22:%7B%22must%22:%5B%7B%22term%22:%7B%22type%22:%22story%22%7D%7D,%7B%22term%22:%7B%22revision.published%22:true%7D%7D,%7B%22nested%22:%7B%22path%22:%22taxonomy.sections%22,%22query%22:%7B%22bool%22:%7B%22must%22:%5B%7B%22term%22:%7B%22taxonomy.sections._id%22:%22/sports%22%7D%7D%5D%7D%7D%7D%7D%5D%7D%7D%7D&website=demo&size=100&from=0&_sourceExclude=related_content&sort=publish_date:desc',
  )
})

it('returns query by section with leading slash', () => {
  const query = resolver.default.resolve({
    Section: '/sports',
    Author: '',
    Keywords: '',
    'Tags-Text': '',
    'Tags-Slug': '',
    'arc-site': 'demo',
    'Include-Terms': '',
    'Exclude-Terms': '',
    'Feed-Size': '',
    'Feed-Offset': '',
    'Source-Exclude': '',
    Sort: '',
  })
  expect(query).toBe(
    'undefined/content/v4/search/published?body=%7B%22query%22:%7B%22bool%22:%7B%22must%22:%5B%7B%22term%22:%7B%22type%22:%22story%22%7D%7D,%7B%22term%22:%7B%22revision.published%22:true%7D%7D,%7B%22nested%22:%7B%22path%22:%22taxonomy.sections%22,%22query%22:%7B%22bool%22:%7B%22must%22:%5B%7B%22term%22:%7B%22taxonomy.sections._id%22:%22/sports%22%7D%7D%5D%7D%7D%7D%7D%5D%7D%7D%7D&website=demo&size=100&from=0&_sourceExclude=related_content&sort=publish_date:desc',
  )
})

it('returns query by author', () => {
  const query = resolver.default.resolve({
    Section: '',
    Author: 'John Smith',
    Keywords: '',
    'Tags-Text': '',
    'Tags-Slug': '',
    'arc-site': 'demo',
    'Include-Terms': '',
    'Exclude-Terms': '',
    'Feed-Size': '',
    'Feed-Offset': '',
    'Source-Exclude': '',
    Sort: '',
  })
  expect(query).toBe(
    'undefined/content/v4/search/published?body=%7B%22query%22:%7B%22bool%22:%7B%22must%22:%5B%7B%22term%22:%7B%22type%22:%22story%22%7D%7D,%7B%22term%22:%7B%22revision.published%22:true%7D%7D,%7B%22term%22:%7B%22credits.by._id%22:%22John%20Smith%22%7D%7D%5D%7D%7D%7D&website=demo&size=100&from=0&_sourceExclude=related_content&sort=publish_date:desc',
  )
})

it('returns query by keywords', () => {
  const query = resolver.default.resolve({
    Section: '',
    Author: '',
    Keywords: 'washington football,sports',
    'Tags-Text': '',
    'Tags-Slug': '',
    'arc-site': 'demo',
    'Include-Terms': '',
    'Exclude-Terms': '',
    'Feed-Size': '',
    'Feed-Offset': '',
    'Source-Exclude': '',
    Sort: '',
  })
  expect(query).toBe(
    'undefined/content/v4/search/published?body=%7B%22query%22:%7B%22bool%22:%7B%22must%22:%5B%7B%22term%22:%7B%22type%22:%22story%22%7D%7D,%7B%22term%22:%7B%22revision.published%22:true%7D%7D,%7B%22simple_query_string%22:%7B%22query%22:%22%5C%22washington%20football%5C%22%20%7C%20%5C%22sports%5C%22%22,%22fields%22:%5B%22taxonomy.seo_keywords%22%5D%7D%7D%5D%7D%7D%7D&website=demo&size=100&from=0&_sourceExclude=related_content&sort=publish_date:desc',
  )
})

it('returns query by tags text', () => {
  const query = resolver.default.resolve({
    Section: '',
    Author: '',
    Keywords: '',
    'Tags-Text': 'football,sports',
    'Tags-Slug': '',
    'arc-site': 'demo',
    'Include-Terms': '',
    'Exclude-Terms': '',
    'Feed-Size': '',
    'Feed-Offset': '',
    'Source-Exclude': '',
    Sort: '',
  })
  expect(query).toBe(
    'undefined/content/v4/search/published?body=%7B%22query%22:%7B%22bool%22:%7B%22must%22:%5B%7B%22term%22:%7B%22type%22:%22story%22%7D%7D,%7B%22term%22:%7B%22revision.published%22:true%7D%7D,%7B%22terms%22:%7B%22taxonomy.tags.text.raw%22:%5B%22football%22,%22sports%22%5D%7D%7D%5D%7D%7D%7D&website=demo&size=100&from=0&_sourceExclude=related_content&sort=publish_date:desc',
  )
})

it('returns query by tags slug', () => {
  const query = resolver.default.resolve({
    Section: '',
    Author: '',
    Keywords: '',
    'Tags-Text': '',
    'Tags-Slug': 'football,sports',
    'arc-site': 'demo',
    'Include-Terms': '',
    'Exclude-Terms': '',
    'Feed-Size': '',
    'Feed-Offset': '',
    'Source-Exclude': '',
    Sort: '',
  })
  expect(query).toBe(
    'undefined/content/v4/search/published?body=%7B%22query%22:%7B%22bool%22:%7B%22must%22:%5B%7B%22term%22:%7B%22type%22:%22story%22%7D%7D,%7B%22term%22:%7B%22revision.published%22:true%7D%7D,%7B%22terms%22:%7B%22taxonomy.tags.slug%22:%5B%22football%22,%22sports%22%5D%7D%7D%5D%7D%7D%7D&website=demo&size=100&from=0&_sourceExclude=related_content&sort=publish_date:desc',
  )
})
