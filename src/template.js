var _e;
(function (_e) {
_e["JOIN"] = "JOIN";
_e["LISTEN"] = "LISTEN";
_e["WATCH"] = "WATCH";
_e["JOIN_REQUEST"] = "JOIN_REQUEST";
})(_e || (_e = {}));

var DEVICES;
(function (DEVICES) {
DEVICES["MOBILE"] = "mobile";
DEVICES["DESKTOP"] = "desktop";
DEVICES["WEB"] = "web";
DEVICES["DEVICE_CODE"] = "device_code";
})(DEVICES || (DEVICES = {}));
const x = {};
x.g = DEVICES;

const routes = // --- GENERATED_CODE_MARKER ---

// we're inside an eval, so this code is what is implicitly returned
Object.values(routes).map((route) => {
	return typeof route == "function" ? route(...new Array(20).fill(":id")) : route;
});