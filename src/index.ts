import fetch from "node-fetch";
import * as meriyah from "meriyah";
import estraverse from "estraverse";
import ESTree from "estree";
import { generate } from "astring";
import fs from "fs";
import { traverse } from "estree-toolkit";

const JAVASCRIPT_ENVIRONMENT = fs.readFileSync("./src/template.js").toString();

const getClientSource = async () => {
	const index = await fetch("https://discord.com/app").then(x => x.text());
	const script = [...index.matchAll(/[A-Fa-f0-9]{20}.js/g)].reverse()[0];

	return fetch(`https://canary.discord.com/assets/${script[0]}`).then((x) =>
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
					const generated = generate(node);
					out = JAVASCRIPT_ENVIRONMENT.replace("// --- GENERATED_CODE_MARKER ---", generated);
					return estraverse.VisitorOption.Break;
				}
			},
		},
	});

	return eval(out);
};

const getSbOpenAPI = async () => {
	return fetch(
		"https://raw.githubusercontent.com/spacebarchat/server/master/assets/openapi.json"
	)
		.then((x) => x.json())
		.then((x: any) => Object.keys(x.paths));
};

const compare = (discord: string[], spacebar: string[]) => {
	const missing = [];

	for (var route of discord) {
		var regex = route.replaceAll("/", "\\/").replaceAll(":id", "{.*}");

		var found = spacebar.find((x) => x.match(regex));

		if (!found) {
			missing.push(route);
		}
	}

	return missing;
};

(async () => {
	const source = await getClientSource();
	const dcRoutes = findClientRoutes(source);
	const sbRoutes = await getSbOpenAPI();
	const missing = compare(dcRoutes, sbRoutes);

	console.log(`Spacebar is missing ${missing.length}`);
	console.log(`Spacebar implements ${sbRoutes.length}`);
	console.log(`Discord implements ${dcRoutes.length}`);

	fs.writeFileSync("./missing.json", JSON.stringify({
		routes: missing.sort(),
		missing: missing.length,
		spacebar: sbRoutes.length,
		discord: dcRoutes.length,
	}, null, 2));
})();
