function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; subClass.__proto__ = superClass; }

import { getDocument } from 'ssr-window';
import $ from '../../shared/dom7';
import { extend } from '../../shared/utils';
import { getDevice } from '../../shared/get-device';
import Modal from '../modal/modal-class';
/** @jsx $jsx */

import $jsx from '../../shared/$jsx';

var Dialog = /*#__PURE__*/function (_Modal) {
  _inheritsLoose(Dialog, _Modal);

  function Dialog(app, params) {
    var _this;

    var extendedParams = extend({
      title: app.params.dialog.title,
      text: undefined,
      content: '',
      buttons: [],
      verticalButtons: false,
      onClick: undefined,
      cssClass: undefined,
      destroyOnClose: false,
      on: {}
    }, params);

    if (typeof extendedParams.closeByBackdropClick === 'undefined') {
      extendedParams.closeByBackdropClick = app.params.dialog.closeByBackdropClick;
    }

    if (typeof extendedParams.backdrop === 'undefined') {
      extendedParams.backdrop = app.params.dialog.backdrop;
    } // Extends with open/close Modal methods;


    _this = _Modal.call(this, app, extendedParams) || this;

    var dialog = _assertThisInitialized(_this);

    var device = getDevice();
    var document = getDocument();
    var title = extendedParams.title,
        text = extendedParams.text,
        content = extendedParams.content,
        buttons = extendedParams.buttons,
        verticalButtons = extendedParams.verticalButtons,
        cssClass = extendedParams.cssClass,
        backdrop = extendedParams.backdrop;
    dialog.params = extendedParams; // Find Element

    var $el;

    if (!dialog.params.el) {
      var dialogClasses = ['dialog'];
      if (buttons.length === 0) dialogClasses.push('dialog-no-buttons');
      if (buttons.length > 0) dialogClasses.push("dialog-buttons-" + buttons.length);
      if (verticalButtons) dialogClasses.push('dialog-buttons-vertical');
      if (cssClass) dialogClasses.push(cssClass);
      var buttonsHTML = '';

      if (buttons.length > 0) {
        buttonsHTML = $jsx("div", {
          class: "dialog-buttons"
        }, buttons.map(function (button) {
          return $jsx("span", {
            class: "dialog-button" + (button.bold ? ' dialog-button-bold' : '') + (button.color ? " color-" + button.color : '') + (button.cssClass ? " " + button.cssClass : '')
          }, button.text);
        }));
      }

      var dialogHtml = $jsx("div", {
        class: dialogClasses.join(' ')
      }, $jsx("div", {
        class: "dialog-inner"
      }, title && $jsx("div", {
        class: "dialog-title"
      }, title), text && $jsx("div", {
        class: "dialog-text"
      }, text), content), buttonsHTML);
      $el = $(dialogHtml);
    } else {
      $el = $(dialog.params.el);
    }

    if ($el && $el.length > 0 && $el[0].f7Modal) {
      return $el[0].f7Modal || _assertThisInitialized(_this);
    }

    if ($el.length === 0) {
      return dialog.destroy() || _assertThisInitialized(_this);
    }

    var $backdropEl;

    if (backdrop) {
      $backdropEl = app.$el.children('.dialog-backdrop');

      if ($backdropEl.length === 0) {
        $backdropEl = $('<div class="dialog-backdrop"></div>');
        app.$el.append($backdropEl);
      }
    } // Assign events


    function buttonOnClick(e) {
      var buttonEl = this;
      var index = $(buttonEl).index();
      var button = buttons[index];
      if (button.onClick) button.onClick(dialog, e);
      if (dialog.params.onClick) dialog.params.onClick(dialog, index);
      if (button.close !== false) dialog.close();
    }

    var addKeyboardHander;

    function onKeyDown(e) {
      var keyCode = e.keyCode;
      buttons.forEach(function (button, index) {
        if (button.keyCodes && button.keyCodes.indexOf(keyCode) >= 0) {
          if (document.activeElement) document.activeElement.blur();
          if (button.onClick) button.onClick(dialog, e);
          if (dialog.params.onClick) dialog.params.onClick(dialog, index);
          if (button.close !== false) dialog.close();
        }
      });
    }

    if (buttons && buttons.length > 0) {
      dialog.on('open', function () {
        $el.find('.dialog-button').each(function (buttonEl, index) {
          var button = buttons[index];
          if (button.keyCodes) addKeyboardHander = true;
          $(buttonEl).on('click', buttonOnClick);
        });

        if (addKeyboardHander && !device.ios && !device.android && !device.cordova && !device.capacitor) {
          $(document).on('keydown', onKeyDown);
        }
      });
      dialog.on('close', function () {
        $el.find('.dialog-button').each(function (buttonEl) {
          $(buttonEl).off('click', buttonOnClick);
        });

        if (addKeyboardHander && !device.ios && !device.android && !device.cordova && !device.capacitor) {
          $(document).off('keydown', onKeyDown);
        }

        addKeyboardHander = false;
      });
    }

    extend(dialog, {
      app: app,
      $el: $el,
      el: $el[0],
      $backdropEl: $backdropEl,
      backdropEl: $backdropEl && $backdropEl[0],
      type: 'dialog',
      setProgress: function setProgress(progress, duration) {
        app.progressbar.set($el.find('.progressbar'), progress, duration);
        return dialog;
      },
      setText: function setText(newText) {
        var $textEl = $el.find('.dialog-text');

        if ($textEl.length === 0) {
          $textEl = $('<div class="dialog-text"></div>');

          if (typeof title !== 'undefined') {
            $textEl.insertAfter($el.find('.dialog-title'));
          } else {
            $el.find('.dialog-inner').prepend($textEl);
          }
        }

        $textEl.html(newText);
        dialog.params.text = newText;
        return dialog;
      },
      setTitle: function setTitle(newTitle) {
        var $titleEl = $el.find('.dialog-title');

        if ($titleEl.length === 0) {
          $titleEl = $('<div class="dialog-title"></div>');
          $el.find('.dialog-inner').prepend($titleEl);
        }

        $titleEl.html(newTitle);
        dialog.params.title = newTitle;
        return dialog;
      }
    });

    function handleClick(e) {
      var target = e.target;
      var $target = $(target);

      if ($target.closest(dialog.el).length === 0) {
        if (dialog.params.closeByBackdropClick && dialog.backdropEl && dialog.backdropEl === target) {
          dialog.close();
        }
      }
    }

    dialog.on('opened', function () {
      if (dialog.params.closeByBackdropClick) {
        app.on('click', handleClick);
      }
    });
    dialog.on('close', function () {
      if (dialog.params.closeByBackdropClick) {
        app.off('click', handleClick);
      }
    });
    $el[0].f7Modal = dialog;

    if (dialog.params.destroyOnClose) {
      dialog.once('closed', function () {
        setTimeout(function () {
          dialog.destroy();
        }, 0);
      });
    }

    return dialog || _assertThisInitialized(_this);
  }

  return Dialog;
}(Modal);

export default Dialog;