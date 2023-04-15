class Singleton:

    @classmethod
    def get_instance(cls: type):
        try:
            return cls.__get_instance()
        except AttributeError:
            cls.__instance = None
            return cls.__get_instance()

    @classmethod
    def __get_instance(cls: type):
        if (cls.__instance == None):
            cls.__instance = cls()
        return cls.__instance
