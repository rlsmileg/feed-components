import PropTypes from 'fusion:prop-types'
import Consumer from 'fusion:consumer'
import moment from 'moment'
import getProperties from 'fusion:properties'
import { resizerKey } from 'fusion:environment'
import { BuildContent } from '@wpmedia/feeds-content-elements'
import { BuildPromoItems } from '@wpmedia/feeds-promo-items'
import { generatePropsForFeed } from '@wpmedia/feeds-prop-types'
import { buildResizerURL } from '@wpmedia/feeds-resizer'
import URL from 'url'
const jmespath = require('jmespath')

const rssTemplate = (
  elements,
  {
    channelTitle,
    channelDescription,
    channelCopyright,
    channelTTL,
    channelUpdatePeriod,
    channelUpdateFrequency,
    channelCategory,
    channelLogo,
    imageTitle,
    imageCaption,
    imageCredits,
    itemTitle,
    itemDescription,
    pubDate,
    itemCredits,
    itemCategory,
    includeContent,
    promoItemsJmespath,
    requestPath,
    resizerURL,
    resizerWidth,
    resizerHeight,
    domain,
    feedTitle,
    channelLanguage,
    flipboardBuildContent,
    videoSelect,
    PromoItems,
  },
) => ({
  rss: {
    '@xmlns:atom': 'http://www.w3.org/2005/Atom',
    '@xmlns:content': 'http://purl.org/rss/1.0/modules/content/',
    ...(itemCredits && {
      '@xmlns:dc': 'http://purl.org/dc/elements/1.1/',
    }),
    ...(channelUpdatePeriod &&
      channelUpdatePeriod !== 'Exclude field' && {
        '@xmlns:sy': 'http://purl.org/rss/1.0/modules/syndication/',
      }),
    '@xmlns:media': 'http://search.yahoo.com/mrss/',
    '@version': '2.0',
    channel: {
      title: { $: channelTitle || feedTitle },
      link: domain,
      'atom:link': {
        '@href': `${domain}${requestPath}`,
        '@rel': 'self',
        '@type': 'application/rss+xml',
      },
      description: { $: channelDescription || `${feedTitle} News Feed` },
      lastBuildDate: moment
        .utc(new Date())
        .format('ddd, DD MMM YYYY HH:mm:ss ZZ'),
      ...(channelLanguage &&
        channelLanguage.toLowerCase() !== 'exclude' && {
          language: channelLanguage,
        }),
      ...(channelCategory && { category: channelCategory }),
      ...(channelCopyright && {
        copyright: channelCopyright,
      }), // TODO Add default logic
      ...(channelTTL && { ttl: channelTTL }),
      ...(channelUpdatePeriod &&
        channelUpdatePeriod !== 'Exclude Field' && {
          'sy:updatePeriod': channelUpdatePeriod,
        }),
      ...(channelUpdateFrequency &&
        channelUpdatePeriod !== 'Exclude field' && {
          'sy:updateFrequency': channelUpdateFrequency,
        }),
      ...(channelLogo && {
        image: {
          url: buildResizerURL(channelLogo, resizerKey, resizerURL),
          title: channelTitle || feedTitle,
          link: domain,
        },
      }),

      item: elements.map((s) => {
        let author, body, category
        const url = `${domain}${s.website_url || s.canonical_url || ''}`
        const img = PromoItems.mediaTag({
          ans: s,
          promoItemsJmespath,
          resizerKey,
          resizerURL,
          resizerWidth,
          resizerHeight,
          imageTitle,
          imageCaption,
          imageCredits,
          videoSelect,
        })
        return {
          ...(itemTitle && {
            title: { $: jmespath.search(s, itemTitle) || '' },
          }),
          link: url,
          ...(itemDescription && {
            description: { $: jmespath.search(s, itemDescription) || '' },
          }),
          guid: {
            '#': url,
            '@isPermaLink': true,
          },
          ...(itemCredits &&
            (author = jmespath.search(s, itemCredits)) &&
            author.length && {
              'dc:creator': { $: author.join(', ') },
            }),
          pubDate: moment
            .utc(s[pubDate])
            .format('ddd, DD MMM YYYY HH:mm:ss ZZ'),
          ...(itemCategory &&
            (category = jmespath.search(s, itemCategory)) &&
            category && { category: category }),
          ...(includeContent !== 0 &&
            (body = flipboardBuildContent.parse(
              s.content_elements || [],
              includeContent,
              domain,
              resizerKey,
              resizerURL,
              resizerWidth,
              resizerHeight,
              videoSelect,
            )) &&
            body && {
              'content:encoded': {
                $: body,
              },
            }),
          ...(img && { '#': img }),
        }
      }),
    },
  },
})

export function FlipboardRss({
  globalContent,
  customFields,
  arcSite,
  requestUri,
}) {
  const {
    resizerURL = '',
    feedDomainURL = 'http://localhost.com',
    feedTitle = '',
    feedLanguage = '',
  } = getProperties(arcSite)
  const channelLanguage = customFields.channelLanguage || feedLanguage
  const { width = 0, height = 0 } = customFields.resizerKVP || {}
  const requestPath = new URL.URL(requestUri, feedDomainURL).pathname
  const PromoItems = new BuildPromoItems()

  function FlipboardBuildContent() {
    BuildContent.call(this)

    this.image = (
      element,
      resizerKey,
      resizerURL,
      resizerWidth,
      resizerHeight,
    ) => {
      return {
        figure: {
          img: {
            '@': {
              alt: element.caption || '',
              src: buildResizerURL(
                element.url,
                resizerKey,
                resizerURL,
                resizerWidth,
                resizerHeight,
              ),
              ...(element.width && { width: resizerWidth || element.width }),
              ...(element.height && {
                height: resizerHeight || element.height,
              }),
            },
          },
          ...(element.caption && { figcaption: element.caption }),
        },
      }
    }
  }

  const flipboardBuildContent = new FlipboardBuildContent()

  // can't return null for xml return type, must return valid xml template
  return rssTemplate(globalContent.content_elements || [], {
    ...customFields,
    requestPath,
    resizerURL,
    resizerWidth: width,
    resizerHeight: height,
    domain: feedDomainURL,
    feedTitle,
    channelLanguage,
    flipboardBuildContent,
    PromoItems,
  })
}

FlipboardRss.propTypes = {
  customFields: PropTypes.shape({
    ...generatePropsForFeed('rss', PropTypes, ['includePromo']),
  }),
}

FlipboardRss.label = 'RSS Flipboard'
FlipboardRss.icon = 'arc-rss'
export default Consumer(FlipboardRss)
