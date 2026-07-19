export function page({ title, body }) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<link rel="stylesheet" href="/MunerisTools/assets/style.css">
</head>
<body>
<main class="wrap">
${body}
</main>
</body>
</html>`;
}
