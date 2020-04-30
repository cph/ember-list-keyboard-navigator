// cf. https://github.com/jquery/jquery/blob/26415e081b318dbe1d46d2b7c30e05f14c339b75/src/offset.js#L94-L100
function offsetOf(el) {
  const rect = el.getBoundingClientRect();
  const win = el.ownerDocument.defaultView;
  return {
    top: rect.top + win.pageYOffset,
    left: rect.left + win.pageXOffset
  };
}

export function scrollIntoView(el) {
  let scrollParent = el && el.closest('.scrollable');
  if(!scrollParent) { return; }
  let scrollTop = scrollParent.scrollTop;

  // elTop is the distance between the top edge of the node
  // and the top edge of its scroll container.
  let elTop = offsetOf(el).top + scrollTop - offsetOf(scrollParent).top;
  let elHeight = el.offsetHeight;

  // [minOffset, maxOffset] describe the range of offsets
  // which are currently scrolled into view.
  //
  // If the element's offset is between these values, it is
  // entirely visible and we should not scroll to it.
  let minOffset = scrollTop;
  let maxOffset = scrollTop + scrollParent.offsetHeight - elHeight;

  // Scroll up or down just enough to reveal the element.
  let scrollDelta = 0;
  if(elTop < minOffset) {
    scrollDelta = elTop - minOffset;
  } else if(elTop > maxOffset) {
    scrollDelta = elTop - maxOffset;
  }

  if(scrollDelta !== 0) {
    scrollParent.scrollTop = scrollTop + scrollDelta;
  }
}

export function scrollToTop(el) {
  let scrollParent = el && el.closest('.scrollable');
  if(!scrollParent) { return; }
  scrollParent.scrollTop = 0;
}

export function scrollToBottom(el) {
  let scrollParent = el && el.closest('.scrollable');
  if(!scrollParent) { return; }
  scrollParent.scrollTop = scrollParent.scrollHeight;
}
