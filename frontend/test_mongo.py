import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

def listar_emails():
    try:
        client = MongoClient(os.getenv("MONGO_CS"))
        db = client[os.getenv("MONGO_DB_NAME")]
        usuarios = db["users"]

        usuarios_lista = list(usuarios.find())
        emails = [u.get("email") for u in usuarios_lista if "email" in u]

        if not emails:
            print("Nenhum e-mail encontrado na coleção 'usuarios'.")
        else:
            print("E-mails encontrados:")
            for email in emails:
                print(email)
    except Exception as e:
        print("Erro ao conectar ou buscar dados no MongoDB:", e)

if __name__ == "__main__":
    listar_emails()
