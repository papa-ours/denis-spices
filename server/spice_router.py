from flask import request, jsonify, send_file
from spice_db_handler import SpiceDBHandler
from image_finder import ImageFinder

class SpiceRouter:
    @staticmethod
    def add_routes(app):
        @app.route("/api/spice/new", methods = ["POST"])
        def new_spice():
            SpiceDBHandler.get_instance().add_spice(request.json["spice"], request.json["image_url"])
            return ""

        @app.route("/api/spice/update", methods = ["PUT"])
        def update_spice():
            updated = { 
                "label": request.json["label"],
                "type": request.json["type"],
            }

            fields = ["printed", "spicy_level", "expiration_date", "to_print", "epices_de_cru"]
            for field in fields:
                if field in request.json:
                    updated[field] = request.json[field]
                    
            if request.json["image"] != "":
                updated["img"] = request.json["image"]
            SpiceDBHandler.get_instance().update_spice(request.json["_id"], updated)
            return ""

        @app.route("/api/spice/printed/update", methods = ["PUT"])
        def add_printed_to_spice():
            SpiceDBHandler.get_instance().add_printed_to_spice(request.json["_id"], request.json["template_name"])
            return ""

        @app.route("/api/spice/delete/<string:label>", methods = ["DELETE"])
        def delete_spice(label):
            SpiceDBHandler.get_instance().delete_spice(label)
            return ""

        @app.route("/api/spice/count", methods = ["GET"])
        def get_spice_count():
            args = request.args.to_dict()
            label = args["label"] if "label" in args else ""
            _type = []
            _printed = []
            _to_print = []
            if "type" in args and args["type"] != "":
                _type = [int(val) for val in args["type"].split(",")]
            if "to_print" in args and args["to_print"] != "":
                _to_print = [str(val) for val in args["to_print"].split(",")]
            if "printed" in args and args["printed"] != "":
                _printed = [str(val) for val in args["printed"].split(",")]
            owner = str(args["owner"]) if "owner" in args else "Denis"
            epices_de_cru = int(args["epices_de_cru"]) if "epices_de_cru" in args else -1

            return jsonify(SpiceDBHandler.get_instance().get_spice_count(label, _type, _printed, _to_print, owner, epices_de_cru))

        @app.route("/api/spice", methods = ["GET"])
        def get_all_spices():
            args = request.args.to_dict()
            label = args["label"] if "label" in args else ""
            _type = []
            _to_print = []
            _printed = []
            if "printed" in args and args["printed"] != "":
                _printed = [str(val) for val in args["printed"].split(",")]
            if "type" in args and args["type"] != "":
                _type = [int(val) for val in args["type"].split(",")]
            if "to_print" in args and args["to_print"] != "":
                _to_print = [str(val) for val in args["to_print"].split(",")]
            offset = int(args["offset"]) if "offset" in args else 0
            limit = int(args["limit"]) if "limit" in args else 0
            owner = str(args["owner"]) if "owner" in args else "Denis"
            epices_de_cru = int(args["epices_de_cru"]) if "epices_de_cru" in args else -1
            
            return jsonify(SpiceDBHandler.get_instance().get_spices(label, _type, _printed, _to_print, owner, epices_de_cru, offset, limit))

        @app.route("/api/spice/type/<int:type>")
        def get_spices_by_type(type):
            return jsonify(SpiceDBHandler.get_instance().get_spices_by_type(type))

        @app.route("/api/spice/image/<string:_id>")
        def get_spice_image(_id):
            return jsonify({
                'url': ImageFinder.get_image_path(_id),
            })

        @app.route("/api/spice/images/<string:label>")
        def get_spice_image_suggestions(label):
            return jsonify(ImageFinder.get_images(label))

        @app.route("/api/spice/image/content/<string:_id>")
        def get_spice_image_content(_id):
            if _id == '-1':
                return send_file("assets/mock.png", mimetype="image/png")

            filename, image_type = ImageFinder.create_image_file(_id)
            if filename == "": 
                return ""
            return send_file(filename, mimetype=image_type)

        @app.route("/api/mask")
        def get_mask_image():
            return send_file("assets/mask.png", mimetype="image/png")