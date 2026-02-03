
'use client';

import { useEffect, useState } from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Phone, Mail, MapPin, Calendar, DollarSign, Building, Search, ArrowUpDown } from 'lucide-react';
import Link from 'next/link';

interface Lead {
  id: string;
  razaoSocial: string;
  nomeFantasia?: string;
  telefonePrincipal?: string;
  email?: string;
  valorEstimadoRecuperacao?: number;
  status: string;
  prioridade: string;
  dataProximaAcao?: string;
  proximaAcao?: string;
  municipio?: string;
  uf?: string;
  instituicoesFinanceiras?: string;
}

export default function VendedorPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const response = await fetch('/api/leads/vendedor');
      const data = await response.json();
      setLeads(data);
    } catch (error) {
      console.error('Erro ao carregar leads:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'NAO_CONTATADO':
        return 'bg-red-100 text-red-800';
      case 'POTENCIAL':
        return 'bg-orange-100 text-orange-800'; // Contato Realizado
      case 'EM_ANALISE':
        return 'bg-blue-100 text-blue-800'; // Qualificação
      case 'PROCESSO_INICIADO':
        return 'bg-purple-100 text-purple-800'; // Proposta Enviada
      case 'VALOR_RECUPERADO':
        return 'bg-yellow-100 text-yellow-800'; // Negociação
      case 'CONTRATO_ASSINADO':
        return 'bg-green-100 text-green-800';
      case 'PERDIDO':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'NAO_CONTATADO':
        return 'Não Contatado';
      case 'POTENCIAL':
        return 'Contato Realizado'; // Reutilizando POTENCIAL para Contato Realizado
      case 'EM_ANALISE':
        return 'Qualificação'; // Reutilizando EM_ANALISE para Qualificação
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

  const getPrioridadeColor = (prioridade: string) => {
    switch (prioridade) {
      case 'ALTA':
        return 'bg-red-500';
      case 'MEDIA':
        return 'bg-yellow-500';
      case 'BAIXA':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  // Função para busca
  const searchLeads = (leads: Lead[], term: string) => {
    if (!term.trim()) return leads;
    
    const searchLower = term.toLowerCase();
    return leads.filter(lead => 
      lead.razaoSocial?.toLowerCase().includes(searchLower) ||
      lead.nomeFantasia?.toLowerCase().includes(searchLower) ||
      lead.email?.toLowerCase().includes(searchLower) ||
      lead.telefonePrincipal?.toLowerCase().includes(searchLower) ||
      lead.municipio?.toLowerCase().includes(searchLower)
    );
  };

  // Função para ordenação
  const sortLeads = (leads: Lead[], sortBy: string, order: 'asc' | 'desc') => {
    return [...leads].sort((a, b) => {
      let valueA: any;
      let valueB: any;

      switch (sortBy) {
        case 'razaoSocial':
          valueA = a.razaoSocial?.toLowerCase() || '';
          valueB = b.razaoSocial?.toLowerCase() || '';
          break;
        case 'valorEstimadoRecuperacao':
          valueA = a.valorEstimadoRecuperacao || 0;
          valueB = b.valorEstimadoRecuperacao || 0;
          break;
        case 'status':
          valueA = a.status || '';
          valueB = b.status || '';
          break;
        case 'createdAt':
        default:
          valueA = new Date(a.dataProximaAcao || '1900-01-01').getTime();
          valueB = new Date(b.dataProximaAcao || '1900-01-01').getTime();
          break;
      }

      if (valueA < valueB) return order === 'asc' ? -1 : 1;
      if (valueA > valueB) return order === 'asc' ? 1 : -1;
      return 0;
    });
  };

  // Aplicar filtros, busca e ordenação
  const filteredAndSortedLeads = (() => {
    let result = leads;
    
    // Filtrar por status
    if (statusFilter !== 'ALL') {
      result = result.filter(lead => lead.status === statusFilter);
    }
    
    // Aplicar busca
    result = searchLeads(result, searchTerm);
    
    // Aplicar ordenação
    result = sortLeads(result, sortBy, sortOrder);
    
    return result;
  })();

  if (loading) {
    return (
      <AppLayout requiredRole="VENDEDOR">
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="grid gap-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout requiredRole="VENDEDOR">
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Meus Leads</h1>
          <p className="text-gray-600">
            Gerencie e acompanhe seus leads de recuperação de seguro prestamista
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Phone className="h-5 w-5 text-blue-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Total de Leads</p>
                  <p className="text-2xl font-bold text-gray-900">{leads.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
                  <Calendar className="h-5 w-5 text-red-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Não Contatados</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {leads.filter(l => l.status === 'NAO_CONTATADO').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Building className="h-5 w-5 text-orange-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Contato Realizado</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {leads.filter(l => l.status === 'POTENCIAL').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <DollarSign className="h-5 w-5 text-green-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Valor Total</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    }).format(
                      leads.reduce((sum, lead) => sum + (lead.valorEstimadoRecuperacao || 0), 0)
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Sort */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex flex-1 gap-4 items-center">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Buscar por nome, empresa, telefone, email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-48">
                    <ArrowUpDown className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Ordenar por" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="createdAt">Data de Criação</SelectItem>
                    <SelectItem value="razaoSocial">Nome (A-Z)</SelectItem>
                    <SelectItem value="valorEstimadoRecuperacao">Valor</SelectItem>
                    <SelectItem value="status">Status</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="px-3"
                >
                  {sortOrder === 'asc' ? '↑' : '↓'}
                </Button>
              </div>
              
              <div className="text-sm text-gray-600">
                {filteredAndSortedLeads.length} de {leads.length} leads
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Filters */}
        <div className="mb-6">
          <div className="flex space-x-2 flex-wrap gap-2">
            {[
              { key: 'ALL', label: 'Todos' },
              { key: 'NAO_CONTATADO', label: 'Não Contatados' },
              { key: 'POTENCIAL', label: 'Contato Realizado' },
              { key: 'EM_ANALISE', label: 'Qualificação' },
              { key: 'PROCESSO_INICIADO', label: 'Proposta Enviada' },
              { key: 'VALOR_RECUPERADO', label: 'Negociação' },
              { key: 'CONTRATO_ASSINADO', label: 'Fechado Ganho' },
            ].map((filter) => (
              <Button
                key={filter.key}
                variant={statusFilter === filter.key ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter(filter.key)}
                className={statusFilter === filter.key ? 'bg-[#D4AF37] hover:bg-[#B8941F] text-black' : ''}
              >
                {filter.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Leads List */}
        <div className="grid gap-4">
          {filteredAndSortedLeads.map((lead) => (
            <Card key={lead.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <div
                        className={`w-3 h-3 rounded-full ${getPrioridadeColor(lead.prioridade)}`}
                        title={`Prioridade: ${lead.prioridade}`}
                      />
                      <h3 className="text-lg font-semibold text-gray-900">
                        {lead.razaoSocial}
                      </h3>
                      {lead.nomeFantasia && (
                        <span className="text-sm text-gray-500">({lead.nomeFantasia})</span>
                      )}
                      <Badge className={getStatusColor(lead.status)}>
                        {getStatusText(lead.status)}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                      {lead.telefonePrincipal && (
                        <div className="flex items-center space-x-2">
                          <Phone className="h-4 w-4" />
                          <span>{lead.telefonePrincipal}</span>
                        </div>
                      )}
                      {lead.email && (
                        <div className="flex items-center space-x-2">
                          <Mail className="h-4 w-4" />
                          <span>{lead.email}</span>
                        </div>
                      )}
                      {(lead.municipio || lead.uf) && (
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4" />
                          <span>{lead.municipio}, {lead.uf}</span>
                        </div>
                      )}
                      {lead.valorEstimadoRecuperacao && (
                        <div className="flex items-center space-x-2">
                          <DollarSign className="h-4 w-4" />
                          <span className="font-medium text-green-600">
                            {new Intl.NumberFormat('pt-BR', {
                              style: 'currency',
                              currency: 'BRL'
                            }).format(lead.valorEstimadoRecuperacao)}
                          </span>
                        </div>
                      )}
                    </div>

                    {lead.proximaAcao && (
                      <div className="mt-3 p-3 bg-yellow-50 rounded-lg">
                        <p className="text-sm font-medium text-yellow-800">Próxima Ação:</p>
                        <p className="text-sm text-yellow-700">{lead.proximaAcao}</p>
                        {lead.dataProximaAcao && (
                          <p className="text-xs text-yellow-600 mt-1">
                            Data: {new Date(lead.dataProximaAcao).toLocaleDateString('pt-BR')}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="ml-4">
                    <Link href={`/vendedor/lead/${lead.id}`}>
                      <Button className="bg-[#D4AF37] hover:bg-[#B8941F] text-black">
                        Abrir
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredAndSortedLeads.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Phone className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhum lead encontrado
              </h3>
              <p className="text-gray-600">
                {searchTerm || statusFilter !== 'ALL'
                  ? 'Tente ajustar os filtros de busca ou status.'
                  : 'Você ainda não possui leads atribuídos.'
                }
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
