// ---- composite chart for Role Created Date VS Role Type
 queue()
        .defer(d3.json, "data/roleDates.json")
        .await(makeGraphs);
    function makeGraphs(error, alonerolesData) {
        var ndx = crossfilter(alonerolesData);
        var parseDate = d3.time.format("%d/%m/%Y").parse;
        alonerolesData.forEach(function(d){
            d.date = parseDate(d.date);
        });
        var date_dim = ndx.dimension(dc.pluck('date'));
        var minDate = date_dim.bottom(1)[0].date;
        var maxDate = date_dim.top(1)[0].date;
        function spend_by_name(name) {
            return function(d) {
                if (d.name === name) {
                    return +d.spend;
                } else {
                    return 0;
                }
            }
        }
        var fcroleByMonth = date_dim.group().reduceSum(spend_by_name('Friendly Call Role'));
        var bfroleByMonth = date_dim.group().reduceSum(spend_by_name('Befriended Role'));
        var scroleByMonth = date_dim.group().reduceSum(spend_by_name('Support Coordination Role'));
        var volroleByMonth = date_dim.group().reduceSum(spend_by_name('Volunteer Role'));
        var bctechroleByMonth = date_dim.group().reduceSum(spend_by_name('BConnect Tech Role'));
         
        var compositeChart = dc.compositeChart('#rolecreateddate');
        compositeChart
            .width(1200)
            .height(300)
            .dimension(date_dim)
            .x(d3.time.scale().domain([minDate, maxDate]))
            .yAxisLabel("Role Types Created")
            // .title(function (d) {
            // return d.value + d.spend_by_name + ' were created.'
            // })
            
            .legend(dc.legend().x(150).y(20).itemHeight(15).gap(10))
            .mouseZoomable(true)
            .renderHorizontalGridLines(true)
            .compose([
                dc.lineChart(compositeChart)
                    .colors('green')
                    .group(fcroleByMonth, 'Friendly Call Role'),
                dc.lineChart(compositeChart)
                    .colors('red')
                    .group(bfroleByMonth, 'Befriended Role'),
                dc.lineChart(compositeChart)
                    .colors('blue')
                    .group(scroleByMonth, 'Support Coordination Role'),
                dc.lineChart(compositeChart)
                    .colors('orange')
                    .group(volroleByMonth, 'Volunteer Role'),
                dc.lineChart(compositeChart)
                    .colors('purple')
                    .group(bctechroleByMonth, 'BConnect Tech Role')
            ])
            .brushOn(false)
            .elasticX(true)
            .render();
        dc.renderAll();
    }




