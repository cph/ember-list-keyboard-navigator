import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, triggerKeyEvent, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

const KEY = { DOWN: 40, UP: 38, ENTER: 13 };

module('Integration | Component | ListKeyboardNavigator', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function() {
    this.set('list', [
      { name: 'One' },
      { name: 'Two' },
      { name: 'Three' }
    ]);
  });

  test('it handles down arrow key navigation', async function(assert) {
    await render(hbs`
      <ListKeyboardNavigator @items={{list}} as |node|>
        {{#if node}}{{node.name}}{{/if}}
      </ListKeyboardNavigator>`);

    assert.equal(this.element.textContent.trim(), '');

    await triggerKeyEvent('[data-test-list-keyboard-navigator]', 'keydown', KEY.DOWN);
    assert.equal(this.element.textContent.trim(), 'One');
  });

  test('handles up arrow key navigation', async function(assert) {
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

  test('sends an action with the currently selected node when pressing Enter', async function(assert) {
    assert.expect(1);
    const done = assert.async();

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
