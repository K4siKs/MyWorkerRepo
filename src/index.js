/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

/*export default {
	async fetch(request, env, ctx) {
		return new Response('Hello World Test!');
	},
};
*/

export default {
  async fetch(request) {
	  const response = await fetch(request);
	  const AuthEmail = request.headers.get('Cf-Access-Authenticated-User-Email');
	  const timestamp = new Date().toUTCString();
	  const country = request.cf.country;
	  
	  // Get the Content-Type of the response
	  const contentType = response.headers.get('Content-Type');

	  // If the content is not HTML (e.g., PNG, CSS), return the response as is
	  if (contentType && (contentType.includes('image/') || contentType.includes('text/css') || contentType.includes('application/javascript'))) {
		return response;
	  }

	  // For HTML content, modify the response
	  let originalHtml = await response.text();
		
	  // Country Flag
	  const countryMap = {
		  US: "https://upload.wikimedia.org/wikipedia/commons/a/a4/Flag_of_the_United_States.svg",
		  FR: "https://upload.wikimedia.org/wikipedia/commons/c/c3/Flag_of_France.svg",
		  PT: "https://upload.wikimedia.org/wikipedia/commons/5/5c/Flag_of_Portugal.svg",
		  ES: "https://en.wikipedia.org/wiki/Flag_of_Spain#/media/File:Flag_of_Spain.svg"
		};
	  const url = countryMap[country];
	
	  // Inject JavaScript or modify HTML as needed
	  const scriptCode = `
	  <script>
	    console.log("Injected JavaScript is executing!");
	    document.body.innerHTML += '<h2>Authenticated email: ${AuthEmail} at ${timestamp} from <a href="${url}">${country}</a></h2>';
	  </script>
	  `;
	  
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