const { createType, createFieldType, build } = require('../');

let i = 0;
let afId = 0;

const collection = createType('collections');

const group = createFieldType('groups', {
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
const treat = createType('articleFragments', {
  field: group
});
const supporting = createType('articleFragments', {
  idKey: 'uuid',
  preProcess: af => ({
    ...af,
    uuid: afId++
  })
});

const { normalize, denormalize } = build({
  collections: collection({
    live: articleFragment({
      'meta.supporting': supporting()
    }),
    previously: articleFragment({
      'meta.supporting': supporting()
    }),
    treats: treat()
  })
});

const guModel = {
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

const absModel = {
  keep: 'me',
  as: [
    {
      id: 1,
      keep: 'me',
      b: 'b1',
      cs: [{ id: 1, d: 'd1' }, { id: 2, d: 'd2' }, { id: 3, d: 'd1' }]
    },
    {
      id: 2,
      b: 'b1',
      cs: []
    },
    {
      id: 3,
      b: 'b2',
      cs: [{ id: 4, d: 'd2' }]
    }
  ]
};

describe('normalizer', () => {
  it('normalizes nicely', () => {
    expect(normalize(guModel)).toEqual({
      entities: {
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
          '0': { name: '1', uuid: '0', articleFragments: [0] },
          '1': {
            name: '1',
            uuid: '1',
            articleFragments: [2]
          },
          '2': {
            name: '0',
            uuid: '2',
            articleFragments: ['snap/1470297947216']
          }
        },
        collections: {
          '1': {
            id: '1',
            lastUpdated: 1528875685805,
            updatedBy: 'Chris King',
            updatedEmail: 'chris.king@guardian.co.uk',
            live: ['0'],
            previously: ['1'],
            treats: ['2']
          }
        }
      },
      result: { id: '1', collections: ['1'] }
    });
  });

  it('normalizes and denormalizes nicely', () => {
    const { result, entities } = normalize(guModel);
    const denormalized = denormalize(result, entities);
    expect(denormalized).toEqual(guModel);
  });

  it('handles multiple fields', () => {
    let bi = 0;
    let di = 0;

    const a = createType('as', {
      field: createFieldType('bs', {
        key: 'b',
        groupKey: 'bs',
        valueKey: 'bType',
        uuid: () => bi++
      })
    });
    const c = createType('cs', {
      field: createFieldType('ds', {
        key: 'd',
        groupKey: 'ds',
        valueKey: 'dType',
        uuid: () => di++
      })
    });

    const { normalize, denormalize } = build({
      as: a({
        cs: c()
      })
    });

    const normalized = normalize(absModel);

    expect(normalized).toEqual({
      result: {
        keep: 'me',
        bs: [0, 1]
      },
      entities: {
        as: {
          1: {
            keep: 'me',
            id: 1,
            ds: [0, 1]
          },
          2: {
            id: 2,
            ds: []
          },
          3: {
            id: 3,
            ds: [2]
          }
        },
        bs: {
          0: {
            bType: 'b1',
            uuid: 0,
            as: [1, 2]
          },
          1: {
            bType: 'b2',
            uuid: 1,
            as: [3]
          }
        },
        cs: {
          1: {
            id: 1
          },
          2: {
            id: 2
          },
          3: {
            id: 3
          },
          4: {
            id: 4
          }
        },
        ds: {
          0: {
            dType: 'd1',
            uuid: 0,
            cs: [1, 3]
          },
          1: {
            dType: 'd2',
            uuid: 1,
            cs: [2]
          },
          2: {
            dType: 'd2',
            uuid: 2,
            cs: [4]
          }
        }
      }
    });

    expect(denormalize(normalized.result, normalized.entities)).toEqual({
      keep: 'me',
      as: [
        {
          id: 1,
          keep: 'me',
          b: 'b1',
          // NOTE: these are reordered when denormalized due to tree ordering
          cs: [{ id: 1, d: 'd1' }, { id: 3, d: 'd1' }, { id: 2, d: 'd2' }]
        },
        {
          id: 2,
          b: 'b1',
          cs: []
        },
        {
          id: 3,
          b: 'b2',
          cs: [{ id: 4, d: 'd2' }]
        }
      ]
    });
  });

  it('handles default fields', () => {
    let bi = 0;
    let di = 0;

    const a = createType('as', {
      field: createFieldType('bs', {
        key: 'b',
        groupKey: 'bs',
        valueKey: 'bType',
        uuid: () => bi++,
        defaultValue: 'defB'
      })
    });
    const c = createType('cs', {
      field: createFieldType('ds', {
        key: 'd',
        groupKey: 'ds',
        valueKey: 'dType',
        uuid: () => di++,
        defaultValue: 'defD'
      })
    });

    const { normalize, denormalize } = build({
      as: a({
        cs: c()
      })
    });

    const normalized = normalize(absModel);

    expect(normalized).toEqual({
      result: {
        keep: 'me',
        bs: [0, 1]
      },
      entities: {
        as: {
          1: {
            keep: 'me',
            id: 1,
            ds: [0, 1]
          },
          2: {
            id: 2,
            ds: [2]
          },
          3: {
            id: 3,
            ds: [3]
          }
        },
        bs: {
          0: {
            bType: 'b1',
            uuid: 0,
            as: [1, 2]
          },
          1: {
            bType: 'b2',
            uuid: 1,
            as: [3]
          }
        },
        cs: {
          1: {
            id: 1
          },
          2: {
            id: 2
          },
          3: {
            id: 3
          },
          4: {
            id: 4
          }
        },
        ds: {
          0: {
            dType: 'd1',
            uuid: 0,
            cs: [1, 3]
          },
          1: {
            dType: 'd2',
            uuid: 1,
            cs: [2]
          },
          2: {
            dType: 'defD',
            uuid: 2,
            cs: []
          },
          3: {
            dType: 'd2',
            uuid: 3,
            cs: [4]
          }
        }
      }
    });

    expect(denormalize(normalized.result, normalized.entities)).toEqual({
      keep: 'me',
      as: [
        {
          id: 1,
          keep: 'me',
          b: 'b1',
          // NOTE: these are reordered when denormalized due to tree ordering
          cs: [{ id: 1, d: 'd1' }, { id: 3, d: 'd1' }, { id: 2, d: 'd2' }]
        },
        {
          id: 2,
          b: 'b1',
          cs: []
        },
        {
          id: 3,
          b: 'b2',
          cs: [{ id: 4, d: 'd2' }]
        }
      ]
    });
  });
});
