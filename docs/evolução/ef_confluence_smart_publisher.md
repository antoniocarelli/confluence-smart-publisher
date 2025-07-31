# Especificação Funcional - Confluence Smart Publisher

## Informações do Documento

| Campo | Valor |
|-------|-------|
| **Produto** | VS Code Extensions |
| **Requisito** | Confluence Smart Publisher - Nova Interface |
| **Versão** | 1.0 |
| **Data** | 31/07/2025 |
| **Autor** | Analista de Requisitos |
| **Aprovador** | Gerente de Produto |
| **Status** | Rascunho |

---

## 1. Resumo Executivo

### 1.1 Objetivo
Evoluir a extensão Confluence Smart Publisher do VS Code de um simples preview de arquivos Markdown para uma solução completa de gestão e edição, incluindo interface lateral moderna, catálogo visual de snippets e toolbar inteligente de formatação. Manter integração com Confluence Atlassian e visualização baseada em MkDocs Material.

### 1.2 Contexto
A extensão atual oferece apenas preview de arquivos `.md` utilizando tema MkDocs. A demanda por uma interface mais rica e funcionalidades avançadas de edição justifica esta evolução para tornar a ferramenta mais competitiva e produtiva para equipes que trabalham com documentação.

### 1.3 Benefícios Esperados
- Aumento da produtividade na criação de documentos Markdown
- Interface unificada para todas as funcionalidades da extensão
- Redução do tempo de formatação através de snippets visuais
- Experiência de usuário mais intuitiva e moderna
- Arquitetura extensível para futuras funcionalidades

---

## 2. Escopo

### 2.1 Escopo Incluído
- View Container na Activity Bar do VS Code
- Três views organizadas: Commands, Snippets e Toolbar
- Interface para execução de todos os comandos existentes
- Catálogo visual de snippets com drag-and-drop
- Toolbar inteligente de formatação Markdown
- Arquitetura extensível para novas funcionalidades
- Manutenção da funcionalidade de preview existente

### 2.2 Escopo Excluído
- Alterações na funcionalidade de preview MkDocs existente
- Integração com outras plataformas além do Confluence
- Funcionalidades de colaboração em tempo real
- Editor WYSIWYG completo
- Sincronização automática em tempo real

### 2.3 Premissas
- VS Code API versão 1.96 ou superior disponível
- Node.js versão 18 ou superior no ambiente de desenvolvimento
- Usuários possuem conhecimento básico de Markdown
- Conexão com internet para integração Confluence
- Permissões adequadas para instalação de extensões VS Code

---

## 3. Stakeholders

| Papel | Nome | Responsabilidade |
|-------|------|------------------|
| **Product Owner** | [Nome do PO] | Definição de prioridades e validação de funcionalidades |
| **Analista de Requisitos** | [Nome do Analista] | Especificação funcional e coordenação com stakeholders |
| **Desenvolvedor Lead** | [Nome do Dev Lead] | Arquitetura técnica e implementação principal |
| **UX Designer** | [Nome do UX] | Design da interface e experiência do usuário |
| **Usuário Final** | Equipes de Documentação | Feedback sobre usabilidade e necessidades |

---

## 4. Requisitos Funcionais

### 4.1 User Stories

#### US001 - View Container na Activity Bar
**Como** usuário da extensão Confluence Smart Publisher  
**Eu quero** ter um painel dedicado na Activity Bar do VS Code  
**Para que** eu possa acessar todas as funcionalidades da extensão de forma organizada e intuitiva

**Critérios de Aceite:**
- [ ] Container aparece na Activity Bar com ícone monocromático 24x24px
- [ ] Container tem nome "Confluence Smart Publisher"
- [ ] Container carrega sob demanda (lazy load) quando clicado
- [ ] Arquitetura permite registro dinâmico de novas views
- [ ] Container funciona independentemente de arquivos abertos

**Prioridade:** Alta  
**Estimativa:** 8 Story Points

#### US002 - Commands View
**Como** usuário da extensão  
**Eu quero** executar todos os comandos disponíveis através de botões visuais  
**Para que** eu não precise memorizar atalhos de teclado ou navegar por menus complexos

**Critérios de Aceite:**
- [ ] Todos os 11 comandos existentes têm botões representativos
- [ ] Cada botão possui ícone descritivo e tooltip explicativo
- [ ] Comandos que precisam de contexto solicitam informações via QuickPick ou InputBox
- [ ] Status de execução é exibido visualmente
- [ ] Comandos desabilitados quando não aplicáveis ao contexto atual

**Prioridade:** Alta  
**Estimativa:** 13 Story Points

#### US003 - Snippets View com Catálogo Visual
**Como** editor de documentos Markdown  
**Eu quero** inserir trechos pré-formatados através de um catálogo visual  
**Para que** eu possa acelerar a criação de conteúdo e manter consistência na formatação

**Critérios de Aceite:**
- [ ] Cada snippet tem miniatura visual representativa
- [ ] Tooltip mostra o conteúdo exato que será inserido
- [ ] Clique no snippet insere o conteúdo na posição do cursor
- [ ] Drag-and-drop funciona com cursor fantasma indicando posição
- [ ] Snippets organizados por categorias (headings, listas, blocos, etc.)

**Prioridade:** Média  
**Estimativa:** 21 Story Points

#### US004 - Toolbar Inteligente de Formatação
**Como** usuário editando Markdown  
**Eu quero** aplicar formatação através de botões visuais  
**Para que** eu possa formatar texto sem conhecer a sintaxe Markdown específica

**Critérios de Aceite:**
- [ ] Botões para H1-H4, negrito, itálico, listas, blockquote, código
- [ ] Com seleção de texto: aplica formatação sobre o texto selecionado
- [ ] Sem seleção: insere template com cursor posicionado corretamente
- [ ] Botões adaptam-se ao tema do VS Code
- [ ] Atalhos de teclado opcionais para cada formatação

**Prioridade:** Média  
**Estimativa:** 13 Story Points

#### US005 - Arquitetura Extensível
**Como** desenvolvedor da extensão  
**Eu quero** uma arquitetura que permita adicionar novas views facilmente  
**Para que** futuras funcionalidades possam ser integradas sem refatoração major

**Critérios de Aceite:**
- [ ] Sistema de registro dinâmico de views implementado
- [ ] Comunicação padronizada entre webview e extensão
- [ ] Cada view isolada em seu próprio provider
- [ ] Documentação de como adicionar novas views
- [ ] Exemplo de view adicional funcionando

**Prioridade:** Baixa  
**Estimativa:** 8 Story Points

### 4.2 Fluxos de Processo

#### 4.2.1 Fluxo Principal - Execução de Comando
1. Usuário abre o painel Confluence Smart Publisher na Activity Bar
2. Sistema carrega as três views (Commands, Snippets, Toolbar)
3. Usuário clica em um botão de comando na Commands View
4. Sistema verifica se comando precisa de contexto adicional
5. Se necessário, exibe QuickPick ou InputBox para coleta de informações
6. Sistema executa o comando com parâmetros fornecidos
7. Resultado da execução é exibido através de notificação ou atualização da view

#### 4.2.2 Fluxo Alternativo A - Inserção de Snippet
1. Usuário navega até a Snippets View
2. Visualiza miniaturas dos snippets disponíveis
3. Clica em um snippet ou arrasta para o editor
4. Sistema insere o conteúdo na posição especificada
5. Cursor é posicionado no local apropriado para edição

#### 4.2.3 Fluxo Alternativo B - Formatação via Toolbar
1. Usuário seleciona texto no editor Markdown ou posiciona cursor
2. Clica em botão de formatação na Toolbar View
3. Se há seleção: sistema aplica formatação ao texto selecionado
4. Se não há seleção: sistema insere template de formatação
5. Cursor fica posicionado para continuação da edição

#### 4.2.4 Fluxo de Exceção A - Comando Falha
1. Sistema detecta erro durante execução de comando
2. Exibe mensagem de erro clara e acionável
3. Log detalhado é gravado para debug
4. Interface retorna ao estado anterior à execução

---

## 5. Regras de Negócio

### RN001 - Carregamento Sob Demanda
**Descrição:** O container e suas views devem ser carregados apenas quando solicitados pelo usuário  
**Impacto:** Melhora performance inicial do VS Code e reduz uso de memória  
**Exceções:** Views críticas podem ter pré-carregamento configurável

### RN002 - Independência de Extensões
**Descrição:** A toolbar de Markdown deve funcionar independentemente de outras extensões  
**Impacto:** Garante funcionalidade mesmo sem Markdown All-In-One ou similares  
**Exceções:** Integração opcional com extensões existentes quando disponíveis

### RN003 - Contexto de Comando
**Descrição:** Comandos que necessitam de contexto devem solicitá-lo antes da execução  
**Impacto:** Evita erros de execução e melhora experiência do usuário  
**Exceções:** Comandos com contexto implícito (arquivo ativo) executam diretamente

### RN004 - Segurança de Conteúdo
**Descrição:** Webviews devem implementar Content Security Policy restritiva  
**Impacto:** Previne execução de scripts maliciosos e vulnerabilidades XSS  
**Exceções:** Scripts locais necessários para funcionalidade são permitidos

### RN005 - Compatibilidade de Tema
**Descrição:** Todos os ícones e elementos visuais devem adaptar-se ao tema ativo do VS Code  
**Impacto:** Mantém consistência visual e acessibilidade  
**Exceções:** Elementos de branding podem manter cores específicas

---

## 6. Requisitos de Interface

### 6.1 Wireframes/Mockups
[Referência para wireframes do painel lateral com as três views organizadas verticalmente]

### 6.2 Padrões de UI/UX
- Seguir VS Code UX Guidelines oficiais
- Ícones SVG monocromáticos adaptáveis ao tema
- Tooltips descritivos para todos os elementos interativos
- Feedback visual para ações em progresso
- Estados desabilitados claramente identificáveis

### 6.3 Responsividade
- [ ] Adaptação à largura do painel lateral (mínimo 200px)
- [ ] Colapso inteligente de elementos quando espaço limitado
- [ ] Scroll vertical quando conteúdo excede altura disponível
- [ ] Redimensionamento responsivo de miniaturas de snippets

---

## 7. Requisitos de Dados

### 7.1 Campos Obrigatórios
| Campo | Tipo | Tamanho | Validação |
|-------|------|---------|-----------|
| Command ID | string | 50 chars | Padrão VS Code command |
| Snippet Content | string | 1000 chars | Markdown válido |
| Icon Path | string | 100 chars | Caminho relativo válido |
| Tooltip Text | string | 200 chars | Texto descritivo |

### 7.2 Campos Opcionais
| Campo | Tipo | Tamanho | Validação |
|-------|------|---------|-----------|
| Keyboard Shortcut | string | 20 chars | Combinação de teclas válida |
| Category | string | 30 chars | Categoria de agrupamento |
| Preview Image | string | 100 chars | Caminho para miniatura |
| Context Filter | array | N/A | Contextos aplicáveis |

---

## 8. Integrações

### 8.1 Sistemas Internos
| Sistema | Tipo de Integração | Dados Trocados | Observações |
|---------|-------------------|----------------|-------------|
| VS Code API | Direta | Comandos, eventos, UI | API versão 1.96+ |
| Editor Markdown | Event-driven | Texto, seleção, cursor | Integração nativa |
| Workspace | File system | Arquivos .md, configurações | Acesso via API |

### 8.2 Sistemas Externos
| Sistema | Tipo de Integração | Dados Trocados | Observações |
|---------|-------------------|----------------|-------------|
| Confluence Atlassian | REST API | Páginas, metadados | Autenticação necessária |
| MkDocs | Template engine | HTML renderizado | Para preview |

---

## 9. Critérios de Aceite Gerais

### 9.1 Funcionalidade
- [ ] Todas as user stories implementadas conforme especificado
- [ ] 11 comandos existentes integrados na Commands View
- [ ] Catálogo visual de snippets funcionando com drag-and-drop
- [ ] Toolbar de formatação com lógica contextual
- [ ] Arquitetura extensível documentada e testada

### 9.2 Performance
- [ ] Carregamento inicial do container: < 500ms
- [ ] Resposta de botões: < 100ms
- [ ] Inserção de snippets: < 50ms
- [ ] Memória adicional: < 10MB em idle

### 9.3 Usabilidade
- [ ] Interface intuitiva seguindo padrões VS Code
- [ ] Tooltips informativos em todos os elementos
- [ ] Feedback visual claro para ações do usuário
- [ ] Navegação por teclado funcional
- [ ] Suporte a temas claro e escuro

### 9.4 Segurança
- [ ] Content Security Policy implementada em webviews
- [ ] Validação de entrada em campos de texto
- [ ] Sanitização de conteúdo Markdown inserido
- [ ] Logs não expõem informações sensíveis

---

## 10. Riscos e Dependências

### 10.1 Riscos Identificados
| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| Mudanças na VS Code API | Média | Alto | Monitoramento de changelogs e testes |
| Performance com muitos snippets | Alta | Médio | Lazy loading e virtualização |
| Compatibilidade com temas customizados | Média | Médio | Testes extensivos com temas populares |
| Complexidade da arquitetura extensível | Baixa | Alto | Prototipagem prévia e documentação |

### 10.2 Dependências
- VS Code API versão 1.96 ou superior
- Node.js versão 18+ para desenvolvimento
- Biblioteca markdown-it para renderização
- Disponibilidade de ícones Codicon do VS Code
- Acesso à API do Confluence para comandos de integração

---

## 11. Cronograma

| Fase | Prazo | Responsável | Status |
|------|-------|-------------|--------|
| **Análise e Design** | 07/08/2025 | Analista + UX | Planejado |
| **Sprint 1 - Infraestrutura** | 14/08/2025 | Dev Lead | Planejado |
| **Sprint 2 - Commands View** | 21/08/2025 | Dev Team | Planejado |
| **Sprint 3 - Snippets View** | 28/08/2025 | Dev Team | Planejado |
| **Sprint 4 - Toolbar View** | 04/09/2025 | Dev Team | Planejado |
| **Sprint 5 - Testes e Refino** | 11/09/2025 | QA + Dev Team | Planejado |
| **Sprint 6 - Documentação e Deploy** | 18/09/2025 | Dev Team | Planejado |

---

## 12. Anexos

### 12.1 Documentos Relacionados
- [Link para Especificação Técnica] (a ser criada)
- [Link para Critérios de Aceite Detalhados] (a ser criada)
- [Link para Documentação da API VS Code]
- [Link para UX Guidelines do VS Code]

### 12.2 Comandos Existentes para Integração
1. **confluence-smart-publisher.publishConfluence** - Publish Document
2. **confluence-smart-publisher.getPageByTitle** - Download Document by Title  
3. **confluence-smart-publisher.getPageById** - Download Document by ID
4. **confluence-smart-publisher.createPage** - Create Document
5. **confluence-smart-publisher.formatConfluence** - Format Document
6. **confluence-smart-publisher.syncWithPublished** - Sync with Published
7. **confluence-smart-publisher.setEmojiTitle** - Set Title Emoji
8. **confluence-smart-publisher.decodeHtml** - Decode HTML Entities
9. **confluence-smart-publisher.convertMarkdown** - Convert to Confluence Format
10. **confluence-smart-publisher.convertConfluenceToMarkdown** - Convert Confluence to Markdown
11. **confluence-smart-publisher.preview** - Open Markdown Preview

### 12.3 Arquitetura de Views Proposta
```
Activity Bar
└── Confluence Smart Publisher (View Container)
    ├── Commands View    (ações e status)
    ├── Snippets View    (inserção visual de blocos)
    └── Toolbar View     (formatação direta)
```

---

## 13. Controle de Versões

| Versão | Data | Autor | Descrição das Alterações |
|--------|------|-------|--------------------------|
| 1.0 | 31/07/2025 | Analista de Requisitos | Versão inicial baseada no documento de requisitos |

---

## 14. Aprovações

| Papel | Nome | Data | Assinatura |
|-------|------|------|------------|
| **Product Owner** | [Nome] | [DD/MM/AAAA] | [Assinatura] |
| **Gerente de Produto** | [Nome] | [DD/MM/AAAA] | [Assinatura] |
| **Arquiteto de Software** | [Nome] | [DD/MM/AAAA] | [Assinatura] |
| **UX Designer** | [Nome] | [DD/MM/AAAA] | [Assinatura] |