import pymongo
import bson
import ssl
import re

from singleton import Singleton

class TemplateDBHandler(Singleton):
    CONNECTION_STRING = "mongodb+srv://admin:12345@cluster0-b5swb.mongodb.net/test?retryWrites=true&w=majority"
    DB_NAME = "DB1"
    COLLECTION_NAME = "Template"

    def __init__(self):
        self.client = pymongo.MongoClient(TemplateDBHandler.CONNECTION_STRING, ssl=True, ssl_cert_reqs=ssl.CERT_NONE)

    def __get_collection(self):
        return self.client[TemplateDBHandler.DB_NAME][TemplateDBHandler.COLLECTION_NAME]
    
    def get_templates(self):
        docs = self.__get_collection().find({})
        parsed_docs = []
        for doc in docs:
            parsed_doc = doc
            parsed_doc["_id"] = str(doc["_id"])
            parsed_docs.append(parsed_doc)

        return parsed_docs
    
    def add_template(self, params):
        self.__get_collection().insert_one(params)

    def update_template(self, _id, params):
        self.__get_collection().update_one({"_id": bson.ObjectId(_id)}, {"$set": params})

    def get_template(self, _id):
        self.__get_collection().find_one({"_id": bson.ObjectId(_id)})

    def delete_template(self, _id):
        self.__get_collection().delete_one({"_id": bson.ObjectId(_id)})
        
    def update_all(self, params):
        self.__get_collection().update_many({}, {"$set": params})