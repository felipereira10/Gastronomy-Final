import os
import requests
from tkinter import Tk, Button, Entry, Label, Toplevel, messagebox, ttk, Text, Scrollbar, END
from pymongo import MongoClient
from dotenv import load_dotenv
from bson import json_util
import json
from datetime import datetime

load_dotenv()

def conectar_mongodb():
    client = MongoClient(os.getenv("MONGO_CS"))
    db = client[os.getenv("MONGO_DB_NAME")]
    return db["users"]

def mostrar_tela_envio():
    envio_window = Toplevel(root)
    envio_window.title("Envio de Notificações")
    envio_window.geometry("500x500")

    assunto_label = Label(envio_window, text="Assunto:", font=("Arial", 10))
    assunto_label.pack(pady=5)
    assunto_entry = Entry(envio_window, font=("Arial", 10), width=50)
    assunto_entry.pack(pady=5)

    corpo_label = Label(envio_window, text="Corpo do E-mail:", font=("Arial", 10))
    corpo_label.pack(pady=5)
    corpo_text = Text(envio_window, wrap="word", font=("Arial", 10), width=60, height=10)
    corpo_text.pack(pady=5)

    def confirmar_envio():
        assunto = assunto_entry.get().strip()
        corpo = corpo_text.get("1.0", END).strip()

        if not assunto or not corpo:
            messagebox.showwarning("Atenção", "Preencha o assunto e o corpo do e-mail.")
            return

        usuarios_lista = users.find()
        destinatarios = [u["email"] for u in usuarios_lista if "email" in u]

        if not destinatarios:
            messagebox.showwarning("Erro", "Nenhum e-mail encontrado.")
            return

        status_label.config(text="Enviando...", fg="blue")
        progress_bar.start()

        try:
            res = requests.post("http://localhost:8000/enviar", json={
                "remetente_visual": os.getenv("REMETENTE_PADRAO", "no-reply@notificador.com"),
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
            envio_window.destroy()

    confirmar_btn = Button(envio_window, text="Enviar", command=confirmar_envio, font=("Arial", 12, "bold"), bg="#4CAF50", fg="white")
    confirmar_btn.pack(pady=15)

def restaurar_backup():
    try:
        caminho_backup = os.path.join("backups", "backup_usuarios.json")
        if not os.path.exists(caminho_backup):
            raise FileNotFoundError("Arquivo de backup não encontrado na pasta 'backups'.")

        with open(caminho_backup, "r") as f:
            dados = json_util.loads(f.read())

        if isinstance(dados, list):
            for doc in dados:
                filtro = {"email": doc.get("email")}
                doc.pop("_id", None) 
                users.replace_one(filtro, doc, upsert=True)
        else:
            filtro = {"email": dados.get("email")}
            dados.pop("_id", None)
            users.replace_one(filtro, dados, upsert=True)

        messagebox.showinfo("Sucesso", "Backup restaurado com sucesso!")
    except Exception as e:
        print("[Backup] Falha ao restaurar:", e)
        messagebox.showerror("Erro", f"Falha ao restaurar backup:\n{e}")


# UI principal
root = Tk()
root.title("Notificação de Invasão")
root.geometry("400x350")
root.resizable(False, False)

frame = ttk.Frame(root, padding="20")
frame.place(relx=0.5, rely=0.5, anchor="center")

Label(frame, text="Envio de Notificação", font=("Arial", 16, "bold"), anchor="center").grid(row=0, column=0, columnspan=2, pady=10)

Button(
    frame, text="Enviar E-mails", command=mostrar_tela_envio,
    width=20, height=2, bg="#4CAF50", fg="white", font=("Arial", 12, "bold")
).grid(row=1, column=0, columnspan=2, pady=10)

Button(
    frame, text="Restaurar Backup", command=restaurar_backup,
    width=20, height=2, bg="#2196F3", fg="white", font=("Arial", 12, "bold")
).grid(row=2, column=0, columnspan=2, pady=10)

status_label = Label(frame, text="Pronto para enviar.", font=("Arial", 10))
status_label.grid(row=3, column=0, columnspan=2, pady=10)

progress_bar = ttk.Progressbar(frame, orient="horizontal", length=200, mode="indeterminate")
progress_bar.grid(row=4, column=0, columnspan=2, pady=10)

users = conectar_mongodb()
root.mainloop()