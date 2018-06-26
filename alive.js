let counties = document.getElementById('county-group')
counties = Array.from(counties.children)

let states = {}
let state = (el) => el.id.split(', ')[1]

fetch('./all.json').then((response) => {
    return response.json()
}).then((data) => {
    counties.forEach((child) => {
        let county = data.counties.filter(
            (d) => d.county.replace(' County', '') + ', ' + d.state == child.id
        )

        let fill = (stateStyle, countyStyle) => {
            counties
                .filter((c) => state(c) === state(child))
                .forEach((sibling) => {
                sibling.style = stateStyle
            })
            child.style = countyStyle || stateStyle
        }

        let name = () => document.getElementById('county-name')
        let median = () => document.getElementById('median')

        child.onmouseover = () => {
            fill('fill: #88c', 'fill: #00c')
            name().innerHTML = child.id
            median().innerHTML = (
                'Median Wage: ' + _.trim(_.get(county, '0.wage'))
            )
        }

        child.onclick = () => {
            console.log(county, child.id, data.counties.slice(0, 5))
        }

        child.onmouseout = () => {
            fill('fill: #d0d0d0')
            name().innerHTML = ''
        }
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

