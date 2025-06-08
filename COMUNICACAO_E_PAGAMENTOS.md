# Sistema de Comunicação e Pagamentos - FreelancePro

## **Visão Geral do Sistema Ideal**

Seu projeto FreelancePro precisa de um sistema completo de gestão pós-contratação que cubra:
- Comunicação em tempo real
- Gestão de marcos (milestones)
- Sistema de pagamentos seguro
- Acompanhamento de entregáveis
- Resolução de disputas

## **1. Fluxo Pós-Aceitação da Proposta**

### **Processo Automatizado:**
```
Proposta Aceita → Contrato Criado → Marcos Definidos → Pagamento Inicial → Desenvolvimento → Entregas → Pagamentos
```

### **Estrutura do Contrato:**
- **Informações Básicas**: Título, descrição, prazo, valor total
- **Marcos (Milestones)**: Divisão do projeto em etapas
- **Termos de Pagamento**: % por marco, condições de liberação
- **Entregáveis**: Lista específica do que será entregue
- **Comunicação**: Chat integrado ao projeto

## **2. Sistema de Marcos (Milestones)**

### **Conceito:**
- Dividir projetos em **etapas menores** (3-6 marcos)
- Cada marco tem **valor específico** (% do total)
- **Entregáveis definidos** para cada etapa
- **Aprovação necessária** para liberar pagamento

### **Exemplo Prático:**
```
Projeto: E-commerce - R$ 15.000
├── Marco 1: Setup (20%) - R$ 3.000
├── Marco 2: Frontend (40%) - R$ 6.000  
├── Marco 3: Backend (30%) - R$ 4.500
└── Marco 4: Deploy (10%) - R$ 1.500
```

### **Estados dos Marcos:**
- **PENDING**: Aguardando início
- **IN_PROGRESS**: Em desenvolvimento
- **COMPLETED**: Freelancer finalizou
- **APPROVED**: Empresa aprovou
- **PAID**: Pagamento liberado

## **3. Sistema de Pagamentos Seguro**

### **Escrow (Custódia):**
- **Valor reservado** no início do projeto
- **Liberação automática** após aprovação
- **Proteção** para ambas as partes
- **Taxa da plataforma** (5-10% do valor)

### **Fluxo de Pagamento:**
```
Empresa deposita → Escrow → Milestone aprovado → Freelancer recebe
```

### **Integração com Gateways:**
- **Stripe**: Para cartões internacionais
- **PagSeguro/Mercado Pago**: Para mercado brasileiro
- **PIX**: Para transferências instantâneas
- **Boleto**: Para empresas que preferem

### **Código de Exemplo - Service de Pagamento:**
```typescript
class PaymentService {
  async createEscrow(contractId: string, amount: number) {
    // Reserva o valor no gateway de pagamento
    const escrow = await stripe.paymentIntents.create({
      amount: amount * 100, // centavos
      currency: 'brl',
      payment_method_types: ['card'],
      capture_method: 'manual', // Não captura automaticamente
      metadata: { contractId }
    });
    
    return escrow;
  }
  
  async releaseMilestonePayment(milestoneId: string) {
    const milestone = await db.milestone.findUnique({
      where: { id: milestoneId },
      include: { contract: true }
    });
    
    if (milestone.status === 'APPROVED') {
      // Libera o pagamento
      await stripe.paymentIntents.capture(milestone.paymentIntentId);
      
      // Atualiza status
      await db.milestone.update({
        where: { id: milestoneId },
        data: { status: 'PAID', paidAt: new Date() }
      });
      
      // Notifica freelancer
      await notificationService.send({
        userId: milestone.contract.freelancerId,
        type: 'PAYMENT_RECEIVED',
        message: `Pagamento de R$ ${milestone.amount} foi liberado!`
      });
    }
  }
}
```

## **4. Chat Integrado ao Projeto**

### **Funcionalidades:**
- **Mensagens em tempo real** (WebSocket/Socket.io)
- **Compartilhamento de arquivos**
- **Histórico completo** da comunicação
- **Notificações** push e email
- **Status de leitura** das mensagens

### **Tipos de Mensagem:**
- **TEXT**: Mensagem normal
- **FILE**: Arquivo anexado
- **MILESTONE_UPDATE**: Atualização de marco
- **PAYMENT_REQUEST**: Solicitação de pagamento
- **DELIVERY**: Entrega de trabalho

### **WebSocket Implementation:**
```typescript
// Socket handler para mensagens
io.on('connection', (socket) => {
  socket.on('join-contract', (contractId) => {
    socket.join(`contract-${contractId}`);
  });
  
  socket.on('send-message', async (data) => {
    const message = await db.message.create({
      data: {
        contractId: data.contractId,
        senderId: data.userId,
        content: data.content,
        type: data.type
      }
    });
    
    // Envia para todos os participantes
    io.to(`contract-${data.contractId}`).emit('new-message', message);
    
    // Notificação push
    await notificationService.sendToContract(data.contractId, {
      title: 'Nova mensagem',
      body: data.content
    });
  });
});
```

## **5. Sistema de Aprovação de Entregáveis**

### **Processo:**
1. Freelancer **marca marco como concluído**
2. **Upload dos entregáveis** (arquivos, links, demos)
3. Empresa **revisa e testa**
4. **Aprovação ou solicitação de ajustes**
5. **Pagamento liberado automaticamente**

### **Interface de Aprovação:**
```typescript
const ApprovalInterface = () => {
  return (
    <div className="milestone-approval">
      <h3>Marco: {milestone.title}</h3>
      <div className="deliverables">
        {milestone.deliverables.map(item => (
          <div key={item.id}>
            <CheckIcon /> {item.description}
            {item.file && <DownloadButton file={item.file} />}
          </div>
        ))}
      </div>
      
      <div className="actions">
        <button onClick={approveMilestone} className="approve">
          ✅ Aprovar e Liberar R$ {milestone.amount}
        </button>
        <button onClick={requestRevision} className="revise">
          🔄 Solicitar Revisão
        </button>
      </div>
    </div>
  );
};
```

## **6. Sistema de Notificações**

### **Tipos de Notificação:**
- **In-app**: Dentro da plataforma
- **Email**: Para atualizações importantes
- **Push**: Para móbil (PWA)
- **SMS**: Para pagamentos (opcional)

### **Eventos que Geram Notificações:**
- Nova mensagem no chat
- Marco concluído/aprovado
- Pagamento liberado/recebido
- Prazo próximo do vencimento
- Disputa aberta

## **7. Gestão de Arquivos e Entregáveis**

### **Estrutura de Pastas:**
```
/contracts/{contractId}/
├── /milestones/
│   ├── /milestone-1/
│   │   ├── deliverable-1.pdf
│   │   └── demo-link.txt
│   └── /milestone-2/
├── /chat-files/
└── /final-delivery/
```

### **Upload e Versionamento:**
- **Drag & drop** de arquivos
- **Versionamento** automático
- **Visualização** de PDFs, imagens
- **Download** em lote por marco

## **8. Sistema de Disputas**

### **Cenários de Disputa:**
- Cliente não aprova entregável válido
- Freelancer não entrega no prazo
- Qualidade abaixo do esperado
- Mudança de escopo não acordada

### **Processo de Resolução:**
1. **Tentativa de acordo** via chat
2. **Mediação** por equipe da plataforma
3. **Arbitragem** com especialista externo
4. **Decisão final** e liberação/retenção de pagamento

## **9. Dashboard de Contratos**

### **Visão Freelancer:**
- Lista de contratos ativos
- Progresso de cada projeto
- Próximos prazos
- Valores a receber
- Chat com clientes

### **Visão Empresa:**
- Projetos em andamento
- Marcos para aprovação
- Freelancers ativos
- Histórico de pagamentos
- Performance dos projetos

## **10. APIs Necessárias**

### **Contratos:**
```typescript
POST /api/contracts - Criar contrato
GET /api/contracts - Listar contratos
GET /api/contracts/:id - Detalhes do contrato
PUT /api/contracts/:id - Atualizar contrato
```

### **Marcos:**
```typescript
POST /api/milestones - Criar marco
PUT /api/milestones/:id/complete - Marcar como concluído
PUT /api/milestones/:id/approve - Aprovar marco
PUT /api/milestones/:id/request-revision - Solicitar revisão
```

### **Mensagens:**
```typescript
POST /api/contracts/:id/messages - Enviar mensagem
GET /api/contracts/:id/messages - Histórico de mensagens
POST /api/contracts/:id/files - Upload de arquivo
```

### **Pagamentos:**
```typescript
POST /api/payments/escrow - Criar custódia
POST /api/payments/release - Liberar pagamento
GET /api/payments/history - Histórico de pagamentos
```

## **11. Considerações de Segurança**

### **Autenticação e Autorização:**
- JWT tokens para autenticação
- Permissões baseadas em papel (freelancer/empresa)
- Verificação de propriedade do contrato
- Rate limiting para APIs

### **Pagamentos:**
- PCI DSS compliance
- Criptografia de dados sensíveis
- Logs de auditoria
- Detecção de fraude

## **12. Próximos Passos para Implementação**

### **Fase 1: Base**
- [ ] Modelo de dados para contratos
- [ ] Sistema básico de marcos
- [ ] Chat simples
- [ ] Dashboard básico

### **Fase 2: Pagamentos**
- [ ] Integração com Stripe
- [ ] Sistema de escrow
- [ ] Liberação automática
- [ ] Histórico financeiro

### **Fase 3: Melhorias**
- [ ] Notificações em tempo real
- [ ] Upload de arquivos
- [ ] Sistema de disputas
- [ ] Analytics avançados

### **Fase 4: Otimizações**
- [ ] App móbil
- [ ] Integrações externas
- [ ] IA para detecção de problemas
- [ ] Relatórios automatizados

## **Conclusão**

O sistema ideal combina:
- **Transparência** total no processo
- **Segurança** nos pagamentos
- **Comunicação** eficiente
- **Automação** de processos
- **Proteção** para ambas as partes

Isso cria um ambiente de **confiança** onde freelancers e empresas podem trabalhar com segurança, sabendo que seus interesses estão protegidos e que o processo é transparente e eficiente. 