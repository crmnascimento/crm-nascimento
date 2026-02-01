
'use client';

import { useEffect, useState } from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  Phone, 
  Calendar,
  Building,
  Target,
  AlertCircle,
  Clock
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

interface DashboardStats {
  totalLeads: number;
  totalValue: number;
  conversionRate: number;
  contractedLeads: number;
  recentLeads: number;
  recentInteractions: number;
  leadsPerStatus: Array<{
    status: string;
    count: number;
  }>;
  leadsPerPriority: Array<{
    priority: string;
    count: number;
  }>;
  leadsPerBank: Array<{
    bank: string;
    count: number;
  }>;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/dashboard/stats');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    } finally {
      setLoading(false);
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

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'ALTA':
        return 'Alta';
      case 'MEDIA':
        return 'Média';
      case 'BAIXA':
        return 'Baixa';
      default:
        return priority;
    }
  };

  // Cores para os gráficos
  const statusColors = ['#EF4444', '#F59E0B', '#3B82F6', '#10B981', '#8B5CF6', '#06B6D4', '#6B7280'];
  const priorityColors = ['#EF4444', '#F59E0B', '#10B981'];

  if (loading) {
    return (
      <AppLayout requiredRole="DIRETORIA">
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="grid grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout requiredRole="DIRETORIA">
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Executivo</h1>
          <p className="text-gray-600">
            Visão geral do desempenho e métricas do CRM
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total de Leads</p>
                  <p className="text-3xl font-bold text-gray-900">{stats?.totalLeads || 0}</p>
                  <p className="text-xs text-green-600 mt-1">
                    +{stats?.recentLeads || 0} nos últimos 30 dias
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-lg">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Valor Total em Negociação</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {stats?.totalValue 
                      ? new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                          notation: 'compact',
                          maximumFractionDigits: 0
                        }).format(stats.totalValue)
                      : 'R$ 0'
                    }
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Valor estimado de recuperação
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <Target className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Taxa de Conversão</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {stats?.conversionRate ? `${stats.conversionRate.toFixed(1)}%` : '0%'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {stats?.contractedLeads || 0} contratos assinados
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Phone className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Interações Recentes</p>
                  <p className="text-3xl font-bold text-gray-900">{stats?.recentInteractions || 0}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Últimos 7 dias
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row - Foco no Vendedor */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Funil de Vendas */}
          <Card>
            <CardHeader>
              <CardTitle>Funil de Vendas</CardTitle>
              <CardDescription>
                Acompanhamento do pipeline de vendas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={stats?.leadsPerStatus?.map((item, index) => ({
                      name: getStatusText(item.status),
                      value: item.count,
                      color: statusColors[index % statusColors.length]
                    })) || []}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fontSize: 9 }}
                      tickLine={false}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis 
                      tick={{ fontSize: 10 }}
                      tickLine={false}
                    />
                    <Tooltip />
                    <Bar dataKey="value" fill="#D4AF37" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Desempenho do Vendedor */}
          <Card>
            <CardHeader>
              <CardTitle>Desempenho do Vendedor</CardTitle>
              <CardDescription>
                Métricas de produtividade atual
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Phone className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-blue-900">Taxa de Contato</p>
                      <p className="text-sm text-blue-600">Leads contatados vs total</p>
                    </div>
                  </div>
                  <span className="text-2xl font-bold text-blue-900">
                    {(stats?.totalLeads || 0) > 0 && stats
                      ? `${(((stats.totalLeads - (stats.leadsPerStatus?.find(s => s.status === 'NAO_CONTATADO')?.count || 0)) / stats.totalLeads) * 100).toFixed(1)}%`
                      : '0%'
                    }
                  </span>
                </div>

                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Target className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium text-green-900">Meta do Mês</p>
                      <p className="text-sm text-green-600">Contratos vs meta (15)</p>
                    </div>
                  </div>
                  <span className="text-2xl font-bold text-green-900">
                    {stats?.contractedLeads || 0}/15
                  </span>
                </div>

                <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-yellow-600" />
                    <div>
                      <p className="font-medium text-yellow-900">Atividade Semanal</p>
                      <p className="text-sm text-yellow-600">Interações dos últimos 7 dias</p>
                    </div>
                  </div>
                  <span className="text-2xl font-bold text-yellow-900">
                    {stats?.recentInteractions || 0}
                  </span>
                </div>

                <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <TrendingUp className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="font-medium text-purple-900">Produtividade</p>
                      <p className="text-sm text-purple-600">Interações por lead ativo</p>
                    </div>
                  </div>
                  <span className="text-2xl font-bold text-purple-900">
                    {(stats?.totalLeads || 0) > 0 && stats
                      ? ((stats.recentInteractions || 0) / stats.totalLeads).toFixed(1)
                      : '0.0'
                    }
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Section - Foco no Vendedor */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Atividades Recentes do Vendedor */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                Atividades Recentes do Vendedor
              </CardTitle>
              <CardDescription>
                Últimas interações e atualizações realizadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats?.recentInteractions === 0 ? (
                  <div className="text-center py-8">
                    <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Nenhuma atividade recente
                    </h3>
                    <p className="text-gray-600">
                      Quando houver interações com leads, elas aparecerão aqui.
                    </p>
                  </div>
                ) : (
                  <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                    <div className="bg-blue-500 rounded-full w-2 h-2 mt-2"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        {stats?.recentInteractions} interações registradas
                      </p>
                      <p className="text-xs text-gray-500">
                        Nos últimos 7 dias - Acompanhe o progresso na página de leads
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Alertas e Tarefas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertCircle className="h-5 w-5 mr-2 text-yellow-600" />
                Alertas e Próximas Ações
              </CardTitle>
              <CardDescription>
                Itens que requerem atenção
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span className="font-medium text-red-800">
                      {stats?.leadsPerStatus?.find(s => s.status === 'NAO_CONTATADO')?.count || 0} leads não contatados
                    </span>
                  </div>
                  <p className="text-sm text-red-600 mt-1">
                    Requerem primeiro contato
                  </p>
                </div>

                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span className="font-medium text-yellow-800">
                      {stats?.leadsPerPriority?.find(p => p.priority === 'ALTA')?.count || 0} leads de alta prioridade
                    </span>
                  </div>
                  <p className="text-sm text-yellow-600 mt-1">
                    Precisam de atenção prioritária
                  </p>
                </div>

                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="font-medium text-blue-800">
                      {stats?.recentInteractions || 0} interações esta semana
                    </span>
                  </div>
                  <p className="text-sm text-blue-600 mt-1">
                    Atividade dos vendedores
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
