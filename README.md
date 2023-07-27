# tataku-processor-deepl 

Deepl processor for tataku.vim.

## Contents 

- [tataku-processor-deepl-installation](tataku-processor-deepl-installation)
- [tataku-processor-deepl-dependencies](tataku-processor-deepl-dependencies)
- [tataku-processor-deepl-examples](tataku-processor-deepl-examples)
- [tataku-processor-deepl-Options](tataku-processor-deepl-Options)

## Installation 

Use your favorite plugin manager or other.

## Dependencies 

tataku.vim and denops.vim are required.

- https://github.com/Omochcie/tataku.vim
- https://github.com/vim-denops/denops.vim

## Examples 

Configuration:

```vim
let g:tataku_recipes = #{
    \   sample: #{
    \     ...
    \   },
    \   processor: #{
    \     name: 'deepl',
    \     options: #{
    \       source: 'en',
    \       target: 'ja',
    \     },
    \   },
		\   ...
```

## Options 

### `anyjump_definition`

- `isPro` 

Whether to use pro plan access point.

Default: `false`
- `authKey` 

Authentication key.

Required.
- `source` 

The source language name that translate text.

Required.
- `source` 

The target language name that translate text.

Required.

