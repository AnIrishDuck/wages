let counties = document.getElementById('county-group')
counties = Array.from(counties.children)

let states = {}
let state = (el) => el.id.split(', ')[1]

fetch('./all.json').then((response) => {
    return response.json()
}).then((data) => {
    let stride = 1
    let starts = [null].concat(_.range(13, 20, stride))
    let ends = _.range(13, 20, stride).concat([null])
    let bins = _.zip(starts, ends).map((a) => ({ start: a[0], end: a[1] }))
    let inBin = (bin) => (n) =>
        (!_.isNil(n)) && (n >= (bin.start || 0) && n < (bin.end || 100))

    let colorCount = bins.length - 2
    let gradient = (ix) => Math.floor(ix / colorCount * 255)
    let colorRange = _.range(colorCount).map((ix) => (
        'rgb(' + (255 - gradient(ix)) + ', 255, 0)'
    ))
    let colors = ['rgb(255, 196, 0)']
                 .concat(colorRange)
                 .concat(['rgb(0, 255, 255)'])

    let color = (amount) => _.zip(bins, colors)
                             .filter((pair) => inBin(pair[0])(amount))
                             .map((pair) => pair[1])[0] || '#f0f'

    let amounts = []
    counties.forEach((child) => {
        let county = data.counties.filter(
            (d) => d.county.replace(' County', '') + ', ' + d.state == child.id
        )

        let fill = (stateStyle, countyStyle) => {
            child.style = countyStyle || stateStyle
        }

        let name = () => document.getElementById('county-name')
        let median = () => document.getElementById('median')

        let wage = _.get(county, '0.wage')
        if (!_.isNil(wage)) { amounts.push(wage) }
        let base = 'fill: ' + color(wage)

        if (county.length === 0) {
            console.log(child.id)
            base = 'fill: #fff'
        }

        child.style = base
        child.onmouseover = () => {
            child.style.strokeWidth = 2
            const _p = child.parentElement
            _p.removeChild(child)
            _p.appendChild(child)
            name().innerHTML = child.id
            const wageText = () => {
                if (_.isNil(wage)) {
                    return 'No Data'
                } else {
                    return 'Median Wage: ' + _.trim(wage)
                }
            }
            median().innerHTML = wageText()
        }

        child.onclick = () => {
            console.log(county, child.id, data.counties.slice(0, 5))
        }

        child.onmouseout = () => {
            fill(base)
            child.style.strokeWidth = 0.178287
            name().innerHTML = ''
        }
    })

    let counts = bins.map((bin) =>
        amounts.filter(inBin(bin)).length
    )
    let chart = SVG('histo-chart')
    let bars = _.zip(bins, colors, counts).forEach((pair, ix) => {
        let bin = pair[0]
        let color = pair[1]
        let count = pair[2]
        console.log(bin, color, count, ix)
        let label = () => {
            let start = bin.start
            let end = bin.end
            let fmt = (v) => v.toFixed(2)
            if (start === null) {
                return '< ' + fmt(end)
            } else if (end === null) {
                return '> ' + fmt(start)
            } else {
                return start.toFixed(2) + ' - ' + (end - 0.01).toFixed(2)
            }
        }
        chart
            .rect(200 * (count / _.max(counts)), 15)
            .fill(color)
            .move(120, 20 + (ix * 17))

        chart
            .text(label())
            .move(0, 20 + (ix * 17))
    })

})

let countyScale = 0.56117729
let original = { width: 552.9319458007812, height: 349.8168640136719 }
let scale = (v) => 'matrix(' + v + ',0,0,' + v + ',0,0)'
let resize = () => {
    let w = window.innerWidth
    let h = window.innerHeight - 20

    let amount = h / original.height
    let transform = (id, value) =>
        document.getElementById(id).setAttribute('transform', value)

    transform('county-group', scale(countyScale * amount))
    transform('state-line-g', scale(amount))
}

resize()
