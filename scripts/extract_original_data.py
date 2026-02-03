
import pandas as pd
import json
from decimal import Decimal

def extract_leads_from_excel():
    try:
        # Ler a planilha Excel
        df = pd.read_excel('./scripts/Acompanhamento_Clientes_Potenciais_Atualizado.xlsx')
        
        print(f"Total de linhas na planilha: {len(df)}")
        print(f"Colunas disponíveis: {list(df.columns)}")
        
        # Mostrar as primeiras linhas para entender a estrutura
        print("\nPrimeiras 5 linhas:")
        print(df.head())
        
        # Mostrar dados sobre valores nulos
        print("\nValores nulos por coluna:")
        print(df.isnull().sum())
        
        # Salvar dados limpos em JSON para análise
        df_clean = df.dropna(how='all')  # Remove linhas completamente vazias
        
        # Converter para lista de dicionários e limpar valores NaN
        leads_data = df_clean.to_dict('records')
        
        # Limpar valores NaN e substituir por None
        for lead in leads_data:
            for key, value in lead.items():
                if pd.isna(value) or str(value).lower() == 'nan':
                    lead[key] = None
        
        # Salvar em JSON para análise
        with open('./scripts/leads_originais.json', 'w', encoding='utf-8') as f:
            json.dump(leads_data, f, indent=2, ensure_ascii=False, default=str)
        
        print(f"\nDados extraídos e salvos. Total de registros válidos: {len(leads_data)}")
        
        return leads_data
        
    except Exception as e:
        print(f"Erro ao ler planilha: {e}")
        return None

if __name__ == "__main__":
    leads = extract_leads_from_excel()
