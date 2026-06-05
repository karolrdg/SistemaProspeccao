# ProspectCRM 🚀
<img width="1000" height="493" alt="logo-login (2)" src="https://github.com/user-attachments/assets/be68a1d0-a4e1-4977-94f0-e1a84585ac09" />


O **ProspectCRM** é uma plataforma web completa para prospecção comercial e gerenciamento de empresas (leads). Desenvolvido inicialmente como projeto autoral de extensão acadêmica para atender uma empresa real, o sistema foi refatorado para um modelo SaaS reutilizável e otimizado. 

A aplicação realiza a busca, análise e organização de potenciais clientes utilizando dados públicos da Receita Federal, integrando recursos avançados de roteirização geográfica para otimizar visitas comerciais em campo.

🔗 **Link do Projeto:** [Acesse a aplicação no Render](https://sistemaprospeccao.onrender.com/) 

---

## ✨ Principais Funcionalidades

*   🔍 **Filtro Inteligente de Leads:** Busca avançada de empresas por cidade, segmento e código CNAE.
*   📊 **Visualização Estratégica:** Painel lateral dinâmico contendo dados de contato (E-mail, Telefone), localização e classificação do porte da empresa.
*   👥 **Gestão de Equipe (CRM):** Módulo administrativo para cadastrar, gerenciar permissões e monitorar colaboradores/vendedores.
*   📥 **Exportação de Dados:** Geração de arquivos CSV com os leads selecionados para integração com outras ferramentas.
*   🗺️ **Roteirização Inteligente (Geomarketing):** Seleção de múltiplas empresas da lista para traçar rotas automáticas otimizadas diretamente no mapa.

---

## 📸 Preview do Sistema

### Tela login

<img width="1917" height="935" alt="telalogin" src="https://github.com/user-attachments/assets/ccdfe780-5182-48a7-b7e7-0840f7843bc0" />


### 🗺️ Painel de Prospecção e Detalhes
Visualização da listagem de dados da Receita Federal com painel lateral detalhado de informações da empresa selecionada.

<img width="1905" height="937" alt="Captura de tela 2026-06-01 185944" src="https://github.com/user-attachments/assets/39740298-2f8a-4b8d-95c9-ca4f23ac3c86" />


### 👥 Gerenciamento de Colaboradores
Controle completo de acesso e níveis de permissão para a equipe de vendas.

<img width="1916" height="934" alt="telacadastro" src="https://github.com/user-attachments/assets/2b246052-44b8-4358-8f12-c60ae69acac1" />


### 📍 Seleção de Leads para Rotas
Seleção de múltiplas empresas simultaneamente para exportação ou agrupamento de rotas.

<img width="1902" height="942" alt="tracarrota1" src="https://github.com/user-attachments/assets/44a6f519-29bc-480f-91b2-3e7caa661f26" />


### 🚗 Roteirização Otimizada no Mapa
Integração com mapas para visualização de trajeto físico das empresas selecionadas mais próximas, otimizando as visitas de prospecção.

<img width="1914" height="933" alt="tracarrota2" src="https://github.com/user-attachments/assets/69dbe5c0-2f44-41f5-abbd-738d0a048862" />


---

## 🛠️ Tecnologias Utilizadas

### **Frontend**
*   **React** (Interface moderna, componentizada e reativa)
*   **Tailwind CSS** (Design minimalista, fluido e totalmente responsivo)

### **Backend**
*   **`.NET 8.0` Web API** (Arquitetura robusta, segura e de alta performance)
*   **Dapper** (Micro-ORM utilizado para consultas SQL brutas extremamente velozes)
*   **Npgsql** (Driver oficial do PostgreSQL para .NET)
*   **JWT (JSON Web Tokens)** (Autenticação e autorização segura baseada em funções/níveis)

### **Banco de Dados & Infraestrutura**
*   **PostgreSQL** (Armazenamento confiável e escalável dos dados)
*   **Render** (Hospedagem em nuvem da aplicação)

---

# 🚧 Melhorias Planejadas

O sistema ainda está em evolução e algumas partes carregam referências do projeto original desenvolvido para a GSO durante o projeto de extensão.

## Próximos passos

- Refatoração geral do código
- Remoção de regras e nomenclaturas específicas da empresa original
- Transformar o sistema em uma plataforma mais neutra e reutilizável
- Melhor componentização no frontend
- Melhor separação de responsabilidades no backend
- Dashboard analítico com métricas
- Pipeline/funil de vendas
- Melhorias de UI/UX e responsividade
- Controle de permissões mais avançado
- Otimização de performance
- Integrações futuras com APIs externas

## Objetivo

Evoluir o projeto de um sistema acadêmico funcional para uma solução mais profissional, escalável e adaptável para diferentes cenários comerciais.

## 🚀 Como Executar o Projeto Localmente

### Pré-requisitos
*   [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
*   [Node.js](https://nodejs.org/)
*   Instância do [PostgreSQL](https://www.postgresql.org/) ativa

### 1. Configurando o Backend (API)
```bash
# Entre na pasta da API backend
cd apiprospeccaogso

# Execute a API (ela utilizará os User Secrets configurados localmente)
dotnet run
# Volte para a raiz e entre na pasta do frontend
cd ../frontend

# Instale as dependências do React
npm install

# Inicie o servidor de desenvolvimento do Tailwind/React
npm run dev
