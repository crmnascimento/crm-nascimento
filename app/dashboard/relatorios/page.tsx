
'use client';

import { useEffect, useState } from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  Users, 
  FileDown,
  Calendar,
  Target,
  Phone,
  Clock,
  FileText,
  FileSpreadsheet
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

interface VendedorPerformance {
  vendedorId: string;
  vendedorName: string;
  totalLeads: number;
  leadsContatados: number;
  contratosFechados: number;
  valorTotal: number;
  valorFechado: number;
  interacoes: number;
  taxaConversao: number;
  ultimaAtividade: string;
}

interface ConversaoData {
  status: string;
  count: number;
  percentage: number;
}

interface FinanceiroData {
  mes: string;
  valorEstimado: number;
  valorFechado: number;
  valorPerdido: number;
}

export default function RelatoriosPage() {
  const [vendedorPerformance, setVendedorPerformance] = useState<VendedorPerformance[]>([]);
  const [conversaoData, setConversaoData] = useState<ConversaoData[]>([]);
  const [financeiroData, setFinanceiroData] = useState<FinanceiroData[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    to: new Date()
  });

  useEffect(() => {
    fetchReportsData();
  }, [dateRange]);

  const fetchReportsData = async () => {
    try {
      setLoading(true);
      // Aqui implementaremos as chamadas para APIs específicas de relatórios
      await fetchVendedorPerformance();
      await fetchConversaoData();
      await fetchFinanceiroData();
    } catch (error) {
      console.error('Erro ao carregar dados dos relatórios:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchVendedorPerformance = async () => {
    try {
      const response = await fetch('/api/dashboard/reports/vendedor');
      if (response.ok) {
        const data = await response.json();
        setVendedorPerformance(data);
      } else {
        console.error('Erro ao carregar performance do vendedor');
        setVendedorPerformance([]);
      }
    } catch (error) {
      console.error('Erro ao carregar performance do vendedor:', error);
      setVendedorPerformance([]);
    }
  };

  const fetchConversaoData = async () => {
    try {
      const response = await fetch('/api/dashboard/reports/conversao');
      if (response.ok) {
        const data = await response.json();
        setConversaoData(data);
      } else {
        console.error('Erro ao carregar dados de conversão');
        setConversaoData([]);
      }
    } catch (error) {
      console.error('Erro ao carregar dados de conversão:', error);
      setConversaoData([]);
    }
  };

  const fetchFinanceiroData = async () => {
    try {
      const response = await fetch('/api/dashboard/reports/financeiro?meses=6');
      if (response.ok) {
        const data = await response.json();
        setFinanceiroData(data);
      } else {
        console.error('Erro ao carregar dados financeiros');
        setFinanceiroData([]);
      }
    } catch (error) {
      console.error('Erro ao carregar dados financeiros:', error);
      setFinanceiroData([]);
    }
  };

  const exportToPDF = () => {
    try {
      const doc = new jsPDF();
      
      // Cabeçalho do documento
      doc.setFontSize(20);
      doc.text('Relatório CRM - Nascimento Advogados', 14, 22);
      
      doc.setFontSize(12);
      doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 14, 32);
      
      // Dados do vendedor para a tabela
      const vendedorData = vendedorPerformance.map(v => [
        v.vendedorName,
        v.totalLeads.toString(),
        v.leadsContatados.toString(),
        v.contratosFechados.toString(),
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v.valorTotal),
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v.valorFechado),
        `${v.taxaConversao.toFixed(1)}%`,
        new Date(v.ultimaAtividade).toLocaleDateString('pt-BR')
      ]);

      // Tabela de performance do vendedor
      autoTable(doc, {
        head: [['Vendedor', 'Leads Ativos', 'Contatados', 'Fechados', 'Valor Total', 'Valor Fechado', 'Taxa Conv.', 'Última Ativ.']],
        body: vendedorData,
        startY: 45,
        theme: 'grid',
        headStyles: { fillColor: [212, 175, 55] }, // Cor dourada do tema
        margin: { top: 45 }
      });

      // Dados de conversão
      const finalY = (doc as any).lastAutoTable.finalY + 20;
      doc.setFontSize(14);
      doc.text('Funil de Conversão', 14, finalY);
      
      const conversaoTableData = conversaoData.map(c => [
        c.status,
        c.count.toString(),
        `${c.percentage.toFixed(1)}%`
      ]);

      autoTable(doc, {
        head: [['Status', 'Quantidade', 'Percentual']],
        body: conversaoTableData,
        startY: finalY + 5,
        theme: 'grid',
        headStyles: { fillColor: [212, 175, 55] }
      });

      // Salvar o PDF
      doc.save(`relatorio-crm-${new Date().toISOString().split('T')[0]}.pdf`);
      
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      alert('Erro ao gerar o relatório PDF. Tente novamente.');
    }
  };

  const exportToCSV = () => {
    try {
      // Preparar dados para Excel
      const vendedorSheet = vendedorPerformance.map(v => ({
        'Vendedor': v.vendedorName,
        'Leads Ativos': v.totalLeads,
        'Leads Contatados': v.leadsContatados,
        'Contratos Fechados': v.contratosFechados,
        'Valor Total': v.valorTotal,
        'Valor Fechado': v.valorFechado,
        'Taxa de Conversão (%)': parseFloat(v.taxaConversao.toFixed(1)),
        'Última Atividade': v.ultimaAtividade
      }));

      const conversaoSheet = conversaoData.map(c => ({
        'Status': c.status,
        'Quantidade': c.count,
        'Percentual (%)': parseFloat(c.percentage.toFixed(1))
      }));

      const financeiroSheet = financeiroData.map(f => ({
        'Mês': f.mes,
        'Valor Estimado': f.valorEstimado,
        'Valor Fechado': f.valorFechado,
        'Valor Perdido': f.valorPerdido
      }));

      // Criar workbook
      const wb = XLSX.utils.book_new();
      
      // Adicionar sheets
      const wsVendedor = XLSX.utils.json_to_sheet(vendedorSheet);
      const wsConversao = XLSX.utils.json_to_sheet(conversaoSheet);
      const wsFinanceiro = XLSX.utils.json_to_sheet(financeiroSheet);
      
      XLSX.utils.book_append_sheet(wb, wsVendedor, 'Performance Vendedor');
      XLSX.utils.book_append_sheet(wb, wsConversao, 'Funil de Conversão');
      XLSX.utils.book_append_sheet(wb, wsFinanceiro, 'Dados Financeiros');

      // Salvar arquivo Excel
      XLSX.writeFile(wb, `relatorio-crm-${new Date().toISOString().split('T')[0]}.xlsx`);
      
    } catch (error) {
      console.error('Erro ao gerar Excel:', error);
      alert('Erro ao gerar o relatório Excel. Tente novamente.');
    }
  };

  const statusColors = ['#EF4444', '#F59E0B', '#10B981', '#6B7280'];

  if (loading) {
    return (
      <AppLayout requiredRole="DIRETORIA">
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
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
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Relatórios</h1>
              <p className="text-gray-600">
                Análise detalhada de desempenho e métricas do CRM
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Calendar className="h-4 w-4" />
                <span>Último mês</span>
              </div>
              <Button variant="outline" onClick={exportToPDF} className="bg-red-50 border-red-200 text-red-700 hover:bg-red-100">
                <FileText className="h-4 w-4 mr-2" />
                Exportar PDF
              </Button>
              <Button variant="outline" onClick={exportToCSV} className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100">
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Exportar Excel
              </Button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="desempenho" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="desempenho">Desempenho do Vendedor</TabsTrigger>
            <TabsTrigger value="conversao">Funil de Conversão</TabsTrigger>
            <TabsTrigger value="financeiro">Relatório Financeiro</TabsTrigger>
          </TabsList>

          {/* Tab: Desempenho do Vendedor */}
          <TabsContent value="desempenho" className="space-y-6">
            {/* KPIs do Vendedor */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Users className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-600">Leads Ativos</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {vendedorPerformance[0]?.totalLeads || 0}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Phone className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-600">Taxa de Contato</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {vendedorPerformance[0] 
                          ? `${((vendedorPerformance[0].leadsContatados / vendedorPerformance[0].totalLeads) * 100).toFixed(1)}%`
                          : '0%'
                        }
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <Target className="h-5 w-5 text-yellow-600" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-600">Taxa de Conversão</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {vendedorPerformance[0]?.taxaConversao?.toFixed(1) || 0}%
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Clock className="h-5 w-5 text-purple-600" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-600">Interações</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {vendedorPerformance[0]?.interacoes || 0}
                      </p>
                      <p className="text-xs text-gray-500">no período</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Detalhes do Vendedor */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  Detalhamento de Performance
                </CardTitle>
                <CardDescription>
                  Métricas detalhadas de produtividade do vendedor
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Vendedor</TableHead>
                      <TableHead>Leads Ativos</TableHead>
                      <TableHead>Leads Contatados</TableHead>
                      <TableHead>Contratos Fechados</TableHead>
                      <TableHead>Valor Total</TableHead>
                      <TableHead>Valor Fechado</TableHead>
                      <TableHead>Taxa de Conversão</TableHead>
                      <TableHead>Última Atividade</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {vendedorPerformance.map((vendedor) => (
                      <TableRow key={vendedor.vendedorId}>
                        <TableCell className="font-medium">{vendedor.vendedorName}</TableCell>
                        <TableCell>{vendedor.totalLeads}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            {vendedor.leadsContatados}
                            <Badge variant="outline" className="ml-2">
                              {((vendedor.leadsContatados / vendedor.totalLeads) * 100).toFixed(0)}%
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>{vendedor.contratosFechados}</TableCell>
                        <TableCell>
                          {new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL',
                            notation: 'compact'
                          }).format(vendedor.valorTotal)}
                        </TableCell>
                        <TableCell className="text-green-600 font-medium">
                          {new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL',
                            notation: 'compact'
                          }).format(vendedor.valorFechado)}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            className={`${vendedor.taxaConversao >= 25 ? 'bg-green-100 text-green-800' : 
                              vendedor.taxaConversao >= 15 ? 'bg-yellow-100 text-yellow-800' : 
                              'bg-red-100 text-red-800'}`}
                          >
                            {vendedor.taxaConversao.toFixed(1)}%
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(vendedor.ultimaAtividade).toLocaleDateString('pt-BR')}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Funil de Conversão */}
          <TabsContent value="conversao" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Gráfico de Funil */}
              <Card>
                <CardHeader>
                  <CardTitle>Funil de Conversão</CardTitle>
                  <CardDescription>
                    Distribuição dos leads por status
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={conversaoData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ status, percentage }) => `${status} ${percentage}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="count"
                        >
                          {conversaoData.map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={statusColors[index % statusColors.length]} 
                            />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value, name) => [`${value} leads`, name]}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Tabela de Conversão */}
              <Card>
                <CardHeader>
                  <CardTitle>Detalhes do Funil</CardTitle>
                  <CardDescription>
                    Análise detalhada de cada etapa
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {conversaoData.map((item, index) => (
                      <div key={item.status} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div 
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: statusColors[index % statusColors.length] }}
                          />
                          <span className="font-medium">{item.status}</span>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg">{item.count}</p>
                          <p className="text-sm text-gray-500">{item.percentage}%</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Métricas de Conversão */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Users className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-600">Taxa de Primeiro Contato</p>
                      <p className="text-2xl font-bold text-gray-900">64.3%</p>
                      <p className="text-xs text-green-600">+12% vs mês anterior</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Target className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-600">Taxa Contato → Fechamento</p>
                      <p className="text-2xl font-bold text-gray-900">31.6%</p>
                      <p className="text-xs text-green-600">+8% vs mês anterior</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <div className="p-2 bg-red-100 rounded-lg">
                      <TrendingUp className="h-5 w-5 text-red-600" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-600">Taxa de Perda</p>
                      <p className="text-2xl font-bold text-gray-900">18.6%</p>
                      <p className="text-xs text-red-600">-5% vs mês anterior</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Tab: Financeiro */}
          <TabsContent value="financeiro" className="space-y-6">
            {/* Métricas Financeiras */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <DollarSign className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-600">Valor Total em Negociação</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                          notation: 'compact'
                        }).format(
                          financeiroData.reduce((acc, curr) => acc + curr.valorEstimado, 0)
                        )}
                      </p>
                      <p className="text-xs text-gray-500">Total dos últimos 6 meses</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <TrendingUp className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-600">Valor Fechado</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                          notation: 'compact'
                        }).format(
                          financeiroData.reduce((acc, curr) => acc + curr.valorFechado, 0)
                        )}
                      </p>
                      <p className="text-xs text-gray-500">Total dos últimos 6 meses</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <div className="p-2 bg-red-100 rounded-lg">
                      <DollarSign className="h-5 w-5 text-red-600" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-600">Valor Perdido</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                          notation: 'compact'
                        }).format(
                          financeiroData.reduce((acc, curr) => acc + curr.valorPerdido, 0)
                        )}
                      </p>
                      <p className="text-xs text-gray-500">Total dos últimos 6 meses</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Gráfico Financeiro */}
            <Card>
              <CardHeader>
                <CardTitle>Evolução Financeira</CardTitle>
                <CardDescription>
                  Acompanhamento dos valores por mês
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={financeiroData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="mes" 
                        tick={{ fontSize: 10 }}
                        tickLine={false}
                      />
                      <YAxis 
                        tick={{ fontSize: 10 }}
                        tickLine={false}
                        tickFormatter={(value) => `R$ ${value / 1000}k`}
                      />
                      <Tooltip 
                        formatter={(value) => [
                          new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value)),
                          ''
                        ]}
                      />
                      <Bar dataKey="valorEstimado" fill="#D4AF37" name="Valor Estimado" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="valorFechado" fill="#10B981" name="Valor Fechado" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="valorPerdido" fill="#EF4444" name="Valor Perdido" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
