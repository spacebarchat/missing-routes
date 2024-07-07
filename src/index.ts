import { generate } from "astring";
import ESTree from "estree";
import { traverse } from "estree-toolkit";
import fs from "fs";
import * as meriyah from "meriyah";
import fetch from "node-fetch";

const JAVASCRIPT_ENVIRONMENT = fs.readFileSync("./src/template.js").toString();

const ignoredAdditional = new Set([
	// Not used in the client
	"/gateway",
	"/gateway/bot",
	"/guilds/{guild_id}/widget.json",
	"/guilds/{guild_id}/widget.png",
]);

const getClientSource = async () => {
	const index = await fetch("https://canary.discord.com/app").then(x => x.text());
	const script = [...index.matchAll(/web.[A-Fa-f0-9]{20}.js/g)].reverse()[0];

	return fetch(`https://canary.discord.com/assets/${script[0]}`).then((x) =>
		x.text()
	);
};

const MeriyahOptions: meriyah.Options = {
	webcompat: true,
};

const findClientRoutes = (source: string): string[] => {
	const tree = meriyah.parseModule(source, MeriyahOptions) as ESTree.Node;

	let called = 0;
	let out = "";
	traverse(tree, {
		$: { scope: true },
		CallExpression: {
			enter: (path) => {
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
							x.key.name == "USER" &&
							x.value.type == "ArrowFunctionExpression"
					)
				) {
					called++;

					// this is our routes list
					const generated = generate(node);
					out = JAVASCRIPT_ENVIRONMENT.replace("undefined;// --- GENERATED_CODE_MARKER ---", generated);
				}
			},
		},
	});

	if (called > 1) {
		console.warn("\nWarning: More than one result was found while traversing the AST. This will probably break the output.\n");
	}

	out = out.replaceAll(/..\.JOIN/g, `"JOIN"`);
	out = out.replaceAll(/.\..\.DEVICE_CODE/g, `"device_code"`);

	return eval(out);
};

const getSbOpenAPI = async () => {
	return fetch(
		"https://raw.githubusercontent.com/spacebarchat/server/master/assets/openapi.json"
	)
		.then((x) => x.json())
		.then((x: any) => Object.keys(x.paths).map((y) => y.replace(/\/$/, "")));
};

const compare = (discord: string[], spacebar: string[]) => {
	const missing = [];
	const additional = [];

	for (const route of discord) {
		const regex = route.replaceAll("/", "\\/").replaceAll(":id", "{.*}");

		const found = spacebar.some((x) => x.match(regex));

		if (!found) {
			missing.push(route);
		}
	}

	for (const route of spacebar) {
		const regex = route.replaceAll("/", "\\/").replace(/{.*}/g, ":id");

		const found = discord.some((x) => x.match(regex));

		if (!found && !ignoredAdditional.has(route)) {
			additional.push(route);
		}
	}

	return [missing, additional];
};

(async () => {
	const source = await getClientSource();
	const dcRoutes = findClientRoutes(source);
	const sbRoutes = await getSbOpenAPI();
	const [missing, additional] = compare(dcRoutes, sbRoutes);

	console.log(`Spacebar is missing ${missing.length}`);
	console.log(`Spacebar implements ${sbRoutes.length}`);
	console.log(`Discord implements ${dcRoutes.length}`);

	fs.writeFileSync("./missing.json", JSON.stringify({
		missing: missing.length,
		spacebar: sbRoutes.length,
		discord: dcRoutes.length,
		routes: missing.sort(),
		additional: additional.sort(),
	}, null, 2));
})();
