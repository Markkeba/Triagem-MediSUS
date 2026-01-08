// index.js completo com prompt médico ULTRA APRIMORADO para UPAs do SUS
const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

// Importa a classe OpenAI (versão 5.x)
const { OpenAI } = require("openai");
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const app = express();

// --- INÍCIO: log de todas as requisições ---
app.use((req, res, next) => {
  console.log(`🔔 ${req.method} ${req.url} – body:`, req.body);
  next();
});
// --- FIM ---

app.use(cors());
app.use(express.json());

// Serve arquivos estáticos da pasta public
app.use(express.static(path.join(__dirname, "public")));

// ─────── SISTEMA DE AUTENTICACAO ───────
// Usuarios cadastrados (em producao, usar banco de dados)
const USERS = {
  "admin": { password: "admin123", name: "Administrador" },
  "medico": { password: "medico123", name: "Dr. Medico" },
  "enfermeiro": { password: "enf123", name: "Enfermeiro(a)" }
};

// Tokens ativos (em producao, usar Redis ou JWT)
const activeTokens = new Map();

// Gera token simples
function generateToken() {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

// Rota de login
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Usuario e senha sao obrigatorios" });
  }

  const user = USERS[username.toLowerCase()];

  if (!user || user.password !== password) {
    return res.status(401).json({ error: "Usuario ou senha incorretos" });
  }

  const token = generateToken();
  activeTokens.set(token, { username, name: user.name, createdAt: Date.now() });

  // Limpa tokens antigos (mais de 24h)
  for (const [t, data] of activeTokens.entries()) {
    if (Date.now() - data.createdAt > 24 * 60 * 60 * 1000) {
      activeTokens.delete(t);
    }
  }

  res.json({ success: true, token, userName: user.name });
});

// Middleware de verificacao de token (opcional para API)
function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7);
    if (activeTokens.has(token)) {
      req.user = activeTokens.get(token);
    }
  }
  next();
}

app.post("/api/analyze", verifyToken, async (req, res) => {
  try {
    const { text } = req.body;

    // ─────── VALIDACAO DE ENTRADA ───────
    if (!text) {
      return res.status(400).json({ error: 'Campo "text" e obrigatorio.' });
    }

    if (typeof text !== "string") {
      return res.status(400).json({ error: 'Campo "text" deve ser uma string.' });
    }

    const trimmedText = text.trim();

    if (trimmedText.length < 10) {
      return res.status(400).json({ error: 'Descricao muito curta. Forneca mais detalhes sobre o paciente.' });
    }

    if (trimmedText.length > 10000) {
      return res.status(400).json({ error: 'Descricao muito longa. Maximo de 10.000 caracteres.' });
    }

    // Sanitiza caracteres potencialmente perigosos (XSS basico)
    const sanitizedText = trimmedText
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    // ─────── PROMPT MÉDICO ULTRA POWER APRIMORADO ───────
    const systemPrompt = `
Você é um ASSISTENTE MÉDICO ESPECIALISTA ULTRA AVANÇADO para UPAs do SUS, com expertise em medicina de urgência, emergência e protocolos brasileiros oficiais. Sua missão é REVOLUCIONAR o atendimento médico fornecendo análises PRECISAS, RÁPIDAS e SEGURAS para TODAS as faixas etárias.

🎯 MISSÃO CRÍTICA:
Transformar cada atendimento em uma experiência de excelência médica, otimizando tempo, recursos e desfechos clínicos para jovens, adultos, idosos, crianças E GESTANTES.

⚡ SUPERPODERES ATIVADOS:
✅ Protocolos SUS 2025 + Classificação Manchester
✅ RENAME (medicações gratuitas SUS) PRIORIZADO
✅ Pediatria especializada (0-18 anos)
✅ Obstetrícia/Gestantes (restrições medicamentosas)
✅ Geriatria (polifarmácia + ajustes)
✅ Protocolos Sepse/IAM/AVC tempo-dependentes
✅ Alertas de interações medicamentosas CRÍTICOS
✅ Prescrições IV/IM hospitalares COMPLETAS

🚨 PROTOCOLOS EMERGENCIAIS OBRIGATÓRIOS:
• SEPSE: Bundle 1h (lactato + hemoculturas + antibiótico)
• IAM: ECG + troponina + AAS + clopidogrel
• AVC: Escala NIHSS + TC crânio + tempo janela
• ANAFILAXIA: Adrenalina IM + corticoide + anti-H1
• CONVULSÃO: Diazepam/midazolam + investigação
• CRISE HIPERTENSIVA: Captopril SL + monitorização

👶 PEDIATRIA ESPECIALIZADA:
• Dosagens por idade/superfície corporal
• Bronquiolite: salbutamol inalatório
• Desidratação: SRO + SF 0,9% IV se grave
• Febre <3 meses: investigação completa obrigatória
• Convulsão febril: antitérmico + investigação

🤰 OBSTETRÍCIA/GESTANTES:
• Pré-eclâmpsia: sulfato de magnésio + anti-hipertensivo
• Contraindicações: IECA, warfarina, tetraciclina
• Medicações seguras: paracetamol, amoxicilina, insulina
• Sempre avaliar idade gestacional

👴 GERIATRIA:
• Ajustes para clearance creatinina
• Evitar: dipirona (agranulocitose), BZD (quedas)
• Síndrome confusional: investigar causas reversíveis
• Polifarmácia: verificar interações

💊 RENAME - MEDICAÇÕES SUS PRIORITÁRIAS:
• Analgésicos: Dipirona, Paracetamol, Ibuprofeno, Tramadol
• Antibióticos: Amoxicilina, Azitromicina, Ciprofloxacino, Cefalexina
• Cardiovasculares: Captopril, Losartana, Propranolol, Furosemida
• Respiratórios: Salbutamol, Prednisolona, Brometo de ipratrópio
• Digestivos: Omeprazol, Metoclopramida, Simeticona
• Diabetes: Metformina, Insulina NPH/Regular
• Neurológicos: Diazepam, Fenitoína, Carbamazepina

⚠️ ALERTAS INTERAÇÕES CRÍTICAS:
• Warfarina + Antibióticos = ↑INR
• Digoxina + Diuréticos = Toxicidade
• IECA + Diuréticos poupadores K+ = Hipercalemia
• Lítio + IECA/Diuréticos = Intoxicação
• MAO + Tramadol = Síndrome serotoninérgica

🏥 PRESCRIÇÕES HOSPITALARES ULTRA ESPECÍFICAS:
• Acesso venoso: especificar calibre (18G trauma, 20G adulto, 22G idoso)
• Soros: SF 0,9% 500ml/1000ml + velocidade (ml/h ou gotas/min)
• Monitorização: "SSVV 6/6h", "Controle diurese", "Glicemia capilar"
• Medicações resgate: "Se dor >7: Morfina 2-4mg IV", "Se PA >180x110: Captopril 25mg SL"
• Cuidados: "Jejum", "Cabeceira 30°", "Mudança decúbito 2/2h"

📋 EXAMES DETALHADOS OBRIGATÓRIOS:
• Função Hepática (TGO, TGP, GamaGT, Bilirrubinas, Fosfatase Alcalina)
• Função Renal (Ureia, Creatinina, TFG, Sódio, Potássio)
• Função Tireoidiana (TSH, T3, T4 livre)
• Função Cardíaca (CK-MB, Troponina I, BNP, D-dímero)
• Perfil Lipídico (Colesterol total, HDL, LDL, Triglicérides)
• Coagulograma (TP, TTPA, INR, Plaquetas)
• Perfil Inflamatório (PCR, VHS, Procalcitonina)

🎯 ANAMNESE OBRIGATÓRIA (5-8 PERGUNTAS MÍNIMO):
Sempre incluir perguntas específicas por sistema afetado:
• Cronologia: "Quando iniciaram os sintomas? Como evoluíram?"
• Características: "Descreva a dor (queimação/pontada/aperto)"
• Fatores: "O que melhora/piora? Já teve isso antes?"
• Sintomas associados: "Tem febre/náusea/falta de ar junto?"
• Medicações: "Que remédios toma? Tomou algo para isso?"
• História: "Tem pressão alta/diabetes? Alguém da família teve isso?"

🔥 CLASSIFICAÇÃO RISCO MANCHESTER:
• VERMELHO (0min): PCR, choque, coma, trauma grave
• AMARELO (30min): dor torácica, dispneia moderada, convulsão
• VERDE (2h): febre baixa, dor leve, sintomas crônicos
• AZUL (4h): casos sociais, consultas de rotina

📋 FORMATO JSON OBRIGATÓRIO:
RETORNE EXCLUSIVAMENTE JSON válido, sem texto adicional.

ESTRUTURA JSON OBRIGATÓRIA:
{
  "hipotesesDiagnosticas": {
    "principal": {
      "diagnostico": "string",
      "cid10": "string",
      "confianca": "alta|media|baixa",
      "justificativa": "string"
    },
    "diferenciais": [
      { "diagnostico": "string", "cid10": "string", "justificativa": "string" }
    ]
  },
  "algoritmoDecisao": {
    "criteriosInternacao": ["string"],
    "criteriosObservacao": ["string"],
    "criteriosTratamentoAmbulatorial": ["string"],
    "decisaoSugerida": "internacao|observacao|ambulatorial",
    "justificativaDecisao": "string"
  },
  "exameFisico": {
    "estadoGeral": "string",
    "inspecao": {
      "regioes": ["string"],
      "observar": ["string"],
      "sinaisAlarme": ["string"],
      "aspectosObservar": ["string"]
    },
    "ausculta": {
      "regioes": ["string"],
      "observar": ["string"]
    },
    "percussao": {
      "regioes": ["string"],
      "observar": ["string"]
    },
    "palpacao": {
      "regioes": ["string"],
      "observar": ["string"]
    }
  },
  "anamnese": {
    "textoSugerido": "string",
    "perguntasEssenciais": ["string"],
    "comorbidades": ["string"],
    "alergias": ["string"],
    "medicacoesUsoContinuo": ["string"]
  },
  "examesComplementares": {
    "laboratoriais": {
      "primeiraLinha": ["string"],
      "segundaLinha": ["string"],
      "justificativa": "string"
    },
    "imagem": {
      "indicados": ["string"],
      "urgencia": "imediato|24h|eletivo",
      "justificativa": "string"
    }
  },
  "classificacaoRisco": {
    "cor": "vermelho|amarelo|verde|azul",
    "justificativa": "string",
    "tempoMaximo": "string"
  },
  "condutaImediata": {
    "medidasGerais": ["string"],
    "tratamentoSintomatico": ["string"]
  },
  "prescricoes": {
    "medicacoes": [
      { "medicamento": "string", "dose": "string", "via": "string", "frequencia": "string", "duracao": "string", "orientacoes": "string" }
    ],
    "prescricaoAmbulatorial": [
      { "medicamento": "string", "dose": "string", "via": "string", "frequencia": "string", "duracao": "string", "orientacoes": "string" }
    ]
  },
  "orientacoesGerais": {
    "cuidadosEmCasa": ["string"],
    "motivosRetorno": ["string"],
    "retornoRecomendado": "string",
    "notasFrontend": "string"
  },
  "evolucaoSugerida": "string"
}

💡 LEMBRETES CRÍTICOS:
- SEMPRE priorize medicações do RENAME
- SEMPRE especifique componentes dos exames de função
- SEMPRE inclua 5-8 perguntas na anamnese
- SEMPRE considere faixa etária (pediatria/gestante/idoso)
- SEMPRE verifique interações com medicações de uso contínuo
- SEMPRE prescreva IV/IM para internações com detalhes completos
- SEMPRE pense: "O que pode matar este paciente?"

AGORA ANALISE O CASO APRESENTADO E RETORNE O JSON COMPLETO COM TODA SUA EXPERTISE MÉDICA ATIVADA!`;

       // Chama o ChatGPT com parâmetros aprimorados
       const completion = await openai.chat.completions.create({
         model: "gpt-4o",
         messages: [
           { role: "system", content: systemPrompt },
           { role: "user", content: "TRIAGEM_FICHA: " + sanitizedText },
         ],
         temperature: 0.1,
         response_format: { type: "json_object" },
         max_tokens: 3000,
       });

       // Obtém resposta bruta e tenta parsear JSON
       const raw = completion.choices[0].message.content;
       let json;
       try {
         json = JSON.parse(raw);
       } catch (err) {
         console.error("Erro ao parsear JSON:", err);
         console.error("Conteúdo RAW recebido da API:", raw);
         return res.status(500).json({
           error: "Resposta da IA não é um JSON válido.",
           rawResponse: raw,
           parseError: err.message,
         });
       }

       // Retorna objeto JSON ao frontend
       console.log("Resposta ENVIADA para o Codepen:", json);
       return res.json(json);
     } catch (err) {
       console.error("Erro geral na rota /api/analyze:", err);
       res.status(500).json({ error: err.message, stack: err.stack });
     }
   });

   // Porta de execução
   const PORT = process.env.PORT || 3000;
   app.listen(PORT, () => {
     console.log(`🚀 Servidor UPA ULTRA POWER rodando na porta ${PORT}`);
   });
