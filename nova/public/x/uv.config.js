self.__uv$config = {
	prefix: "/x/s/",
	encodeUrl: self["Ultra" + "violet"].codec.xor.encode,
	decodeUrl: self["Ultra" + "violet"].codec.xor.decode,
	handler: "/x/uv.handler.js",
	client: "/x/uv.client.js",
	bundle: "/x/uv.bundle.js",
	config: "/x/uv.config.js",
	sw: "/x/uv.sw.js",
};
