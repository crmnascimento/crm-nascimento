
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import InteractionForm from '@/components/lead/interaction-form';
import { StatusSelect, PrioritySelect } from '@/components/lead/status-priority-selects';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  ArrowLeft, 
  Phone, 
  Mail, 
  MapPin, 
  Building, 
  DollarSign, 
  Calendar,
  User,
  FileText,
  MessageSquare,
  Plus,
  Edit3,
  Save,
  X
} from 'lucide-react';
import Link from 'next/link';

interface Lead {
  id: string;
  razaoSocial: string;
  nomeFantasia?: string;
  cnpj?: string;
  setor?: string;
  telefonePrincipal?: string;
  telefoneSecundario?: string;
  email?: string;
  endereco?: string;
  municipio?: string;
  uf?: string;
  cep?: string;
  contatoPrincipal?: string;
  cargo?: string;
  valorEstimadoRecuperacao?: number;
  contratosBancarios?: string;
  instituicoesFinanceiras?: string;
  status: string;
  prioridade: string;
  proximaAcao?: string;
  dataProximaAcao?: string;
  observacoes?: string;
  observacoesContato?: string;
  responsavel?: {
    name: string;
    email: string;
  };
  interactions?: Array<{
    id: string;
    tipo: string;
    descricao: string;
    resultado?: string;
    dataContato: string;
    user: {
      name: string;
    };
  }>;
}

export default function LeadDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Form states
  const [status, setStatus] = useState('');
  const [proximaAcao, setProximaAcao] = useState('');
  const [dataProximaAcao, setDataProximaAcao] = useState('');
  const [observacoesContato, setObservacoesContato] = useState('');
  
  // Interaction form
  const [showInteractionForm, setShowInteractionForm] = useState(false);
  
  // Quick edit states
  const [editingField, setEditingField] = useState<string | null>(null);
  const [tempValues, setTempValues] = useState<Record<string, any>>({});

  useEffect(() => {
    if (params.id) {
      fetchLead();
    }
  }, [params.id]);

  const fetchLead = async () => {
    try {
      const response = await fetch(`/api/leads/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setLead(data);
        setStatus(data.status);
        setProximaAcao(data.proximaAcao || '');
        setDataProximaAcao(data.dataProximaAcao ? data.dataProximaAcao.split('T')[0] : '');
        setObservacoesContato(data.observacoesContato || '');
      } else {
        toast({
          title: 'Erro',
          description: 'Erro ao carregar lead',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao carregar lead',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch(`/api/leads/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status,
          proximaAcao,
          dataProximaAcao: dataProximaAcao ? new Date(dataProximaAcao).toISOString() : null,
          observacoesContato,
        }),
      });

      if (response.ok) {
        toast({
          title: 'Sucesso',
          description: 'Lead atualizado com sucesso',
        });
        fetchLead();
      } else {
        toast({
          title: 'Erro',
          description: 'Erro ao atualizar lead',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao atualizar lead',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };



  // Quick edit functions
  const startEdit = (field: string, currentValue: any) => {
    setEditingField(field);
    setTempValues({ [field]: currentValue });
  };

  const cancelEdit = () => {
    setEditingField(null);
    setTempValues({});
  };

  const saveQuickEdit = async (field: string) => {
    try {
      const response = await fetch(`/api/leads/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          [field]: tempValues[field]
        }),
      });

      if (response.ok) {
        toast({
          title: 'Sucesso',
          description: 'Campo atualizado com sucesso',
        });
        setEditingField(null);
        setTempValues({});
        fetchLead();
      } else {
        toast({
          title: 'Erro',
          description: 'Erro ao atualizar campo',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao atualizar campo',
        variant: 'destructive',
      });
    }
  };

  // Editable field component
  const EditableField = ({ field, value, label, type = 'text' }: {
    field: string;
    value: any;
    label: string;
    type?: 'text' | 'number' | 'currency';
  }) => {
    const isEditing = editingField === field;
    const tempValue = tempValues[field] ?? value;

    if (isEditing) {
      return (
        <div className="flex items-center space-x-2">
          <div className="flex-1">
            <Label>{label}</Label>
            {type === 'currency' ? (
              <Input
                type="number"
                value={tempValue || ''}
                onChange={(e) => setTempValues({ ...tempValues, [field]: parseFloat(e.target.value) || 0 })}
                className="mt-1"
                placeholder="0.00"
              />
            ) : (
              <Input
                type={type}
                value={tempValue || ''}
                onChange={(e) => setTempValues({ ...tempValues, [field]: e.target.value })}
                className="mt-1"
              />
            )}
          </div>
          <div className="flex space-x-1 mt-6">
            <Button size="sm" onClick={() => saveQuickEdit(field)} className="h-8 w-8 p-0">
              <Save className="h-3 w-3" />
            </Button>
            <Button size="sm" variant="outline" onClick={cancelEdit} className="h-8 w-8 p-0">
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="group">
        <Label>{label}</Label>
        <div className="flex items-center space-x-2 mt-1">
          <p className="font-medium flex-1">
            {type === 'currency' && value
              ? new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                }).format(value)
              : value || 'Não informado'
            }
          </p>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => startEdit(field, value)}
            className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0"
          >
            <Edit3 className="h-3 w-3" />
          </Button>
        </div>
      </div>
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'NAO_CONTATADO':
        return 'bg-red-100 text-red-800';
      case 'POTENCIAL':
        return 'bg-yellow-100 text-yellow-800';
      case 'EM_ANALISE':
        return 'bg-blue-100 text-blue-800';
      case 'CONTRATO_ASSINADO':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'NAO_CONTATADO':
        return 'Não Contatado';
      case 'POTENCIAL':
        return 'Contato Realizado';
      case 'EM_ANALISE':
        return 'Qualificação';
      case 'PROCESSO_INICIADO':
        return 'Proposta Enviada';
      case 'VALOR_RECUPERADO':
        return 'Negociação';
      case 'CONTRATO_ASSINADO':
        return 'Fechado Ganho';
      case 'PERDIDO':
        return 'Fechado Perdido';
      default:
        return status;
    }
  };

  const getInteractionTypeText = (type: string) => {
    switch (type) {
      case 'LIGACAO':
        return 'Ligação';
      case 'EMAIL':
        return 'Email';
      case 'WHATSAPP':
        return 'WhatsApp';
      case 'REUNIAO':
        return 'Reunião';
      case 'PROPOSTA':
        return 'Proposta';
      case 'CONTRATO':
        return 'Contrato';
      case 'OBSERVACAO':
        return 'Observação';
      default:
        return type;
    }
  };

  if (loading) {
    return (
      <AppLayout requiredRole="VENDEDOR">
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!lead) {
    return (
      <AppLayout requiredRole="VENDEDOR">
        <div className="p-6">
          <Card>
            <CardContent className="p-12 text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Lead não encontrado
              </h3>
              <p className="text-gray-600 mb-4">
                O lead solicitado não foi encontrado ou você não tem permissão para acessá-lo.
              </p>
              <Link href="/vendedor">
                <Button>Voltar para Meus Leads</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout requiredRole="VENDEDOR">
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <Link href="/vendedor">
                <Button variant="ghost" className="mb-2">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar para Meus Leads
                </Button>
              </Link>
              <h1 className="text-3xl font-bold text-gray-900">{lead.razaoSocial}</h1>
              {lead.nomeFantasia && (
                <p className="text-gray-600">Nome Fantasia: {lead.nomeFantasia}</p>
              )}
              <div className="flex items-center space-x-2 mt-2">
                <Badge className={getStatusColor(lead.status)}>
                  {getStatusText(lead.status)}
                </Badge>
                <Badge variant="outline">
                  Prioridade: {lead.prioridade}
                </Badge>
              </div>
            </div>
            <div className="text-right">
              <div>
                <p className="text-sm text-gray-600 mb-2">Valor Estimado</p>
                <div className="text-2xl font-bold text-green-600">
                  <EditableField
                    field="valorEstimadoRecuperacao"
                    value={lead.valorEstimadoRecuperacao}
                    label=""
                    type="currency"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Informações do Lead */}
          <div className="lg:col-span-2 space-y-6">
            {/* Dados de Contato */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Dados de Contato
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <div className="flex-1">
                      <EditableField
                        field="telefonePrincipal"
                        value={lead.telefonePrincipal}
                        label="Telefone Principal"
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <div className="flex-1">
                      <EditableField
                        field="telefoneSecundario"
                        value={lead.telefoneSecundario}
                        label="Telefone Secundário"
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <div className="flex-1">
                      <EditableField
                        field="email"
                        value={lead.email}
                        label="E-mail"
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <div className="flex-1">
                      <EditableField
                        field="contatoPrincipal"
                        value={lead.contatoPrincipal ? `${lead.contatoPrincipal} ${lead.cargo ? `(${lead.cargo})` : ''}` : ''}
                        label="Contato Principal"
                      />
                    </div>
                  </div>
                </div>
                
                {(lead.endereco || lead.municipio) && (
                  <div className="flex items-start space-x-2 pt-2">
                    <MapPin className="h-4 w-4 text-gray-500 mt-1" />
                    <div>
                      {lead.endereco && <p>{lead.endereco}</p>}
                      {(lead.municipio || lead.uf) && (
                        <p>{lead.municipio}, {lead.uf} {lead.cep && `- ${lead.cep}`}</p>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Informações Comerciais */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building className="h-5 w-5 mr-2" />
                  Informações Comerciais
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {lead.cnpj && (
                    <div>
                      <Label>CNPJ</Label>
                      <p className="font-medium">{lead.cnpj}</p>
                    </div>
                  )}
                  {lead.setor && (
                    <div>
                      <Label>Setor</Label>
                      <p className="font-medium">{lead.setor}</p>
                    </div>
                  )}
                  {lead.contratosBancarios && (
                    <div>
                      <Label>Contratos Bancários</Label>
                      <p className="font-medium">{lead.contratosBancarios}</p>
                    </div>
                  )}
                  {lead.instituicoesFinanceiras && (
                    <div>
                      <Label>Instituições Financeiras</Label>
                      <p className="font-medium">{lead.instituicoesFinanceiras}</p>
                    </div>
                  )}
                </div>
                
                {lead.observacoes && (
                  <div>
                    <Label>Observações Gerais</Label>
                    <p className="mt-1 text-sm text-gray-700 bg-gray-50 p-3 rounded-md">
                      {lead.observacoes}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Histórico de Interações */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    <MessageSquare className="h-5 w-5 mr-2" />
                    Histórico de Interações
                  </CardTitle>
                  <Button
                    onClick={() => setShowInteractionForm(!showInteractionForm)}
                    className="bg-[#D4AF37] hover:bg-[#B8941F] text-black"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Interação
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {showInteractionForm && (
                  <InteractionForm
                    leadId={params.id as string}
                    onSuccess={() => {
                      setShowInteractionForm(false);
                      fetchLead();
                    }}
                    onCancel={() => setShowInteractionForm(false)}
                  />
                )}


                <div className="space-y-4">
                  {lead.interactions && lead.interactions.length > 0 ? (
                    lead.interactions.map((interaction) => (
                      <div key={interaction.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="outline">
                            {getInteractionTypeText(interaction.tipo)}
                          </Badge>
                          <div className="text-sm text-gray-500">
                            {new Date(interaction.dataContato).toLocaleDateString('pt-BR')} às{' '}
                            {new Date(interaction.dataContato).toLocaleTimeString('pt-BR', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                            {' - '}
                            {interaction.user.name}
                          </div>
                        </div>
                        <p className="text-gray-700 mb-2">{interaction.descricao}</p>
                        {interaction.resultado && (
                          <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                            <strong>Resultado:</strong> {interaction.resultado}
                          </p>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-8">
                      Nenhuma interação registrada ainda
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Painel de Ações */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Ações do Lead
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Status do Lead</Label>
                  <StatusSelect 
                    value={status} 
                    onValueChange={setStatus}
                    loading={saving}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label>Próxima Ação</Label>
                  <Textarea
                    value={proximaAcao}
                    onChange={(e) => setProximaAcao(e.target.value)}
                    placeholder="Descreva a próxima ação..."
                  />
                </div>

                <div>
                  <Label>Data da Próxima Ação</Label>
                  <Input
                    type="date"
                    value={dataProximaAcao}
                    onChange={(e) => setDataProximaAcao(e.target.value)}
                  />
                </div>

                <div>
                  <Label>Observações de Contato</Label>
                  <Textarea
                    value={observacoesContato}
                    onChange={(e) => setObservacoesContato(e.target.value)}
                    placeholder="Adicione observações sobre os contatos..."
                  />
                </div>

                <Button 
                  onClick={handleSave} 
                  disabled={saving}
                  className="w-full bg-[#D4AF37] hover:bg-[#B8941F] text-black"
                >
                  {saving ? 'Salvando...' : 'Salvar Alterações'}
                </Button>
              </CardContent>
            </Card>

            {/* Próxima Ação Agendada */}
            {lead.proximaAcao && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-yellow-700">
                    <Calendar className="h-5 w-5 mr-2" />
                    Próxima Ação Agendada
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-700 mb-2">{lead.proximaAcao}</p>
                  {lead.dataProximaAcao && (
                    <p className="text-xs text-gray-500">
                      Data: {new Date(lead.dataProximaAcao).toLocaleDateString('pt-BR')}
                    </p>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
