import requests
from spice_db_handler import SpiceDBHandler
import os
import glob
import base64
from pathlib import Path

class ImageFinder:
    BASE_URL = 'https://epicesdecru.com/products/epices/'
    IMAGE_URL = 'https://epicesdecru.com//upload/products/'
    EXTENSION = '.jpg'
    SEARCH_URL = 'https://epicesdecru.com/search/results?q='
    
    IMAGE_DIR = os.path.join('assets', 'spices')

    @staticmethod
    def get_guess_functions():
        return [
            lambda label: label.lower().replace(' ', '+'),
        ]

    @staticmethod
    def find_images(url, n = 1):
        response = requests.get(url)
        if response.status_code != 200:
            return ''
        content = str(response.content)
        start = content.find(ImageFinder.IMAGE_URL)
        end = content.find(ImageFinder.EXTENSION, start) + len(ImageFinder.EXTENSION)

        urls = [content[start:end]]
        for i in range(1, n):
            start = content.find(ImageFinder.IMAGE_URL, end)
            end = content.find(ImageFinder.EXTENSION, start) + len(ImageFinder.EXTENSION)
            urls.append(content[start:end])

        # only unique urls
        return list(set(urls))

    @staticmethod
    def get_image_path(_id):
        return SpiceDBHandler.get_instance().get_spice_image(_id)

    @staticmethod
    def get_images(label):
        return ImageFinder.find_images(ImageFinder.SEARCH_URL + ImageFinder.get_guess_functions()[0](label), 7)

    @staticmethod
    def create_folder():
        Path(ImageFinder.IMAGE_DIR).mkdir(parents=True, exist_ok=True)

    @staticmethod
    def create_image_file(_id):
        ImageFinder.create_folder()
        
        prefix = os.path.join(ImageFinder.IMAGE_DIR, _id)
        image_type = 'jpg'
        files = glob.glob(prefix + "*")
        if len(files) == 0:
            source = ImageFinder.get_image_path(_id)
            if source:
                file_content = ''
                if source.startswith("data:image"):
                    image_type = source[(source.find("/") + 1):source.find(";")]
                    file_content = base64.decodestring(bytes(source.replace("data:image/" + image_type + ";base64,", ""), encoding="utf-8"))
                else:
                    response = requests.get(source)
                    if response.status_code == 200:
                        file_content = response.content
                img = open(prefix + "." + image_type, "wb")
                img.write(file_content)
                img.close()
        files = glob.glob(prefix + "*")
        if len(files) == 0:
            return '', ''
        return (files[0], os.path.splitext(files[0])[1].replace(".", ""))
