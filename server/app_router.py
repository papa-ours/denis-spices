from flask import request, jsonify, send_from_directory, render_template

class AppRouter:
    @staticmethod
    def add_routes(app):
        @app.route("/static/<path:path>")
        def get_static(path):
            print(path)
            return render_template("index.html")
        
        @app.route("/")
        def get_app():
            return render_template("index.html")
