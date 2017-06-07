# Repositório base do aplicativo Compras do Bem

## Dependências

[Node Js](https://nodejs.org/en/)

[Yarn](https://yarnpkg.com/pt-BR/docs/install)*

[Mongo](https://www.mongodb.com/download-center)

## Rodando a aplicação

**Instale os plugins**

``` bash
$ npm install

ou, se estiver usando o Yarn

$ yarn
```

**Servindo a aplicação**

``` bash
$ npm start
```

Vá em [localhost:3000](localhost:3000) para acessar.

## Extrutura

Todas as páginas encontram-se em **/app/views** e os recursos de javascript, css, imagens, etc encontram-se em **/public**.

Estamos usando uma marcação chamada [PUG](https://pugjs.org/api/getting-started.html).

--------------------------
## Pug básico

O pug cria a hierarquisação das tags html por identação. No caso de nosso projeto estamos usando o padrão de 2 espaços. Veja abaixo

*pug*
``` pug
ul
  li teste
  li teste 2
```
*html*
``` html
<ul>
  <li>teste</li>
  <li>teste 2</li>
</ul>
```

**Classes e Ids**

*pug*
``` pug
#id
  p.classe Paragraf com classe
#id2.classe
```
*html*
``` html
<div id="id">
  <p class="classe">Paragraf com classe</p>
</div>
<div id="id2" class="classe"></div>
```

**Identação de Conteudo in Div**

*pug*
``` pug
div
  | Texto in Div
  span Algum Span
```
*html*
``` html
<div>
  Texto in Div
  <span>Algum Span</span>
</div>
```

**Repetição de conteúdo (Loops)**

*pug*
``` pug
each val in [1, 2, 3]
  //- Catrão Default
  .card
    .card-title
      h1 titulo do card
    .card-text
      p Texto do card.
```
*html*
``` html
<!-- Cartão Default -->
<div class="card">
  <div class="card-title">
    <h1>titulo do card</h1>
  </div>
  <div class="card-text">
    <p>Texto do card.</p>
  </div>
</div>
<!-- Cartão Default -->
<div class="card">
  <div class="card-title">
    <h1>titulo do card</h1>
  </div>
  <div class="card-text">
    <p>Texto do card.</p>
  </div>
</div>
<!-- Cartão Default -->
<div class="card">
  <div class="card-title">
    <h1>titulo do card</h1>
  </div>
  <div class="card-text">
    <p>Texto do card.</p>
  </div>
</div>
```
--------------------------

A extrutura básica se encontra em **layouts/default.pug**. Todas as outras páginas que usarem esse layout precisam ter no começo desta.

Abaixo o padrão de cada página.

``` pug
extends ../layouts/default

block styles
  //- Algum CSS ou metatag que só essa página possua

block content
  //- O conteúdo da página

block scripts
  //- Algum script que só essa página possua.
```

## Estrutura de Arquivos de layout

| Arquivos                               | Descrição                                                  |
| ---------------------------------- | ------------------------------------------------------------ |
| **app/views**           | Pasta principal das Views.  |
| **app/views/account**           | Páginas relacionadas com o login e conta de usuário.              |
| **app/views/account**/forgot.pug         | Página de esquecimento de senha.                                 |
| **app/views/account**/login.pug            | Página de login.                            |
| **app/views/account**/profile.pug            | Página para edição das informações do usuário.                      |
| **app/views/account**/reset.pug                 | Página gerada para o reset da senha.                          |
| **app/views/account**/signup.pug                        | Página de cadastro de usuário.                         |
| **app/views/layouts**   | Pasta de layouts, por exemplo um layout sem header ou para mobile.                 |
| **app/views/layouts**/default.pug          | Layout padrão de montagem de páginas.                      |
| **app/views/pages**       | Pasta com páginas do site.                                |
| **app/views/pages**/dashboard.pug | Página de dashboard, só pode ser acessada com login.           |
| **app/views/pages**/home.pug                 | Página principal '/'.      |
| **views/api**/                     | Templates for API Examples.                                  |
| **app/views/pages**/user.pug       | Página de perfil de usuários.                 |
| **app/views/partials**    | Pasta com os elementos padrões do template.                                     |
| **app/views/partials**/flash.pug                 | Menssagens de Erro / Sucesso / Info.                                          |
| **app/views/partials**/foot.pug                 | Scripts.                                          |
| **app/views/partials**/footet.pug                 | Footer.                                          |
| **app/views/partials**/head.pug      | Meta tags e CSS.                                     |
| **app/views/partials**/header.pug               | Nav Bar.                                               |
| **app/views/servicos**               | Pasta com as páginas principais de servicos.                                               |
| **app/views/servicos**/edit.pug               | Página de edição de serviços.                                               |
| **app/views/servicos**/form.pug               | Formulário de criação e edição de serviços.                                               |
| **app/views/servicos**/index.pug               | Página de resultado de busca de serviços.                                               |
| **app/views/servicos**/new.pug               | Página de criação de novo serviço.                                               |
| **app/views/servicos**/show.pug               | Perfil público do serviço.                                               |


License
-------

The MIT License (MIT)

Copyright (c) 2017 Jardim Digital

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
