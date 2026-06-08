# Diário de Desenvolvimento — UmaEstampa

**Unidade Curricular:** Interação Humano-Máquina  
**Grupo:** Bernardo Craveiro e Helder Silva  

---

## Sessão 1 – 18 de maio de 2026

**Elementos presentes:** Bernardo Craveiro, Helder Silva  

**Objetivo:**  
Definição da estrutura inicial da aplicação e implementação das páginas base.

**Atividades realizadas:**  
- Bernardo Craveiro: Criação do projeto base em Ionic/Angular e configuração do ambiente de desenvolvimento;  
- Bernardo Craveiro e Helder Silva: Implementação conjunta do catálogo de produtos com leitura a partir de ficheiro JSON;  
- Helder Silva: Criação da estrutura de navegação entre páginas (routing / app.routes.ts);  
- Helder Silva: Implementação do componente de cabeçalho (HeaderComponent) com ligação ao carrinho e à conta do utilizador;  
- Helder Silva: Configuração do Ionic Storage para persistência de dados locais;  
- Helder Silva: Definição da estrutura global de estilos (global.scss e CSS variables).  

**Problemas:**  
- Os produtos não eram corretamente carregados na primeira renderização do catálogo.

**Solução:**  
- Corrigido o fluxo assíncrono do serviço de produtos, garantindo a correta subscrição do Observable do HttpClient.

**Decisões:**  
- Adoção de Angular Signals para gestão de estado, por simplificar a reatividade da aplicação;  
- Definição da estrutura base dos produtos (id, nome, preço, categoria, descrição e imagem).  

---

## Sessão 2 – 25 de maio de 2026

**Elementos presentes:** Bernardo Craveiro, Helder Silva  

**Objetivo:**  
Implementação do personalizador de produtos, carrinho e checkout.

**Atividades realizadas:**  
- Helder Silva: Implementação da página Customizer com upload de imagem, drag para posicionamento, escala (20%–200%) e rotação (−180° a +180°);  
- Helder Silva: Validação de imagens (tipo, tamanho e restrições de qualidade antes do upload);  
- Bernardo Craveiro: Implementação do CartService com Angular Signals (adição, remoção e atualização de quantidades);  
- Bernardo Craveiro: Implementação da página de carrinho com gestão de quantidades, remoção de itens e cálculo de envio (€4,99 ou grátis acima de €50);  
- Bernardo Craveiro: Implementação do processo de checkout em 3 etapas (dados pessoais, pagamento e confirmação);  
- Helder Silva e Bernardo Craveiro: Integração do carrinho com persistência no Ionic Storage.  

**Problemas:**  
- Remoção de itens do carrinho provocava inconsistências nos índices dos elementos.

**Solução:**  
- Substituição da lógica baseada em índice por remoção baseada em identificador único do produto/item.

**Decisões:**  
- Persistência do carrinho no storage para evitar perda de dados;  
- Adoção de checkout multi-etapas para melhorar usabilidade e reduzir erros.  

---

## Sessão 3 – 1 de junho de 2026

**Elementos presentes:** Bernardo Craveiro, Helder Silva  

**Objetivo:**  
Implementação do sistema de autenticação real com JWT, registo de utilizadores e persistência por conta.

**Atividades realizadas:**  
- Bernardo Craveiro e Helder Silva: Definição da arquitetura de autenticação client-side com JWT e Web Crypto API;  
- Bernardo Craveiro: Implementação do JwtService (HS256, HMAC-SHA256, hashing de passwords com SHA-256);  
- Helder Silva: Reestruturação do AuthService com registo real, validação de email duplicado e autenticação com hash de password;  
- Bernardo Craveiro: Implementação de restauração automática de sessão e validação de expiração do token (30 dias);  
- Helder Silva: Atualização da interface de login com mensagens de erro reais;  
- Bernardo Craveiro e Helder Silva: Implementação da separação de dados por utilizador (carrinho e histórico de encomendas).  

**Problemas:**  
- A sessão não era restaurada corretamente devido ao acesso ao Ionic Storage antes da sua inicialização.

**Solução:**  
- Introdução do método `ensureReady()` no StorageService para garantir inicialização antes de qualquer leitura/escrita.

**Decisões:**  
- Implementação de JWT totalmente client-side para simplificar a solução académica;  
- Separação de dados por utilizador no Ionic Storage;  
- Validade do token definida para 30 dias.  

---
## Sessão 4 – 8 de junho de 2026

**Elementos presentes:** Bernardo Craveiro, Helder Silva  

**Objetivo:**  
Correção de problemas de usabilidade identificados nas avaliações heurísticas realizadas por outros grupos.

**Atividades realizadas:**  
- Bernardo Craveiro e Helder Silva: Análise e triagem dos problemas reportados nas avaliações heurísticas;  
- Bernardo Craveiro: Campo de email no checkout tornado read-only (o email está associado à conta e não deve ser alterável, evitando erros — Heurística #5);  
- Bernardo Craveiro: Campo "Cidade" no checkout substituído por um dropdown com lista de cidades portuguesas, reduzindo erros de digitação (Heurística #5);  
- Helder Silva: Mensagens de erro no checkout tornadas específicas por campo — em vez de uma mensagem genérica, o toast indica exatamente quais campos têm erro (Heurística #9);  
- Helder Silva: Adição de campos de dados de pagamento no passo 2 do checkout: dados do cartão (nome, número, validade, CVV) para pagamento por cartão, número de telemóvel para MB WAY, e nota informativa para transferência bancária (Heurística #8);  
- Bernardo Craveiro: Botão "Personalizar" no catálogo reduzido em tamanho (Heurística #8);  
- Helder Silva: Estilos dos botões de voltar melhorados globalmente — maior espaçamento vertical e área de toque mais generosa (Heurística #8).

**Problemas:**  
- Nenhum problema técnico relevante nesta sessão.

**Decisões:**  
- Email mantido como read-only em vez de removido, para o utilizador continuar a visualizar qual o email associado;  
- Lista de cidades implementada como dropdown fixo com as principais cidades portuguesas;  
- Campos de pagamento adicionados apenas no passo 2, sem afetar os restantes passos do checkout.

---

## Ajuda Externa

Foi recebida ajuda pontual de um elemento externo ao grupo (irmão do Bernardo Craveiro), especialmente em aspetos técnicos mais avançados:

- Inicialização correta do Ionic Storage e uso de `ensureReady()`;  
- Boas práticas de gestão de sessão e segurança (tokens e persistência);  
- Utilização da Web Crypto API para hashing e validação de dados de autenticação;  
- Processamento e validação avançada de imagens no Customizer (upload, transformação e exportação em canvas);  
- Resolução de problemas com Capacitor e orientação do ecrã em dispositivos móveis;  
- Estratégias de sincronização e persistência do carrinho e histórico de encomendas em cenários de falha ou múltiplas contas.  
