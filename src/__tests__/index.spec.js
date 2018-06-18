const { createType, createField, createSchema } = require('../');

const frontSchema = createType('fronts');
const collectionSchema = createType('collections');
const articleFragmentSchema = createType('articleFragments');
const treatSchema = createType('treats');
const supportingSchema = createType('articleFragments');
const groupSchema = createField('group');

let i = 0;

const articleFragment = articleFragmentSchema(
  {
    'meta.supporting': supportingSchema()
  },
  {
    field: groupSchema({
      key: 'meta.group',
      valueKey: 'name',
      uuid: () => `${i++}`
    })
  }
);

const { normalize, denormalize } = createSchema(
  frontSchema({
    collections: collectionSchema({
      live: articleFragment,
      previously: articleFragment,
      treats: treatSchema(
        {},
        {
          field: groupSchema({
            key: 'meta.group',
            valueKey: 'name',
            uuid: () => `${i++}`
          })
        }
      )
    })
  })
);

const model = {
  id: '1',
  collections: [
    {
      id: '1',
      live: [
        {
          id: 'internal-code/page/4717875',
          frontPublicationDate: 1528872499882,
          publishedBy: 'Chris King',
          meta: {
            headline: 'A guide to its new collection',
            showKickerCustom: true,
            supporting: [
              {
                id: 'internal-code/page/4717478',
                meta: {
                  headline: 'Streetwear was a class thing',
                  customKicker: 'A-Cold-Wall*’s Samuel Ross',
                  showQuotedHeadline: true,
                  showKickerCustom: true
                }
              }
            ],
            group: '1',
            customKicker: 'Can M&amp;S be saved by a teddy bear coat?'
          }
        }
      ],
      treats: [
        {
          id: 'snap/1470297947216',
          frontPublicationDate: 1492511039150,
          publishedBy: 'Celine Bijleveld',
          meta: {
            trailText:
              'Free crosswords that can be completed online by mobile, tablet and desktop, and are printable. Daily easy, quick and cryptic crosswords puzzles.',
            headline: 'Crosswords',
            snapType: 'link',
            href: '/crosswords',
            group: '0'
          }
        }
      ],
      lastUpdated: 1528875685805,
      updatedBy: 'Chris King',
      updatedEmail: 'chris.king@guardian.co.uk',
      previously: [
        {
          id: 'internal-code/page/4717035',
          frontPublicationDate: 1528864307952,
          publishedBy: 'Warren Murray',
          meta: {
            headline:
              "'Much nicer than expected': football fans size up Moscow",
            isBoosted: true,
            showKickerCustom: true,
            supporting: [
              {
                id: 'internal-code/page/4714067',
                meta: {
                  headline: "Juergen Teller's World Cup photographs",
                  customKicker: 'Naked, trembling and drinking',
                  showKickerCustom: true
                }
              },
              {
                id: 'internal-code/page/4716873',
                meta: {
                  headline: "What to watch instead if you can't stand football",
                  customKicker: 'Television',
                  imageSrc:
                    'https://media.guim.co.uk/d86c892dfc2a9cc2639c5062704ab82517ef30a1/236_0_2490_1494/master/2490.jpg',
                  imageSrcThumb:
                    'https://media.guim.co.uk/d86c892dfc2a9cc2639c5062704ab82517ef30a1/236_0_2490_1494/500.jpg',
                  imageSrcWidth: '2490',
                  imageSrcHeight: '1494',
                  imageSrcOrigin:
                    'https://media.gutools.co.uk/images/d86c892dfc2a9cc2639c5062704ab82517ef30a1',
                  isBoosted: true,
                  imageReplace: true,
                  showKickerCustom: true
                }
              }
            ],
            group: '1',
            customKicker: 'World Cup'
          }
        }
      ]
    }
  ]
};

describe('normalizer', () => {
  it('normalizes nicely', () => {
    expect(normalize(model)).toEqual({
      articleFragments: {
        'internal-code/page/4717478': {
          id: 'internal-code/page/4717478',
          meta: {
            headline: 'Streetwear was a class thing',
            customKicker: 'A-Cold-Wall*’s Samuel Ross',
            showQuotedHeadline: true,
            showKickerCustom: true
          }
        },
        'internal-code/page/4717875': {
          id: 'internal-code/page/4717875',
          frontPublicationDate: 1528872499882,
          publishedBy: 'Chris King',
          meta: {
            headline: 'A guide to its new collection',
            showKickerCustom: true,
            supporting: ['internal-code/page/4717478'],
            customKicker: 'Can M&amp;S be saved by a teddy bear coat?'
          }
        },
        'internal-code/page/4714067': {
          id: 'internal-code/page/4714067',
          meta: {
            headline: "Juergen Teller's World Cup photographs",
            customKicker: 'Naked, trembling and drinking',
            showKickerCustom: true
          }
        },
        'internal-code/page/4716873': {
          id: 'internal-code/page/4716873',
          meta: {
            headline: "What to watch instead if you can't stand football",
            customKicker: 'Television',
            imageSrc:
              'https://media.guim.co.uk/d86c892dfc2a9cc2639c5062704ab82517ef30a1/236_0_2490_1494/master/2490.jpg',
            imageSrcThumb:
              'https://media.guim.co.uk/d86c892dfc2a9cc2639c5062704ab82517ef30a1/236_0_2490_1494/500.jpg',
            imageSrcWidth: '2490',
            imageSrcHeight: '1494',
            imageSrcOrigin:
              'https://media.gutools.co.uk/images/d86c892dfc2a9cc2639c5062704ab82517ef30a1',
            isBoosted: true,
            imageReplace: true,
            showKickerCustom: true
          }
        },
        'internal-code/page/4717035': {
          id: 'internal-code/page/4717035',
          frontPublicationDate: 1528864307952,
          publishedBy: 'Warren Murray',
          meta: {
            headline:
              "'Much nicer than expected': football fans size up Moscow",
            isBoosted: true,
            showKickerCustom: true,
            supporting: [
              'internal-code/page/4714067',
              'internal-code/page/4716873'
            ],
            customKicker: 'World Cup'
          }
        }
      },
      groups: {
        '0': { name: '1', uuid: '0', live: ['internal-code/page/4717875'] },
        '1': {
          name: '1',
          uuid: '1',
          previously: ['internal-code/page/4717035']
        },
        '2': { name: '0', uuid: '2', treats: ['snap/1470297947216'] }
      },
      treats: {
        'snap/1470297947216': {
          id: 'snap/1470297947216',
          frontPublicationDate: 1492511039150,
          publishedBy: 'Celine Bijleveld',
          meta: {
            trailText:
              'Free crosswords that can be completed online by mobile, tablet and desktop, and are printable. Daily easy, quick and cryptic crosswords puzzles.',
            headline: 'Crosswords',
            snapType: 'link',
            href: '/crosswords'
          }
        }
      },
      collections: {
        '1': {
          id: '1',
          lastUpdated: 1528875685805,
          updatedBy: 'Chris King',
          updatedEmail: 'chris.king@guardian.co.uk',
          groups: ['0', '1', '2']
        }
      },
      fronts: { '1': { id: '1', collections: ['1'] } }
    });
  });

  it('normalizes and denormalizes nicely', () => {
    const denormalized = denormalize(normalize(model), '1');
    expect(denormalized).toEqual(model);
  });
});
