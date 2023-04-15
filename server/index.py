from flask import Flask
from flask_cors import CORS
import os
from spice_router import SpiceRouter
from template_router import TemplateRouter
from app_router import AppRouter

class App:
    def __init__(self):
        self.app = Flask(__name__)
        CORS(self.app)
        self.app.debug = True
        self.add_routes()
    
    def run(self):
        port = int(os.environ.get('PORT', 80))
        self.app.run(port=port, host='0.0.0.0')

    def add_routes(self):
        SpiceRouter.add_routes(self.app)
        TemplateRouter.add_routes(self.app)
        AppRouter.add_routes(self.app)

def create_app():
    App().run()

if __name__ == '__main__':
    create_app()