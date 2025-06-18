import os
import datetime
import requests
from tkinter import Tk, Button, Label, messagebox, ttk
from pymongo import MongoClient
from bson.json_util import dumps
from dotenv import load_dotenv

load_dotenv()

def conectar_mongodb():
    client = MongoClient(os.getenv("MONGO_CS"))
    db = client[os.getenv("MONGO_DB_NAME")]
    return db["users"]


def backup_emails(users_list):
    if not os.path.exists("backups"):
        os.makedirs("backups")

    timestamp = datetime.datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
    filepath = os.path.join("backups", f"backup_{timestamp}.json")

    try:
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(dumps(users_list, indent=4)) 
        print(f"[Backup] Arquivo salvo em: {filepath}")
    except Exception as e:
        print(f"[Backup] Falha ao criar backup: {e}")


def enviar_emails():
    remetente_visual = os.getenv("REMETENTE_PADRAO") or "notificacoes@sistema.com"
    users_list = list(users.find())
    destinatarios = [u.get("email") for u in users_list if "email" in u]

    if not destinatarios:
        messagebox.showwarning("Erro", "Nenhum e-mail encontrado.")
        return

    backup_emails(users_list) 

    assunto = "Notificação de Possível Invasão"
    corpo = (
        "Prezado usuário,\n\n"
        "Foi detectada uma possível invasão em nosso sistema. Estamos analisando o ocorrido "
        "e tomando as medidas necessárias.\n\n"
        "Equipe de Segurança."
    )

    status_label.config(text="Enviando...", fg="blue")
    progress_bar.start()

    try:
        res = requests.post("http://localhost:8000/enviar", json={
            "remetente_visual": remetente_visual,
            "destinatarios": destinatarios,
            "assunto": assunto,
            "corpo": corpo
        })
        if res.status_code == 200:
            status_label.config(text="E-mails enviados!", fg="green")
        else:
            status_label.config(text="Erro ao enviar.", fg="red")
            print("Detalhe:", res.text)
    except Exception as e:
        status_label.config(text="Falha na requisição.", fg="red")
        print(e)
    finally:
        progress_bar.stop()


root = Tk()
root.title("Notificação de Invasão")
root.geometry("400x300")
root.resizable(False, False)

frame = ttk.Frame(root, padding="20")
frame.place(relx=0.5, rely=0.5, anchor="center")

Label(frame, text="Envio de Notificação", font=("Arial", 16, "bold")).pack(pady=10)

Button(
    frame, text="Aviso de Privacidade",
    command=lambda: messagebox.showinfo("Aviso", "Usamos seus dados apenas para notificações."),
    width=25, height=2, bg="#FFC107", fg="black", font=("Arial", 10, "bold")
).pack(pady=10)

Button(
    frame, text="Enviar E-mails", command=enviar_emails,
    width=25, height=2, bg="#4CAF50", fg="white", font=("Arial", 12, "bold")
).pack(pady=10)

status_label = Label(frame, text="Pronto para enviar.", font=("Arial", 10))
status_label.pack(pady=10)

progress_bar = ttk.Progressbar(frame, orient="horizontal", length=200, mode="indeterminate")
progress_bar.pack(pady=10)

users = conectar_mongodb()
root.mainloop()

