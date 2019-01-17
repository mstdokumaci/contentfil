<template>
  <div class="editor" id="app">
    <editor-menu-bubble :editor="editor">
      <div
        slot-scope="{ commands, isActive, menu }"
        class="menububble"
        :class="{ 'is-active': menu.isActive }"
        :style="`left: ${menu.left}px; bottom: ${menu.bottom}px;`"
      >
        <button
          class="menububble__button"
          :class="{ 'is-active': isActive.bold() }"
          @click="commands.bold"
        >
          B
        </button>

        <button
          class="menububble__button"
          :class="{ 'is-active': isActive.italic() }"
          @click="commands.italic"
        >
          I
        </button>

        <button
          class="menububble__button"
          :class="{ 'is-active': isActive.code() }"
          @click="commands.code"
        >
          &lt;&gt;
        </button>

        <button
          class="menububble__button"
          :class="{ 'is-active': isActive.heading({ level: 1 }) }"
          @click="commands.heading({ level: 1 })"
        >
          H1
        </button>

        <button
          class="menububble__button"
          :class="{ 'is-active': isActive.heading({ level: 2 }) }"
          @click="commands.heading({ level: 2 })"
        >
          H2
        </button>

        <button
          class="menububble__button"
          :class="{ 'is-active': isActive.heading({ level: 3 }) }"
          @click="commands.heading({ level: 3 })"
        >
          H3
        </button>
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
  } from 'tiptap-extensions'

  const objectify = state => {
    if (state.content) {
      state.content = Object.assign({}, state.content.map(objectify))
    }
    return state
  }

  const deObjectify = state => {
    if (state.content) {
      const keys = Object.keys(state.content)
      keys.sort((a, b) => +a - +b)
      state.content = keys.map(key => deObjectify(state.content[key]))
    }
    return state
  }

  export default {
    name: 'app',
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
          ],
          content: '<p>A</p>',
          onUpdate: ({ getHTML, tr }) => {
            console.log(tr)
            this.onChange(getHTML())
          }
        }),
        setting: false
      }
    },
    methods: {
      onChange(content) {
        clearTimeout(this.updateTimer)
        this.updateTimer = setTimeout(this.update, 200, content)
      },
      update(content) {
        this.setting = true
        this.$client.get('content').set(content)
        this.setting = false
      }
    },
    created () {
      this.$client.on('connected', val => {
        if (val) {
          this.$client.switchBranch('A')
        }
      })
      this.$client.get('content', '').subscribe(content => {
        if (!this.setting && content !== void 0 && content.compute() !== '') {
          this.editor.setContent(content.compute())
        }
      })
    },
    beforeDestroy() {
      this.editor.destroy()
    }
  }
</script>

<style>
</style>
