import type {Slice, Node as ProseMirrorNode} from '@tiptap/pm/model'

const LIST_TYPES = ['bulletList', 'orderedList', 'taskList']

// ProseMirror's default plain text drops list markers, so a copied list loses its
// structure as soon as it lands in a plain text field. Emit markdown-style markers instead.
export function slicePlainText(slice: Slice): string {
	const blocks: string[] = []
	slice.content.forEach(node => blocks.push(nodeToPlainText(node)))
	return blocks.filter(Boolean).join('\n\n')
}

function nodeToPlainText(node: ProseMirrorNode): string {
	if (node.isLeaf) {
		return ''
	}

	if (node.isTextblock) {
		return node.textContent
	}

	if (LIST_TYPES.includes(node.type.name)) {
		const lines: string[] = []
		node.forEach((item, _offset, index) => {
			const marker = node.type.name === 'orderedList' ? `${index + 1}. ` : '- '
			const [first = '', ...rest] = blocksToPlainText(item).split('\n')
			lines.push(marker + first, ...rest.map(line => '  ' + line))
		})
		return lines.join('\n')
	}

	return blocksToPlainText(node)
}

function blocksToPlainText(node: ProseMirrorNode): string {
	const blocks: string[] = []
	node.forEach(child => blocks.push(nodeToPlainText(child)))
	return blocks.filter(Boolean).join(node.type.name === 'listItem' || node.type.name === 'taskItem' ? '\n' : '\n\n')
}
