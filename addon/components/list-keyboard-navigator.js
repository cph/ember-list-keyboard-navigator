import Component from '@ember/component';
import layout from '../templates/components/list-keyboard-navigator';
import { not, oneWay } from '@ember/object/computed';
import { observer, computed } from '@ember/object';
import { run, schedule } from '@ember/runloop';
import { typeOf } from '@ember/utils';
import $ from 'jquery';
import KEY from '../utils/keycodes';
import { scrollToTop, scrollToBottom, scrollIntoView } from '../utils/scroll-helpers';

const doNothing = function() {};

export default Component.extend({
  layout,
  attributeBindings: ['tabIndex:tabindex'],
  classNames: ['list-keyboard-navigator'],
  'data-test-list-keyboard-navigator': true,

  selectedItem: null,
  itemSelector: 'li',
  tabIndex: 0,
  highlightFromSelection: false,
  selectImmediately: false,
  items: Object.freeze([]),

  _highlightedItemIndex: -1,
  _highlightedBy: null,
  _list: oneWay('items'),

  highlightOnMouseOver: not('selectImmediately'),

  highlightedIndex: computed('highlightFromSelection', '_highlightedItemIndex', function() {
    let index = this.get('_highlightedItemIndex');
    if(!this.get('highlightFromSelection')) return index;
    return index < 0 ? this.get('selectedItemIndex') : index;
  }),

  highlightedItem: computed('highlightedIndex', function() {
    let index = this.get('highlightedIndex');
    let list = this.get('_list');
    if(index < 0 || list.length === 0) return null;
    if(index >= list.length) index = index % list.length;
    return list[index];
  }),

  selectedItemIndex: computed('selectedItem', '_list.[]', function() {
    let selectedItem = this.get('selectedItem');
    if(!selectedItem) return -1;
    return this.get('_list').indexOf(selectedItem);
  }),

  highlightSelectedItem: observer('selectedItem', function() {
    let _highlightedItemIndex = this.get('selectedItemIndex');
    this.setProperties({ _highlightedItemIndex, _highlightedBy: null });
  }),

  didInsertElement() {
    this._super(...arguments);
    this.reset();
    this._activeSelector = this.get('itemSelector');
    this._mouseOverHandler = run.bind(this, 'onMouseOverItem');
    $(this.element).on('mouseover', this._mouseOverHandler);
  },

  willDestroyElement() {
    $(this.element).off('mouseover', this._mouseOverHandler);
    this._super(...arguments);
  },

  reset: observer('_list.[]', function() {
    this.resetHighlight();
    schedule('afterRender', this, () => { this.scrollToSelectedItem(); });
  }),

  scrollToHighlightedItem: observer('highlightedIndex', function() {
    let { itemSelector, highlightedIndex, _highlightedBy } = this.getProperties('itemSelector', 'highlightedIndex', '_highlightedBy');
    if(_highlightedBy === 'mouse') return;
    if(highlightedIndex < 0) return;

    let $el = $(this.element).find(`${itemSelector}:eq(${highlightedIndex})`);
    if(highlightedIndex === 0) {
      scrollToTop($el);
    } else if(highlightedIndex === this.get('_list.length') - 1) {
      scrollToBottom($el);
    } else {
      scrollIntoView($el);
    }
  }),

  notifyChangedHighlightedItem: observer('highlightedItem', function() {
    this.getAction('onItemHighlighted')(this.get('highlightedItem'));
  }),

  resetHighlight() {
    this.updateHighlightIndex({ index: -1 });
  },

  scrollToSelectedItem() {
    let selectedItemIndex = this.get('selectedItemIndex');
    if(selectedItemIndex < 0) return;
    let $el = $(this.element).find(`${this.get('itemSelector')}:eq(${selectedItemIndex})`);
    if($el.length > 0) scrollIntoView($el);
  },

  updateHighlightIndex({ index, highlightedBy }) {
    if(this.get('_highlightedItemIndex') === index) return;
    this.setProperties({ _highlightedItemIndex: index, _highlightedBy: highlightedBy });
    if(this.get('selectImmediately')) this.select();
  },

  keyDown(e) {
    let { altKey, ctrlKey, metaKey, shiftKey, keyCode } = e;
    if(altKey || ctrlKey || metaKey) return;
    if(e.isDefaultPrevented()) return;

    if(keyCode >= KEY.ZERO && keyCode <= KEY.Z ||
        keyCode >= KEY.NUMPAD_ZERO && keyCode <= KEY.NUMPAD_NINE ||
        keyCode === KEY.BACKSPACE) {
      this.getAction('onTyping')();
    }

    if(shiftKey) return;

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
        if(this.get('_highlightedBy') !== 'keyboard') break;
        if(this.get('highlightedItem') && this.get('highlightedItem') !== this.get('selectedItem')) {
          e.preventDefault();
          e.stopImmediatePropagation();
          this.enterPressed();
        }
        break;
    }
  },

  downPressed() {
    let currentIndex = this.get('highlightedIndex');
    let list = this.get('_list');
    if(currentIndex === list.length - 1) {
      this.getAction('onHitBottom')();
      return;
    }
    if(list.length === 0) return;
    let index = Math.min((currentIndex + 1), this.get('_list.length') - 1);
    this.updateHighlightIndex({ index, highlightedBy: 'keyboard' });
  },

  upPressed() {
    let currentIndex = this.get('highlightedIndex');
    if(currentIndex <= 0) {
      if(this.get('onHitTop')) {
        this.updateHighlightIndex({ index: -1, highlightedBy: 'keyboard' });
        this.getAction('onHitTop')();
      }
      return;
    }
    let list = this.get('_list');
    if(list.length === 0) return;
    let index = Math.max(0, currentIndex - 1);
    this.updateHighlightIndex({ index, highlightedBy: 'keyboard' });
  },

  enterPressed() {
    this.select();
  },

  select() {
    let item = this.get('highlightedItem');
    if(item !== null) this.getAction('onItemSelected')(item);
  },

  onMouseOverItem(e) {
    if(!this.get('highlightOnMouseOver')) return;
    let $item = $(e.target).closest(this.get('itemSelector'));
    let index = $(this.element).find(this.get('itemSelector')).index($item);
    this.updateHighlightIndex({ index, highlightedBy: 'mouse' });
  },

  mouseLeave(/* e */) {
    if(!this.get('highlightOnMouseOver')) return;
    this.updateHighlightIndex({ index: -1, highlightedBy: 'mouse' });
  },

  acquireFocus: observer('focused', function() {
    if(this.get('focused')) {
      // Safari will scroll to the top of the div and cancel any click events if
      // we focus on the keyboard navigator when it or a child is already in focus
      let $el = $(this.element);
      let alreadyFocused = $el.is(document.activeElement) || $.contains($el[0], document.activeElement);
      if(!alreadyFocused) {
        $el.focus().trigger($.Event('keydown', { keyCode: KEY.DOWN }));
      }
    }
  }),

  focusIn() {
    this.set('focused', true);
    this.getAction('focus-in')();
  },

  focusOut() {
    this.set('focused', false);
    this.getAction('focus-out')();
  },

  getAction(actionName) {
    return typeOf(this.get(actionName)) === 'function' ? this.get(actionName) : doNothing;
  }
});
