queue()
    .defer(d3.csv, "data/aloneData.csv")
    .await(makeGraphs);
    
function makeGraphs (error, aloneData) {
    var ndx = crossfilter(aloneData);
    
    show_contactrecordtype_selector(ndx);
    
    
    /* ---------- Role Type conversion to integer -------

    
    
    var rolerecordType = [
        "rolerecordtype",
        //"Support Coordination Role",
        //"befriended role",
        //"Friendly Call Role",
    ];
    
    function role_type_to_integer(roletype) {
        // Convert all hero attributes to integers. Store as a
        // lowercased variable of the same name.
        roletype.forEach(function(rt) {
            aloneData.forEach(function(d) {
                var rt_lower = rt.toLowerCase();
                d[rt_lower] = parseInt(d[rt], 20);
            });
        });
    }

    role_type_to_integer(rolerecordType); */

    
    /* ---------- Gender Percent ---------*/
    display_gender_percent(ndx, 'Male', '#percent-male');
    display_gender_percent(ndx, 'Female', '#percent-female');
    display_gender_percent(ndx, 'Undeclared / Not Specified', '#percent-undeclared');
    display_gender_percent(ndx, 'Unknown', '#percent-unknown');
    
    
    /* ---------- Role Type Percent ---------*/
    display_roletype_percent(ndx, 'Volunteer Role', '#vol_role_percent');
    display_roletype_percent(ndx, 'Support Coordination Role', '#sc_role_percent');
    display_roletype_percent(ndx, 'Befriended Role', '#bf_role_percent');
    display_roletype_percent(ndx, 'Friendly Call Role', '#fc_role_percent');
    display_roletype_percent(ndx, 'Housing Applicant', '#ha_role_percent');
    display_roletype_percent(ndx, 'Clubs and Activities Role', '#sa_role_percent');
    display_roletype_percent(ndx, 'Tenant Role', '#tn_role_percent');
    display_roletype_percent(ndx, 'BConnect Tech Role', '#bc_role_percent');
   
    /* ---------- Gender breakdown graph ---------*/
    show_gender_breakdown(ndx);
    
    /* ---------- CHO breakdown graph ---------*/
    show_cho_breakdown(ndx);
    
    
    /* ---------- Pie Charts -------------*/
    show_genderbystatus_breakdown(ndx);
    show_roletype_breakdown(ndx);
    
    /* ---------- composite Charts -------------*/
   //show_role_created_date(ndx);
    
    
    
    dc.renderAll();
}

// contact record type Selector function 
function show_contactrecordtype_selector(ndx) {
    recordtypedim = ndx.dimension(dc.pluck("Contact Record Type"));
    group = recordtypedim.group();
    
    dc.selectMenu("#contactrecordtype-selector")
        .dimension(recordtypedim)
        .group(group);
}

// ---- Gender Selection & Percent

function display_gender_percent(ndx, gender, element) {
    var genderPercent = ndx.groupAll().reduce(
        // Sum totals for each gender type
        function(p, v) {
            p.total++;
            if (v.Gender === gender) {
                p.gender_count++;
            }
            return p;
        },
        function(p, v) {
            p.total--;
            if (v.Gender === gender) {
                p.gender_count--;
            }
            return p;
        },
        function() {
            return { total: 0, gender_count: 0 };
        }
    );

    dc.numberDisplay(element)
        .formatNumber(d3.format('.0%'))
        .valueAccessor(function(d) {
            if (d.gender_count == 0) {
                return 0;
            }
            else {
                return (d.gender_count / d.total);
            }
        })
        .group(genderPercent);
}


// ---- Role Type Percent Percent
function display_roletype_percent(ndx, role, roletype) {
    var roletypePercent = ndx.groupAll().reduce(
        // Sum totals for each gender type
        function(p, v) {
            p.total++;
            if (v.RoleRecordType === role) {
                p.roletype_count++;
            }
            return p;
        },
        function(p, v) {
            p.total--;
            if (v.RoleRecordType === role) {
                p.roletype_count--;
            }
            return p;
        },
        function() {
            return { total: 0, roletype_count: 0 };
        }
    );

    dc.numberDisplay(roletype)
        .formatNumber(d3.format('.0%'))
        .valueAccessor(function(d) {
            if (d.roletype == 0) {
                return 0;
            }
            else {
                return (d.roletype_count / d.total);
            }
        })
        .group(roletypePercent);
}




// ---- To remove blanks

function remove_blanks(group, value_to_remove) {
    // Filter out specified values from passed group
    return {
        all: function() {
            return group.all().filter(function(d) {
                return d.key !== value_to_remove;
            });
        }
    };
}


// --- percentages for slices


function show_slice_percent(key, endAngle, startAngle) {
    // Return the % of each pie slice as a string to be displayed
    // on the slice itself.
    // To save space, %'s below 9% display only the % and no other text.
    var percent = dc.utils.printSingleValue((endAngle - startAngle) / (2 * Math.PI) * 100);
    if (percent > 9) {
        return key + ' | ' + Math.round(percent) + '%';
    }
    else if (percent > 0) {
        return Math.round(percent) + '%';
    }
}


// ---- Gender Breakdown Function 
function show_gender_breakdown(ndx) {
    var dim = ndx.dimension(dc.pluck("Gender"));
    var group = dim.group();
    var group = remove_blanks(dim.group(), "");
    dc.barChart("#op-gender")
        .width(500)
        .height(300)
        .margins({top: 10, right: 10, bottom: 30, left: 40})
        .useViewBoxResizing(true)
        .dimension(dim)
        .group(group)
        .transitionDuration(800)
        .x(d3.scale.ordinal())
        .xUnits(dc.units.ordinal)
        .xAxisLabel("Gender")
        .yAxis().ticks(10);
        
}

// ---- breakdown by CHO Area Function 
function show_cho_breakdown(ndx) {
    var cho_dim = ndx.dimension(dc.pluck("CHO Area"));
    var group = cho_dim.group();
    var group = remove_blanks(cho_dim.group(), "");
    
    dc.barChart("#cho-area")
        .width(500)
        .height(300)
        .margins({top: 10, right: 10, bottom: 30, left: 40})
        .useViewBoxResizing(true)
        .dimension(cho_dim)
        .group(group)
        .transitionDuration(800)
        .colors('#fff010')
        .x(d3.scale.ordinal())
        .xUnits(dc.units.ordinal)
        .xAxisLabel("CHO Area")
        .yAxis().ticks(15);
        
}


// ---- breakdown by Gender by status Pie Chart 

function show_genderbystatus_breakdown(ndx) {
    var dim = ndx.dimension(dc.pluck("Status"));
    var group = dim.group();
    
    var group = remove_blanks(dim.group(), "");
    var statusColors = d3.scale.ordinal()
        .range(['#2ff502', '#fc1919', '#ffe100']);
        
        dc.pieChart('#statuspie')
                .width(475)
                .radius(350)
                .transitionDuration(1000)
                .dimension(dim)
                .group(group)
                .useViewBoxResizing(true)
                .colors(statusColors)
                .legend(dc.legend().x(350).y(0).itemHeight(12).gap(5))
                .on('pretransition', function(chart) {
                    chart.selectAll('text.pie-slice').text(function(d) {
                    return show_slice_percent(d.data.key, d.endAngle, d.startAngle);
            });
        });
 }



// ---- Role Type Pie Chart
function show_roletype_breakdown(ndx) {
    var dim = ndx.dimension(dc.pluck("RoleRecordType"));
    var group = dim.group();
    
    var group = remove_blanks(dim.group(), "");
    var roletypeColors = d3.scale.ordinal()
        .range(['#029920', '#00396e', '#ffe100', '#15C2B8', '#B815C2']);
        
        dc.pieChart('#roletype')
                .width(475)
                .radius(60)
                .transitionDuration(1000)
                .dimension(dim)
                .group(group)
                .useViewBoxResizing(true)
                .colors(roletypeColors)
                .cap(4)
                .minAngleForLabel(0)
                .drawPaths(true)
                .othersGrouper(false)
                .externalLabels(30)
                .legend(dc.legend().x(350).y(0).itemHeight(12).gap(5))
                .on('pretransition', function(chart) {
                    chart.selectAll('text.pie-slice').text(function(d) {
                    return show_slice_percent(d.data.key, d.endAngle, d.startAngle);
            });
        });
 }

// ---- composite chart for Role Created Date VS Role Type

