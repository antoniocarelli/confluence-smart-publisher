# 🧪 Teste da Implementação Personalizada de Admonitions

Este arquivo testa a implementação personalizada que substitui `markdown-it-admonition`.

## Teste 1: Tipos Básicos

!!! note
    Esta é uma admonition de nota sem título personalizado.

!!! warning "Título Personalizado"
    Esta é uma admonition de warning com título personalizado.

## Teste 2: Todos os Tipos Suportados

!!! note "Nota"
    Tipo Note com borda azul #448aff

!!! abstract "Resumo"
    Tipo Abstract com borda azul claro #00bcd4

!!! info "Informação"
    Tipo Info com borda ciano #00b8d4

!!! tip "Dica"
    Tipo Tip com borda teal #00bfa5

!!! success "Sucesso"
    Tipo Success com borda verde #00c853

!!! question "Pergunta"
    Tipo Question com borda verde claro #64dd17

!!! warning "Aviso"
    Tipo Warning com borda laranja #ff9100

!!! failure "Falha"
    Tipo Failure com borda vermelha clara #ff5252

!!! danger "Perigo"
    Tipo Danger com borda vermelha #ff1744

!!! bug "Bug"
    Tipo Bug com borda rosa #f50057

!!! example "Exemplo"
    Tipo Example com borda roxo #7c4dff

!!! quote "Citação"
    Tipo Quote com borda cinza #9e9e9e

## Teste 3: Aliases

!!! summary "Resumo usando alias"
    Teste do alias 'summary' para 'abstract'

!!! tldr "Resumo TLDR"
    Teste do alias 'tldr' para 'abstract'

!!! todo "A Fazer"
    Teste do alias 'todo' para 'info'

!!! hint "Dica usando alias"
    Teste do alias 'hint' para 'tip'

!!! important "Importante"
    Teste do alias 'important' para 'tip'

!!! check "Verificado"
    Teste do alias 'check' para 'success'

!!! done "Concluído"
    Teste do alias 'done' para 'success'

!!! help "Ajuda"
    Teste do alias 'help' para 'question'

!!! faq "FAQ"
    Teste do alias 'faq' para 'question'

!!! caution "Cuidado"
    Teste do alias 'caution' para 'warning'

!!! attention "Atenção"
    Teste do alias 'attention' para 'warning'

!!! fail "Falhou"
    Teste do alias 'fail' para 'failure'

!!! missing "Ausente"
    Teste do alias 'missing' para 'failure'

!!! error "Erro"
    Teste do alias 'error' para 'danger'

!!! cite "Citação"
    Teste do alias 'cite' para 'quote'

## Teste 4: Conteúdo Aninhado

!!! example "Exemplo Complexo"
    #### Subtítulo Aninhado
    
    Este exemplo demonstra conteúdo **rico** e *variado* dentro de uma admonition.
    
    **Lista ordenada:**
    1. Primeiro item
    2. Segundo item
        - Sub-item não ordenado
        - Outro sub-item
    3. Terceiro item
    
    **Lista não ordenada:**
    - Item A
    - Item B
    - Item C
    
    **Bloco de código:**
    ```javascript
    function exemploAdmonition() {
        console.log("Código dentro de admonition!");
        return "Funcionando perfeitamente";
    }
    ```
    
    **Tabela:**
    | Coluna 1 | Coluna 2 | Coluna 3 |
    |----------|----------|----------|
    | Dado A   | Dado B   | Dado C   |
    | Valor 1  | Valor 2  | Valor 3  |
    
    **Link:** [Documentação](https://example.com)
    
    **Código inline:** `const teste = true;`

## Teste 5: Múltiplos Admonitions Sequenciais

!!! tip "Primeira Dica"
    Esta é a primeira dica.

!!! danger "Primeiro Perigo"
    Este é um aviso de perigo.

Texto normal entre admonitions para verificar que a delimitação está funcionando corretamente.

!!! success "Primeira Confirmação"
    Operação realizada com sucesso.

!!! info "Informação Adicional"
    Informações complementares sobre o processo.

## Teste 6: Casos Extremos

!!! note ""
    Admonition com título vazio (deveria usar o padrão "Note").

!!! warning
    Admonition sem título (deveria usar o padrão "Warning").

!!! example "Título com espaços    extras   "
    Teste com espaços extras no título.

!!! quote "Título com \"aspas\" aninhadas"
    Teste com aspas dentro do título.

## Teste 7: Validação de Indentação

!!! note "Teste de Indentação"
    Esta linha está corretamente indentada com 4 espaços.
    
        Esta linha tem indentação extra (8 espaços total).
    
    Esta linha volta à indentação normal de 4 espaços.

Esta linha não está indentada, então o admonition deve terminar acima.

!!! tip "Novo Admonition"
    Este é um novo admonition após a quebra.

## Estrutura HTML Esperada

Cada admonition deve gerar HTML na seguinte estrutura:

```html
<div class="admonition tipo">
  <p class="admonition-title">Título</p>
  <p>Conteúdo...</p>
</div>
```

## Verificação Visual

Se a implementação estiver correta, você deve ver:

1. ✅ Cada tipo com sua cor de borda específica
2. ✅ Aliases funcionando (summary = abstract, etc.)
3. ✅ Títulos personalizados e padrão funcionando
4. ✅ Conteúdo aninhado preservado (listas, código, tabelas)
5. ✅ Múltiplos admonitions bem delimitados
6. ✅ Indentação de 4 espaços respeitada