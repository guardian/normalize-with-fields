const { createType, createField, build } = require('../');

let i = 0;
let afId = 0;

const front = createType('fronts');
const collection = createType('collections');

const group = createField('group', {
  key: 'meta.group',
  valueKey: 'name',
  uuid: () => `${i++}`
});

const articleFragment = createType('articleFragments', {
  preProcess: af => ({
    ...af,
    uuid: afId++
  }),
  idKey: 'uuid',
  field: group
});
const treat = createType('treats', {
  field: group
});
const supporting = createType('articleFragments', {
  idKey: 'uuid',
  preProcess: af => ({
    ...af,
    uuid: afId++
  })
});

const { normalize, denormalize } = build(
  front({
    collections: collection({
      live: articleFragment({
        'meta.supporting': supporting()
      }),
      previously: articleFragment({
        'meta.supporting': supporting()
      }),
      treats: treat()
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
          uuid: 5,
          frontPublicationDate: 1528872499882,
          publishedBy: 'Chris King',
          meta: {
            headline: 'A guide to its new collection',
            showKickerCustom: true,
            supporting: [
              {
                id: 'internal-code/page/4717478',
                uuid: 6,
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
          uuid: 7,
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
                uuid: 8,
                meta: {
                  headline: "Juergen Teller's World Cup photographs",
                  customKicker: 'Naked, trembling and drinking',
                  showKickerCustom: true
                }
              },
              {
                id: 'internal-code/page/4716873',
                uuid: 9,
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
        '1': {
          uuid: 1,
          id: 'internal-code/page/4717478',
          meta: {
            headline: 'Streetwear was a class thing',
            customKicker: 'A-Cold-Wall*’s Samuel Ross',
            showQuotedHeadline: true,
            showKickerCustom: true
          }
        },
        '0': {
          uuid: 0,
          id: 'internal-code/page/4717875',
          frontPublicationDate: 1528872499882,
          publishedBy: 'Chris King',
          meta: {
            headline: 'A guide to its new collection',
            showKickerCustom: true,
            supporting: [1],
            customKicker: 'Can M&amp;S be saved by a teddy bear coat?'
          }
        },
        '3': {
          uuid: 3,
          id: 'internal-code/page/4714067',
          meta: {
            headline: "Juergen Teller's World Cup photographs",
            customKicker: 'Naked, trembling and drinking',
            showKickerCustom: true
          }
        },
        '4': {
          uuid: 4,
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
        '2': {
          uuid: 2,
          id: 'internal-code/page/4717035',
          frontPublicationDate: 1528864307952,
          publishedBy: 'Warren Murray',
          meta: {
            headline:
              "'Much nicer than expected': football fans size up Moscow",
            isBoosted: true,
            showKickerCustom: true,
            supporting: [3, 4],
            customKicker: 'World Cup'
          }
        }
      },
      groups: {
        '0': { name: '1', uuid: '0', live: [0] },
        '1': {
          name: '1',
          uuid: '1',
          previously: [2]
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
