# Triagem MediSUS

Sistema de triagem medica inteligente para Unidades de Pronto Atendimento (UPAs) do SUS, com suporte de Inteligencia Artificial.

## Sobre o Projeto

O Triagem MediSUS e um assistente de suporte a decisao clinica que utiliza IA (GPT-4) para auxiliar profissionais de saude na:

- Classificacao de risco (Protocolo Manchester)
- Hipoteses diagnosticas com CID-10
- Sugestao de exames complementares
- Prescricao de medicacoes (priorizando RENAME - medicacoes gratuitas do SUS)
- Orientacoes de conduta medica

**IMPORTANTE:** Este sistema e um assistente de apoio. O diagnostico final e a conduta devem ser validados por um medico.

## Funcionalidades

- Interface web intuitiva para entrada de dados do paciente
- Classificacao de risco com cores do protocolo Manchester
- Hipotese diagnostica principal e diferenciais
- Sugestoes de exames laboratoriais e de imagem
- Prescricoes hospitalares e ambulatoriais
- Perguntas para complementar a anamnese
- Sistema de autenticacao basica

## Requisitos

- Node.js 18 ou superior
- Chave de API da OpenAI (GPT-4)

## Instalacao

1. Clone o repositorio:
```bash
git clone https://github.com/seu-usuario/Triagem-MediSUS.git
cd Triagem-MediSUS
```

2. Instale as dependencias:
```bash
npm install
```

3. Configure as variaveis de ambiente:
```bash
cp .env.example .env
```

Edite o arquivo `.env` e adicione sua chave da OpenAI:
```
OPENAI_API_KEY=sua-chave-aqui
PORT=3000
```

4. Inicie o servidor:
```bash
npm start
```

5. Acesse no navegador:
```
http://localhost:3000
```

## Usuarios Padrao

O sistema vem com usuarios pre-configurados para teste:

| Usuario | Senha | Perfil |
|---------|-------|--------|
| admin | admin123 | Administrador |
| medico | medico123 | Medico |
| enfermeiro | enf123 | Enfermeiro |

**IMPORTANTE:** Em ambiente de producao, altere essas credenciais ou integre com um sistema de autenticacao real.

## Estrutura do Projeto

```
Triagem-MediSUS/
├── index.js          # Servidor Express + API
├── package.json      # Dependencias do projeto
├── .env              # Variaveis de ambiente (nao commitado)
├── public/           # Arquivos estaticos (frontend)
│   ├── index.html    # Redirecionamento para login
│   ├── login.html    # Tela de login
│   └── app.html      # Aplicacao principal
└── README.md         # Esta documentacao
```

## API Endpoints

### POST /api/login

Autentica um usuario.

**Request:**
```json
{
  "username": "medico",
  "password": "medico123"
}
```

**Response:**
```json
{
  "success": true,
  "token": "abc123...",
  "userName": "Dr. Medico"
}
```

### POST /api/analyze

Analisa dados de triagem e retorna sugestoes medicas.

**Request:**
```json
{
  "text": "Paciente: Joao Silva\nIdade: 45 anos\nQueixa: Dor no peito ha 2 horas..."
}
```

**Response:** Objeto JSON com hipoteses diagnosticas, classificacao de risco, exames, prescricoes, etc.

## Tecnologias Utilizadas

- **Backend:** Node.js, Express.js
- **IA:** OpenAI GPT-4
- **Frontend:** HTML, CSS, JavaScript (vanilla)

## Seguranca

O sistema inclui:
- Autenticacao por usuario/senha
- Tokens de sessao com expiracao de 24h
- Validacao e sanitizacao de entrada
- Limite de tamanho de texto (10.000 caracteres)

## Proximos Passos (Roadmap)

- [ ] Banco de dados para persistencia
- [ ] Historico de atendimentos
- [ ] Integracao com prontuario eletronico
- [ ] Exportacao em PDF
- [ ] Conformidade com LGPD
- [ ] Dashboard administrativo

## Licenca

Este projeto e de uso restrito para fins educacionais e de pesquisa.

## Aviso Legal

Este software NAO substitui a avaliacao medica profissional. Todas as sugestoes devem ser validadas por um profissional de saude qualificado antes de qualquer conduta clinica.
