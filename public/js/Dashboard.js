queue()
    .defer(d3.json, "/api/data")
    .await(makeGraphs);

function print_filter(filter){
	var f=eval(filter);
	if (typeof(f.length) != "undefined") {}else{}
	if (typeof(f.top) != "undefined") {f=f.top(Infinity);}else{}
	if (typeof(f.dimension) != "undefined") {f=f.dimension(function(d) { return "";}).top(Infinity);}else{}
	console.log(filter+"("+f.length+") = "+JSON.stringify(f).replace("[","[\n\t").replace(/}\,/g,"},\n\t").replace("]","\n]"));
} 

function makeGraphs(error, apiData) {
	
//Start Transformations
	var dataSet = apiData;
	var dateFormat = d3.time.format("%Y-%m-%d");
	dataSet.forEach(function(d) {
		d.date = dateFormat.parse(d.date);
	});

	//Create a Crossfilter instance
	var ndx = crossfilter(dataSet);

	// Line day chart
	var dateDim = ndx.dimension(function(d) { return d.date; });
	var dateGroup = dateDim.group();
	var dateLineChart = dc.lineChart("#date-line-chart");

	//var minDate = dateDim.bottom(1)[0].date; //min date in database
	//var maxDate = dateDim.top(1)[0].date;
	var minDate = dateFormat.parse("2016-05-15"); //min date in database
	var maxDate = dateFormat.parse("2016-05-23"); //max date in database
	
	
	dateLineChart.height(320)
		.margins({top: 10, right: 40, bottom: 30, left: 50})
		.dimension(dateDim)
		.group(dateGroup)
		.transitionDuration(500)
		.renderHorizontalGridLines(true)
    	.renderVerticalGridLines(true)
    	.renderArea(true)
		.elasticY(true)
		.x(d3.time.scale().domain([minDate, maxDate]))
		.xAxis().ticks(d3.time.day);

	// Composite day chart	
	var dateTikiGroup = dateDim.group().reduceSum(function(d) {
		if (d.website === 'Tiki') {
			return 1;
		} else {
			return 0;
		}
	});
	var dateLazadaGroup = dateDim.group().reduceSum(function(d) {
		if (d.website === 'Lazada') {
			return 1;
		} else {
			return 0;
		}
	});

	var dateCompositeChart = dc.compositeChart("#date-composite-chart");
	var	minDateComposite = new Date();
		minDateComposite.setDate(minDate.getDate() - 1);
	var	maxDateComposite = new Date();
		maxDateComposite.setDate(maxDate.getDate() + 1);
	dateCompositeChart.height(320)
		.margins({top: 10, right: 40, bottom: 30, left: 50})
		.dimension(dateDim)
		.transitionDuration(500)
		.x(d3.time.scale().domain([minDate, maxDate]))
		.xUnits(d3.time.days)
		.elasticY(true)
		.legend(dc.legend().x(70).y(10).itemHeight(13).gap(5))
		.compose([
			dc.barChart(dateCompositeChart)
				.group(dateLazadaGroup, "Lazada")
				.gap(50)
				.ordinalColors(["orange"]),
			dc.barChart(dateCompositeChart)
				.group(dateTikiGroup, "Tiki")
				.gap(50)
				.centerBar(true)
		])
		.xAxis().ticks(d3.time.day);

	// Pie website chart
	var websiteDim = ndx.dimension(function(d) { return d.website; });
	var websiteGroup = websiteDim.group();
	var websitePieChart = dc.pieChart("#website-pie-chart");
	websitePieChart.height(240)
 		.radius(80)
		.innerRadius(30)
		.dimension(websiteDim)
		.group(websiteGroup)
		.transitionDuration(500);

	// Composite category chart
	var categoryDim = ndx.dimension(function(d) {
		var category = d.category
		switch (category) {
			case "Sách": 
			case "English Books":
				return "00.Sách";

			case "Truyền thông, Âm nhạc & Sách":
				return "01.Truyền thông, Âm nhạc & Sách";

			case "Chăm sóc sức khỏe & Làm đẹp":
			case "Làm đẹp - Sức khỏe":
				return "02.Làm đẹp - Sức khỏe";

			case "Các chương trình khuyến mãi":
			case "Khuyến mãi & Dịch vụ":
			case "Khuyến mãi":
				return "03.Khuyến mãi - Dịch vụ";

			case "Máy vi tính & Laptop":
				return "04.Máy vi tính - Laptop";

			case "Máy ảnh & Máy quay phim":
			case "Máy Ảnh - Máy Quay Phim":
				return "05.Máy Ảnh - Máy Quay Phim";

			case "Nhà cửa & Đời sống":
			case "Nhà Cửa - Đời Sống":
				return "06.Nhà Cửa - Đời Sống";

			case "TV, Video, Âm thanh, Game & Thiết bị số":
			case "Thiết Bị Số - Phụ Kiện Số":
			case "Tivi – Thiết bị nghe nhìn":
				return "07.Thiết Bị Số - Phụ Kiện Số";

			case "Điện thoại & Máy tính bảng":
			case "Điện Thoại - Máy Tính Bảng":
				return "08.Điện Thoại - Máy Tính Bảng";

			case "Điện Gia Dụng":
			case "Đồ gia dụng":
				return "09.Điện Gia Dụng";

			case "Bách Hóa Online":
			case "Bách hóa Online":
				return "10.Bách hóa Online";

			case "Thời Trang":
			case "Thời trang & Du lịch":
			case "Đồng hồ, Mắt kính, Trang sức":
			case "Vali, Ba Lô & Túi Du Lịch":
				return "11.Thời Trang";

			case "Mẹ Và Bé":
			case "Đồ Chơi - Thời Trang Phụ Kiện Mẹ Bé":
			case "Trẻ sơ sinh & Trẻ nhỏ":
			case "Đồ chơi & Trò chơi":
				return "12.Đồ chơi - Trẻ nhỏ";

			case "Thể Thao & Dã Ngoại":
			case "Thể thao":
				return "13.Thể thao";

			case "Văn Phòng Phẩm - Quà Tặng":
				return "14.Văn Phòng Phẩm - Quà Tặng";

			case "Ôtô, Xe máy & Thiết bị định vị":
				return "15.Ôtô, Xe máy & Thiết bị định vị";

			case "":
				return "16.Undefined";

			default:
				return category
		}
	});
	var categoryTikiGroup = categoryDim.group().reduceSum(function(d) {
		if (d.website === 'Tiki') {
			return 1;
		} else {
			return 0;
		}
	});
	var categoryLazadaGroup = categoryDim.group().reduceSum(function(d) {
		if (d.website === 'Lazada') {
			return 1;
		} else {
			return 0;
		}
	});
	var categoryTikiRowChart = dc.rowChart("#category-tiki-row-chart");
	categoryTikiRowChart.height(480)
		.margins({top: 10, right: 40, bottom: 30, left: 10})
		.x(d3.scale.linear().domain([0,300000]))
		.dimension(categoryDim)
		.group(categoryTikiGroup)
		.transitionDuration(500)
		.elasticX(true)
		.title(function(d) { return "Products: " + d.value; })
		.label(function(d) {
			return d.key.split(".")[1];
		})
		.xAxis().ticks(7);

	var categoryLazadaRowChart = dc.rowChart("#category-lazada-row-chart");
	categoryLazadaRowChart.height(480)
		.margins({top: 10, right: 40, bottom: 30, left: 10})
		.x(d3.scale.linear().domain([0,300000]))
		.dimension(categoryDim)
		.group(categoryLazadaGroup)
		.transitionDuration(500)
		.elasticX(true)
		.title(function(d) { return "Products: " + d.value; })
		.label(function(d) {
			return d.key.split(".")[1];
		})
		.xAxis().ticks(7);
	
	var all = ndx.groupAll();
	dc.dataCount("#row-selection")
        .dimension(ndx)
        .group(all);

	
	/*var datePosted = ndx.dimension(function(d) { return d.date; });
	var websiteType = ndx.dimension(function(d) { return d.website; });
	var categoryType = ndx.dimension(function(d) { return d.category; });

	var projectsTikiByDate = datePosted.group().reduceSum(function(d) {
		if (d.website === 'Tiki') {
			return 1;
		} else {
			return 0;
		}
	});
	var projectsLazadaByDate = datePosted.group().reduceSum(function(d) {
		if (d.website === 'Lazada') {
			return 1;
		} else {
			return 0;
		}
	});
	//var projectsLazadaByDate = datePosted.group().reduceCount(function(d) { if (d.website == 'Lazada') {return d.website;}});
	print_filter(projectsTikiByDate);
	var projectsByWebsite = websiteType.group();
	var projectsByCategoryType = categoryType.group();

	print_filter(projectsByWebsite);
	print_filter(projectsByCategoryType);

	var dateChart = dc.barChart("#date-chart");
	var websiteChart = dc.pieChart("#funding-chart");
	var categoryTypeChart = dc.rowChart("#resource-chart");

	var minDate = datePosted.bottom(1)[0].date;
	var maxDate = datePosted.top(1)[0].date;


	websiteChart
        .height(220)
        //.width(350)
        .radius(90)
        .innerRadius(40)
        .transitionDuration(1000)
        .dimension(websiteType)
        .group(projectsByWebsite);

    dateChart
		//.width(600)
		.height(320)
		.margins({top: 10, right: 50, bottom: 30, left: 50})
		.dimension(datePosted)
		.group(projectsTikiByDate, "Tiki")
		.stack(projectsLazadaByDate, "Lazada")
	//	.renderArea(true)
		.transitionDuration(500)
		.x(d3.time.scale().domain([minDate, maxDate]))
		.legend(dc.legend().x(0).y(0).itemHeight(13).gap(5))
		.elasticY(true)
		.elasticX(true)
		.renderHorizontalGridLines(true)
    	.renderVerticalGridLines(true)
		.xAxisLabel("Month")
		.gap(1)
		.xAxis().ticks(d3.time.day);

	categoryTypeChart
        //.width(300)
        .height(820)
        .dimension(categoryType)
        .group(projectsByCategoryType)
        .elasticX(true);*/
	

	//Define Dimensions
//	var datePosted = ndx.dimension(function(d) { return d.date_posted; });
/*	var gradeLevel = ndx.dimension(function(d) { return d.grade_level; });
	var resourceType = ndx.dimension(function(d) { return d.resource_type; });
	var fundingStatus = ndx.dimension(function(d) { return d.funding_status; });
	var povertyLevel = ndx.dimension(function(d) { return d.poverty_level; });*/
//	var state = ndx.dimension(function(d) { return d.school_state; });
/*	var totalDonations  = ndx.dimension(function(d) { return d.total_donations; });*/


	//Calculate metrics
//	var projectsByDate = datePosted.group();
/*	var projectsByGrade = gradeLevel.group(); 
	var projectsByResourceType = resourceType.group();
	var projectsByFundingStatus = fundingStatus.group();
	var projectsByPovertyLevel = povertyLevel.group();*/
//	var stateGroup = state.group();

/*	var all = ndx.groupAll();

	//Calculate Groups
	var totalDonationsState = state.group().reduceSum(function(d) {
		return d.total_donations;
	});

	var totalDonationsGrade = gradeLevel.group().reduceSum(function(d) {
		return d.grade_level;
	});

	var totalDonationsFundingStatus = fundingStatus.group().reduceSum(function(d) {
		return d.funding_status;
	});



	var netTotalDonations = ndx.groupAll().reduceSum(function(d) {return d.total_donations;});*/

	//Define threshold values for data
	/*var minDate = datePosted.bottom(1)[0].date_posted;
	var maxDate = datePosted.top(1)[0].date_posted;

console.log(minDate);
console.log(maxDate);

    //Charts
	var dateChart = dc.lineChart("#date-chart");*/
/*	var gradeLevelChart = dc.rowChart("#grade-chart");
	var resourceTypeChart = dc.rowChart("#resource-chart");
	var fundingStatusChart = dc.pieChart("#funding-chart");
	var povertyLevelChart = dc.rowChart("#poverty-chart");
	var totalProjects = dc.numberDisplay("#total-projects");
	var netDonations = dc.numberDisplay("#net-donations");
	var stateDonations = dc.barChart("#state-donations");*/


/*  selectField = dc.selectMenu('#menuselect')
        .dimension(state)
        .group(stateGroup); 
*/
/*       dc.dataCount("#row-selection")
        .dimension(ndx)
        .group(all);


	totalProjects
		.formatNumber(d3.format("d"))
		.valueAccessor(function(d){return d; })
		.group(all);

	netDonations
		.formatNumber(d3.format("d"))
		.valueAccessor(function(d){return d; })
		.group(netTotalDonations)
		.formatNumber(d3.format(".3s"));*/

/*	dateChart
		//.width(600)
		.height(220)
		.margins({top: 10, right: 50, bottom: 30, left: 50})
		.dimension(datePosted)
		.group(projectsByDate)
		.renderArea(true)
		.transitionDuration(500)
		.x(d3.time.scale().domain([minDate, maxDate]))
		.elasticY(true)
		.renderHorizontalGridLines(true)
    	.renderVerticalGridLines(true)
		.xAxisLabel("Year")
		.yAxis().ticks(6);*/

/*	resourceTypeChart
        //.width(300)
        .height(220)
        .dimension(resourceType)
        .group(projectsByResourceType)
        .elasticX(true)
        .xAxis().ticks(5);

	povertyLevelChart
		//.width(300)
		.height(220)
        .dimension(povertyLevel)
        .group(projectsByPovertyLevel)
        .xAxis().ticks(4);

	gradeLevelChart
		//.width(300)
		.height(220)
        .dimension(gradeLevel)
        .group(projectsByGrade)
        .xAxis().ticks(4);

  
          fundingStatusChart
            .height(220)
            //.width(350)
            .radius(90)
            .innerRadius(40)
            .transitionDuration(1000)
            .dimension(fundingStatus)
            .group(projectsByFundingStatus);*/


/*    stateDonations
    	//.width(800)
        .height(220)
        .transitionDuration(1000)
        .dimension(state)
        .group(totalDonationsState)
        .margins({top: 10, right: 50, bottom: 30, left: 50})
        .centerBar(false)
        .gap(5)
        .elasticY(true)
        .x(d3.scale.ordinal().domain(state))
        .xUnits(dc.units.ordinal)
        .renderHorizontalGridLines(true)
        .renderVerticalGridLines(true)
        .ordering(function(d){return d.value;})
        .yAxis().tickFormat(d3.format("s"));*/






    dc.renderAll();

};