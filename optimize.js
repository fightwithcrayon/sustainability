const fs = require('fs');
const path = require('path');
const glob = require('glob');
const sharp = require('sharp');

const CACHE_DIR = './imageCache';
const DB_FILE = './imageLog.json';
const OUT_DIR = './out';

if (!fs.existsSync(CACHE_DIR)){
    fs.mkdirSync(CACHE_DIR);
}

const checkCache = (filePath) => {
	if (!fs.existsSync(CACHE_DIR + filePath)){
		console.log('No cache')
		return false;
	}

	const original = fs.statSync(CACHE_DIR + filePath);
	const current = fs.statSync(OUT_DIR + filePath);
	if (original.size !== current.size) {
		console.log('Filehas changed since cache')
		const [extension, ...filename] = path.basename(filePath).split('.').reverse();
		console.log(filePath, extension, filename)
		const regex = new RegExp(`^${filename}?(_[0-9]*)\.(png|jpg|jpeg|webp)`)
		
		fs.readdirSync(CACHE_DIR + path.dirname(filePath))
			.filter(f => regex.test(f))
			.map(f => fs.unlinkSync(CACHE_DIR + path.dirname(filePath) + '/' + f))

		return false;
	}

	console.log('Have cache')
	return true;
}

const optimizeImage = async ([filePath, sizes], hasValidCache) => {
	const [extension, ...filename] = filePath.split('.').reverse();

	for await (size of sizes) {
		const originalFormatExists = fs.existsSync(`${CACHE_DIR}${filename}_${size}.${extension}`);
		const webpExists = fs.existsSync(`${CACHE_DIR}${filename}_${size}.webp`);

		if (hasValidCache && originalFormatExists && webpExists) {
			console.log('Found all files cached')
			await sharp(`${CACHE_DIR}${filename}_${size}.${extension}`).toFile(`${OUT_DIR}${filename}_${size}.${extension}`)
			await sharp(`${CACHE_DIR}${filename}_${size}.webp`).toFile(`${OUT_DIR}${filename}_${size}.webp`)
			return;
		}

		if (hasValidCache) {
			console.log('Have cache but need to rebuild file')
		}
		fs.mkdirSync(`${CACHE_DIR}${path.dirname(filePath)}`, { recursive: true });

		const original = sharp(OUT_DIR + filePath);
		const resized = original.width > size ? original.resize(size) : original;
		await resized.toFile(`${OUT_DIR}${filename}_${size}.${extension}`);
		await resized.toFile(`${CACHE_DIR}${filename}_${size}.${extension}`);
		await resized.webp().toFile(`${OUT_DIR}${filename}_${size}.webp`);
		await resized.webp().toFile(`${CACHE_DIR}${filename}_${size}.webp`);
	}
}

const process = async () => { 
	const imageIndex = fs.readFileSync(DB_FILE);

	for await (entry of Object.entries(JSON.parse(imageIndex))) {
		const [filePath] = entry;
		if (!filePath.includes('.')) {
			return;
		}
		const hasValidCache = checkCache(filePath);
		await optimizeImage(entry, hasValidCache);

		if (!hasValidCache) {
			const from = OUT_DIR + filePath
			const to = CACHE_DIR + filePath
			fs.copyFileSync(from, to);
		}
	}

	fs.unlinkSync(DB_FILE)
}

process();