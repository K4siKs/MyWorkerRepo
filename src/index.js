/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

export default {
  async fetch(request, env) {
	  
	  // Variables
	  const response = await fetch(request);
	  const AuthEmail = request.headers.get('Cf-Access-Authenticated-User-Email');
	  const timestamp = new Date().toUTCString();
	  const country = request.cf.country;
	  const baseURL = 'https://tunnel.persistent-terabyte.sxplab.com/DVWA/';
	  const url = baseURL + country;
	  
	  // Get the Content-Type of the response
	  const contentType = response.headers.get('Content-Type');

	  // If the content is not HTML (e.g., PNG, CSS), return the response as is
	  if (contentType && (contentType.includes('image/') || contentType.includes('text/css') || contentType.includes('application/javascript'))) {
		return response;
	  }

	  // For HTML content, modify the response
	  let originalHtml = await response.text();
	  
	  // Inject JavaScript or modify HTML as needed
	  const scriptCode = `
	  <script>
	    document.body.innerHTML += '<h2>Authenticated email: ${AuthEmail} at ${timestamp} from <a href="${url}">${country}</a></h2>';
	  </script>
	  `;
	  
	  // If someone clicks on the link, we parse its request
	  if (request.url == url) {
		  
			// Variables
		    const newUrl = new URL(request.url);
			const key = newUrl.pathname.slice(1);

			// We get the R2 bucket object
			const object = await env.cfBucket.get(key);

			// Return 404 if object is not found
			if (object === null) {
			  return new Response("Object Not Found", { status: 404 });
			}

			// Rewrite headers
			const headers = new Headers();
			object.writeHttpMetadata(headers);
			headers.set("etag", object.httpEtag);
			headers.set("Content-Type", "image/svg+xml");

			// Return response for path /DVWA/${COUNTRY}
			return new Response(object.body, {
			  headers,
			});
	  }
	  // Javascrit code insertion in body
	  const modifiedHtml = originalHtml.replace('<body>', `<body>${scriptCode}`);

	  // Return the modified HTML with the injected JavaScript
	  return new Response(modifiedHtml, {
	   headers: { 
	    'Content-Type': 'text/html; charset=utf-8'
	   },
	  });
  },
}