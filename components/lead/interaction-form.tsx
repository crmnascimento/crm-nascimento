
'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  SelectImproved, 
  SelectContentImproved, 
  SelectItemImproved, 
  SelectTriggerImproved, 
  SelectValueImproved,
  useSafeSelect
} from '@/components/ui/select-improved';
import { useToast } from '@/hooks/use-toast';
import { Plus, X, Save } from 'lucide-react';

interface InteractionFormProps {
  leadId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

const INTERACTION_TYPES = [
  { value: 'LIGACAO', label: 'Ligação' },
  { value: 'EMAIL', label: 'Email' },
  { value: 'WHATSAPP', label: 'WhatsApp' },
  { value: 'REUNIAO', label: 'Reunião' },
  { value: 'PROPOSTA', label: 'Proposta' },
  { value: 'CONTRATO', label: 'Contrato' },
  { value: 'OBSERVACAO', label: 'Observação' }
];

const INTERACTION_TEMPLATES = {
  LIGACAO: [
    {
      label: '📞 Ligação de apresentação - Cliente interessado',
      text: 'Realizada ligação para apresentar os serviços de recuperação de seguro prestamista. Cliente demonstrou interesse e solicitou mais informações.'
    },
    {
      label: '📞 Tentativa de contato - Reagendar',
      text: 'Tentativa de contato por ligação. Não foi possível falar com o responsável. Secretária informou melhor horário para retorno.'
    },
    {
      label: '📞 Follow-up - Cliente analisando',
      text: 'Ligação de follow-up. Cliente esclareceu dúvidas sobre o processo e está analisando a proposta internamente.'
    }
  ],
  EMAIL: [
    {
      label: '📧 Email de apresentação',
      text: 'Enviado email com apresentação dos serviços e casos de sucesso na recuperação de seguro prestamista.'
    },
    {
      label: '📧 Envio de documentos',
      text: 'Enviados documentos complementares e cronograma do processo de recuperação conforme solicitado pelo cliente.'
    },
    {
      label: '📧 Follow-up pós-proposta',
      text: 'Email de follow-up verificando o andamento da análise interna e oferecendo esclarecimentos adicionais.'
    }
  ],
  WHATSAPP: [
    {
      label: '💬 WhatsApp - Agendamento de reunião',
      text: 'Contato via WhatsApp para agendar reunião presencial ou por videoconferência para apresentação detalhada dos serviços.'
    },
    {
      label: '💬 Envio de material informativo',
      text: 'Enviado material informativo via WhatsApp com cases de sucesso e depoimentos de outros clientes.'
    },
    {
      label: '💬 Esclarecimento de dúvidas',
      text: 'Resposta rápida a dúvidas do cliente via WhatsApp. Esclarecimentos sobre prazos e documentação necessária.'
    }
  ],
  REUNIAO: [
    {
      label: '🤝 Reunião presencial - Apresentação',
      text: 'Reunião presencial na empresa do cliente. Apresentação completa dos serviços e análise preliminar do caso.'
    },
    {
      label: '🎥 Videoconferência - Alinhamento final',
      text: 'Videoconferência para alinhamento final dos termos contratuais e esclarecimento de últimas dúvidas antes da assinatura.'
    },
    {
      label: '📊 Reunião de acompanhamento',
      text: 'Reunião de acompanhamento do processo. Apresentação do status atual e próximos passos do caso.'
    }
  ],
  PROPOSTA: [
    {
      label: '📋 Proposta comercial enviada',
      text: 'Enviada proposta comercial personalizada com valores, prazos e condições específicas para o caso do cliente.'
    },
    {
      label: '✏️ Proposta ajustada',
      text: 'Ajustes realizados na proposta conforme solicitações do cliente. Nova versão enviada para análise final.'
    },
    {
      label: '⏰ Follow-up da proposta',
      text: 'Follow-up da proposta enviada. Cliente solicitou prazo adicional para análise interna e aprovação.'
    }
  ],
  CONTRATO: [
    {
      label: '✅ Contrato assinado - Processo iniciado',
      text: 'Contrato assinado e processo iniciado. Documentação recebida e análise técnica em andamento.'
    },
    {
      label: '📝 Revisão final do contrato',
      text: 'Revisão final do contrato com cliente. Esclarecimentos sobre cláusulas e assinatura agendada.'
    },
    {
      label: '🔐 Contrato para assinatura digital',
      text: 'Contrato enviado para assinatura digital. Cliente recebeu instruções para finalização do processo.'
    }
  ],
  OBSERVACAO: [
    {
      label: '📝 Cliente solicitou mais tempo',
      text: 'Cliente precisa de mais tempo para análise interna. Reagendado contato para próxima semana.'
    },
    {
      label: '⏳ Aguardando aprovação interna',
      text: 'Cliente demonstrou interesse, mas está aguardando aprovação da diretoria. Manter acompanhamento semanal.'
    },
    {
      label: '💤 Sem interesse no momento',
      text: 'Cliente não demonstrou interesse no momento. Manter no pipeline para contato futuro em 3 meses.'
    }
  ]
};

export default function InteractionForm({ leadId, onSuccess, onCancel }: InteractionFormProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [description, setDescription] = useState('');
  const [result, setResult] = useState('');

  const {
    value: interactionType,
    setValue: setInteractionType,
    error: typeError,
    hasValidOptions
  } = useSafeSelect('', INTERACTION_TYPES);

  const templates = useMemo(() => {
    if (!interactionType || !(interactionType in INTERACTION_TEMPLATES)) {
      return [];
    }
    return INTERACTION_TEMPLATES[interactionType as keyof typeof INTERACTION_TEMPLATES] || [];
  }, [interactionType]);

  const handleSubmit = async () => {
    // Validação rigorosa
    if (!interactionType || interactionType.trim() === '') {
      toast({
        title: 'Erro de Validação',
        description: 'Selecione o tipo de interação',
        variant: 'destructive',
      });
      return;
    }

    if (!description || description.trim() === '') {
      toast({
        title: 'Erro de Validação',
        description: 'Preencha a descrição da interação',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/interactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          leadId,
          tipo: interactionType,
          descricao: description.trim(),
          resultado: result.trim() || null,
        }),
      });

      if (response.ok) {
        toast({
          title: 'Sucesso',
          description: 'Interação adicionada com sucesso',
        });
        onSuccess();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao adicionar interação');
      }
    } catch (error) {
      console.error('Erro ao adicionar interação:', error);
      toast({
        title: 'Erro',
        description: error instanceof Error ? error.message : 'Erro ao adicionar interação',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const useTemplate = (template: { text: string }) => {
    setDescription(template.text);
  };

  return (
    <div className="space-y-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-lg">Adicionar Nova Interação</h4>
        <Button variant="ghost" onClick={onCancel} size="sm">
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-4">
        {/* Tipo de Interação */}
        <div>
          <Label htmlFor="interaction-type">Tipo de Interação *</Label>
          <SelectImproved value={interactionType} onValueChange={setInteractionType}>
            <SelectTriggerImproved 
              id="interaction-type"
              loading={loading}
              error={!!typeError}
              className="mt-1"
            >
              <SelectValueImproved placeholder="Selecione o tipo de interação" />
            </SelectTriggerImproved>
            <SelectContentImproved>
              {hasValidOptions ? (
                INTERACTION_TYPES.map((type) => (
                  <SelectItemImproved key={type.value} value={type.value}>
                    {type.label}
                  </SelectItemImproved>
                ))
              ) : (
                <div className="p-2 text-sm text-gray-500">
                  Nenhuma opção disponível
                </div>
              )}
            </SelectContentImproved>
          </SelectImproved>
          {typeError && (
            <p className="text-sm text-red-600 mt-1">{typeError}</p>
          )}
        </div>

        {/* Templates */}
        {templates.length > 0 && (
          <div className="bg-blue-50 p-3 rounded-md">
            <Label className="text-blue-800 font-medium">Templates Sugeridos:</Label>
            <div className="mt-2 space-y-2">
              {templates.map((template, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="text-xs w-full justify-start text-left h-auto p-2"
                  onClick={() => useTemplate(template)}
                  type="button"
                >
                  {template.label}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Descrição */}
        <div>
          <Label htmlFor="description">Descrição *</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ex: Realizada ligação para apresentar os serviços. Cliente demonstrou interesse e solicitou proposta comercial."
            rows={4}
            className="mt-1"
            disabled={loading}
          />
        </div>

        {/* Resultado */}
        <div>
          <Label htmlFor="result">Resultado/Próximo Passo</Label>
          <Textarea
            id="result"
            value={result}
            onChange={(e) => setResult(e.target.value)}
            placeholder="Ex: Proposta a ser enviada até sexta-feira. Agendar follow-up para próxima terça-feira."
            rows={3}
            className="mt-1"
            disabled={loading}
          />
        </div>

        {/* Botões */}
        <div className="flex space-x-3 pt-2">
          <Button 
            onClick={handleSubmit} 
            disabled={loading || !interactionType || !description.trim()}
            className="bg-[#D4AF37] hover:bg-[#B8941F] text-black"
          >
            {loading ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {loading ? 'Salvando...' : 'Salvar Interação'}
          </Button>
          <Button 
            variant="outline" 
            onClick={onCancel}
            disabled={loading}
          >
            Cancelar
          </Button>
        </div>
      </div>
    </div>
  );
}
