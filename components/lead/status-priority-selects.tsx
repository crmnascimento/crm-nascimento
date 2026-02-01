
'use client';

import React from 'react';
import { 
  SelectImproved, 
  SelectContentImproved, 
  SelectItemImproved, 
  SelectTriggerImproved, 
  SelectValueImproved,
  useSafeSelect
} from '@/components/ui/select-improved';

// Status Options
export const LEAD_STATUS_OPTIONS = [
  { value: 'NAO_CONTATADO', label: 'Não Contatado' },
  { value: 'POTENCIAL', label: 'Contato Realizado' },
  { value: 'EM_ANALISE', label: 'Qualificação' },
  { value: 'PROCESSO_INICIADO', label: 'Proposta Enviada' },
  { value: 'VALOR_RECUPERADO', label: 'Negociação' },
  { value: 'CONTRATO_ASSINADO', label: 'Fechado Ganho' },
  { value: 'PERDIDO', label: 'Fechado Perdido' }
];

// Priority Options
export const PRIORITY_OPTIONS = [
  { value: 'ALTA', label: 'Alta' },
  { value: 'MEDIA', label: 'Média' },
  { value: 'BAIXA', label: 'Baixa' }
];

// Filter Options (includes "all" option)
export const STATUS_FILTER_OPTIONS = [
  { value: 'all', label: 'Todos os Status' },
  ...LEAD_STATUS_OPTIONS
];

export const PRIORITY_FILTER_OPTIONS = [
  { value: 'all', label: 'Todas as Prioridades' },
  ...PRIORITY_OPTIONS
];

// Sort Options
export const SORT_OPTIONS = [
  { value: 'createdAt', label: 'Data de Criação' },
  { value: 'razaoSocial', label: 'Nome (A-Z)' },
  { value: 'valorEstimadoRecuperacao', label: 'Valor' },
  { value: 'status', label: 'Status' },
  { value: 'responsavel', label: 'Responsável' }
];

interface StatusSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  loading?: boolean;
  error?: boolean;
  className?: string;
}

export function StatusSelect({ 
  value, 
  onValueChange, 
  placeholder = "Selecione o status",
  loading,
  error,
  className 
}: StatusSelectProps) {
  const {
    value: safeValue,
    setValue,
    error: selectError,
    hasValidOptions
  } = useSafeSelect(value, LEAD_STATUS_OPTIONS);

  const handleChange = (newValue: string) => {
    setValue(newValue);
    onValueChange(newValue);
  };

  return (
    <SelectImproved value={safeValue} onValueChange={handleChange}>
      <SelectTriggerImproved 
        loading={loading}
        error={error || !!selectError}
        className={className}
      >
        <SelectValueImproved placeholder={placeholder} />
      </SelectTriggerImproved>
      <SelectContentImproved>
        {hasValidOptions ? (
          LEAD_STATUS_OPTIONS.map((option) => (
            <SelectItemImproved key={option.value} value={option.value}>
              {option.label}
            </SelectItemImproved>
          ))
        ) : (
          <div className="p-2 text-sm text-gray-500">
            Nenhuma opção disponível
          </div>
        )}
      </SelectContentImproved>
    </SelectImproved>
  );
}

export function PrioritySelect({ 
  value, 
  onValueChange, 
  placeholder = "Selecione a prioridade",
  loading,
  error,
  className 
}: StatusSelectProps) {
  const {
    value: safeValue,
    setValue,
    error: selectError,
    hasValidOptions
  } = useSafeSelect(value, PRIORITY_OPTIONS);

  const handleChange = (newValue: string) => {
    setValue(newValue);
    onValueChange(newValue);
  };

  return (
    <SelectImproved value={safeValue} onValueChange={handleChange}>
      <SelectTriggerImproved 
        loading={loading}
        error={error || !!selectError}
        className={className}
      >
        <SelectValueImproved placeholder={placeholder} />
      </SelectTriggerImproved>
      <SelectContentImproved>
        {hasValidOptions ? (
          PRIORITY_OPTIONS.map((option) => (
            <SelectItemImproved key={option.value} value={option.value}>
              {option.label}
            </SelectItemImproved>
          ))
        ) : (
          <div className="p-2 text-sm text-gray-500">
            Nenhuma opção disponível
          </div>
        )}
      </SelectContentImproved>
    </SelectImproved>
  );
}

export function StatusFilterSelect({ 
  value, 
  onValueChange, 
  placeholder = "Filtrar por status",
  loading,
  error,
  className 
}: StatusSelectProps) {
  const {
    value: safeValue,
    setValue,
    error: selectError,
    hasValidOptions
  } = useSafeSelect(value || 'all', STATUS_FILTER_OPTIONS);

  const handleChange = (newValue: string) => {
    setValue(newValue);
    onValueChange(newValue);
  };

  return (
    <SelectImproved value={safeValue} onValueChange={handleChange}>
      <SelectTriggerImproved 
        loading={loading}
        error={error || !!selectError}
        className={className}
      >
        <SelectValueImproved placeholder={placeholder} />
      </SelectTriggerImproved>
      <SelectContentImproved>
        {hasValidOptions ? (
          STATUS_FILTER_OPTIONS.map((option) => (
            <SelectItemImproved key={option.value} value={option.value}>
              {option.label}
            </SelectItemImproved>
          ))
        ) : (
          <div className="p-2 text-sm text-gray-500">
            Nenhuma opção disponível
          </div>
        )}
      </SelectContentImproved>
    </SelectImproved>
  );
}

export function PriorityFilterSelect({ 
  value, 
  onValueChange, 
  placeholder = "Filtrar por prioridade",
  loading,
  error,
  className 
}: StatusSelectProps) {
  const {
    value: safeValue,
    setValue,
    error: selectError,
    hasValidOptions
  } = useSafeSelect(value || 'all', PRIORITY_FILTER_OPTIONS);

  const handleChange = (newValue: string) => {
    setValue(newValue);
    onValueChange(newValue);
  };

  return (
    <SelectImproved value={safeValue} onValueChange={handleChange}>
      <SelectTriggerImproved 
        loading={loading}
        error={error || !!selectError}
        className={className}
      >
        <SelectValueImproved placeholder={placeholder} />
      </SelectTriggerImproved>
      <SelectContentImproved>
        {hasValidOptions ? (
          PRIORITY_FILTER_OPTIONS.map((option) => (
            <SelectItemImproved key={option.value} value={option.value}>
              {option.label}
            </SelectItemImproved>
          ))
        ) : (
          <div className="p-2 text-sm text-gray-500">
            Nenhuma opção disponível
          </div>
        )}
      </SelectContentImproved>
    </SelectImproved>
  );
}

export function SortSelect({ 
  value, 
  onValueChange, 
  placeholder = "Ordenar por",
  loading,
  error,
  className 
}: StatusSelectProps) {
  const {
    value: safeValue,
    setValue,
    error: selectError,
    hasValidOptions
  } = useSafeSelect(value || 'createdAt', SORT_OPTIONS);

  const handleChange = (newValue: string) => {
    setValue(newValue);
    onValueChange(newValue);
  };

  return (
    <SelectImproved value={safeValue} onValueChange={handleChange}>
      <SelectTriggerImproved 
        loading={loading}
        error={error || !!selectError}
        className={className}
      >
        <SelectValueImproved placeholder={placeholder} />
      </SelectTriggerImproved>
      <SelectContentImproved>
        {hasValidOptions ? (
          SORT_OPTIONS.map((option) => (
            <SelectItemImproved key={option.value} value={option.value}>
              {option.label}
            </SelectItemImproved>
          ))
        ) : (
          <div className="p-2 text-sm text-gray-500">
            Nenhuma opção disponível
          </div>
        )}
      </SelectContentImproved>
    </SelectImproved>
  );
}
