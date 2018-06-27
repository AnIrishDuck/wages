class Series(object):
    def __init__(self, path):
        self.data = open(path).readlines()
        header = self.data[0]
        self.headers = dict((t.strip(), ix)
                            for ix, t in enumerate(header.split('\t')))

    def series(self):
        return (line.split('\t') for line in self.data[1:])

    def select(self, keys, where={}):
        def get(line, k): return line[self.headers[k]]

        return [
            dict((k, get(line, k)) for k in keys)
            for line in self.series()
            if all(get(line, k) == v for k, v in where.iteritems())
        ]

    def column(self, key, where={}):
        return [d[key] for d in self.select([key], where)]

    def index(self, key, value, where={}):
        return dict((d[key], d[value]) for d in self.select([key, value], where))
