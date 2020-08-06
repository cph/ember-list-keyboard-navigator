
import Component from '@glimmer/component';
import { action } from '@ember/object';
import { schedule } from '@ember/runloop';
import { tracked } from '@glimmer/tracking';
import KEY from '../utils/keycodes';
import { scrollToTop, scrollToBottom, scrollIntoView } from '../utils/scroll-helpers';

export default class ListKeyboardNavigatorComponent extends Component {
  scrollElement = null;

  @tracked _selectedItem = null;
  @tracked _highlightedItemIndex = -1;
  @tracked _highlightedBy = null;

  get itemSelector() {
    return this.args.itemSelector || 'li';
  }

  get selectedItem() {
    return this._selectedItem || this.args.selectedItem;
  }
  set selectedItem(item) {
    this._selectedItem = item;
    this._highlightedBy = null;
    this.highlightedIndex = this.selectedItemIndex;
  }

  get _list() {
    return this.args.items || [];
  }

  get selectImmediately() {
    return !!this.args.selectImmediately;
  }

  get highlightOnMouseOver() {
    return !this.selectImmediately;
  }

  get selectedItemIndex() {
    if (!this.selectedItem) { return -1; }
    return this._list.indexOf(this.selectedItem);
  }

  get highlightedIndex() {
    const index = this._highlightedItemIndex;
    if (!this.highlightFromSelection) { return index; }
    return index < 0 ? this.selectedItemIndex : index;
  }
  set highlightedIndex(value) {
    this._highlightedItemIndex = value;
    this.scrollToHighlightedItem();
    this.notifyChangedHighlightedItem();
  }

  get highlightedItem() {
    let index = this.highlightedIndex;
    if (index < 0 || this._list.length === 0) { return null; }
    if (index >= this._list.length) { index = index % this._list.length; }
    return this._list[index];
  }

  @action
  reset() {
    this.resetHighlight();
    schedule('afterRender', this, () => { this.scrollToSelectedItem(); });
  }

  scrollToHighlightedItem() {
    if (!this.scrollElement) { return; }
    const { itemSelector, highlightedIndex, _highlightedBy } = this;
    if (_highlightedBy === 'mouse') return;
    if (highlightedIndex < 0) return;

    const el = this.scrollElement.querySelectorAll(itemSelector)[highlightedIndex];
    if (!el) { return; }

    if (highlightedIndex === 0) {
      scrollToTop(el);
    } else if(highlightedIndex === this._list.length - 1) {
      scrollToBottom(el);
    } else {
      scrollIntoView(el);
    }
  }

  notifyChangedHighlightedItem() {
    this.args.onItemHighlighted && this.args.onItemHighlighted(this.highlightedItem);
  }

  resetHighlight() {
    this.updateHighlightIndex({ index: -1 });
  }

  scrollToSelectedItem() {
    if (this.selectedItemIndex < 0) { return; }

    const el = this.scrollElement.querySelectorAll(this.itemSelector)[this.selectedItemIndex];
    if (el) { scrollIntoView(el); }
  }

  updateHighlightIndex({ index, highlightedBy }) {
    if (this._highlightedItemIndex === index) { return; }
    this._highlightedBy = highlightedBy;
    this.highlightedIndex = index;
    if (this.selectImmediately) { this.select(); }
  }

  @action
  onKeyDown(e) {
    const { altKey, ctrlKey, metaKey, shiftKey, keyCode } = e;
    if (altKey || ctrlKey || metaKey) { return; }
    if (e.defaultPrevented) { return; }

    if (keyCode >= KEY.ZERO && keyCode <= KEY.Z ||
        keyCode >= KEY.NUMPAD_ZERO && keyCode <= KEY.NUMPAD_NINE ||
        keyCode === KEY.BACKSPACE) {
      this.args.onTyping && this.args.onTyping();
    }

    if (shiftKey) { return; }

    switch(keyCode) {
      case KEY.DOWN:
        e.preventDefault();
        this.downPressed();
        break;
      case KEY.UP:
        e.preventDefault();
        this.upPressed();
        break;
      case KEY.ENTER:
        if (this._highlightedBy !== 'keyboard') { break; }
        if (this.highlightedItem && this.highlightedItem !== this.selectedItem) {
          e.preventDefault();
          e.stopImmediatePropagation();
          this.enterPressed();
        }
        break;
    }
  }

  downPressed() {
    const currentIndex = this.highlightedIndex;
    let list = this._list;
    if (currentIndex === list.length - 1) {
      this.args.onHitBottom && this.args.onHitBottom();
      return;
    }
    if (list.length === 0) { return; }
    const index = Math.min((currentIndex + 1), list.length - 1);
    this.updateHighlightIndex({ index, highlightedBy: 'keyboard' });
  }

  upPressed() {
    const currentIndex = this.highlightedIndex;
    if (currentIndex <= 0) {
      if (this.args.onHitTop) {
        this.updateHighlightIndex({ index: -1, highlightedBy: 'keyboard' });
        this.args.onHitTop();
      }
      return;
    }
    const list = this._list;
    if (list.length === 0) { return; }
    const index = Math.max(0, currentIndex - 1);
    this.updateHighlightIndex({ index, highlightedBy: 'keyboard' });
  }

  enterPressed() {
    this.select();
  }

  select() {
    const item = this.highlightedItem;
    if(item !== null && this.args.onItemSelected) { this.args.onItemSelected(item); }
  }

  @action
  onMouseOverItem(e) {
    if (!this.highlightOnMouseOver) { return; }
    if (!this.scrollElement) { return; }
    let item = e.target.closest(this.itemSelector);
    let index = Array.from(this.scrollElement.querySelectorAll(this.itemSelector).values()).indexOf(item);
    this.updateHighlightIndex({ index, highlightedBy: 'mouse' });
  }

  @action
  onMouseLeave(/* e */) {
    if (!this.highlightOnMouseOver) { return; }
    this.updateHighlightIndex({ index: -1, highlightedBy: 'mouse' });
  }

  @action
  acquireFocus() {
    if (!this.scrollElement) { return; }
    if (this.args.focused) {
      // Safari will scroll to the top of the div and cancel any click events if
      // we focus on the keyboard navigator when it or a child is already in focus
      let alreadyFocused = this.scrollElement.contains(document.activeElement);
      if (!alreadyFocused) {
        this.scrollElement.focus();
        this.scrollElement.dispatchEvent(new KeyboardEvent('keydown', { keyCode: KEY.DOWN }));
      }
    }
  }

  @action
  onFocusIn() {
    this.args.onFocusIn && this.args.onFocusIn();
  }

  @action
  onFocusOut() {
    this.args.onFocusOut && this.args.onFocusOut();
  }

  @action
  registerScrollElement(el) {
    this.scrollElement = el;
  }

  @action deregisterScrollElement() {
    this.scrollElement = null;
  }
}
