export function longpress(node: HTMLElement, duration = 500) {
	let timeout: ReturnType<typeof setTimeout> | null = null;

	const handlePressStart = () => {
		timeout = setTimeout(() => {
			node.dispatchEvent(new CustomEvent('show'));
		}, duration);
	};

	const handlePressEnd = () => {
		if (timeout) clearTimeout(timeout);
	};

	node.addEventListener('mousedown', handlePressStart);
	node.addEventListener('touchstart', handlePressStart);
	node.addEventListener('mouseup', handlePressEnd);
	node.addEventListener('mouseleave', handlePressEnd);
	node.addEventListener('touchend', handlePressEnd);
	node.addEventListener('touchcancel', handlePressEnd);

	return {
		destroy() {
			node.removeEventListener('mousedown', handlePressStart);
			node.removeEventListener('touchstart', handlePressStart);
			node.removeEventListener('mouseup', handlePressEnd);
			node.removeEventListener('mouseleave', handlePressEnd);
			node.removeEventListener('touchend', handlePressEnd);
			node.removeEventListener('touchcancel', handlePressEnd);
		}
	};
}
