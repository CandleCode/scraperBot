const { ChartJSNodeCanvas } = require('chartjs-node-canvas');


const drawChartCanvas = async (emojiList) => {
	const countArray = emojiList.map((emoji) => {
		return emoji.count;
	});
	console.log(countArray);

	const configuration = {
		type: 'bar',
		data: {
			labels: ['', '', '', '', '', '', ''],
			datasets: [{
				axis: 'y',
				label: 'My First Dataset',
				data: countArray,
				backgroundColor:'#5865f2',
				fill:false,
				borderWidth: 1,
				barThickness: 30,
			}],
		},
		options: {
			indexAxis: 'y',
			scales: {
				xAxis: {
					grid: {
						color:'#ffffff',
					},
				},
				yAxis: {
					grid: {
						color:'#ffffff',
					},
				},
			},
			plugins: {
				legend: { display: false },
				datalabels: {
					color: '#ffffff',
				},
			},
		},
	};
	const smallChartJSNodeCanvas = new ChartJSNodeCanvas({
		width: 400,
		height: 400,
		plugins: {
			modern: ['chartjs-plugin-datalabels'],
		},
	});
	return await smallChartJSNodeCanvas.renderToBuffer(configuration);
};

module.exports = {
	drawChartCanvas,
};
