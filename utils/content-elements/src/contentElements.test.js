import { buildContent } from './contentElements'

const domain = 'https://www.example.com'
const resizerKey = 'ABC123'
const resizerURL = 'https://www.example.com/resizer'

it('handle empty content elements', () => {
  const ce = []
  const text = buildContent(ce, 'all', domain, resizerKey, resizerURL)
  expect(text).toBe('')
})

it('handle empty text content element', () => {
  const ce = [{ type: 'text', content: '' }]
  const text = buildContent(ce, 'all', domain, resizerKey, resizerURL)
  expect(text).toBe('')
})

it('generate text content element', () => {
  const ce = [{ type: 'text', content: '<i>this is text</i><br />' }]
  const text = buildContent(ce, 'all', domain)
  expect(text).toBe('<p>&lt;i&gt;this is text&lt;/i&gt;&lt;br /&gt;</p>')
})

it('generate blockquote content element', () => {
  const ce = [{ type: 'blockquote', content: 'this is a quote' }]
  const text = buildContent(ce, 'all', domain, resizerKey, resizerURL)
  expect(text).toBe('<q>this is a quote</q>')
})

it('generate header content element', () => {
  const ce = [{ type: 'header', content: 'this is a header', level: 2 }]
  const text = buildContent(ce, 'all', domain, resizerKey, resizerURL)
  expect(text).toBe('<h2>this is a header</h2>')
})

it('generate divider content element', () => {
  // divider elements are ignored
  const ce = [
    { type: 'divider', content: 'a divider has no content and is ignored' },
  ]
  const text = buildContent(ce, 'all', domain, resizerKey, resizerURL)
  expect(text).toBe('')
})

it('generate code content element', () => {
  // code elements are ignored
  const ce = [
    { type: 'code', content: '<script>alert("hello world!")</script>' },
  ]
  const text = buildContent(ce, 'all', domain, resizerKey, resizerURL)
  expect(text).toBe('')
})

it('generate custom_embed content element', () => {
  // custom_embed are custom per client and subtype. They will all need to be custom
  const ce = [
    {
      type: 'custom_embed',
      subtype: 'customEmbed_audio',
      embed: { any: 'thing', can: 'go', in: 'here' },
    },
  ]
  const text = buildContent(ce, 'all', domain, resizerKey, resizerURL)
  expect(text).toBe('')
})

it('generate correction content element', () => {
  const ce = [
    {
      type: 'correction',
      correction_type: 'clarification',
      text:
        'In our previous article, we misspelled the name of the restaurant.',
    },
  ]
  const text = buildContent(ce, 'all', domain, resizerKey, resizerURL)
  expect(text).toBe(
    '<i>In our previous article, we misspelled the name of the restaurant.</i>',
  )
})

it('generate endorsement content element', () => {
  const ce = [
    {
      type: 'endorsement',
      endorsement: '$$$',
    },
  ]
  const text = buildContent(ce, 'all', domain, resizerKey, resizerURL)
  expect(text).toBe('<p>$$$</p>')
})

it('generate list content element', () => {
  const ce = [
    {
      type: 'list',
      list_type: 'ordered',
      items: [
        { type: 'text', content: 'This is a list!' },
        {
          type: 'list',
          list_type: 'unordered',
          items: [{ type: 'text', content: 'This is a sub-item.' }],
        },
      ],
    },
  ]
  const text = buildContent(ce, 'all', domain, resizerKey, resizerURL)
  expect(text).toBe(
    '<ol><li>This is a list!</li><li><ul><li>This is a sub-item.</li></ul></li></ol>',
  )
})

it('generate numeric_rating content element', () => {
  const ce = [
    {
      type: 'numeric_rating',
      numeric_rating: 3,
      units: 'stars',
    },
  ]
  const text = buildContent(ce, 'all', domain, resizerKey, resizerURL)
  expect(text).toBe('<p>3 stars</p>')
})

it('generate raw_html content element', () => {
  const ce = [
    {
      type: 'raw_html',
      content:
        '<div class="empty" style="padding: 20px;background-color:#333;color:white;text-align:center;font-size:2em;">Sample HTML block</div>',
    },
  ]
  const text = buildContent(ce, 'all', domain, resizerKey, resizerURL)
  expect(text).toBe(
    '<p>&lt;div class="empty" style="padding: 20px;background-color:#333;color:white;text-align:center;font-size:2em;"&gt;Sample HTML block&lt;/div&gt;</p>',
  )
})

it('generate image content element', () => {
  const ce = [
    {
      type: 'image',
      height: 1275,
      url:
        'https://arc-anglerfish-arc2-prod-demo.s3.amazonaws.com/public/FK3A3PGSLNFYXCHLKWQGADE2ZA.jpg',
      width: 1920,
    },
  ]
  const text = buildContent(ce, 'all', domain, resizerKey, resizerURL)
  // prettier-ignore
  expect(text).toBe(
    "<img src=\"https://www.example.com/resizer/abcdefghijklmnopqrstuvwxyz=/arc-anglerfish-arc2-prod-demo.s3.amazonaws.com/public/FK3A3PGSLNFYXCHLKWQGADE2ZA.jpg\" height=\"1275\" width=\"1920\"/>",
  )
})

it('generate twitter oembed_response content element', () => {
  // twitter need to strip out <script>
  const ce = [
    {
      type: 'oembed_response',
      subtype: 'twitter',
      raw_oembed: {
        html:
          '<blockquote class="twitter-tweet"><p lang="en" dir="ltr">Honestly, same. <a href="https://t.co/vhmMXeG7W4">https://t.co/vhmMXeG7W4</a> <a href="https://t.co/8VqgOr5WUQ">pic.twitter.com/8VqgOr5WUQ</a></p>&mdash; Teddy Amenabar (@TeddyAmen) <a href="https://twitter.com/TeddyAmen/status/1167114295123091459?ref_src=twsrc%5Etfw">August 29, 2019</a></blockquote>\n<script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>\n',
      },
    },
  ]
  const text = buildContent(ce, 'all', domain, resizerKey, resizerURL)
  expect(text).toBe(
    '&lt;blockquote class="twitter-tweet"&gt;&lt;p lang="en" dir="ltr"&gt;Honestly, same. &lt;a href="https://t.co/vhmMXeG7W4"&gt;https://t.co/vhmMXeG7W4&lt;/a&gt; &lt;a href="https://t.co/8VqgOr5WUQ"&gt;pic.twitter.com/8VqgOr5WUQ&lt;/a&gt;&lt;/p&gt;&amp;mdash; Teddy Amenabar (@TeddyAmen) &lt;a href="https://twitter.com/TeddyAmen/status/1167114295123091459?ref_src=twsrc%5Etfw"&gt;August 29, 2019&lt;/a&gt;&lt;/blockquote&gt;',
  )
})

it('generate youtube oembed_response content element', () => {
  const ce = [
    {
      type: 'oembed_response',
      subtype: 'youtube',
      raw_oembed: {
        html:
          '<iframe width="480" height="270" src="https://www.youtube.com/embed/a6KGPBflhiM?feature=oembed" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>',
      },
    },
  ]
  const text = buildContent(ce, 'all', domain, resizerKey, resizerURL)
  expect(text).toBe(
    '&lt;iframe width="480" height="270" src="https://www.youtube.com/embed/a6KGPBflhiM?feature=oembed" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen&gt;&lt;/iframe&gt;',
  )
})

it('generate table content element', () => {
  const ce = [
    {
      type: 'table',
      header: [
        {
          type: 'text',
          content: 'Fruit',
        },
        {
          type: 'text',
          content: 'Vegetable',
        },
      ],
      rows: [
        [
          {
            type: 'text',
            content: 'Apple',
          },
          {
            type: 'text',
            content: 'Asparagus',
          },
        ],
        [
          {
            type: 'text',
            contenT: 'Blue Berries',
          },
          {
            type: 'text',
            content: 'brussel Sprouts',
          },
        ],
      ],
    },
  ]
  const text = buildContent(ce, 'all', domain, resizerKey, resizerURL)
  expect(text).toBe(
    '<table><thead><tr><th>Fruit</th><th>Vegetable</th></tr></thead><tbody><tr><td>Apple</td><td>Asparagus</td></tr><tr><td>brussel Sprouts</td></tr></tbody></table>',
  )
})
