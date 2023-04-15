import pymongo
import bson
import ssl
import re

from singleton import Singleton

class SpiceDBHandler(Singleton):
    CONNECTION_STRING = "mongodb+srv://admin:12345@cluster0-b5swb.mongodb.net/test?retryWrites=true&w=majority"
    DB_NAME = "DB1"
    COLLECTION_NAME = "Spice"

    def __init__(self):
        self.client = pymongo.MongoClient(SpiceDBHandler.CONNECTION_STRING, ssl=True, ssl_cert_reqs=ssl.CERT_NONE)

    def __get_collection(self):
        return self.client[SpiceDBHandler.DB_NAME][SpiceDBHandler.COLLECTION_NAME]

    def get_spices(self, label = "", _type = [], printed = [], to_print = [], owner = "Denis", epices_de_cru = -1, offset = 0, limit = 0):
        query = {}
        if len(printed) > 0:
            query["printed"] = {"$in": printed}
        if len(_type) > 0:
            query["type"] = {"$in": _type}
        if len(to_print) > 0:
            print(to_print)
            query["to_print"] = {"$in": to_print}
        if label != "":
            query["label"] = {"$regex": "{}".format(label), "$options": "i"}
        query["owner"] = owner
        if epices_de_cru != -1:
            query["epices_de_cru"] = epices_de_cru
        
        docs = self.__get_collection().find(query, {"img": 0}).skip(offset).limit(limit)

        parsed_docs = []
        for doc in docs:
            parsed_doc = doc
            parsed_doc["_id"] = str(doc["_id"])
            parsed_docs.append(parsed_doc)

        return parsed_docs

    def get_spice_count(self, label = "", _type = [], printed = [], to_print = [], owner = "Denis", epices_de_cru = -1):
        query = {}
        if len(printed) > 0:
            query["printed"] = {"$in": printed}
        if len(to_print) > 0:
            query["to_print"] = {"$in": to_print}
        if len(_type) > 0:
            query["type"] = {"$in": _type}
        if label != "":
            query["label"] = {"$regex": "{}".format(label), "$options": "i"}
        query["owner"] = owner
        if epices_de_cru != -1:
            query["epices_de_cru"] = epices_de_cru

        return self.__get_collection().count(query)

    def add_spice(self, spice, image):
        self.__get_collection().insert_one({
            'label': spice['label'],
            'type': spice['type'],
            'img': image,
            'printed': spice['printed'],
            'to_print': spice['to_print'],
            'owner': spice['owner'],
            'epices_de_cru': spice['epices_de_cru'],
            'expiration_date': spice['expiration_date'],
            'spicy_level': spice['spicy_level'],
        })

    def get_spices_by_type(self, type):
        return [doc for doc in self.__get_collection().find({'type': type}, {'_id': 0})]

    def update_spice(self, _id, newValues):
        self.__get_collection().update_one({'_id': bson.ObjectId(_id)}, {'$set': newValues})

    def add_printed_to_spice(self, _id, template_name):
        self.__get_collection().update_one({'_id': bson.ObjectId(_id)}, {'$push': {"printed": template_name}})

    def set_spice_image(self, _id, path):
        self.__get_collection().update_one({'_id': bson.ObjectId(_id)}, {'$set': {'img': path}})

    def get_spice_image(self, _id):
        doc = self.__get_collection().find_one({'_id': bson.ObjectId(_id)}, {'_id': 0, 'img': 1})
        if doc != None and 'img' in doc:
            return doc['img']
        return ''

    def delete_spice(self, _id):
        self.__get_collection().delete_one({'_id': bson.ObjectId(_id)}).deleted_count

    def delete_all(self):
        self.__get_collection().delete_many({})

    def update_all(self, update):
        self.__get_collection().update_many({}, {"$set": update})
