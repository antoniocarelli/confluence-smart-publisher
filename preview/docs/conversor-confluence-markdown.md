# Documentação Técnica: Conversor Confluence para Markdown

## 1. Visão Geral

Este documento descreve o processo de conversão de documentos do Confluence para Markdown, servindo como base para o desenvolvimento de um conversor em TypeScript.

## 2. Estrutura do Documento

### 2.1. Elementos Principais

O conversor deve lidar com os seguintes elementos do Confluence:

1. **Metadados**
   - Propriedades do documento
   - Labels
   - Versão
   - Status
   - Data de última alteração

2. **Estrutura**
   - Títulos e subtítulos
   - Índice
   - Seções e subseções
   - Links internos e externos

3. **Conteúdo**
   - Tabelas
   - Listas ordenadas e não ordenadas
   - Blocos de código
   - Citações
   - Notas e alertas
   - Detalhes expansíveis

## 3. Regras de Conversão

### 3.1. Metadados

```typescript
interface ConfluenceMetadata {
  file_id: string;
  labels: string[];
  version: string;
  status: string;
  lastModified: Date;
  properties: Record<string, string>;
}
```

#### 3.1.1. Propriedades
- Converter propriedades do Confluence para um cabeçalho YAML no Markdown
- Exemplo:
```yaml
---
file_id: "1058209793"
labels: ["user-story", "escopo", "pendente"]
version: "1.0"
status: "Aceita"
lastModified: "2025-06-09"
---
```

### 3.2. Estrutura

#### 3.2.1. Títulos
- Converter níveis de título do Confluence para Markdown usando `#`
- Exemplo:
```typescript
const titleMapping = {
  'h1': '#',
  'h2': '##',
  'h3': '###',
  'h4': '####',
  'h5': '#####',
  'h6': '######'
};
```

#### 3.2.2. Índice
- Gerar índice automático baseado nos títulos
- Criar links internos usando IDs gerados a partir dos títulos
- Exemplo:
```markdown
## Índice
- [1. Propriedades](#1-propriedades)
- [2. Glossário](#2-glossário)
```

### 3.3. Conteúdo

#### 3.3.1. Tabelas
```typescript
interface TableConfig {
  alignment: 'left' | 'center' | 'right';
  headers: string[];
  rows: string[][];
}
```

- Converter tabelas do Confluence para sintaxe Markdown
- Manter alinhamento de colunas
- Exemplo:
```markdown
| Coluna 1 | Coluna 2 |
|----------|----------|
| Valor 1  | Valor 2  |
```

#### 3.3.2. Listas
- Converter listas ordenadas e não ordenadas
- Manter níveis de indentação
- Exemplo:
```markdown
- Item 1
  - Subitem 1.1
  - Subitem 1.2
- Item 2
```

#### 3.3.3. Blocos de Código
- Identificar blocos de código
- Manter linguagem de programação quando especificada
- Exemplo:
```markdown
```typescript
const code = "example";
```
```

#### 3.3.4. Citações e Notas
- Converter blocos de nota e alerta
- Usar sintaxe de citação do Markdown
- Exemplo:
```markdown
> ℹ️ **Info**: Texto informativo
> 💡 **Dica**: Texto da dica
> 📝 **Nota**: Texto da nota
> ⚠️ **Atenção**: Texto de alerta
> ⛔ **Atenção**: Texto de alerta 
```

#### 3.3.5. Detalhes Expansíveis
- Converter blocos expansíveis para `<details>` do HTML
- Exemplo:
```markdown
<details>
<summary>Título do bloco</summary>

Conteúdo do bloco
</details>
```

### 3.4. Links

#### 3.4.1. Links Internos
- Converter links internos do Confluence para links Markdown
- Gerar IDs únicos para seções
- Exemplo:
```markdown
[Texto do link](#id-da-secao)
```

#### 3.4.2. Links Externos
- Manter URLs externas
- Converter para sintaxe Markdown
- Exemplo:
```markdown
[Texto do link](https://exemplo.com)
```

## 4. Processo de Conversão

### 4.1. Fluxo de Processamento

1. **Análise do Documento**
   - Ler arquivo Confluence
   - Identificar estrutura e elementos
   - Extrair metadados

2. **Conversão de Elementos**
   - Processar cada elemento conforme regras
   - Manter hierarquia e relacionamentos
   - Gerar IDs únicos para links internos

3. **Geração do Markdown**
   - Criar estrutura do documento
   - Aplicar formatação
   - Validar sintaxe

### 4.2. Tratamento de Erros

- Identificar elementos não suportados
- Registrar avisos e erros
- Manter rastreabilidade das conversões

## 5. Considerações de Implementação

### 5.1. Dependências Sugeridas

```json
{
  "dependencies": {
    "marked": "^4.0.0",
    "jsdom": "^16.0.0",
    "yaml": "^2.0.0"
  }
}
```

### 5.2. Estrutura de Classes Sugerida

```typescript
class ConfluenceToMarkdownConverter {
  private metadata: ConfluenceMetadata;
  private content: string;
  
  constructor(confluenceContent: string) {
    this.content = confluenceContent;
    this.metadata = this.extractMetadata();
  }
  
  private extractMetadata(): ConfluenceMetadata {
    // Implementação
  }
  
  private convertTitles(): string {
    // Implementação
  }
  
  private convertTables(): string {
    // Implementação
  }
  
  private convertLists(): string {
    // Implementação
  }
  
  public convert(): string {
    // Implementação principal
  }
}
```

## 6. Testes

### 6.1. Casos de Teste

1. **Conversão Básica**
   - Documento simples com título e parágrafos
   - Verificar estrutura básica

2. **Elementos Complexos**
   - Tabelas com diferentes alinhamentos
   - Listas aninhadas
   - Blocos de código

3. **Links e Referências**
   - Links internos
   - Links externos
   - Referências cruzadas

4. **Metadados**
   - Extração correta de propriedades
   - Geração de cabeçalho YAML

## 7. Limitações Conhecidas

1. Alguns elementos específicos do Confluence podem não ter equivalente direto em Markdown
  - Nestes casos o texto original deve ser mantido, para evitar perda de informação.
2. Formatação complexa pode requerer HTML embutido
3. Links internos podem precisar de ajuste manual
  - Nestes casos o texto original deve ser mantido, para evitar perda de informação.


## 8. Manutenção

### 8.1. Atualizações

- Manter compatibilidade com novas versões do Confluence
- Atualizar regras de conversão conforme necessário
- Documentar mudanças na sintaxe

### 8.2. Logs

- Registrar conversões realizadas
- Manter histórico de erros
- Facilitar debugging 