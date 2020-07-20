import { assert } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, triggerKeyEvent, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

const KEY = { DOWN: 40, UP: 38, ENTER: 13 };

describe('Integration | Component | ListKeyboardNavigator', function() {
  setupRenderingTest();

  beforeEach(function() {
    this.set('list', [
      { name: 'One' },
      { name: 'Two' },
      { name: 'Three' }
    ]);
  });

  it('handles down arrow key navigation', async function() {
    await render(hbs`
      <ListKeyboardNavigator @items={{list}} as |node|>
        {{#if node}}{{node.name}}{{/if}}
      </ListKeyboardNavigator>`);

    assert.equal(this.element.textContent.trim(), '');

    await triggerKeyEvent('[data-test-list-keyboard-navigator]', 'keydown', KEY.DOWN);
    assert.equal(this.element.textContent.trim(), 'One');
  });

  it('handles up arrow key navigation', async function() {
    await render(hbs`
      <ListKeyboardNavigator @items={{list}} as |node|>
        {{#if node}}{{node.name}}{{/if}}
      </ListKeyboardNavigator>`);

    assert.equal(this.element.textContent.trim(), '');

    let target = find('[data-test-list-keyboard-navigator]');
    await triggerKeyEvent(target, 'keydown', KEY.DOWN);
    await triggerKeyEvent(target, 'keydown', KEY.DOWN);
    await triggerKeyEvent(target, 'keydown', KEY.DOWN);
    await triggerKeyEvent(target, 'keydown', KEY.UP);

    assert.equal(this.element.textContent.trim(), 'Two');
  });

  it('sends an action with the currently selected node when pressing Enter', async function(done) {
    this.set('enterAction', function(node) {
      assert.equal('One', node.name);
      done();
    });

    await render(hbs`
      <ListKeyboardNavigator @items={{list}} @onItemSelected={{enterAction}} as |node|>
        {{#if node}}{{node.name}}{{/if}}
      </ListKeyboardNavigator>`);

    let target = find('[data-test-list-keyboard-navigator]');
    await triggerKeyEvent(target, 'keydown', KEY.DOWN);
    await triggerKeyEvent(target, 'keydown', KEY.ENTER);
  });
});
