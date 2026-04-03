import { format, formatDistanceToNow, isAfter, parseISO } from 'date-fns';
import { pt } from 'date-fns/locale';

/**
 * Formata uma data para o padrão profissional: "24 Out 2024 - 14:30"
 */
export const formatDateTime = (dateString: string) => {
  if (!dateString) return "Data inválida";
  const date = parseISO(dateString);
  return format(date, "dd MMM yyyy '•' HH:mm", { locale: pt });
};

/**
 * Formata apenas o horário: "14:30"
 */
export const formatTime = (dateString: string) => {
  if (!dateString) return "--:--";
  const date = parseISO(dateString);
  return format(date, "HH:mm", { locale: pt });
};

/**
 * Retorna o tempo relativo: "há 2 minutos"
 */
export const formatRelative = (dateString: string) => {
  if (!dateString) return "";
  const date = parseISO(dateString);
  return formatDistanceToNow(date, { addSuffix: true, locale: pt });
};

/**
 * Calcula o tempo restante para expiração de forma precisa
 */
export const getTimeRemaining = (expiresAt: string) => {
  const expiry = parseISO(expiresAt);
  const now = new Date();
  
  if (isAfter(now, expiry)) return "00:00:00";
  
  const diffMs = expiry.getTime() - now.getTime();
  const h = Math.floor(diffMs / (1000 * 60 * 60));
  const m = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  const s = Math.floor((diffMs % (1000 * 60)) / 1000);
  
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

/**
 * Verifica se uma data está dentro de um limite de horas (ex: 48h para histórico)
 */
export const isWithinHours = (dateString: string, hours: number) => {
  const date = parseISO(dateString);
  const diff = new Date().getTime() - date.getTime();
  return diff < hours * 60 * 60 * 1000;
};