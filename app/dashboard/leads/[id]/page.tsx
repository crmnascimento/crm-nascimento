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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
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
  X,
  Trash2
} from 'lucide-react';
import Link from 'next/link';

interface Telefone {
  id: string;
  numero: string;
  tipo: string;
  observacao?: string;
  ativo: boolean;
}

interface Socio {
  id: string;
  nome: string;
  cpf?: string;
  dataNascimento?: string;
  idade?: number;
  observacoes?: string;
  telefones?: Telefone[];
}

interface Lead {
  id: string;
  razaoSocial: string;
  nomeFantasia?: string;
  cnpj?: string;
  setor?: string;
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
  telefones?: Telefone[];
  socios?: Socio[];
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
  const [deleting, setDeleting] = useState(false);
  
  // Form states
  const [status, setStatus] = useState('');
  const [prioridade, setPrioridade] = useState('');
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
        setPrioridade(data.prioridade);
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
          prioridade,
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

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const response = await fetch(`/api/leads/${params.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast({
          title: 'Sucesso',
          description: 'Lead excluído com sucesso',
        });
        router.push('/dashboard/leads');
      } else {
        toast({
          title: 'Erro',
          description: 'Erro ao excluir lead',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao excluir lead',
        variant: 'destructive',
      });
    } finally {
      setDeleting(false);
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
        return 'Potencial';
      case 'EM_ANALISE':
        return 'Em Análise';
      case 'CONTRATO_ASSINADO':
        return 'Contrato Assinado';
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

  const getTipoTelefoneText = (tipo: string) => {
    switch (tipo) {
      case 'COMERCIAL':
        return 'Comercial';
      case 'RESIDENCIAL':
        return 'Residencial';
      case 'CELULAR':
        return 'Celular';
      case 'WHATSAPP':
        return 'WhatsApp';
      case 'OUTRO':
        return 'Outro';
      default:
        return tipo;
    }
  };

  if (loading) {
    return (
      <AppLayout requiredRole="DIRETORIA">
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
      <AppLayout requiredRole="DIRETORIA">
        <div className="p-6">
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-gray-500">Lead não encontrado</p>
              <div className="mt-4 text-center">
                <Link href="/dashboard/leads">
                  <Button variant="outline">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Voltar para Leads
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout requiredRole="DIRETORIA">
      <div className="p-6">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <Link href="/dashboard/leads">
              <Button variant="ghost" size="sm" className="mb-2">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">{lead.razaoSocial}</h1>
            {lead.nomeFantasia && (
              <p className="text-gray-600">{lead.nomeFantasia}</p>
            )}
          </div>
          <div className="flex space-x-2">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Excluir Lead
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Excluir Lead</AlertDialogTitle>
                  <AlertDialogDescription>
                    Tem certeza que deseja excluir este lead? Esta ação não pode ser desfeita.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    disabled={deleting}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    {deleting ? 'Excluindo...' : 'Excluir'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Status Cards */}
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-4">
                  <Label className="text-xs text-gray-500">Status</Label>
                  <Badge className={`mt-2 ${getStatusColor(lead.status)}`}>
                    {getStatusText(lead.status)}
                  </Badge>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <Label className="text-xs text-gray-500">Prioridade</Label>
                  <p className="mt-2 font-medium">
                    {lead.prioridade === 'ALTA' ? '🔴 Alta' : lead.prioridade === 'MEDIA' ? '🟡 Média' : '🟢 Baixa'}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Informações de Contato */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Phone className="h-5 w-5 mr-2" />
                  Informações de Contato
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Telefones da Empresa */}
                {lead.telefones && lead.telefones.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-sm mb-3 text-gray-700">Telefones Comerciais</h3>
                    <div className="space-y-3">
                      {lead.telefones.map((tel) => (
                        <div key={tel.id} className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <Phone className="h-4 w-4 text-blue-600" />
                                <span className="font-mono font-semibold text-gray-900">{tel.numero}</span>
                                <Badge variant="outline" className="text-xs">
                                  {getTipoTelefoneText(tel.tipo)}
                                </Badge>
                              </div>
                              {tel.observacao && (
                                <p className="text-sm text-gray-600 mt-1 ml-6">
                                  💬 {tel.observacao}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Email */}
                {lead.email && (
                  <div>
                    <Label className="text-xs text-gray-500">Email</Label>
                    <p className="font-medium flex items-center mt-1">
                      <Mail className="h-4 w-4 mr-2" />
                      {lead.email}
                    </p>
                  </div>
                )}

                {/* Contato Principal */}
                {lead.contatoPrincipal && (
                  <div>
                    <Label className="text-xs text-gray-500">Contato Principal</Label>
                    <p className="font-medium">{lead.contatoPrincipal}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Sócios */}
            {lead.socios && lead.socios.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="h-5 w-5 mr-2" />
                    Sócios
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {lead.socios.map((socio) => (
                    <div key={socio.id} className="border-l-4 border-blue-500 pl-4 py-2">
                      <h4 className="font-semibold text-gray-900">{socio.nome}</h4>
                      {socio.cpf && <p className="text-sm text-gray-600">CPF: {socio.cpf}</p>}
                      {socio.dataNascimento && (
                        <p className="text-sm text-gray-600">
                          Data de Nascimento: {socio.dataNascimento}
                          {socio.idade && ` (${socio.idade} anos)`}
                        </p>
                      )}
                      {socio.observacoes && (
                        <p className="text-sm text-gray-600 mt-1">Obs: {socio.observacoes}</p>
                      )}
                      
                      {/* Telefones do Sócio */}
                      {socio.telefones && socio.telefones.length > 0 && (
                        <div className="mt-3 space-y-2">
                          <p className="text-xs font-semibold text-gray-700">Telefones:</p>
                          {socio.telefones.map((tel) => (
                            <div key={tel.id} className="bg-blue-50 p-2 rounded text-sm">
                              <div className="flex items-center space-x-2">
                                <Phone className="h-3 w-3 text-blue-600" />
                                <span className="font-mono">{tel.numero}</span>
                                <Badge variant="outline" className="text-xs">
                                  {getTipoTelefoneText(tel.tipo)}
                                </Badge>
                              </div>
                              {tel.observacao && (
                                <p className="text-xs text-gray-600 mt-1">💬 {tel.observacao}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Localização */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  Localização
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {lead.endereco && (
                    <div>
                      <Label>Endereço</Label>
                      <p className="font-medium">{lead.endereco}</p>
                    </div>
                  )}
                  {lead.municipio && (
                    <div>
                      <Label>Município</Label>
                      <p className="font-medium">{lead.municipio}</p>
                    </div>
                  )}
                  {lead.uf && (
                    <div>
                      <Label>UF</Label>
                      <p className="font-medium">{lead.uf}</p>
                    </div>
                  )}
                  {lead.cep && (
                    <div>
                      <Label>CEP</Label>
                      <p className="font-medium">{lead.cep}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Informações Adicionais */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building className="h-5 w-5 mr-2" />
                  Informações Adicionais
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
                  {lead.instituicoesFinanceiras && (
                    <div>
                      <Label>Instituição Financeira</Label>
                      <p className="font-medium">{lead.instituicoesFinanceiras}</p>
                    </div>
                  )}
                  {lead.contratosBancarios && (
                    <div>
                      <Label>Contratos Bancários</Label>
                      <p className="font-medium">{lead.contratosBancarios}</p>
                    </div>
                  )}
                </div>
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
                    size="sm"
                    onClick={() => setShowInteractionForm(!showInteractionForm)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Interação
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {showInteractionForm && (
                  <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <InteractionForm
                      leadId={lead.id}
                      onSuccess={() => {
                        setShowInteractionForm(false);
                        fetchLead();
                      }}
                    />
                  </div>
                )}

                {lead.interactions && lead.interactions.length > 0 ? (
                  <div className="space-y-3">
                    {lead.interactions.map((interaction) => (
                      <div key={interaction.id} className="border-l-4 border-yellow-500 pl-4 py-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <Badge variant="outline" className="mb-2">
                              {getInteractionTypeText(interaction.tipo)}
                            </Badge>
                            <p className="text-sm text-gray-600">
                              {new Date(interaction.dataContato).toLocaleDateString('pt-BR', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                          <p className="text-sm font-medium text-gray-700">{interaction.user.name}</p>
                        </div>
                        <p className="mt-2 text-sm text-gray-700">{interaction.descricao}</p>
                        {interaction.resultado && (
                          <p className="mt-1 text-sm text-gray-600">
                            <strong>Resultado:</strong> {interaction.resultado}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-4">Nenhuma interação registrada ainda</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Ações do Lead */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Ações do Lead</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm">Status do Lead</Label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NAO_CONTATADO">Não Contatado</SelectItem>
                      <SelectItem value="POTENCIAL">Potencial</SelectItem>
                      <SelectItem value="EM_ANALISE">Em Análise</SelectItem>
                      <SelectItem value="CONTRATO_ASSINADO">Contrato Assinado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm">Prioridade</Label>
                  <Select value={prioridade} onValueChange={setPrioridade}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BAIXA">Baixa</SelectItem>
                      <SelectItem value="MEDIA">Média</SelectItem>
                      <SelectItem value="ALTA">Alta</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm">Próxima Ação</Label>
                  <Textarea
                    value={proximaAcao}
                    onChange={(e) => setProximaAcao(e.target.value)}
                    placeholder="Descreva a próxima ação..."
                    className="mt-1 min-h-20"
                  />
                </div>

                <div>
                  <Label className="text-sm">Data da Próxima Ação</Label>
                  <Input
                    type="date"
                    value={dataProximaAcao}
                    onChange={(e) => setDataProximaAcao(e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label className="text-sm">Observações de Contato</Label>
                  <Textarea
                    value={observacoesContato}
                    onChange={(e) => setObservacoesContato(e.target.value)}
                    placeholder="Adicione observações sobre os contatos..."
                    className="mt-1 min-h-20"
                  />
                </div>

                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full"
                >
                  {saving ? 'Salvando...' : 'Salvar Alterações'}
                </Button>
              </CardContent>
            </Card>

            {/* Responsável */}
            {lead.responsavel && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <User className="h-5 w-5 mr-2" />
                    Responsável
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="font-medium">{lead.responsavel.name}</p>
                  <p className="text-sm text-gray-600">{lead.responsavel.email}</p>
                </CardContent>
              </Card>
            )}

            {/* Valor Estimado */}
            {lead.valorEstimadoRecuperacao && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <DollarSign className="h-5 w-5 mr-2" />
                    Valor Estimado
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-green-600">
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    }).format(lead.valorEstimadoRecuperacao)}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
