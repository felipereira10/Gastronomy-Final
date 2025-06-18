from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, EmailStr
import os
import smtplib
from email.mime.text import MIMEText
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

SMTP_EMAIL = os.getenv("SMTP_EMAIL")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")

app = FastAPI()

# Libera acesso ao frontend (localhost)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class EmailRequest(BaseModel):
    remetente_visual: EmailStr
    destinatarios: list[EmailStr]
    assunto: str
    corpo: str

@app.post("/enviar")
def enviar_email(req: EmailRequest):
    try:
        smtp_host = "smtp.gmail.com"
        smtp_port = 587
        server = smtplib.SMTP(smtp_host, smtp_port)
        server.starttls()
        server.login(SMTP_EMAIL, SMTP_PASSWORD)

        for destinatario in req.destinatarios:
            msg = MIMEText(req.corpo, 'plain')
            msg['From'] = req.remetente_visual
            msg['To'] = destinatario
            msg['Subject'] = req.assunto
            server.sendmail(SMTP_EMAIL, destinatario, msg.as_string())

        server.quit()
        return {"status": "sucesso", "mensagem": "E-mails enviados."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
