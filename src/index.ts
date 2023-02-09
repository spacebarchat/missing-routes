import fetch from "node-fetch";
import * as meriyah from "meriyah";
import estraverse from "estraverse";
import ESTree from "estree";
import { generate } from "astring";
import fs from "fs";
import { traverse } from "estree-toolkit";

const getClientSource = async () => {
	const index = await fetch("https://discord.com/app").then(x => x.text());
	const script = [...index.matchAll(/[A-Fa-f0-9]{20}.js/g)].reverse()[0];

	return fetch(`https://discord.com/assets/${script[0]}`).then((x) =>
		x.text()
	);
};

const MeriyahOptions: meriyah.Options = {
	webcompat: true,
};

const findClientRoutes = (source: string): string[] => {
	const tree = meriyah.parseModule(source, MeriyahOptions) as ESTree.Node;

	let out = "";
	traverse(tree, {
		$: { scope: true },
		CallExpression: {
			enter: (path, state) => {
				const node = path.node;
				if (!node) return;
				if (
					node.type == "CallExpression" &&
					node.callee.type == "MemberExpression" &&
					node.callee.object.type == "Identifier" &&
					node.callee.object.name == "Object" &&
					node.callee.property.type == "Identifier" &&
					node.callee.property.name == "freeze" &&
					node.arguments.length == 1 &&
					node.arguments[0].type == "ObjectExpression" &&
					node.arguments[0].properties.find(
						(x) =>
							x.type == "Property" &&
							x.key.type == "Identifier" &&
							x.key.name == "USER"
					)
				) {
					// this is our routes list

					// for (var childScope of path.scope?.children || []) {
					// 	const childNode = childScope.path.node;
					// 	const opp = childScope.path.
					// 	if (!opp) continue;

					// 	if (!childNode) continue;

					// 	out += generate(childNode) + "\n\n";
					// }

					// this is gross, don't care. it's temp, bestie
					const scoped = `
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
`;

					out += scoped;

					out += "const routes = " + generate(node) + "\n\n";

					out += `
Object.values(routes).map((route) => {
	return typeof route == "function" ? route(...new Array(20).fill(":id")) : route
})
`;

					return estraverse.VisitorOption.Break;
				}
			},
		},
	});

	// haha evil
	return eval(out);
};

const getFcOpenAPI = async () => {
	return fetch(
		"https://raw.githubusercontent.com/fosscord/fosscord-server/maddy/refactor/assets/openapi.json"
	)
		.then((x) => x.json())
		.then((x: any) => Object.keys(x.paths));
};

const compare = (discord: string[], fosscord: string[]) => {
	const missing = [];

	for (var route of discord) {
		var regex = route.replaceAll("/", "\\/").replaceAll(":id", "{.*}");

		var found = fosscord.find((x) => x.match(regex));

		if (!found) {
			missing.push(route);
		}
	}

	return missing;
};

(async () => {
	const source = await getClientSource();
	const dcRoutes = findClientRoutes(source);
	const fcRoutes = await getFcOpenAPI();
	const missing = compare(dcRoutes, fcRoutes);

	console.log(`Fosscord is missing ${missing.length}`);
	console.log(`Fosscord implements ${fcRoutes.length}`);
	console.log(`Discord implements ${dcRoutes.length}`);

	fs.writeFileSync("./missing.json", JSON.stringify(missing.sort(), null, 2));
})();
