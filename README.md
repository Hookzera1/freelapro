# FreelancePro - Plataforma de Freelancers

Uma plataforma moderna para conectar freelancers e empresas, construída com Next.js 15, Firebase, Prisma e Tailwind CSS.

## 🚀 Deploy Rápido

### Pré-requisitos
- Node.js 18+
- Conta no Vercel
- Banco de dados PostgreSQL (recomendado: PlanetScale)
- Projeto Firebase configurado

### Deploy em 5 minutos

1. **Clone e instale dependências:**
```bash
git clone <seu-repo>
cd freelancepro
npm install
```

2. **Configure variáveis de ambiente:**
```bash
cp .env.example .env.local
# Edite .env.local com suas credenciais
```

3. **Execute o script de deploy:**
```bash
chmod +x scripts/deploy.sh
./scripts/deploy.sh
```

## 🛡️ Segurança Implementada

### ✅ Medidas de Segurança Ativas

- **Rate Limiting**: 200 requests por 15 minutos por IP
- **Security Headers**: HSTS, XSS Protection, Content Type Options
- **CSP (Content Security Policy)**: Proteção contra XSS
- **Middleware de Autenticação**: Proteção de rotas sensíveis
- **Validação de Entrada**: Zod schemas para todas as APIs
- **Sanitização de Dados**: Limpeza de inputs maliciosos
- **Bloqueio de Arquivos Sensíveis**: .env, package.json, etc.

### 🔒 Headers de Segurança

```
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-XSS-Protection: 1; mode=block
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: origin-when-cross-origin
```

## 🏗️ Arquitetura

### Stack Tecnológico
- **Frontend**: Next.js 15, React 18, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Banco de Dados**: PostgreSQL (PlanetScale)
- **Autenticação**: Firebase Auth
- **Storage**: Firebase Storage
- **Deploy**: Vercel
- **Validação**: Zod

### Estrutura do Projeto
```
src/
├── app/                    # App Router (Next.js 15)
│   ├── api/               # API Routes
│   ├── components/        # Componentes React
│   ├── hooks/            # Custom Hooks
│   ├── lib/              # Utilitários e configurações
│   └── types/            # Definições TypeScript
├── prisma/               # Schema e migrações do banco
├── public/               # Arquivos estáticos
└── scripts/              # Scripts de deploy e utilitários
```

## 🔧 Configuração Local

### 1. Banco de Dados
```bash
# Configurar Prisma
npx prisma generate
npx prisma db push
```

### 2. Firebase
```bash
# Configurar Firebase
npm install -g firebase-tools
firebase login
firebase init
```

### 3. Desenvolvimento
```bash
npm run dev
```

## 📊 Monitoramento

### Logs e Métricas
- **Vercel Analytics**: Métricas de performance
- **Console Logs**: Debugging em desenvolvimento
- **Error Boundaries**: Captura de erros React

### Health Check
- Endpoint: `/api/health`
- Monitora: Banco de dados, Firebase, APIs

## 🚨 Troubleshooting

### Problemas Comuns

1. **Build Errors**:
   ```bash
   npm run build
   # Verifique os logs para erros específicos
   ```

2. **Database Connection**:
   ```bash
   npx prisma db push
   npx prisma generate
   ```

3. **Firebase Auth**:
   - Verifique as credenciais no `.env.local`
   - Confirme domínios autorizados no Firebase Console

## 📈 Performance

### Otimizações Implementadas
- **Image Optimization**: Next.js Image component
- **Code Splitting**: Automatic route-based splitting
- **Compression**: Gzip/Brotli compression
- **Caching**: Static generation onde possível
- **Bundle Analysis**: Webpack bundle analyzer

### Métricas Alvo
- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1
- **Time to Interactive**: < 3s

## 🔄 CI/CD

### Deploy Automático
- **Trigger**: Push para branch `main`
- **Build**: Vercel automatic builds
- **Tests**: Pre-deploy validation
- **Rollback**: Instant rollback capability

## 📝 Licença

MIT License - veja [LICENSE](LICENSE) para detalhes.

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📞 Suporte

- **Email**: suporte@freelancepro.com
- **Discord**: [Link do Discord]
- **Documentação**: [Link da Documentação]

---

**Status do Projeto**: ✅ Pronto para Produção

**Última Atualização**: Dezembro 2024 #   f r e e l a p r o  
 #   D e p l o y   w i t h   F i r e b a s e   v a r s  
 #   D e p l o y   c o m   n o m e s   c o r r e t o s   F i r e b a s e  
 