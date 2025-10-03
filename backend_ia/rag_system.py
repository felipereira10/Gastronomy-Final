import os
from document_processor import DocumentProcessor
from langchain_community.vectorstores import FAISS  # Import atualizado
from langchain_community.embeddings import HuggingFaceEmbeddings  # Import atualizado
from transformers import pipeline
import torch

class RAGSystem:
    def __init__(self):
        print("🔄 Iniciando sistema RAG...")
        
        # 1. Processar documentos
        self.doc_processor = DocumentProcessor()
        data_path = "./data/"
        
        # Verificar se a pasta data existe
        if not os.path.exists(data_path):
            print("❌ Pasta 'data' não encontrada. Criando pasta...")
            os.makedirs(data_path)
            print("✅ Pasta 'data' criada. Adicione seus arquivos PDF, Word ou TXT.")
        
        documents = self.doc_processor.load_documents(data_path)
        
        # Verificar se há documentos processados
        if not documents:
            print("⚠️  Nenhum documento encontrado na pasta 'data/'.")
            print("📝 Criando documento de exemplo...")
            self._create_sample_documents(data_path)
            documents = self.doc_processor.load_documents(data_path)
        
        print(f"✅ {len(documents)} documentos processados!")
        
        # 2. Criar base de conhecimento
        self.embeddings = HuggingFaceEmbeddings(
            model_name="sentence-transformers/all-MiniLM-L6-v2"
        )
        
        # Verificar se temos embeddings válidos
        if documents:
            self.vector_store = FAISS.from_documents(documents, self.embeddings)
            print("✅ Base de conhecimento criada!")
        else:
            print("❌ Não foi possível criar base de conhecimento - documentos vazios.")
            self.vector_store = None
        
        # 3. Carregar Gemma
        try:
            self.llm = pipeline(
                "text-generation",
                model="google/gemma-2b-it",
                torch_dtype=torch.bfloat16,
                device_map="auto" if torch.cuda.is_available() else None,
                # model_kwargs={"trust_remote_code": True}
            )
            print("✅ Gemma carregada!")
        except Exception as e:
            print(f"❌ Erro ao carregar Gemma: {e}")
            print("🔄 Carregando modelo alternativo...")
            self.llm = pipeline(
                "text-generation",
                model="microsoft/DialoGPT-medium",
                device_map="auto" if torch.cuda.is_available() else None
            )        
            print("✅ Modelo alternativo carregado!")
        except Exception as e2:
            print(f"❌ Erro ao carregar modelo alternativo: {e2}")
            print("🔄 Usando modelo local simples...")
            self.llm = self._create_fallback_llm()
        
    
    def _create_fallback_llm(self):
        """Cria um LLM simples baseado em regras para fallback"""
        class FallbackLLM:
            def __call__(self, prompt, **kwargs):
                # Respostas baseadas em palavras-chave do cardápio
                prompt_lower = prompt.lower()
                
                if "hambúrguer" in prompt_lower or "burger" in prompt_lower:
                    return [{'generated_text': """
                    Baseado no nosso cardápio, temos estas opções de hambúrgueres:

                    🍔 Iron Man Burger - R$ 12,99
                    Ingredientes: beef patty, cheddar, jalapeños, BBQ sauce, bacon, brioche bun

                    🦇 Batman Dark Burger - R$ 13,50  
                    Ingredientes: black bun, angus beef, gouda, smoked bacon, onion rings

                    💪 Invincible Double Stack - R$ 14,50
                    Ingredientes: double beef patties, swiss cheese, lettuce, tomato, spicy mayo

                    Todos estão disponíveis! Qual te interessa mais?
                    """}]
                
                elif "wrap" in prompt_lower:
                    return [{'generated_text': """
                    🥙 Temos estas opções de wraps:

                    Hulk Smash Wrap - R$ 9,25
                    Flash Chicken Wrap - R$ 8,75  
                    Omni-Man Wrap - R$ 9,95

                    Todos disponíveis e deliciosos!
                    """}]
                
                elif "preço" in prompt_lower or "quanto custa" in prompt_lower:
                    return [{'generated_text': """
                    Posso ajudar com preços! Temos opções como:

                    • Hambúrgueres: R$ 12,99 - R$ 14,50
                    • Wraps: R$ 8,75 - R$ 9,95
                    • Acompanhamentos: R$ 4,99 - R$ 5,50
                    • Sobremesas: R$ 6,25 - R$ 7,50

                    De qual item específico você quer saber o preço?
                    """}]
                
                else:
                    return [{'generated_text': f"""
                    Olá! Sou o assistente da My Gastronomy. 

                    Posso ajudar com:
                    • Cardápio completo e preços
                    • Ingredientes dos pratos  
                    • Horários de funcionamento
                    • Informações de contato
                    • Promoções especiais

                    No que posso ajudar?
                    
            Serviços:
            - Reservas online e telefone
            - Eventos corporativos
            - Reuniões familiares
            
            Contato:
            - Telefone: (11) 99999-9999
            - Email: reservas@mygastronomy.com
            - Endereço: Av. Paulista, 1000 - São Paulo
                    """}]
        
        return FallbackLLM()
        

        
        # Criar arquivo de exemplo
        sample_file = os.path.join(data_path, "informacoes_restaurante.txt")
        with open(sample_file, 'w', encoding='utf-8') as f:
            f.write(sample_content)
        print(f"✅ Arquivo de exemplo criado: {sample_file}")
    
    def ask_question(self, question):
        if not self.vector_store:
            return "Sistema ainda não está pronto. Por favor, adicione documentos na pasta 'data/' e reinicie o servidor.", []
        
        try:
            # 1. Encontrar documentos relevantes
            relevant_docs = self.vector_store.similarity_search(question, k=2)
            context = "\n".join([doc.page_content for doc in relevant_docs])
            
            # 2. Criar prompt inteligente
            prompt = f"""
            Você é um assistente especializado do restaurante My Gastronomy que responde baseado no contexto fornecido.

            CONTEXTO:
            {context}

            PERGUNTA: {question}

            RESPOSTA (seja direto, útil e amigável):
            """
            
            # 3. Gerar resposta
            response = self.llm(
                prompt,
                max_new_tokens=200,
                do_sample=True,
                temperature=0.3,
                truncation=True
            )
            
            # Extrair apenas a resposta
            full_response = response[0]['generated_text']
            answer = full_response.split("RESPOSTA:")[-1].strip()
            
            return answer, [
                doc.metadata.get('source', 'Documento') for doc in relevant_docs
            ]
            
        except Exception as e:
            print(f"❌ Erro ao processar pergunta: {e}")
            return "Desculpe, estou tendo dificuldades para processar sua pergunta no momento. Por favor, tente novamente.", []