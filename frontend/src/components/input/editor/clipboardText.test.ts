import {describe, it, expect} from 'vitest'
import {ref} from 'vue'
import {Editor} from '@tiptap/core'

import {createEditorExtensions} from './editorExtensions'
import {slicePlainText} from './clipboardText'

function serialize(content: string) {
	const holder = document.createElement('div')
	document.body.appendChild(holder)
	const editor = new Editor({
		element: holder,
		extensions: createEditorExtensions({
			t: key => key,
			isEditing: ref(true),
			isEditEnabled: () => true,
			placeholder: '',
			contentHasChanged: ref(false),
			bubbleSave: () => {},
			getEditor: () => editor,
			uploadCallback: undefined,
			uploadAndInsertFiles: () => {},
		}),
		content,
	})
	const text = slicePlainText(editor.state.doc.slice(0, editor.state.doc.content.size))
	editor.destroy()
	holder.remove()
	return text
}

describe('slicePlainText', () => {
	it('keeps bullet and ordered list markers', () => {
		expect(serialize('<p>start</p><ul><li><p>this</p></li><li><p>is</p></li></ul><p>end</p>'))
			.toBe('start\n\n- this\n- is\n\nend')
		expect(serialize('<ol><li><p>one</p></li><li><p>two</p></li></ol>')).toBe('1. one\n2. two')
	})

	it('indents nested lists', () => {
		expect(serialize('<ul><li><p>outer</p><ul><li><p>inner</p></li></ul></li></ul>'))
			.toBe('- outer\n  - inner')
	})
})
