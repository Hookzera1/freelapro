-- ClearUsers
PRAGMA foreign_keys=OFF;

-- Limpar todas as tabelas relacionadas
DELETE FROM "Message" WHERE 1=1;
DELETE FROM "ChatParticipant" WHERE 1=1;
DELETE FROM "Chat" WHERE 1=1;
DELETE FROM "Payment" WHERE 1=1;
DELETE FROM "ContractMilestone" WHERE 1=1;
DELETE FROM "Contract" WHERE 1=1;
DELETE FROM "BankAccount" WHERE 1=1;
DELETE FROM "Notification" WHERE 1=1;
DELETE FROM "Milestone" WHERE 1=1;
DELETE FROM "Review" WHERE 1=1;
DELETE FROM "Proposal" WHERE 1=1;
DELETE FROM "Job" WHERE 1=1;
DELETE FROM "Session" WHERE 1=1;
DELETE FROM "Account" WHERE 1=1;
DELETE FROM "User" WHERE 1=1;

PRAGMA foreign_keys=ON; 