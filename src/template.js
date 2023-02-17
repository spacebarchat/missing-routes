var Se;
(function (Se) {
Se["JOIN"] = "JOIN";
Se["LISTEN"] = "LISTEN";
Se["WATCH"] = "WATCH";
Se["JOIN_REQUEST"] = "JOIN_REQUEST";
})(Se || (Se = {}));

var DEVICES;
(function (DEVICES) {
DEVICES["MOBILE"] = "mobile";
DEVICES["DESKTOP"] = "desktop";
DEVICES["WEB"] = "web";
DEVICES["DEVICE_CODE"] = "device_code";
})(DEVICES || (DEVICES = {}));
const p = {};
p.g = DEVICES;

const routes = // --- GENERATED_CODE_MARKER ---

// we're inside an eval, so this code is what is implicitly returned
Object.values(routes).map((route) => {
	return typeof route == "function" ? route(...new Array(20).fill(":id")) : route;
});