import csv, json, os
from series import Series

counties = open('counties.csv')
counties = [(row[2], row[3], row[7]) for row in csv.reader(counties)][1:]

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

# ' Borough'
# ' Census Area'
# ' town'
# ' Parish'
# ' city'

agg = []
states = {}
for state, code, county in counties:
    real_code = code.strip().rjust(7, '0')
    value_id = median_hourly[real_code]
    value = values[value_id]
    real_county = (county
        .replace(' Borough', '')
        .replace(' Census Area', '')
        .replace(' town', '')
        .replace(' Parish', '')
        .replace(' city', '')
        .replace('DeBaca', 'De Baca')
        .replace('Ste. Genevieve', 'Sainte Genevieve')
        .replace('Lagrange', 'LaGrange')
        .replace('Northwest Somerset', 'Somerset')
        .replace('Kennebunk', 'Kennebec')
        .replace('Northwest Piscataquis unorganized territory', 'Piscataquis')
    )

    entry = {
        'state': state,
        'msa_code': real_code,
        'county': real_county,
        'wage': value
    }

    agg.append(entry)
    prior = states.get(state) or []
    prior.append(entry)
    states[state] = prior

json.dump({ 'counties': agg }, open('all.json', 'w'))
if not os.path.exists('states'):
    os.mkdir('states')
for state, data in states.iteritems():
    json.dump({ 'counties': data }, open('states/' + state + '.json', 'w'))
