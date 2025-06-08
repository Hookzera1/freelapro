# 🚀 Deploy Rápido FreelancePro - 5 Minutos

## 1️⃣ Supabase (2 minutos)
1. Acesse: https://supabase.com
2. Clique "Start your project" → Sign up
3. Crie projeto "FreelancePro"
4. **⚠️ COPIE A SENHA** (não aparece depois!)
5. Settings → Database → Copie "Connection string"
6. Formato: `postgresql://postgres:[SUA-SENHA]@[HOST]:5432/postgres`

## 2️⃣ Configurar Variáveis (30 segundos)
Edite `.env.local` e adicione:
```bash
DATABASE_URL="postgresql://postgres:[SUA-SENHA]@[HOST]:5432/postgres"
NEXTAUTH_URL="https://[SEU-PROJETO].vercel.app"
NEXTAUTH_SECRET="qualquer-string-aleatoria-aqui"
```

## 3️⃣ Migrar Banco (30 segundos)
```bash
npx prisma db push
npx prisma generate
```

## 4️⃣ Deploy Vercel (2 minutos)
```bash
vercel --prod
```
- Cole as mesmas variáveis de ambiente quando perguntado
- Pronto! Seu site estará no ar

## ✅ URLs Finais
- **Site**: https://[seu-projeto].vercel.app
- **Admin Supabase**: https://supabase.com/dashboard

---
⏱️ **Total: ~5 minutos**
🎯 **Resultado**: FreelancePro funcionando em produção! 