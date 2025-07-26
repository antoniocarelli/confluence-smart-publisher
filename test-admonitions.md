# 🧪 Teste de Admonitions SCSS

Este arquivo testa especificamente as admonitions processadas do `admonitions.scss`.

## Admonitions Básicas

!!! note "Nota"
    Esta é uma admonition de nota. Deve ter borda azul (#448aff) e ícone de lápis.

!!! tip "Dica"
    Esta é uma admonition de dica. Deve ter borda teal (#00bfa5) e ícone de fogo.

!!! warning "Aviso"
    Esta é uma admonition de aviso. Deve ter borda laranja (#ff9100) e ícone de alerta.

!!! danger "Perigo"
    Esta é uma admonition de perigo. Deve ter borda vermelha (#ff1744) e ícone de raio.

## Admonitions Avançadas

!!! success "Sucesso"
    Esta é uma admonition de sucesso. Deve ter borda verde (#00c853) e ícone de check.

!!! info "Informação"
    Esta é uma admonition de informação. Deve ter borda ciano (#00b8d4) e ícone de informação.

!!! question "Pergunta"
    Esta é uma admonition de pergunta. Deve ter borda verde claro (#64dd17) e ícone de interrogação.

!!! quote "Citação"
    Esta é uma admonition de citação. Deve ter borda cinza (#9e9e9e) e ícone de aspas.

## Admonitions Especiais

!!! abstract "Resumo"
    Esta é uma admonition de resumo. Deve ter borda azul claro (#00bcd4) e ícone de clipboard.

!!! bug "Bug"
    Esta é uma admonition de bug. Deve ter borda rosa (#f50057) e ícone de escudo com bug.

!!! example "Exemplo"
    Esta é uma admonition de exemplo. Deve ter borda roxo (#7c4dff) e ícone de tubo de ensaio.

!!! failure "Falha"
    Esta é uma admonition de falha. Deve ter borda vermelha clara (#ff5252) e ícone de X.

## Debug de CSS

**Verifique no console do VS Code as mensagens:**
- `[CSS Debug] Loading admonitions.scss, original size: X`
- `[CSS Debug] Processed admonitions.scss, final size: Y`
- `[CSS Debug] Total CSS size: Z characters`

Se as admonitions não estiverem com as cores corretas, o processamento SCSS pode estar falhando.

### Classes CSS esperadas:
- `.md-typeset .admonition.note`
- `.md-typeset .admonition.tip`
- `.md-typeset .admonition.warning`
- etc.

### Estrutura HTML esperada:
```html
<div class="admonition note">
  <p class="admonition-title">Título</p>
  <p>Conteúdo</p>
</div>
``` 