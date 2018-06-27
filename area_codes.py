import json
from series import Series

area = Series('data/oe.area')
codes = area.index('area_code', 'area_name')

json.dump(codes, open('areas.json', 'w'))
