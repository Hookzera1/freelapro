import { prisma } from './prisma';

export type NotificationType =
  | 'PROPOSAL_RECEIVED'
  | 'PROPOSAL_ACCEPTED'
  | 'PROPOSAL_REJECTED'
  | 'MESSAGE_RECEIVED'
  | 'MILESTONE_COMPLETED'
  | 'MILESTONE_STARTED'
  | 'MILESTONE_APPROVED'
  | 'MILESTONE_REVISION_REQUESTED'
  | 'PAYMENT_RECEIVED'
  | 'CONTRACT_CREATED'
  | 'REVIEW_RECEIVED';

interface NotificationData {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  relatedId?: string;
  relatedType?: string;
}

export async function createNotification({
  userId,
  type,
  title,
  message,
  relatedId,
  relatedType
}: NotificationData) {
  try {
    const notificationData: any = {
      userId,
      type,
      title,
      message,
    };

    // Adicionar campos relacionados se fornecidos
    if (relatedId) {
      notificationData.relatedId = relatedId;
    }
    if (relatedType) {
      notificationData.relatedType = relatedType;
    }

    const notification = await prisma.notification.create({
      data: notificationData,
    });

    // Aqui podemos adicionar lógica para notificações em tempo real
    // usando WebSocket ou Server-Sent Events
    console.log('Notificação criada:', {
      id: notification.id,
      userId,
      type,
      title,
      relatedId,
      relatedType
    });

    return notification;
  } catch (error) {
    console.error('Erro ao criar notificação:', error);
    throw error;
  }
}

export async function sendNotification({
  userId,
  type,
  title,
  message,
}: NotificationData) {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
      },
    });

    // Aqui podemos adicionar lógica para notificações em tempo real
    // usando WebSocket ou Server-Sent Events

    return notification;
  } catch (error) {
    console.error('Erro ao enviar notificação:', error);
    throw error;
  }
}

export async function sendNotificationToMultipleUsers(
  userIds: string[],
  type: NotificationType,
  title: string,
  message: string
) {
  try {
    const notifications = await prisma.$transaction(
      userIds.map((userId) =>
        prisma.notification.create({
          data: {
            userId,
            type,
            title,
            message,
          },
        })
      )
    );

    return notifications;
  } catch (error) {
    console.error('Erro ao enviar notificações em massa:', error);
    throw error;
  }
}

export async function getUnreadNotificationsCount(userId: string) {
  try {
    const count = await prisma.notification.count({
      where: {
        userId,
        read: false,
      },
    });

    return count;
  } catch (error) {
    console.error('Erro ao contar notificações não lidas:', error);
    throw error;
  }
} 