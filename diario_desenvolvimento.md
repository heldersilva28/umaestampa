# Diário de Desenvolvimento — UmaEstampa

**Unidade Curricular:** Interação Humano-Máquina  
**Grupo:** Bernardo Craveiro e Helder Silva  

---

## Sessão 1 – 18 de maio de 2026

**Elementos presentes:** Bernardo Craveiro, Helder Silva

**Objetivo:**  
Definição da estrutura da aplicação e início da implementação das páginas principais.

**Atividades realizadas:**  
- Bernardo Craveiro: Criação do projeto base em Ionic/Angular e configuração do ambiente de desenvolvimento;  
 - Bernardo Craveiro: Implementação do catálogo de produtos com listagem a partir de ficheiro JSON (com Helder);  
 - Helder Silva: Criação da estrutura de navegação entre páginas (app.routes.ts);  
 - Helder Silva: Implementação do componente de cabeçalho (HeaderComponent) com ligação ao carrinho e à conta do utilizador;  
 - Helder Silva: Configuração do Ionic Storage para persistência de dados no dispositivo.
 - Helder Silva: Implementação do catálogo de produtos (com Bernardo);

**Problemas:**  
- Os produtos não apareciam na página de catálogo após a primeira renderização.

**Solução:**  
- Identificou-se que o serviço de produtos não estava a aguardar a resposta do HttpClient antes de devolver os dados; adicionou-se a subscrição correta ao Observable.

**Decisões:**  
- Decidiu-se usar Angular Signals para gestão de estado reativo, em vez de BehaviorSubject, por ser mais simples e alinhado com Angular 20;  
- Ficou definido que cada produto teria id, nome, preço, categoria, descrição e imagem.

---

## Sessão 2 – 25 de maio de 2026

**Elementos presentes:** Bernardo Craveiro, Helder Silva

**Objetivo:**  
Implementação do personalizador de produtos, do carrinho de compras e do processo de checkout.

**Atividades realizadas:**  
- Helder Silva: Implementação da página Customizer com upload de imagem, controlo de posição por drag, slider de escala (20%–200%) e slider de rotação (−180° a +180°);  
- Helder Silva: Validação do ficheiro de imagem (tipo, tamanho máximo e resolução mínima) antes de permitir a personalização;  
- Bernardo Craveiro: Implementação do CartService com Angular Signals, operações de adicionar, remover e atualizar quantidade, e cálculo automático do subtotal;  
- Bernardo Craveiro: Implementação da página de Carrinho com ajuste de quantidades, remoção de itens com confirmação e cálculo de envio (€4,99 ou grátis acima de €50);  
- Bernardo Craveiro: Implementação do processo de Checkout em 3 passos: dados do cliente, método de pagamento e revisão/confirmação da encomenda.

**Problemas:**  
- Ao remover um item do carrinho, o índice dos itens seguintes ficava desfasado, causando remoções incorretas.

**Solução:**  
- Substituiu-se a lógica de remoção por índice por filtragem com base num identificador único do item.

**Decisões:**  
- Decidiu-se persistir o carrinho no Ionic Storage para que os itens não se percam ao fechar a aplicação;  
- Optou-se por um processo de checkout em múltiplos passos para melhorar a experiência do utilizador e reduzir erros de preenchimento.

---

## Sessão 3 – 1 de junho de 2026

**Elementos presentes:** Bernardo Craveiro, Helder Silva

**Objetivo:**  
Implementação do sistema de autenticação real com registo de utilizadores, login com JWT e persistência de dados por utilizador (encomendas, sessão).

**Atividades realizadas:**  
- Bernardo Craveiro e Helder Silva: Análise da solução de autenticação existente (simulada) e definição da abordagem com JWT client-side usando a Web Crypto API nativa do browser;  
- Bernardo Craveiro: Criação do JwtService com geração e verificação de tokens JWT (algoritmo HS256), assinatura HMAC-SHA256 e hash de passwords com SHA-256;  
- Helder Silva: Reestruturação do AuthService para suportar registo real (com verificação de email duplicado e armazenamento de password com hash) e login com validação de credenciais;  
- Bernardo Craveiro: Implementação da restauração automática de sessão ao iniciar a aplicação, com verificação da validade e expiração do token JWT (30 dias);  
- Helder Silva: Atualização da página de autenticação para passar a password ao AuthService e apresentar mensagens de erro reais ao utilizador (ex: "Password incorreta.", "Este email já está registado.");  
- Bernardo Craveiro e Helder Silva: Verificação de que o histórico de encomendas de cada utilizador é corretamente isolado e persistido, uma vez que o ID do utilizador é gerado no registo e se mantém estável entre sessões.

**Problemas:**  
- A sessão não era restaurada corretamente ao reabrir a aplicação porque o Ionic Storage ainda não estava inicializado quando o AuthService tentava ler o token.

**Solução:**  
- Adicionou-se a chamada `ensureReady()` no StorageService antes de qualquer leitura, garantindo que o storage está pronto antes de aceder aos dados.

**Decisões:**  
- Optou-se por uma implementação JWT puramente client-side (sem backend) usando a Web Crypto API, evitando dependências externas e mantendo a aplicação funcional como projeto académico;  
- Decidiu-se armazenar a base de dados de utilizadores no Ionic Storage, separada do token JWT, para permitir múltiplas contas no mesmo dispositivo;  
- O token JWT tem validade de 30 dias, após os quais o utilizador é redirecionado para o login automaticamente.
