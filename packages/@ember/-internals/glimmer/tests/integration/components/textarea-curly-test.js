import { RenderingTestCase, moduleFor, classes, runTask } from 'internal-test-helpers';

import { set } from '@ember/-internals/metal';

class TextAreaRenderingTest extends RenderingTestCase {
  assertTextArea({ attrs, value } = {}) {
    let mergedAttrs = Object.assign({ class: classes('ember-view ember-text-area') }, attrs);
    this.assertComponentElement(this.firstChild, {
      tagName: 'textarea',
      attrs: mergedAttrs,
    });

    if (value) {
      this.assert.strictEqual(value, this.firstChild.value);
    }
  }

  triggerEvent(type, options = {}) {
    let event = document.createEvent('Events');
    event.initEvent(type, true, true);
    Object.assign(event, options);

    this.firstChild.dispatchEvent(event);
  }
}

moduleFor(
  'Components test: {{textarea}}',
  class extends TextAreaRenderingTest {
    ['@test Should insert a textarea'](assert) {
      this.render('{{textarea}}');

      assert.equal(this.$('textarea').length, 1);

      this.assertStableRerender();
    }

    ['@test Should bind its contents to the specified value']() {
      this.render('{{textarea value=this.model.val}}', {
        model: { val: 'A beautiful day in Seattle' },
      });
      this.assertTextArea({ value: 'A beautiful day in Seattle' });

      this.assertStableRerender();

      runTask(() => set(this.context, 'model.val', 'Auckland'));
      this.assertTextArea({ value: 'Auckland' });

      runTask(() => set(this.context, 'model', { val: 'A beautiful day in Seattle' }));
      this.assertTextArea({ value: 'A beautiful day in Seattle' });
    }

    ['@test GH#14001 Should correctly handle an empty string bound value']() {
      this.render('{{textarea value=this.message}}', { message: '' });

      this.assert.strictEqual(this.firstChild.value, '');

      this.assertStableRerender();

      runTask(() => set(this.context, 'message', 'hello'));

      this.assert.strictEqual(this.firstChild.value, 'hello');

      runTask(() => set(this.context, 'message', ''));

      this.assert.strictEqual(this.firstChild.value, '');
    }

    ['@test should update the value for `cut` / `input` / `change` events']() {
      this.render('{{textarea value=this.model.val}}', {
        model: { val: 'A beautiful day in Seattle' },
      });
      this.assertTextArea({ value: 'A beautiful day in Seattle' });

      this.assertStableRerender();

      runTask(() => {
        this.firstChild.value = 'Auckland';
        this.triggerEvent('cut');
      });
      this.assertTextArea({ value: 'Auckland' });

      runTask(() => {
        this.firstChild.value = 'Hope';
        this.triggerEvent('paste');
      });
      this.assertTextArea({ value: 'Hope' });

      runTask(() => {
        this.firstChild.value = 'Boston';
        this.triggerEvent('input');
      });
      this.assertTextArea({ value: 'Boston' });

      runTask(() => set(this.context, 'model', { val: 'A beautiful day in Seattle' }));
      this.assertTextArea({ value: 'A beautiful day in Seattle' });
    }
  }
);
