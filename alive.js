let counties = document.getElementById('county-group')
counties = Array.from(counties.children)

let states = {}
let state = (el) => el.id.split(', ')[1]

let gradient = (start, end) => (x) => {
    let premix = (k) => Math.floor(start[k] + (x * (end[k] - start[k])))
    let mix = (k) => _.clamp(premix(k), 0, 255)
    return 'rgb(' + [mix('r'), mix('g'), mix('b')].join(', ') + ')'
}

let absoluteColors = ({ bins, min, max }) => {
    let colorCount = bins.length - 2
    let gradient = (ix) => Math.floor(ix / colorCount * 255)
    let colorRange = _.range(colorCount).map((ix) => (
        'rgb(' + (255 - gradient(ix)) + ', 255, 0)'
    ))
    return ['rgb(255, 196, 0)']
            .concat(colorRange)
            .concat(['rgb(0, 255, 255)'])
}

let lossGradient = gradient(
    { r: 255, g: 230, b: 230 },
    { r: 255, g: 32, b: 32 }
)
let gainGradient = gradient(
    { r: 230, g: 255, b: 230 },
    { r: 32, g: 255, b: 32 }
)
let diffColors = ({ bins, min, max }) => {
    return bins.map((bin) => {
        let start = _.defaultTo(bin.start, min)
        let end = _.defaultTo(bin.end, max)
        if (start < 0) {
            let b = Math.min(0, max)
            return lossGradient((start - b) / (min - b))
        } else {
            let a = Math.max(0, min)
            return gainGradient((end - a) / (max - a))
        }
    })
}

let inequalityGradient = gradient(
    { r: 255, g: 192, b: 128 },
    { r: 255, g: 128, b: 32 }
)
let inequalityColors = ({ bins, min, max }) => {
    return bins.map((bin) => {
        let start = _.defaultTo(bin.start, min)
        let end = _.defaultTo(bin.end, max)
        let midpoint = (start + end) / 2
        return inequalityGradient((midpoint - min) / (max - min))
    })
}

let charts = {
    current: {
        min: 13,
        max: 20,
        coloring: absoluteColors,
        variable: 'Median Wage',
        f: _.identity
    },
    minWage: {
        min: 8,
        max: 12,
        coloring: absoluteColors,
        variable: 'Min Wage',
        f: (wage, min) => min
    },
    minWageDiff: {
        min: -15,
        max: -6,
        coloring: diffColors,
        variable: 'Min - Median Wage Gap',
        f: (wage, min) => min - wage
    },
    inequality: {
        min: 11,
        max: 16,
        coloring: inequalityColors,
        variable: 'Min - Median Wage Gap',
        f: (wage, min) => wage - min > 10 ? wage - min : null
    },
    damage: {
        min: -3,
        max: 0,
        coloring: diffColors,
        variable: '15 / hr - Median Wage Gap',
        f: (wage) => wage < 15 ? wage - 15 : null
    },
    minToHalf: {
        min: 0,
        max: 4,
        coloring: diffColors,
        variable: 'Wage Increase',
        f: (wage, min) => (wage * 0.5) > min ? (wage * 0.5) - min : null
    },
    half: {
        min: 7,
        max: 13,
        coloring: absoluteColors,
        variable: 'New Minimum Wage',
        f: (wage, min) => Math.max(wage * 0.5, min)
    },
    noChange: {
        min: 7,
        max: 8,
        coloring: ({ bins }) => bins.map(_.constant('rgb(128, 128, 128)')),
        variable: 'Same Minimum Wage',
        f: (wage, min) => (wage * 0.5) > min ? null : min
    },
    diff15: {
        min: -2,
        max: 5,
        coloring: diffColors,
        variable: 'Wage Difference',
        f: (wage) => wage - 15
    }
}

let config = charts.current

let stateMins = {
    ME: 10.00,
    VT: 10.50,
    MA: 11.00,
    RI: 10.10,
    CT: 10.10,
    DE: 8.25,
    DC: 12.50,
    MD: 9.25,
    NJ: 8.60,
    NY: 10.40,
    MI: 9.25,
    OH: 8.30,
    WV: 8.75,
    IL: 8.25,
    MN: 9.65,
    MO: 7.85,
    AR: 8.50,
    NE: 9.00,
    SD: 8.85,
    CO: 10.20,
    NM: 7.50,
    AZ: 10.50,
    MT: 8.30,
    NV: 8.25,
    WA: 11.50,
    OR: 10.25,
    CA: 11.00,
    HI: 10.10,
    AK: 9.84
}

fetch('./all.json').then((response) => {
    return response.json()
}).then((data) => {
    let stride = 1
    let { coloring, f, min, max, variable } = config
    let starts = [null].concat(_.range(min, max, stride))
    let ends = _.range(min, max, stride).concat([null])
    let bins = _.zip(starts, ends).map((a) => ({ start: a[0], end: a[1] }))
    let alt = (v, d) => v === null ? d : v
    let inBin = (bin) => (n) =>
        (!_.isNil(n)) && (n >= alt(bin.start, -100) && n < alt(bin.end, 100))

    let colors = coloring({ bins, min, max })
    let color = (amount) => _.zip(bins, colors)
                             .filter((pair) => inBin(pair[0])(amount))
                             .map((pair) => pair[1])[0] || '#fff'

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
        if (!_.isNil(wage)) {
            wage = f(parseFloat(wage), _.get(stateMins, county[0].state, 7.25))
            amounts.push(parseFloat(wage))
        }
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
                    return variable + ': ' + wage.toFixed(2)
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
    let pad = 20
    let binStride = 17
    let bars = _.zip(bins, colors, counts).forEach((pair, ix) => {
        let bin = pair[0]
        let color = pair[1]
        let count = pair[2]
        console.log(bin, color, count, ix)
        let label = () => {
            let start = bin.start
            let end = bin.end
            let fmt = (v) => {
                let x = (v < 0 ? -v : v).toFixed(0)
                return v < 0 ? '(' + x + ')' : x
            }
            if (start === null) {
                return '< $' + fmt(end)
            } else if (end === null) {
                return '> ' + fmt(start)
            } else {
                return '$' + fmt(start) + ' - ' + fmt(end)
            }
        }
        chart
            .rect(200 * (count / _.max(counts)), 15)
            .fill(color)
            .stroke('#aaa')
            .move(80, pad + (ix * binStride))

        let labelElement = chart
            .text(label())

        let dx = 80 - 10 - labelElement.length()
        labelElement.move(dx, pad + (ix * binStride))
    })
    document.getElementById('histo-chart')
            .style.height = (bins.length * binStride) + (pad * 2)
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
