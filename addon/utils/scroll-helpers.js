export function scrollIntoView($el) {
  let $scrollParent = $el.closest('.scrollable');
  if($scrollParent.length === 0) { return; }
  let scrollTop = $scrollParent.scrollTop();

  // elTop is the distance between the top edge of the node
  // and the top edge of its scroll container.
  let elTop = $el.offset().top + scrollTop - $scrollParent.offset().top;
  let elHeight = $el.outerHeight();

  // [minOffset, maxOffset] describe the range of offsets
  // which are currently scrolled into view.
  //
  // If the element's offset is between these values, it is
  // entirely visible and we should not scroll to it.
  let minOffset = scrollTop;
  let maxOffset = scrollTop + $scrollParent.outerHeight() - elHeight;

  // Scroll up or down just enough to reveal the element.
  let scrollDelta = 0;
  if(elTop < minOffset) {
    scrollDelta = elTop - minOffset;
  } else if(elTop > maxOffset) {
    scrollDelta = elTop - maxOffset;
  }

  if(scrollDelta !== 0) {
    $scrollParent.scrollTop(scrollTop + scrollDelta);
  }
}

export function scrollToTop($el) {
  let $scrollParent = $el.closest('.scrollable');
  if($scrollParent.length === 0) { return; }
  $scrollParent.scrollTop(0);
}

export function scrollToBottom($el) {
  let $scrollParent = $el.closest('.scrollable');
  if($scrollParent.length === 0) { return; }
  $scrollParent.scrollTop($scrollParent.prop('scrollHeight'));
}
