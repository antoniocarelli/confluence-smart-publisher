# Especificação Funcional - Confluence Smart Publisher v2.0

## Informações do Documento

| Campo | Valor |
|-------|-------|
| **Produto** | VS Code Extensions |
| **Requisito** | Confluence Smart Publisher - Interface Completa com Relatório de Tarefas |
| **Versão** | 2.0 |
| **Data** | 31/07/2025 |
| **Autor** | Analista de Requisitos |
| **Aprovador** | Gerente de Produto |
| **Status** | Rascunho |

---

## 1. Resumo Executivo

### 1.1 Objetivo
Evoluir a extensão Confluence Smart Publisher para uma solução completa de gestão de documentação e tarefas, incluindo interface lateral moderna, catálogo visual de snippets, toolbar inteligente de formatação e um sistema avançado de monitoramento e relatório de tarefas distribuídas em arquivos Markdown do workspace.

### 1.2 Contexto
A versão 1.0 focou na interface de edição e publicação. A demanda por rastreamento de tarefas em documentação técnica e colaborativa justifica esta evolução para incluir monitoramento automático de task lists, identificação de responsáveis e prazos, criando um centro de gestão de tarefas baseado em Markdown.

### 1.3 Benefícios Esperados
- Visibilidade completa de todas as tarefas do workspace
- Rastreamento automático de responsáveis e prazos
- Relatórios dinâmicos por pasta, status e responsável
- Redução do overhead de gestão de tarefas distribuídas
- Integração natural com fluxo de documentação existente
- Dashboard centralizado para acompanhamento de progresso

---

## 2. Escopo

### 2.1 Escopo Incluído
- **Todas as funcionalidades da v1.0:** View Container, Commands, Snippets, Toolbar
- **Nova Tasks View:** Quarta view dedicada ao relatório de tarefas
- **Scanner de Workspace:** Monitoramento automático de arquivos .md
- **Parser de Task Lists:** Extração inteligente de tarefas com metadados
- **Sistema de Agrupamento:** Por pasta, status e responsável
- **Detecção de Responsáveis:** Identificação via @ mentions
- **Detecção de Prazos:** Parsing de datas no formato dd/mm/aaaa
- **Atualização em Tempo Real:** Sincronização com mudanças nos arquivos
- **Filtros e Busca:** Interface interativa para navegação

### 2.2 Escopo Excluído
- Edição de tarefas diretamente pelo painel (apenas visualização e navegação)
- Notificações push para prazos vencidos
- Integração com sistemas externos de gestão de tarefas
- Colaboração em tempo real
- Sincronização automática com Confluence (apenas publicação manual)
- Histórico de alterações em tarefas

### 2.3 Premissas
- Workspace contém arquivos .md com task lists no formato padrão Markdown
- Responsáveis são identificados via @ mentions (ex: @joão.silva)
- Datas seguem formato brasileiro dd/mm/aaaa (opcionalmente com hora HH:mm)
- Estrutura de pastas do workspace é organizada e representativa
- Usuários mantêm convenção de nomenclatura para @ mentions

---

## 3. Stakeholders

| Papel | Nome | Responsabilidade |
|-------|------|------------------|
| **Product Owner** | [Nome do PO] | Definição de prioridades e validação de funcionalidades |
| **Analista de Requisitos** | [Nome do Analista] | Especificação funcional e coordenação com stakeholders |
| **Desenvolvedor Lead** | [Nome do Dev Lead] | Arquitetura técnica e implementação principal |
| **UX Designer** | [Nome do UX] | Design da interface e experiência do usuário |
| **Gerente de Projeto** | [Nome do PM] | Validação dos requisitos de relatório e gestão |
| **Usuário Final** | Equipes de Documentação | Feedback sobre usabilidade e necessidades |

---

## 4. Requisitos Funcionais

### 4.1 User Stories da v1.0 (Mantidas)

#### US001 - View Container na Activity Bar
**Como** usuário da extensão Confluence Smart Publisher  
**Eu quero** ter um painel dedicado na Activity Bar do VS Code  
**Para que** eu possa acessar todas as funcionalidades da extensão de forma organizada e intuitiva

**Critérios de Aceite:**
- [ ] Container aparece na Activity Bar com ícone monocromático 24x24px
- [ ] Container tem nome "Confluence Smart Publisher"
- [ ] Container carrega sob demanda (lazy load) quando clicado
- [ ] Arquitetura permite registro dinâmico de novas views
- [ ] Container suporta agora 4 views (Commands, Snippets, Toolbar, Tasks)

**Prioridade:** Alta  
**Estimativa:** 5 Story Points (reduzida por reutilização)

#### US002 - Commands View (Mantida da v1.0)
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
**Estimativa:** 8 Story Points (reduzida por reutilização)

#### US003 - Snippets View (Mantida da v1.0)
**Como** editor de documentos Markdown  
**Eu quero** inserir trechos pré-formatados através de um catálogo visual  
**Para que** eu possa acelerar a criação de conteúdo e manter consistência na formatação

**Critérios de Aceite:**
- [ ] Cada snippet tem miniatura visual representativa
- [ ] Tooltip mostra o conteúdo exato que será inserido
- [ ] Clique no snippet insere o conteúdo na posição do cursor
- [ ] Drag-and-drop funciona com cursor fantasma indicando posição
- [ ] Snippets organizados por categorias (headings, listas, blocos, etc.)
- [ ] Categoria específica para task lists adicionada

**Prioridade:** Média  
**Estimativa:** 13 Story Points (reduzida por reutilização)

#### US004 - Toolbar Inteligente (Mantida da v1.0)
**Como** usuário editando Markdown  
**Eu quero** aplicar formatação através de botões visuais  
**Para que** eu possa formatar texto sem conhecer a sintaxe Markdown específica

**Critérios de Aceite:**
- [ ] Botões para H1-H4, negrito, itálico, listas, blockquote, código
- [ ] Com seleção de texto: aplica formatação sobre o texto selecionado
- [ ] Sem seleção: insere template com cursor posicionado corretamente
- [ ] Botões adaptam-se ao tema do VS Code
- [ ] Botão específico para inserir task list adicionado

**Prioridade:** Média  
**Estimativa:** 8 Story Points (reduzida por reutilização)

### 4.2 User Stories da v2.0 (Novas)

#### US005 - Tasks View com Relatório Completo
**Como** gerente de projeto usando documentação em Markdown  
**Eu quero** visualizar todas as tarefas do workspace em um relatório centralizado  
**Para que** eu possa acompanhar o progresso e identificar pendências distribuídas nos documentos

**Critérios de Aceite:**
- [ ] View dedicada "Tasks" aparece como quarta opção no container
- [ ] Scanner automático identifica todos os arquivos .md do workspace
- [ ] Todas as task lists são extraídas e listadas no relatório
- [ ] Interface mostra total de tarefas pendentes e concluídas
- [ ] Contador de tarefas atualiza em tempo real conforme alterações nos arquivos
- [ ] Performance aceitável mesmo com centenas de arquivos

**Prioridade:** Alta  
**Estimativa:** 21 Story Points

#### US006 - Detecção Inteligente de Responsáveis
**Como** coordenador de equipe  
**Eu quero** que a extensão identifique automaticamente responsáveis pelas tarefas  
**Para que** eu possa saber quem deve executar cada item sem navegar pelos arquivos

**Critérios de Aceite:**
- [ ] @ mentions são detectados automaticamente na descrição das tarefas
- [ ] Múltiplos responsáveis são suportados (@joão @maria)
- [ ] Responsáveis são extraídos independente da posição na descrição
- [ ] Tarefas sem @ mention aparecem como "Não atribuído"
- [ ] Lista de responsáveis únicos é mantida para filtros
- [ ] Validação de formato de @ mention (sem espaços, alfanumérico)

**Prioridade:** Alta  
**Estimativa:** 13 Story Points

#### US007 - Sistema de Detecção de Prazos
**Como** gestor de prazos  
**Eu quero** que a extensão identifique datas nas tarefas automaticamente  
**Para que** eu possa priorizar itens com vencimento próximo

**Critérios de Aceite:**
- [ ] Datas no formato dd/mm/aaaa são detectadas automaticamente
- [ ] Suporte a formato com hora dd/mm/aaaa HH:mm
- [ ] Múltiplas datas na mesma tarefa (primeira é considerada o prazo)
- [ ] Tarefas vencidas são destacadas visualmente
- [ ] Tarefas próximas do vencimento (3 dias) têm indicação especial
- [ ] Ordenação por proximidade do prazo disponível

**Prioridade:** Alta  
**Estimativa:** 13 Story Points

#### US008 - Sistema de Agrupamento Dinâmico
**Como** usuário do relatório de tarefas  
**Eu quero** agrupar as tarefas por diferentes critérios  
**Para que** eu possa visualizar a informação da forma mais útil para meu contexto atual

**Critérios de Aceite:**
- [ ] Agrupamento por pasta (estrutura hierárquica do workspace)
- [ ] Agrupamento por status (pendente vs concluída)
- [ ] Agrupamento por responsável (incluindo "Não atribuído")
- [ ] Subpastas são agrupadas junto com pasta pai
- [ ] Interface permite alternar entre modos de agrupamento
- [ ] Cada grupo mostra contador de tarefas (ex: "Pasta A (5)")
- [ ] Grupos são colapsáveis/expansíveis

**Prioridade:** Média  
**Estimativa:** 21 Story Points

#### US009 - Navegação e Interação com Tarefas
**Como** usuário do relatório  
**Eu quero** navegar facilmente para o contexto de cada tarefa  
**Para que** eu possa editar ou obter mais informações sobre itens específicos

**Critérios de Aceite:**
- [ ] Clique na tarefa abre o arquivo correspondente
- [ ] Cursor é posicionado na linha exata da tarefa
- [ ] Tooltip mostra caminho completo do arquivo
- [ ] Ícone indica se arquivo está atualmente aberto no editor
- [ ] Botão "Refresh" permite atualização manual do relatório
- [ ] Indicação visual de quando última atualização ocorreu

**Prioridade:** Média  
**Estimativa:** 13 Story Points

#### US010 - Filtros e Busca no Relatório
**Como** usuário com muitas tarefas  
**Eu quero** filtrar e buscar itens específicos no relatório  
**Para que** eu possa encontrar rapidamente o que preciso sem scroll excessivo

**Critérios de Aceite:**
- [ ] Campo de busca filtra tarefas por texto da descrição
- [ ] Filtro por status (todas, pendentes, concluídas)
- [ ] Filtro por responsável (dropdown com todos os @ mentions encontrados)
- [ ] Filtro por prazo (sem prazo, vencidas, próximas, futuras)
- [ ] Filtros são combinados (AND logic)
- [ ] Contador mostra quantas tarefas estão visíveis após filtros
- [ ] Botão "Limpar filtros" restaura visualização completa

**Prioridade:** Baixa  
**Estimativa:** 13 Story Points

### 4.3 Fluxos de Processo

#### 4.3.1 Fluxo Principal - Monitoramento de Tarefas
1. Usuário abre workspace com arquivos .md contendo task lists
2. Extensão inicia scanner automático do workspace
3. Sistema identifica todos os arquivos .md recursivamente
4. Parser extrai task lists de cada arquivo
5. Algoritmo identifica responsáveis via @ mentions
6. Sistema detecta datas nas descrições das tarefas
7. Relatório é montado com todas as informações coletadas
8. Tasks View exibe relatório com agrupamento padrão (por pasta)
9. Usuário pode alternar agrupamentos e aplicar filtros

#### 4.3.2 Fluxo Alternativo A - Atualização em Tempo Real
1. Usuário edita arquivo .md no workspace
2. File watcher detecta mudança no arquivo
3. Sistema re-escaneia apenas o arquivo modificado
4. Parser atualiza tarefas deste arquivo no cache
5. Tasks View é atualizada automaticamente
6. Contadores e agrupamentos são recalculados
7. Interface reflete mudanças sem necessidade de refresh manual

#### 4.3.3 Fluxo Alternativo B - Navegação para Tarefa
1. Usuário visualiza tarefa no relatório
2. Clica na tarefa ou usa atalho de teclado
3. Sistema identifica arquivo e linha da tarefa
4. Arquivo é aberto no editor (ou ganha foco se já aberto)
5. Cursor é posicionado na linha exata da tarefa
6. Tarefa fica destacada temporariamente para orientação visual

#### 4.3.4 Fluxo de Exceção A - Arquivo Inacessível
1. Scanner tenta acessar arquivo .md
2. Sistema detecta erro de acesso (permissão, arquivo corrompido, etc.)
3. Erro é logado mas não interrompe processo
4. Arquivo problemático é marcado como "inacessível" no cache
5. Relatório exibe aviso sobre arquivos não processados
6. Retry automático ocorre na próxima atualização completa

#### 4.3.5 Fluxo de Exceção B - Parsing Falha
1. Parser tenta extrair tarefas de arquivo .md
2. Formato inesperado ou markdown malformado causa erro
3. Sistema ignora erros de parsing específicos
4. Arquivo é processado parcialmente (tarefas válidas são extraídas)
5. Log de debug registra problemas encontrados
6. Usuário pode ser notificado opcionalmente sobre parsing incompleto

---

## 5. Regras de Negócio

### 5.1 Regras Existentes da v1.0 (Mantidas)

### RN001 - Carregamento Sob Demanda
**Descrição:** O container e suas views devem ser carregados apenas quando solicitados pelo usuário  
**Impacto:** Melhora performance inicial do VS Code e reduz uso de memória  
**Exceções:** Scanner de tarefas pode ter pré-carregamento configurável para workspaces pequenos

### RN002 - Independência de Extensões
**Descrição:** A toolbar de Markdown deve funcionar independentemente de outras extensões  
**Impacto:** Garante funcionalidade mesmo sem Markdown All-In-One ou similares  
**Exceções:** Integração opcional com extensões existentes quando disponíveis

### 5.2 Novas Regras da v2.0

### RN003 - Formato de Task List
**Descrição:** Apenas task lists no formato padrão Markdown são reconhecidas: `- [ ]` ou `- [x]`  
**Impacto:** Garante compatibilidade e consistência na detecção de tarefas  
**Exceções:** Variações com espaços extras são toleradas: `- [ ]`, `-  [ ]`, `*  [ ]`

### RN004 - Detecção de Responsáveis
**Descrição:** @ mentions devem seguir padrão @username sem espaços e caracteres especiais limitados  
**Impacto:** Evita falsos positivos e garante consistência na identificação  
**Exceções:** Permitidos: letras, números, ponto, hífen, underscore (@joao.silva, @user_123)

### RN005 - Validação de Datas
**Descrição:** Datas devem estar no formato dd/mm/aaaa (ou dd/mm/aa) opcionalmente com hora HH:mm  
**Impacto:** Padronização para parsing confiável e cálculo de vencimentos  
**Exceções:** Formatos aceitos: 15/03/2024, 15/03/24, 15/03/2024 14:30, 15/03/24 14:30

### RN006 - Escopo de Arquivos
**Descrição:** Apenas arquivos .md dentro do workspace são monitorados para tarefas  
**Impacto:** Performance otimizada e foco no conteúdo relevante  
**Exceções:** Arquivos em node_modules, .git e outras pastas de sistema são ignorados

### RN007 - Prioridade de Parsing
**Descrição:** Em caso de múltiplas datas ou @ mentions, a primeira ocorrência tem precedência  
**Impacto:** Comportamento previsível e consistente para usuários  
**Exceções:** Data mais próxima tem precedência sobre primeira ocorrência para cálculo de vencimento

### RN008 - Atualização de Cache
**Descrição:** Cache de tarefas deve ser atualizado em tempo real para arquivos modificados  
**Impacto:** Relatório sempre reflete estado atual dos arquivos  
**Exceções:** Batch updates podem ser aplicados para múltiplas mudanças simultâneas

---

## 6. Requisitos de Interface

### 6.1 Tasks View - Layout e Organização
```
┌─────────────────────────────────────┐
│ 🔍 [Search tasks...]         📊 25  │
├─────────────────────────────────────┤
│ Group by: [📁 Folder ▼] [🔄]        │
├─────────────────────────────────────┤
│ Filters: [All] [@user] [📅 Date]    │
├─────────────────────────────────────┤
│ 📁 src/ (8)                    [-]  │
│   📁 components/ (3)           [-]  │
│     ☐ @john Fix button style       │
│     ☑ @mary Add unit tests          │
│     ☐ Review PR 15/08/2024 @team   │
│   📁 utils/ (5)                [-]  │
│     ☐ @alice Refactor helper       │
│     ☐ Document API 20/08/2024      │
│ 📁 docs/ (12)                  [-]  │
│   ☐ @bob Update README             │
│   ☐ Fix typos 10/08/2024 @editor   │
│ 📝 Unassigned (5)              [-]  │
│   ☐ General cleanup needed         │
│   ☐ Update dependencies            │
└─────────────────────────────────────┘
```

### 6.2 Padrões Visuais para Tarefas
- **☐** Tarefa pendente (checkbox vazio)
- **☑** Tarefa concluída (checkbox marcado)  
- **🔴** Tarefa vencida (data passou)
- **🟡** Tarefa próxima do vencimento (3 dias)
- **📅** Ícone para tarefas com data
- **👤** Ícone para tarefas com responsável
- **📁** Agrupamento por pasta
- **👥** Agrupamento por responsável
- **📊** Agrupamento por status

### 6.3 Estados Interativos
- **Hover:** Destaque sutil da tarefa com tooltip mostrando arquivo
- **Click:** Navegação para arquivo e linha da tarefa
- **Expand/Collapse:** Grupos podem ser abertos/fechados
- **Loading:** Indicador durante scan inicial ou refresh
- **Empty State:** Mensagem quando não há tarefas encontradas
- **Error State:** Aviso sobre arquivos não processados

### 6.4 Responsividade da Tasks View
- [ ] Adaptação à largura mínima do painel (200px)
- [ ] Texto truncado com ellipsis quando necessário
- [ ] Scroll vertical para listas longas
- [ ] Grupos colapsados preservam espaço vertical
- [ ] Filtros responsivos (dropdown em telas menores)

---

## 7. Requisitos de Dados

### 7.1 Estrutura de Task
| Campo | Tipo | Tamanho | Validação |
|-------|------|---------|-----------|
| id | string | 50 chars | Hash único do arquivo + linha |
| description | string | 500 chars | Texto da tarefa limpo |
| completed | boolean | N/A | true para [x], false para [ ] |
| assignees | string[] | 30 chars each | Array de @ mentions válidos |
| dueDate | Date | N/A | Data válida ou null |
| filePath | string | 260 chars | Caminho relativo no workspace |
| lineNumber | number | N/A | Número da linha no arquivo |
| folderPath | string | 200 chars | Pasta do arquivo para agrupamento |

### 7.2 Cache de Workspace
| Campo | Tipo | Tamanho | Validação |
|-------|------|---------|-----------|
| lastScan | Date | N/A | Timestamp da última varredura |
| fileCount | number | N/A | Total de arquivos .md processados |
| taskCount | number | N/A | Total de tarefas encontradas |
| errors | string[] | 100 chars each | Lista de erros de processamento |
| responsables | Set<string> | 30 chars each | Lista única de todos os @ mentions |

### 7.3 Configurações da Tasks View
```json
{
  "confluenceSmartPublisher.tasks": {
    "enabled": true,
    "autoScan": true,
    "scanInterval": 30000,
    "maxFiles": 1000,
    "excludePatterns": ["**/node_modules/**", "**/.git/**"],
    "dateFormats": ["dd/mm/yyyy", "dd/mm/yy"],
    "assigneePattern": "@[a-zA-Z0-9._-]+",
    "groupBy": "folder",
    "showCompleted": true,
    "highlightOverdue": true
  }
}
```

---

## 8. Integrações

### 8.1 Sistema de Arquivos
| Operação | Frequência | Dados Acessados | Performance |
|----------|------------|-----------------|-------------|
| Scan Inicial | Uma vez por sessão | Todos os .md do workspace | < 2s para 500 arquivos |
| File Watch | Tempo real | Arquivos modificados | < 100ms por alteração |
| Leitura de Arquivo | Sob demanda | Conteúdo completo do .md | < 50ms por arquivo |
| Navegação | Interação usuário | Posição específica no arquivo | < 20ms |

### 8.2 VS Code Workspace API
```typescript
// Integração com workspace para descoberta de arquivos
vscode.workspace.findFiles('**/*.md', '**/node_modules/**')

// File watcher para mudanças em tempo real  
vscode.workspace.onDidChangeTextDocument((event) => {
  if (event.document.languageId === 'markdown') {
    taskScanner.updateFile(event.document.uri);
  }
});

// Navegação para arquivo específico
vscode.window.showTextDocument(uri, {
  selection: new vscode.Range(lineNumber, 0, lineNumber, 0)
});
```

### 8.3 Parser de Markdown
- **Biblioteca:** markdown-it para parsing confiável
- **Extensões:** Plugin customizado para detecção de task lists
- **Performance:** Stream processing para arquivos grandes
- **Cache:** AST parcial cached para arquivos não modificados

---

## 9. Critérios de Aceite Gerais

### 9.1 Funcionalidade da v2.0
- [ ] Todas as funcionalidades da v1.0 mantidas e funcionais
- [ ] Tasks View integrada ao container existente
- [ ] Scanner identifica 100% das task lists válidas
- [ ] Detecção de responsáveis funciona com padrões definidos
- [ ] Detecção de datas suporta formatos especificados
- [ ] Agrupamento dinâmico por pasta, status e responsável
- [ ] Navegação para tarefa posiciona cursor corretamente
- [ ] Filtros e busca funcionam isoladamente e em combinação

### 9.2 Performance da v2.0
- [ ] Scan inicial: < 3s para workspace com 500 arquivos .md
- [ ] Atualização em tempo real: < 200ms após mudança em arquivo
- [ ] Interface responsiva: < 100ms para mudança de agrupamento
- [ ] Memória adicional: < 20MB para 1000 tarefas em cache
- [ ] CPU em idle: < 1% após scan inicial completo

### 9.3 Usabilidade da Tasks View
- [ ] Interface intuitiva seguindo padrões VS Code
- [ ] Estados visuais claros para tarefas (pendente/concluída/vencida)
- [ ] Tooltips informativos em todos os elementos
- [ ] Navegação por teclado funcional
- [ ] Indicadores de loading durante operações longas
- [ ] Empty states e error states bem definidos

### 9.4 Robustez e Confiabilidade
- [ ] Parsing funciona com markdown malformado (graceful degradation)
- [ ] Sistema se recupera de arquivos corrompidos ou inacessíveis
- [ ] Performance aceitável mesmo com workspaces muito grandes
- [ ] Cache mantém consistência após operações de arquivo
- [ ] Logs detalhados para troubleshooting sem impactar performance

---

## 10. Riscos e Dependências

### 10.1 Riscos da v2.0
| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| Performance com workspaces grandes | Alta | Alto | Lazy loading, cache inteligente, limites configuráveis |
| Inconsistência de parsing de markdown | Média | Médio | Testes extensivos, graceful degradation |
| Conflito de file watchers | Baixa | Médio | Debouncing, gestão inteligente de eventos |
| Padrões inconsistentes de @ mentions | Alta | Baixo | Configuração flexível, documentação clara |
| Detecção de datas imprecisa | Média | Médio | Regex robusto, múltiplos formatos, validação |

### 10.2 Dependências Técnicas da v2.0
- **File System Access:** Permissões de leitura no workspace
- **VS Code Workspace API:** Para descoberta e monitoramento de arquivos
- **Markdown Parser:** Biblioteca confiável para parsing preciso
- **Regex Engine:** Para detecção de padrões de data e @ mentions
- **Performance:** Algoritmos eficientes para scan de muitos arquivos

### 10.3 Dependências de Usuário
- **Convenções de Nomenclatura:** @ mentions seguem padrão definido
- **Estrutura de Arquivos:** Organização lógica de pastas no workspace
- **Formato de Tarefas:** Uso consistente de task lists padrão Markdown
- **Manutenção:** Atualização regular de responsáveis e datas

---

## 11. Cronograma v2.0

| Fase | Prazo | Responsável | Status |
|------|-------|-------------|--------|
| **Análise e Design v2.0** | 07/08/2025 | Analista + UX | Planejado |
| **Sprint 1 - Base v1.0** | 14/08/2025 | Dev Lead | Planejado |
| **Sprint 2 - File Scanner** | 21/08/2025 | Senior Dev | Planejado |
| **Sprint 3 - Task Parser** | 28/08/2025 | Senior Dev | Planejado |
| **Sprint 4 - Tasks View UI** | 04/09/2025 | Mid Dev + UX | Planejado |
| **Sprint 5 - Agrupamento/Filtros** | 11/09/2025 | Mid Dev | Planejado |
| **Sprint 6 - Performance/Testes** | 18/09/2025 | QA + Dev Team | Planejado |
| **Sprint 7 - Refinamento/Deploy** | 25/09/2025 | Dev Team | Planejado |

---

## 12. Anexos

### 12.1 Documentos Relacionados
- [EF_ConfluenceSmartPublisher_v1.0.md] - Especificação funcional base
- [Link para Especificação Técnica v2.0] (a ser criada)
- [Link para Critérios de Aceite v2.0] (a ser criada)
- [Link para Análise de Performance] (a ser criada)

### 12.2 Exemplos de Task Lists Suportadas
```markdown
# Documento de Exemplo

## Tarefas do Projeto Alpha

- [ ] Implementar autenticação @joao.silva 15/08/2024
- [x] Criar testes unitários @maria.santos
- [ ] Revisar documentação @pedro.oliveira 20/08/2024 14:30
- [ ] Deploy em produção @devops.team 25/08/2024

## Backlog Geral

```markdown
# Documento de Exemplo

## Tarefas do Projeto Alpha

- [ ] Implementar autenticação @joao.silva 15/08/2024
- [x] Criar testes unitários @maria.santos
- [ ] Revisar documentação @pedro.oliveira 20/08/2024 14:30
- [ ] Deploy em produção @devops.team 25/08/2024

## Backlog Geral

- [ ] Atualizar dependências
- [ ] Corrigir bug #123 @ana.costa
- [x] Documentar API REST @tech.writer 10/08/2024

## Tarefas Urgentes

* [ ] Hotfix crítico @emergency.team 01/08/2024
* [ ] Backup do banco @dba.team 05/08/2024 23:00
* [x] Comunicar stakeholders @project.manager
```

### 12.3 Patterns de Detecção

#### @ Mentions Válidos:
- `@joao.silva` ✅
- `@user123` ✅
- `@team_lead` ✅
- `@project-manager` ✅
- `@user.name_123` ✅

#### @ Mentions Inválidos:
- `@joão silva` ❌ (espaço)
- `@user@domain` ❌ (múltiplos @)
- `@123user` ❌ (inicia com número)
- `@user#tag` ❌ (caractere especial)

#### Formatos de Data Válidos:
- `15/08/2024` ✅
- `15/08/24` ✅
- `15/08/2024 14:30` ✅
- `15/08/24 23:59` ✅
- `31/12/2024 00:00` ✅

#### Formatos de Data Inválidos:
- `2024/08/15` ❌ (formato americano)
- `15-08-2024` ❌ (hífen)
- `15.08.2024` ❌ (ponto)
- `August 15, 2024` ❌ (formato textual)

### 12.4 Estrutura de Agrupamento

#### Por Pasta (Hierárquico):
```
📁 src/ (15)
  📁 components/ (8)
  📁 services/ (4)
  📁 utils/ (3)
📁 docs/ (22)
  📁 api/ (12)
  📁 guides/ (10)
📁 tests/ (5)
📝 Root files (3)
```

#### Por Status:
```
⏳ Pendentes (35)
✅ Concluídas (10)
🔴 Vencidas (3)
🟡 Próximas (7)
```

#### Por Responsável:
```
👤 @joao.silva (12)
👤 @maria.santos (8)
👤 @pedro.oliveira (5)
👤 @team.lead (4)
📝 Não atribuído (16)
```

### 12.5 Configuração de Exemplo para Workspace Grande
```json
{
  "confluenceSmartPublisher.tasks": {
    "enabled": true,
    "autoScan": true,
    "scanInterval": 60000,
    "maxFiles": 2000,
    "excludePatterns": [
      "**/node_modules/**",
      "**/.git/**",
      "**/dist/**",
      "**/build/**",
      "**/.next/**",
      "**/coverage/**"
    ],
    "includePatterns": [
      "**/*.md",
      "**/*.markdown"
    ],
    "dateFormats": [
      "dd/mm/yyyy",
      "dd/mm/yy",
      "dd/mm/yyyy HH:mm",
      "dd/mm/yy HH:mm"
    ],
    "assigneePattern": "@[a-zA-Z][a-zA-Z0-9._-]*",
    "groupBy": "folder",
    "showCompleted": true,
    "highlightOverdue": true,
    "overdueThreshold": 0,
    "upcomingThreshold": 3,
    "maxTasksPerFile": 100,
    "enableFileWatcher": true,
    "batchUpdateDelay": 500
  }
}
```

---

## 13. Especificações Técnicas Preliminares

### 13.1 Algoritmo de Scanning
```
ALGORITMO ScanWorkspace():
  files = workspace.findFiles("**/*.md", excludePatterns)
  tasks = []
  
  PARA CADA file EM files:
    SE file.size > MAX_FILE_SIZE ENTÃO
      CONTINUAR // Skip arquivos muito grandes
    FIM SE
    
    content = readFile(file.path)
    fileTasks = extractTasks(content, file.path)
    tasks.addAll(fileTasks)
    
    SE tasks.length > MAX_TOTAL_TASKS ENTÃO
      QUEBRAR // Limite de segurança
    FIM SE
  FIM PARA
  
  RETORNAR tasks
FIM ALGORITMO
```

### 13.2 Parser de Task List
```typescript
interface TaskMatch {
  full: string;           // "- [ ] Task description @user 15/08/2024"
  completed: boolean;     // true for [x], false for [ ]
  description: string;    // "Task description @user 15/08/2024"
  assignees: string[];    // ["@user"]
  dates: Date[];         // [Date object for 15/08/2024]
  lineNumber: number;    // Line position in file
}

function parseTaskList(content: string, filePath: string): TaskMatch[] {
  const taskRegex = /^[\s]*[-*+]\s*\[([ xX])\]\s*(.+)$/gm;
  const assigneeRegex = /@[a-zA-Z][a-zA-Z0-9._-]*/g;
  const dateRegex = /\b(\d{1,2})\/(\d{1,2})\/(\d{2,4})(?:\s+(\d{1,2}):(\d{2}))?\b/g;
  
  // Implementation details...
}
```

### 13.3 Sistema de Cache
```typescript
interface TaskCache {
  version: string;
  lastUpdate: Date;
  files: Map<string, FileTaskCache>;
  globalStats: {
    totalTasks: number;
    completedTasks: number;
    overdueTasks: number;
    assignees: Set<string>;
  };
}

interface FileTaskCache {
  filePath: string;
  lastModified: Date;
  hash: string; // Para detectar mudanças
  tasks: Task[];
  parseErrors: string[];
}
```

---

## 14. Critérios de Sucesso da v2.0

### 14.1 Métricas de Adoção
- **Ativação da Tasks View:** > 80% dos usuários que usam outras views
- **Frequência de Uso:** Tasks View acessada pelo menos 1x por sessão
- **Navegação para Tarefas:** > 60% das tarefas visualizadas são clicadas
- **Uso de Filtros:** > 40% dos usuários usam pelo menos um filtro

### 14.2 Métricas de Performance
- **Tempo de Scan Inicial:** < 3s para 95% dos workspaces típicos
- **Responsividade da Interface:** < 100ms para mudanças de agrupamento
- **Uso de Memória:** < 50MB para workspaces com 1000+ tarefas
- **CPU em Background:** < 2% durante monitoramento de arquivos

### 14.3 Métricas de Qualidade
- **Taxa de Detecção:** > 95% das task lists válidas identificadas
- **Falsos Positivos:** < 5% das "tarefas" detectadas são inválidas
- **Precisão de Responsáveis:** > 90% dos @ mentions corretos
- **Precisão de Datas:** > 95% das datas no formato correto

### 14.4 Indicadores de Satisfação
- **Net Promoter Score:** > 8.0 para funcionalidade de tarefas
- **Relatórios de Bug:** < 2 bugs críticos por 1000 usuários/mês
- **Support Tickets:** < 1% relacionados à detecção incorreta
- **Feature Requests:** Roadmap baseado em feedback real dos usuários

---

## 15. Roadmap Futuro (v3.0+)

### 15.1 Funcionalidades Consideradas
- **Notificações de Prazo:** Push notifications para tarefas vencendo
- **Integração com Calendar:** Sincronização com Google Calendar/Outlook
- **Colaboração:** Comentários e discussões em tarefas
- **Métricas Avançadas:** Analytics de produtividade e tempo de conclusão
- **Templates de Tarefas:** Snippets inteligentes baseados em contexto
- **Automação:** Regras para auto-assignment e auto-completion

### 15.2 Integrações Futuras
- **GitHub Issues:** Sincronização bidirecional com issues
- **Jira/Azure DevOps:** Import/export de work items
- **Slack/Teams:** Notificações em canais de equipe
- **Time Tracking:** Integração com ferramentas de controle de tempo

---

## 16. Controle de Versões

| Versão | Data | Autor | Descrição das Alterações |
|--------|------|-------|--------------------------|
| 2.0 | 31/07/2025 | Analista de Requisitos | Nova versão com sistema completo de relatório de tarefas |
| 1.0 | 31/07/2025 | Analista de Requisitos | Versão inicial com interface básica |

---

## 17. Aprovações

| Papel | Nome | Data | Assinatura |
|-------|------|------|------------|
| **Product Owner** | [Nome] | [DD/MM/AAAA] | [Assinatura] |
| **Gerente de Produto** | [Nome] | [DD/MM/AAAA] | [Assinatura] |
| **Arquiteto de Software** | [Nome] | [DD/MM/AAAA] | [Assinatura] |
| **UX Designer** | [Nome] | [DD/MM/AAAA] | [Assinatura] |
| **Gerente de Projeto** | [Nome] | [DD/MM/AAAA] | [Assinatura] |