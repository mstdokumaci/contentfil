<template>
  <div class="editor" auto-focus="1">
    <div class="fixed-action-btn">
      <a class="btn-floating btn-large waves-effect">
        <i class="large material-icons">menu</i>
      </a>
      <ul>
        <li>
          <button class="btn-floating waves-effect" @click="deleteDraft">
            <i class="material-icons">delete</i>
          </button>
        </li>
        <li>
          <button class="btn-floating waves-effect tooltipped" @click="publish" :disabled="published"
            :data-tooltip="`Last published: ${publishDate}`" data-position="left">
            <i class="material-icons">publish</i>
          </button>
        </li>
      </ul>
    </div>
    <editor-menu-bubble :editor="editor" :keep-in-bounds="false" v-slot="{ commands, isActive, menu }">
      <div class="menububble" :class="{ 'is-active': menu.isActive }"
        :style="`left: ${menu.left}px; bottom: ${menu.bottom}px;`">
        <button class="menububble__button" :class="{ 'is-active': isActive.bold() }" @click="commands.bold">B</button>

        <button class="menububble__button" :class="{ 'is-active': isActive.italic() }"
          @click="commands.italic">I</button>

        <button class="menububble__button" :class="{ 'is-active': isActive.code() }"
          @click="commands.code">&lt;&gt;</button>

        <button class="menububble__button" :class="{ 'is-active': isActive.heading({ level: 1 }) }"
          @click="commands.heading({ level: 1 })">H1</button>

        <button class="menububble__button" :class="{ 'is-active': isActive.heading({ level: 2 }) }"
          @click="commands.heading({ level: 2 })">H2</button>

        <button class="menububble__button" :class="{ 'is-active': isActive.heading({ level: 3 }) }"
          @click="commands.heading({ level: 3 })">H3</button>
      </div>
    </editor-menu-bubble>

    <editor-content class="editor__content" :editor="editor" />
  </div>
</template>

<script>
  import { Editor, EditorContent, EditorMenuBubble } from 'tiptap'
  import {
    Blockquote,
    BulletList,
    CodeBlock,
    HardBreak,
    Heading,
    ListItem,
    OrderedList,
    TodoItem,
    TodoList,
    Bold,
    Code,
    Italic,
    Link,
    Strike,
    Underline,
    History,
    Placeholder
  } from 'tiptap-extensions'

  let subscription

  export default {
    components: {
      EditorContent,
      EditorMenuBubble
    },
    data() {
      return {
        editor: new Editor({
          extensions: [
            new Blockquote(),
            new BulletList(),
            new CodeBlock(),
            new HardBreak(),
            new Heading({ levels: [1, 2, 3] }),
            new ListItem(),
            new OrderedList(),
            new TodoItem(),
            new TodoList(),
            new Bold(),
            new Code(),
            new Italic(),
            new Link(),
            new Strike(),
            new Underline(),
            new History(),
            new Placeholder({
              emptyClass: 'is-empty',
              emptyNodeText: 'Write something',
            })
          ],
          content: "",
          onUpdate: ({ getHTML }) => this.onChange(getHTML())
        }),
        updating: false,
        published: true,
        publishDate: 'Never'
      }
    },
    props: ['id'],
    methods: {
      onChange(content) {
        clearTimeout(this.updateTimer)
        this.updateTimer = setTimeout(this.update, 200, content)
      },
      update(newContent) {
        this.updating = true
        this.$client.get(['draft', this.id, 'content'], newContent).set(newContent)
        this.updating = false
      },
      publish() {
        this.$client.get('draft').emit('publish', this.id)
      },
      deleteDraft() {
        this.$client.get('draft').emit('delete', this.id)
      }
    },
    created() {
      let loadTimeout = setTimeout(() => {
        this.$router.push('/me')
      }, 500)
      subscription = this.$client
        .get('draft', {})
        .subscribe({ keys: [this.id] }, draft => {
          const content = draft.get([this.id, 'content'])
          if (content) {
            if (loadTimeout) {
              clearTimeout(loadTimeout)
              loadTimeout = null
            }

            if (!this.updating && content.compute() !== '') {
              const { from, to } = this.editor.resolveSelection()
              this.editor.setContent(content.compute())
              this.editor.setSelection(from, to)
            }
          }
          const published = draft.get([this.id, 'published'])
          this.published = published && content
            && content.compute() === published.get('content').compute()
          this.publishDate = published ? (new Date(published.get('date').compute())).toUTCString() : 'Never'
        });
    },
    mounted() {
      M.FloatingActionButton.init(
        document.querySelectorAll('.fixed-action-btn'),
        { direction: 'bottom' }
      )
      M.Tooltip.init(document.querySelectorAll('.tooltipped'))
    },
    beforeDestroy() {
      this.editor.destroy()
      subscription && subscription.unsubscribe()
      subscription = null
    }
  }
</script>

<style lang="scss">
  .ProseMirror {
    position: relative;
    word-wrap: break-word;
    -webkit-font-variant-ligatures: none;
    font-variant-ligatures: none
  }

  .ProseMirror,
  .ProseMirror pre {
    white-space: pre-wrap
  }

  .ProseMirror-gapcursor {
    display: none;
    pointer-events: none;
    position: absolute
  }

  .ProseMirror-gapcursor:after {
    content: "";
    display: block;
    position: absolute;
    top: -2px;
    width: 20px;
    border-top: 1px solid #000;
    -webkit-animation: ProseMirror-cursor-blink 1.1s steps(2, start) infinite;
    animation: ProseMirror-cursor-blink 1.1s steps(2, start) infinite
  }

  @-webkit-keyframes ProseMirror-cursor-blink {
    to {
      visibility: hidden
    }
  }

  @keyframes ProseMirror-cursor-blink {
    to {
      visibility: hidden
    }
  }

  .ProseMirror-hideselection ::selection {
    background: transparent
  }

  .ProseMirror-hideselection ::-moz-selection {
    background: transparent
  }

  .ProseMirror-hideselection * {
    caret-color: transparent
  }

  .ProseMirror-focused .ProseMirror-gapcursor {
    display: block
  }

  .editor {
    position: relative;
    margin: 0 auto 5rem;

    .button {
      font-weight: 700;
      display: -webkit-inline-box;
      display: -ms-inline-flexbox;
      display: inline-flex;
      background: rgba(0, 0, 0, 0);
      border: 0;
      color: #000;
      padding: 0.2rem 0.5rem;
      margin-right: 0.2rem;
      border-radius: 3px;
      cursor: pointer;
      background-color: rgba(0, 0, 0, 0.1);
    }

    .menubar {
      margin-bottom: 1rem;
      -webkit-transition: visibility 0.2s 0.4s, opacity 0.2s 0.4s;
      transition: visibility 0.2s 0.4s, opacity 0.2s 0.4s;
    }

    .menubar.is-hidden {
      visibility: hidden;
      opacity: 0;
    }

    .menubar.is-focused {
      visibility: visible;
      opacity: 1;
      -webkit-transition: visibility 0.2s, opacity 0.2s;
      transition: visibility 0.2s, opacity 0.2s;
    }

    .menubar__button {
      font-weight: 700;
      display: -webkit-inline-box;
      display: -ms-inline-flexbox;
      display: inline-flex;
      background: rgba(0, 0, 0, 0);
      border: 0;
      color: #000;
      padding: 0.2rem 0.5rem;
      margin-right: 0.2rem;
      border-radius: 3px;
      cursor: pointer;
    }

    .menubar__button:hover {
      background-color: rgba(0, 0, 0, 0.05);
    }

    .menubar__button.is-active {
      background-color: rgba(0, 0, 0, 0.1);
    }

    .menububble {
      position: absolute;
      display: -webkit-box;
      display: -ms-flexbox;
      display: flex;
      z-index: 20;
      background: #000;
      border-radius: 5px;
      padding: 0.3rem;
      margin-bottom: 0.5rem;
      -webkit-transform: translateX(-50%);
      -ms-transform: translateX(-50%);
      transform: translateX(-50%);
      visibility: hidden;
      opacity: 0;
      -webkit-transition: opacity 0.2s, visibility 0.2s;
      transition: opacity 0.2s, visibility 0.2s;
    }

    .menububble.is-active {
      opacity: 1;
      visibility: visible;
    }

    .menububble__button {
      display: -webkit-inline-box;
      display: -ms-inline-flexbox;
      display: inline-flex;
      background: rgba(0, 0, 0, 0);
      border: 0;
      color: #fff;
      padding: 0.2rem 0.5rem;
      margin-right: 0.2rem;
      border-radius: 3px;
      cursor: pointer;
    }

    .menububble__button:last-child {
      margin-right: 0;
    }

    .menububble__button:hover {
      background-color: hsla(0, 0%, 100%, 0.2);
    }

    .menububble__button.is-active {
      background-color: hsla(0, 0%, 100%, 0.3);
    }

    .menububble__form {
      display: -webkit-box;
      display: -ms-flexbox;
      display: flex;
      -webkit-box-align: center;
      -ms-flex-align: center;
      align-items: center;
    }

    .menububble__input {
      font: inherit;
      border: none;
      background: rgba(0, 0, 0, 0);
      color: #fff;
    }
  }
</style>