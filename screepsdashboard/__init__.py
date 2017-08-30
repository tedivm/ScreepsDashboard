from flask import Flask
from screepsdashboard.config import settings

app = Flask(__name__)
app.config.update(settings)
