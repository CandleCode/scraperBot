class AsyncQueue {
	constructor() {
		this.queue = [];
		this.isBusy = false;
	}
	async enqueue(job) {
		this.queue.push(job);
		await this.nextJob();
	}
	async nextJob() {
		if (this.isBusy) {
			return;
		}
		const next = this.queue.shift();
		if (next) {
			this.isBusy = true;
			await next();
			this.isBusy = false;
			await this.nextJob();
		}
	}
}
const asyncQueue = new AsyncQueue();
module.exports = {
	asyncQueue,
};
