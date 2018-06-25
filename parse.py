import csv, json

counties = open('counties.csv')
counties = [(row[2], row[3], row[7]) for row in csv.reader(counties)][1:]

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

area = Series('data/oe.area')
codes = area.index('area_code', 'area_name')


keys = Series('data/oe.series')
median_hourly = keys.index('area_code', 'series_id', {
    'datatype_code': '08',
    'occupation_code': '000000',
    'industry_code': '000000'
})

values = Series('data/oe.data.0.Current')
values = values.index('series_id', 'value')

agg = []
for state, code, county in counties:
    real_code = code.strip().rjust(7, '0')
    value_id = median_hourly[real_code]
    value = values[value_id]

    agg.append({
        'state': state,
        'msa_code': real_code,
        'county': county,
        'wage': value
    })

print json.dumps({ 'counties': agg })