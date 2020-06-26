import PropTypes from 'fusion:prop-types'
import Consumer from 'fusion:consumer'
import get from 'lodash/get'
import moment from 'moment'
import getProperties from 'fusion:properties'
import { resizerKey } from 'fusion:environment'
import { BuildContent } from '@wpmedia/feeds-content-elements'
import { generatePropsForFeed } from '@wpmedia/feeds-prop-types'
import { buildResizerURL } from '@wpmedia/feeds-resizer'
import { fragment } from 'xmlbuilder2'
const jmespath = require('jmespath')

const rssTemplate = (
  elements,
  {
    channelTitle,
    channelDescription,
    channelPath,
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
    itemCategory,
    includePromo,
    includeContent,
    resizerURL,
    resizeWidth,
    resizeHeight,
    domain,
    feedTitle,
    feedLanguage,
    fbiaBuildContent,
    markupVersion,
    articleStyle,
    likesAndComments,
    adPlacement,
  },
) => ({
  rss: {
    '@xmlns:atom': 'http://www.w3.org/2005/Atom',
    '@xmlns:content': 'http://purl.org/rss/1.0/modules/content/',
    '@xmlns:dc': 'http://purl.org/dc/elements/1.1/',
    '@xmlns:sy': 'http://purl.org/rss/1.0/modules/syndication/',
    '@version': '2.0',
    ...(includePromo && {
      '@xmlns:media': 'http://search.yahoo.com/mrss/',
    }),
    channel: {
      title: `${channelTitle || feedTitle}`,
      link: `${domain}`,
      'atom:link': {
        '@href': `${domain}${channelPath}`,
        '@rel': 'self',
        '@type': 'application/rss+xml',
      },
      description: `${channelDescription || feedTitle + ' News Feed'}`,
      lastBuildDate: moment
        .utc(new Date())
        .format('ddd, DD MMM YYYY HH:mm:ss ZZ'),
      ...(feedLanguage && { language: feedLanguage }),
      ...(channelCategory && { category: channelCategory }),
      ...(channelCopyright && {
        copyright: channelCopyright,
      }), // TODO Add default logic
      ...(channelTTL && { ttl: channelTTL }),
      ...(channelUpdatePeriod && {
        'sy:updatePeriod': channelUpdatePeriod,
      }),
      ...(channelUpdateFrequency && {
        'sy:updateFrequency': channelUpdateFrequency,
      }),
      ...(channelLogo && {
        image: {
          url: buildResizerURL(channelLogo, resizerKey, resizerURL),
          title: `${channelTitle || feedTitle}`,
          link: `${domain}`,
        },
      }),

      item: elements.map((s) => {
        let author, body, category
        const url = `${domain}${s.website_url || s.canonical_url}`
        const img =
          s.promo_items && (s.promo_items.basic || s.promo_items.lead_art)
        console.log(s._id)
        return {
          title: `${jmespath.search(s, itemTitle)}`,
          link: url,
          guid: {
            '#': url,
            '@isPermaLink': true,
          },
          ...((author = jmespath.search(s, 'credits.by[].name')) &&
            author && {
              'dc:creator': author.join(','),
            }),
          description: { $: jmespath.search(s, itemDescription) },
          pubDate: moment
            .utc(s[pubDate])
            .format('ddd, DD MMM YYYY HH:mm:ss ZZ'),
          ...(itemCategory &&
            (category = jmespath.search(s, itemCategory)) &&
            category && { category: category }),
          ...(includeContent !== '0' &&
            (body = fbiaBuildContent.parse(
              s,
              s.content_elements,
              includeContent,
              domain,
              resizerKey,
              resizerURL,
              resizeWidth,
              resizeHeight,
              img,
              itemTitle,
              feedLanguage,
              itemDescription,
              markupVersion,
              articleStyle,
              likesAndComments,
              adPlacement,
            )) &&
            body && {
              'content:encoded': {
                $: body,
              },
            }),
          ...(includePromo &&
            img &&
            img.url && {
              'media:content': {
                '@type': 'image/jpeg',
                '@url': buildResizerURL(img.url, resizerKey, resizerURL),
                ...(jmespath.search(img, imageCaption) && {
                  'media:description': {
                    '@type': 'plain',
                    $: jmespath.search(img, imageCaption),
                  },
                }),
                ...(jmespath.search(img, imageTitle) && {
                  'media:title': {
                    $: jmespath.search(img, imageTitle),
                  },
                }),
                ...((jmespath.search(img, imageCredits) || []).length && {
                  'media:credit': {
                    '@role': 'author',
                    '@scheme': 'urn:ebu',
                    '#': jmespath.search(img, imageCredits).join(','),
                  },
                }),
              },
            }),
        }
      }),
    },
  },
})

export function FbiaRss({ globalContent, customFields, arcSite }) {
  const {
    resizerURL = '',
    feedDomainURL = '',
    feedTitle = '',
    feedLanguage = '',
  } = getProperties(arcSite)

  function FbiaBuildContent(
    s,
    contentElements,
    numRows,
    domain,
    resizerKey,
    resizerURL,
    resizeWidth,
    resizeHeight,
    img,
    itemTitle,
    feedLanguage,
    itemDescription,
    markupVersion,
    articleStyle,
    likesAndComments,
    adPlacement,
  ) {
    BuildContent.call(this)

    this.buildHTMLHeader = (s) => {
      const url = `${domain}${s.website_url || s.canonical_url}`
      return {
        link: {
          '@rel':
            (s.canonical_url && 'canonical') || (s.website_url && 'website'),
          '@href': url,
        },
        title: itemTitle,
        meta: [
          {
            '@property': 'og:title',
            '@content': itemTitle,
          },
          {
            '@property': 'og:url',
            '@content': url,
          },
          {
            '@property': 'og:description',
            '@content': itemDescription,
          },
          {
            '@property': 'fb:use_automatic_ad_placement',
            '@content': adPlacement || 'false',
            //'@default': 'default', <- add ad density?
          },
          {
            '@property': 'op:markup_version', //The version of Instant Articles markup format being used by this article.
            '@content': 'v1.0',
          },
          {
            '@property': 'fb:article_style',
            '@content': articleStyle || 'default',
          },
          {
            '@property': 'og:image',
            '@content':
              (img && buildResizerURL(img.url, resizerKey, resizerURL)) || '',
          },
          {
            '@property': 'fb:likes_and_comments',
            '@content': likesAndComments || 'disable',
          },
        ],
      }
    }
    this.buildHTMLBody = (s) => {
      let item
      const body = []
      const maxRows = numRows === 'all' ? 9999 : parseInt(numRows)
      body.push()
      contentElements.map((element) => {
        if (body.length <= maxRows) {
          switch (element.type) {
            case 'blockquote':
              item = this.blockquote(element)
              break
            case 'correction':
              item = this.correction(element)
              break
            case 'code':
            case 'custom_embed':
            case 'divider':
            case 'element_group':
            case 'story':
              item = ''
              break
            case 'endorsement':
              item = this.endorsement(element)
              break
            case 'gallery':
              item = this.gallery(
                element,
                resizerKey,
                resizerURL,
                resizeWidth,
                resizeHeight,
              )
              break
            case 'header':
              item = this.header(element)
              break
            case 'image':
              item = this.image(
                element,
                resizerKey,
                resizerURL,
                resizeWidth,
                resizeHeight,
              )
              break
            case 'interstitial_link':
              item = this.interstitial(element, domain)
              break
            case 'link_list':
              item = this.linkList(element, domain)
              break
            case 'list':
              item = this.list(element)
              break
            case 'list_element':
              item = this.listElement(element)
              break
            case 'numeric_rating':
              item = this.numericRating(element)
              break
            case 'oembed_response':
              item = this.oembed(element)
              break
            case 'quote':
              item = this.quote(element)
              break
            case 'raw_html':
              item = this.text(element)
              break
            case 'table':
              item = this.table(element)
              break
            case 'text':
              item = this.text(element)
              break
            case 'video':
              item = this.video(element)
              break
            default:
              item = this.text(element)
              break
          }

          // empty array breaks xmlbuilder2, but empty '' is OK
          if (Array.isArray(item) && item.length === 0) {
            item = ''
          }
          console.log(item)
          item && body.push(item)
        }
      })
      return body.length ? fragment(body).toString() : ''
    }
    this.parse = (s) => {
      const fbiaContent = {
        html: {
          '@lang': feedLanguage,
          head: this.buildHTMLHeader(s),
          body: this.buildHTMLBody(s),
        },
      }
      return fragment(fbiaContent).toString()
    }
  }

  const fbiaBuildContent = new FbiaBuildContent()

  // can't return null for xml return type, must return valid xml template
  return rssTemplate(get(globalContent, 'content_elements', []), {
    ...customFields,
    resizerURL,
    domain: feedDomainURL,
    feedTitle,
    feedLanguage,
    fbiaBuildContent,
  })
}
//Reference for fb options: https://developers.facebook.com/docs/instant-articles/reference/article/
FbiaRss.propTypes = {
  customFields: PropTypes.shape({
    channelPath: PropTypes.string.tag({
      label: 'Path',
      group: 'Channel',
      description:
        'Path to the feed excluding the domain, defaults to /arcio/fb-ia',
      defaultValue: '/arcio/fb-ia',
    }),
    articleStyle: PropTypes.string.tag({
      label: 'Article Style',
      group: 'Item',
      description:
        'This parameter is optional and your default style is applied to this article if you do not specify an article style in your markup',
      defaultValue: 'default',
    }),
    likesAndComments: PropTypes.string.tag({
      label: 'Likes and Comments',
      group: 'Item',
      description: 'Enable or disable',
      defaultValue: 'disable',
    }),
    adPlacement: PropTypes.string.tag({
      label: 'Auto Ad Placement',
      group: 'Item',
      description:
        'Enables automatic placement of ads within this article. This parameter is optional and defaults to false if you do not specify',
      defaultValue: 'false',
    }),
    ...generatePropsForFeed('rss', PropTypes, ['channelPath', 'includePromo']),
  }),
}

FbiaRss.label = 'Facebook IA RSS'
export default Consumer(FbiaRss)
/*adDensity: PropTypes.string.tag({
      label: 'Auto Ad Placement',
      group: 'Item',
      description: 'Enable or disable',
      defaultValue: 'disable',
    }),*/
