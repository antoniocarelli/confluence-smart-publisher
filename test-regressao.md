# Teste de Regressão - Funcionalidades Básicas

Este arquivo testa se as funcionalidades básicas do markdown continuam funcionando após a implementação do plugin personalizado de admonitions.

## Headers

### H3 Header
#### H4 Header
##### H5 Header
###### H6 Header

## Formatação de Texto

**Texto em negrito** e *texto em itálico* e `código inline`.

~~Texto riscado~~ também deveria funcionar.

## Listas

### Lista não ordenada:
- Item 1
- Item 2
  - Sub-item A
  - Sub-item B
- Item 3

### Lista ordenada:
1. Primeiro item
2. Segundo item
   1. Sub-item numerado
   2. Outro sub-item
3. Terceiro item

## Links e Imagens

[Link para exemplo](https://example.com)

Auto-link: https://github.com

## Blocos de Código

```javascript
function testeRegressao() {
    console.log("Syntax highlighting funcionando!");
    return true;
}
```

```python
def teste_python():
    print("Python highlighting")
    return "OK"
```

## Tabelas

| Coluna 1 | Coluna 2 | Coluna 3 |
|----------|----------|----------|
| A        | B        | C        |
| 1        | 2        | 3        |
| X        | Y        | Z        |

## Blockquotes

> Esta é uma citação
> 
> Com múltiplas linhas
> 
> > E citação aninhada

## Linha Horizontal

---

## Agora testando que admonitions funcionam junto com markdown normal

!!! note "Funcionamento Normal"
    Este admonition deveria funcionar normalmente.

Texto normal após admonition.

**Texto em negrito** também funciona normalmente.

!!! tip "Outra Admonition"
    Mais uma admonition para verificar.

## Lista após admonitions

1. Item após admonitions
2. Segundo item
3. Terceiro item

## Código após admonitions

```bash
echo "Tudo funcionando!"
```

## Verificação Final

Se você pode ver:
- ✅ Headers formatados corretamente
- ✅ Texto formatado (negrito, itálico, código)
- ✅ Listas funcionando
- ✅ Links clicáveis
- ✅ Syntax highlighting nos blocos de código
- ✅ Tabela bem formatada
- ✅ Blockquotes com estilo correto
- ✅ Admonitions funcionando
- ✅ Combinação de markdown + admonitions

Então a implementação passou no teste de regressão! 🎉