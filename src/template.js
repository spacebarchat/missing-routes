var ye;
(function (ye) {
ye["JOIN"] = "JOIN";
ye["LISTEN"] = "LISTEN";
ye["WATCH"] = "WATCH";
ye["JOIN_REQUEST"] = "JOIN_REQUEST";
})(ye || (ye = {}));

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