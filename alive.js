let counties = document.getElementById('county-group')
counties = Array.from(counties.children)

let states = {}
let state = (el) => el.id.split(', ')[1]
counties.forEach((child) => {
    let fill = (stateStyle, countyStyle) => {
        counties.filter((c) => state(c) === state(child)).forEach((sibling) => {
            sibling.style = stateStyle
        })
        child.style = countyStyle || stateStyle
    }

    child.onmouseover = () => {
        fill('fill: #88c', 'fill: #00c')
    }

    child.onmouseout = () => {
        fill('fill: #d0d0d0')
    }
})

