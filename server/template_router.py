from flask import request, jsonify, send_file
from template_db_handler import TemplateDBHandler
from image_finder import ImageFinder

class TemplateRouter:
    def add_routes(app):
        @app.route("/api/templates", methods = ["GET"])
        def get_templates():
            return jsonify(TemplateDBHandler.get_instance().get_templates())

        @app.route("/api/template/<string:_id>", methods = ["DELETE"])
        def delete_template(_id):
            return jsonify(TemplateDBHandler.get_instance().delete_template(_id))


        @app.route("/api/template", methods = ["POST", "PUT"])
        def add_template():
            _id = request.json.pop("_id")
            if request.method == "POST":
                TemplateDBHandler.get_instance().add_template(request.json)
            else:
                TemplateDBHandler.get_instance().update_template(_id, request.json)
            return ""

