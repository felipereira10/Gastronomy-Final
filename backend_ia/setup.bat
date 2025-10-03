@echo off
echo Criando ambiente virtual...
python -m venv venv

echo Ativando venv...
call venv\Scripts\activate.bat

echo Instalando dependências...
pip install -r requirements.txt

echo Configuração completa!
echo Para ativar: venv\Scripts\activate.bat
pause