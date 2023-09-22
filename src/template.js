var pe;
(function (pe) {
	pe["JOIN"] = "JOIN";
	pe["LISTEN"] = "LISTEN";
	pe["WATCH"] = "WATCH";
	pe["JOIN_REQUEST"] = "JOIN_REQUEST";
})(pe || (pe = {}));

var DEVICES;
(function (DEVICES) {
	DEVICES["MOBILE"] = "mobile";
	DEVICES["DESKTOP"] = "desktop";
	DEVICES["WEB"] = "web";
	DEVICES["DEVICE_CODE"] = "device_code";
})(DEVICES || (DEVICES = {}));
const x = {};
x.g = DEVICES;

// Some application ID, was 1096190356233670716 on 20/06/2023
const Oe = ":id";

const window = {
	GLOBAL_ENV: {
		WEBAPP_ENDPOINT: "webapp://"
	}
};

const routes = undefined;// --- GENERATED_CODE_MARKER ---

// we're inside an eval, so this code is what is implicitly returned
Object.values(routes).map((route) => {
	return typeof route == "function" ? route(...new Array(20).fill(":id")) : route;
});