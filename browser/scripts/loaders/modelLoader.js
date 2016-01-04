(function() {

if (typeof(module) !== 'undefined')
	E2.Loader = require('./loader.js').Loader

function ModelLoader(url) {
	E2.Loader.apply(this, arguments)

	var extname = url.substring(url.lastIndexOf('.'))
	switch(extname) {
		case '.obj':
			this.loadObj(url)
			break;
		case '.js':
		case '.json':
			this.loadJson(url)
			break;
		default:
			msg('ERROR: Don`t know how to load', url, extname)
			break;
	}
}

ModelLoader.prototype = Object.create(E2.Loader.prototype)

ModelLoader.prototype.loadJson = function(url) {
	var loader = new THREE.JSONLoader()
	loader.crossOrigin = 'Anonymous'
	loader.load(url,
		this.onJsonLoaded.bind(this),
		this.progressHandler.bind(this),
		this.errorHandler.bind(this)
	)
}

ModelLoader.prototype.loadObj = function(url) {
	var that = this
	var mtlUrl = url.replace('.obj', '.mtl')

	$.get('/stat' + mtlUrl, function(data) {
		var loader

		if (data.error === undefined) {
			// .mtl exists on server, load .obj and .mtl
			loader = new THREE.OBJMTLLoader()
			loader.crossOrigin = 'Anonymous'
			loader.load(url,
				mtlUrl,
				that.onObjLoaded.bind(that),
				that.progressHandler.bind(that),
				that.errorHandler.bind(that))
		}
		else {
			// no .mtl on server, load .obj only
			loader = new THREE.OBJLoader()
			loader.crossOrigin = 'Anonymous'
			loader.load(url,
				that.onObjLoaded.bind(that),
				that.progressHandler.bind(that),
				that.errorHandler.bind(that))
		}
	})
}
	
ModelLoader.prototype.onObjLoaded = function(geoms, mats) {
	this.emit('loaded', {
		geometries: geoms,
		materials: mats
	})
}
	
ModelLoader.prototype.onJsonLoaded = function(geoms, mats) {
	return this.onObjLoaded([geoms], mats)
}

E2.Loaders.ModelLoader = ModelLoader

if (typeof(module) !== 'undefined') {
	module.exports.ModelLoader = ModelLoader
}

})()