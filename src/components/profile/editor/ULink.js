import { Link } from 'tiptap-extensions'

export default class ULink extends Link {
  get schema() {
    return Object.assign(
      super.schema,
      {
        parseDOM: [
          {
            tag: 'a[href]',
            contentElement: 'u',
            getAttrs: dom => ({
              href: dom.getAttribute('href'),
            }),
          },
        ],
        toDOM: node => ['a',
          {
            ...node.attrs,
            rel: 'noopener noreferrer nofollow',
          }, [
            'u', 0
          ]
        ],
      }
    )
  }
}