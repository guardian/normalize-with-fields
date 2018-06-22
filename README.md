# Normalize with fields

This does a very similar thing to [normalizr](https://github.com/paularmstrong/normalizr): specify a schema to build functions to normalize / denormalize an object that adheres to that schema. The main difference is the ability to treat 'fields' as normalizable entities in a model. This is a niche use case but maps on to various guardian models. Eg:

The below model where `articleFragments` have a `group` field ...

```js
const collections = {
  id: 1,
  articleFragments: [
    {
      id: 1,
      group: 'big'
    },
    {
      id: 2,
      group: 'big'
    },
    {
      id: 3,
      group: 'small'
    }
  ]
};
```

... actually represents `articleFragments` collected by `groups` ...

```js
const collections = {
  id: 1,
  groups: [
    {
      id: 'big',
      articleFragments: [
        {
          id: 1
        },
        {
          id: 2
        }
      ]
    },
    {
      id: 'small',
      articleFragments: [
        {
          id: 3
        }
      ]
    }
  ]
};
```

This library allows you to specify a schema that will treat these fields as parents. Potentially this library could have done the preprocessing work to change the model / schema before handing off the actual normalization to a tool like normalizr but this would have required keeping two schemas or using a normalizr schema as the schema for this tool, which seemed a bit odd. That said, this library also allows nested key syntax such as `a.b` which is required for some use cases and does not exist in normalizr.

**Warning** `fields` should only be used when the data model _should_ be representing a tree. Denormalizing will cause a different ordering of entities from the original model in some cases e.g:

```js
// if `d` is set as a fieldType on the below model
{
  cs: [{ id: 1, d: 'd1' }, { id: 2, d: 'd2' }, { id: 3, d: 'd1' }];
}

// then denormalizing will result in:

{
  cs: [{ id: 1, d: 'd1' }, { id: 3, d: 'd1' }, { id: 2, d: 'd2' }];
}

// if the model is genuinely only used as tree then this should have no semantic difference as building that tree will require this sorting anyway
```

## Build

`build(schema): { normalize(treeModel), denormalize(rootEntity, entities) }`

When passed a `schema` this function will return a `normalize` and `denormalize` function that will accept a tree / flat object respectively to process. Denormalize takes a rootEntity and begin denormalizing from that node.

## Creating schema

`createType(type, opts = { field = null, idKey = 'id', preProcess = node => ({ ...node }) })(children): SchemaNode`

This creates a schema node.

- `type` will be used as the normalized type.
- `idKey` is the field to key the node by.
- `preProcess` will allow modifications to be made for a node before it's normalized.
- `field` defines a field spec (see `createFieldType`).
- `children` of the shape `{ [key]: SchemaNode }` specifices how to traverse the different children type. The `key` can appear as `a.b.c` in order to drill down into nested objects.

`` createFieldType(type, opts = { key: = type, childrenKey = `${type}s`, valueKey = 'id', uuid = null }): Field ``

This creates a field spec for transforming a field on a node into a parent of that node.

- `type` is the normalized type.
- `key` is the key on the node to look for the field. The `key` can appear as `a.b.c` in order to drill down into nested objects.
- `childrenKey` is the name on the new entity to add the child ids to. It defaults to the entity type of the child.
- `valueKey` is the key on the normalized model to add the `type` to.
- `uuid`, if specified, will be called to add a `uuid` key to the entity in order to disambiguate it from others with the same name in sibling nodes.

## Example

Here is an example using basically every feature!

```js
const { createType, createFieldType, build } = require('../');

let i = 0;
let afId = 0;

const collection = createType('collections');

const group = createFieldType('group', {
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
```

The above is taken verbatim from the spec. To see the inputs / outputs of a schame like this have a look in [there](src/__tests__/index.spec.js).
