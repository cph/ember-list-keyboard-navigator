# ember-list-keyboard-navigator

[![Build Status](https://travis-ci.org/cph/ember-list-keyboard-navigator.svg)](https://travis-ci.org/cph/ember-list-keyboard-navigator)

A component for handling keyboard navigation of a list of items


## Installation

```
ember install ember-list-keyboard-navigator
```


## Usage

###### Example:

```htmlbars
{{#list-keyboard-navigator
    itemSelector=".item"
    items=list as |highlightedItem|}}
  {{#each list as |item|}}
    <li class="item {{if (eq item.index highlightedItem.index) "highlighted"}}">
      {{item.label}}
    </li>
  {{/each}}
{{#list-keyboard-navigator}}
```


## License

This project is licensed under the [MIT License](LICENSE.md).
