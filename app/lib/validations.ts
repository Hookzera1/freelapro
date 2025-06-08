import { z } from 'zod';

// Validação para criação de usuário
export const createUserSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(100),
  email: z.string().email('Email inválido'),
  userType: z.enum(['freelancer', 'company'], {
    errorMap: () => ({ message: 'Tipo de usuário deve ser freelancer ou company' })
  }),
  companyName: z.string().min(2).max(100).optional(),
  phone: z.string().optional(),
  bio: z.string().max(1000).optional(),
});

// Validação para criação de projeto
export const createProjectSchema = z.object({
  title: z.string().min(5, 'Título deve ter pelo menos 5 caracteres').max(200),
  description: z.string().min(20, 'Descrição deve ter pelo menos 20 caracteres').max(5000),
  budget: z.number().positive('Orçamento deve ser positivo').max(1000000),
  deadline: z.string().datetime('Data limite inválida'),
  type: z.enum(['fixed', 'hourly', 'recurring']).default('fixed'),
  level: z.enum(['beginner', 'intermediate', 'expert']).default('intermediate'),
  technologies: z.array(z.string()).max(20).optional(),
  scope: z.string().max(1000).optional(),
});

// Validação para criação de proposta
export const createProposalSchema = z.object({
  message: z.string().min(10, 'Mensagem deve ter pelo menos 10 caracteres').max(2000),
  budget: z.number().positive('Orçamento deve ser positivo').max(1000000),
  timeline: z.string().max(500).optional(),
  attachments: z.array(z.string()).max(10).optional(),
});

// Validação para atualização de perfil
export const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  bio: z.string().max(1000).optional(),
  phone: z.string().max(20).optional(),
  location: z.string().max(100).optional(),
  website: z.string().url().optional().or(z.literal('')),
  hourlyRate: z.number().positive().max(10000).optional(),
  skills: z.array(z.string()).max(50).optional(),
  languages: z.array(z.string()).max(20).optional(),
  companyName: z.string().min(2).max(100).optional(),
  companySize: z.enum(['1-10', '11-50', '51-200', '201-500', '500+']).optional(),
});

// Validação para mensagens
export const createMessageSchema = z.object({
  content: z.string().min(1, 'Mensagem não pode estar vazia').max(2000),
  contractId: z.string().min(1, 'ID do contrato é obrigatório'),
  attachments: z.array(z.string()).max(10).optional(),
});

// Validação para reviews
export const createReviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  title: z.string().min(5).max(200),
  comment: z.string().min(10).max(1000).optional(),
  contractId: z.string().min(1),
});

// Validação para upload de arquivos
export const uploadFileSchema = z.object({
  filename: z.string().min(1).max(255),
  fileType: z.string().min(1).max(100),
  fileSize: z.number().positive().max(50 * 1024 * 1024), // 50MB max
});

// Validação para busca/filtros
export const searchFiltersSchema = z.object({
  query: z.string().max(100).optional(),
  category: z.string().max(50).optional(),
  minBudget: z.number().positive().optional(),
  maxBudget: z.number().positive().optional(),
  type: z.enum(['fixed', 'hourly', 'recurring']).optional(),
  level: z.enum(['beginner', 'intermediate', 'expert']).optional(),
  technologies: z.array(z.string()).max(20).optional(),
  location: z.string().max(100).optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
});

// Validação para notificações
export const createNotificationSchema = z.object({
  userId: z.string().min(1),
  type: z.enum(['MESSAGE_RECEIVED', 'PROPOSAL_RECEIVED', 'PROPOSAL_ACCEPTED', 'MILESTONE_COMPLETED', 'PAYMENT_RECEIVED']),
  title: z.string().min(1).max(200),
  message: z.string().min(1).max(500),
  relatedId: z.string().optional(),
  relatedType: z.enum(['project', 'proposal', 'contract', 'message']).optional(),
});

// Função helper para validar dados
export function validateData<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; error: string } {
  try {
    const validData = schema.parse(data);
    return { success: true, data: validData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0];
      return {
        success: false,
        error: firstError.message
      };
    }
    return {
      success: false,
      error: 'Dados inválidos'
    };
  }
}

// Sanitização de strings
export function sanitizeString(str: string): string {
  return str
    .replace(/[<>]/g, '') // Remove tags HTML básicas
    .replace(/javascript:/gi, '') // Remove javascript: urls
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
}

// Validação de IDs
export function isValidId(id: string): boolean {
  return /^[a-zA-Z0-9_-]+$/.test(id) && id.length >= 1 && id.length <= 128;
} 