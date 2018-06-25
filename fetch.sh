mkdir -p data
get () {
    wget https://download.bls.gov/pub/time.series/oe/$1
    mv $1 data
}
get oe.area
get oe.data.0.Current
get oe.series
